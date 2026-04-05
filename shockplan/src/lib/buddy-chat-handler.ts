import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { Profile, Score, BuddyChat } from "@/lib/models";
import {
    buddyStoredToBaseMessages,
    createBuddyChatReadableStream,
} from "@/lib/buddy-chain";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";
import {
    retrieveMemory,
    upsertMemory,
    deleteUserMemory,
} from "@/lib/rag/memory-store";

export type BuddyChatBody = {
    message: string;
    deviceId?: string;
    crisisContext?: string;
};

export type BuddyChatResult =
    | { ok: true; stream: ReadableStream<Uint8Array> }
    | { ok: false; status: number; body: { error: string } };

export type BuddyStoredMessage = {
    id: string;
    role: "user" | "buddy";
    content: string;
    createdAt: Date;
};

type BuddyContextResult =
    | {
          ok: true;
          userId: string;
          deviceId: string;
          name: string;
          query: { userId: string } | { deviceId: string };
      }
    | {
          ok: false;
          status: number;
          body: { error: string };
      };

async function resolveBuddyContext(
    request: Request | undefined,
    bodyDeviceId?: string,
): Promise<BuddyContextResult> {
    const { userId, deviceId, name } = await getUserIdentifier(
        bodyDeviceId,
        request,
    );
    const query = buildUserQuery(userId, deviceId);

    if (!query) {
        return {
            ok: false,
            status: 400,
            body: {
                error: "Not authenticated and no deviceId. Complete onboarding first.",
            },
        };
    }

    return {
        ok: true,
        userId,
        deviceId,
        name,
        query,
    };
}

export async function getBuddyMessages(
    request?: Request,
    bodyDeviceId?: string,
): Promise<
    | { ok: true; messages: BuddyStoredMessage[] }
    | { ok: false; status: number; body: { error: string } }
> {
    try {
        const context = await resolveBuddyContext(request, bodyDeviceId);
        if (!context.ok) {
            return context;
        }

        await connectToDatabase();
        const doc = await BuddyChat.findOne(context.query).lean();
        const messages = (doc?.messages ?? []) as BuddyStoredMessage[];
        return { ok: true, messages };
    } catch (error) {
        console.error("Buddy history lookup error:", error);
        return {
            ok: false,
            status: 500,
            body: { error: "Something went wrong. Please try again." },
        };
    }
}

export async function clearBuddyMessages(
    request?: Request,
    bodyDeviceId?: string,
): Promise<
    { ok: true } | { ok: false; status: number; body: { error: string } }
> {
    try {
        const context = await resolveBuddyContext(request, bodyDeviceId);
        if (!context.ok) {
            return context;
        }

        await connectToDatabase();
        await BuddyChat.findOneAndUpdate(
            context.query,
            { $set: { messages: [], updatedAt: new Date() } },
            { upsert: true },
        );
        await deleteUserMemory(context.userId, context.deviceId);
        return { ok: true };
    } catch (error) {
        console.error("Buddy history clear error:", error);
        return {
            ok: false,
            status: 500,
            body: { error: "Something went wrong." },
        };
    }
}

export async function handleBuddyChatMessage(
    request: Request | undefined,
    body: BuddyChatBody,
): Promise<BuddyChatResult> {
    try {
        const { message, deviceId: bodyDeviceId, crisisContext } = body;
        if (!message) {
            return {
                ok: false,
                status: 400,
                body: { error: "message required" },
            };
        }

        const context = await resolveBuddyContext(request, bodyDeviceId);
        if (!context.ok) {
            return context;
        }
        const { userId, deviceId, name, query } = context;

        await connectToDatabase();

        let profile = await Profile.findOne(query);

        if (!profile && userId && deviceId) {
            profile = await Profile.findOneAndUpdate(
                { deviceId, userId: { $in: ["", null, undefined] } },
                { $set: { userId } },
                { new: true },
            );
        }

        if (!profile) {
            return {
                ok: false,
                status: 404,
                body: {
                    error: "Profile not found. Complete onboarding first.",
                },
            };
        }

        const resolvedQuery = profile.userId
            ? { userId: profile.userId }
            : { deviceId: profile.deviceId };
        const score = await Score.findOne(resolvedQuery).sort({
            calculatedAt: -1,
        });

        const chatDoc = await BuddyChat.findOne(resolvedQuery).lean();
        const prior = chatDoc?.messages ?? [];
        const history = buddyStoredToBaseMessages(prior);

        const shortTermCutoff: Date | null =
            (prior.slice(-48)[0]?.createdAt as Date | undefined) ?? null;
        const longTermContext = await retrieveMemory(
            message,
            userId,
            deviceId,
            shortTermCutoff,
        );

        const stream = createBuddyChatReadableStream(
            message,
            { ...profile.toObject(), userName: name },
            score?.toObject(),
            crisisContext,
            history,
            longTermContext,
            async (assistantText) => {
                const userMsgId = randomUUID();
                const buddyMsgId = randomUUID();
                await BuddyChat.findOneAndUpdate(
                    resolvedQuery,
                    {
                        $push: {
                            messages: {
                                $each: [
                                    {
                                        id: userMsgId,
                                        role: "user",
                                        content: message,
                                        createdAt: new Date(),
                                    },
                                    {
                                        id: buddyMsgId,
                                        role: "buddy",
                                        content: assistantText,
                                        createdAt: new Date(),
                                    },
                                ],
                            },
                        },
                        $set: { updatedAt: new Date() },
                        $setOnInsert: {
                            userId: userId || "",
                            deviceId: deviceId || "",
                            createdAt: new Date(),
                        },
                    },
                    { upsert: true },
                );
                await upsertMemory(
                    userId,
                    deviceId,
                    { id: userMsgId, content: message, createdAt: new Date() },
                    {
                        id: buddyMsgId,
                        content: assistantText,
                        createdAt: new Date(),
                    },
                );
            },
        );

        return { ok: true, stream };
    } catch (error) {
        console.error("Buddy chat error:", error);
        return {
            ok: false,
            status: 500,
            body: { error: "Something went wrong. Please try again." },
        };
    }
}
