import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Document } from "@langchain/core/documents";
import { createBuddyEmbeddings } from "@/lib/rag/buddy-embeddings";

// Environment config (Requirement 7.1)
const MEMORY_INDEX = process.env.PINECONE_MEMORY_INDEX ?? "";
const MEMORY_NS = process.env.PINECONE_MEMORY_NAMESPACE ?? "buddy-memory";
const TOP_K_RAW = parseInt(process.env.BUDDY_MEMORY_TOP_K ?? "6", 10);
export const TOP_K = isNaN(TOP_K_RAW) ? 6 : TOP_K_RAW;

// Module-level cache — mirrors cachedStore in retrieve.ts (Requirement 5.2)
let cachedMemoryStore: PineconeStore | null | undefined;

/**
 * Lazily initialise and cache the PineconeStore for chat memory.
 * Returns null if PINECONE_MEMORY_INDEX is unset or on init error (Requirement 5.1, 5.3).
 */
export async function getMemoryStore(): Promise<PineconeStore | null> {
    if (!MEMORY_INDEX) {
        // Requirement 7.2: single startup log, no error thrown
        console.log(
            "[buddy-memory] PINECONE_MEMORY_INDEX not set — long-term memory disabled",
        );
        return null;
    }

    // Return cached value (null means previously failed, undefined means not yet initialised)
    if (cachedMemoryStore !== undefined) {
        return cachedMemoryStore;
    }

    try {
        const apiKey = process.env.PINECONE_API_KEY;
        if (!apiKey) {
            throw new Error("PINECONE_API_KEY is not set");
        }
        const pinecone = new Pinecone({ apiKey });
        const embeddings = await createBuddyEmbeddings(pinecone, MEMORY_INDEX);
        const index = pinecone.Index(MEMORY_INDEX).namespace(MEMORY_NS);
        cachedMemoryStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
        });
        return cachedMemoryStore;
    } catch (e) {
        console.error("[buddy-memory] Failed to initialise memory store:", e);
        cachedMemoryStore = null;
        return null;
    }
}

// ---------------------------------------------------------------------------
// Public API stubs — implementations added in tasks 1.2, 1.3, 1.4
// ---------------------------------------------------------------------------

export async function upsertMemory(
    userId: string,
    deviceId: string,
    userMsg: { id: string; content: string; createdAt: Date },
    buddyMsg: { id: string; content: string; createdAt: Date },
): Promise<void> {
    const store = await getMemoryStore();
    if (!store) return;

    const docs = [
        new Document({
            pageContent: userMsg.content,
            metadata: {
                userId,
                deviceId,
                role: "user",
                messageId: userMsg.id,
                createdAt: userMsg.createdAt.getTime(),
            },
        }),
        new Document({
            pageContent: buddyMsg.content,
            metadata: {
                userId,
                deviceId,
                role: "buddy",
                messageId: buddyMsg.id,
                createdAt: buddyMsg.createdAt.getTime(),
            },
        }),
    ];

    try {
        await store.addDocuments(docs, { ids: [userMsg.id, buddyMsg.id] });
    } catch (e) {
        console.error(
            `[buddy-memory] upsertMemory failed for messageId=${userMsg.id}:`,
            e,
        );
    }
}

export async function retrieveMemory(
    query: string,
    userId: string,
    deviceId: string,
    shortTermCutoff: Date | null,
): Promise<string> {
    const store = await getMemoryStore();
    if (!store) return "";

    // Build metadata filter: scope to user, exclude short-term window (Req 3.1, 3.2, 6.1)
    const userFilter: Record<string, unknown> = userId
        ? { userId }
        : { deviceId };

    const filter: Record<string, unknown> =
        shortTermCutoff !== null
            ? { ...userFilter, createdAt: { $lt: shortTermCutoff.getTime() } }
            : userFilter;

    try {
        const records = await store.similaritySearch(query, TOP_K, filter);
        if (!records.length) return "";

        // Format as labelled block (Req 4.2)
        return (
            "RELEVANT PAST CONTEXT:\n" +
            records
                .map((r) => `[${r.metadata.role}]: ${r.pageContent}`)
                .join("\n")
        );
    } catch (e) {
        console.error("[buddy-memory] retrieveMemory failed:", e);
        return "";
    }
}

export async function deleteUserMemory(
    userId: string,
    deviceId: string,
): Promise<void> {
    const store = await getMemoryStore();
    if (!store) return;

    const filter = userId
        ? { userId: { $eq: userId } }
        : { deviceId: { $eq: deviceId } };

    try {
        await (store as any).pineconeIndex.deleteMany({ filter });
    } catch (e) {
        console.error("[buddy-memory] deleteUserMemory failed:", e);
    }
}
