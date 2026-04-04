import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { CommunityPostModel } from "@/lib/models";

const CRISIS_TYPES = [
  "job-loss",
  "medical-bills",
  "car-accident",
  "eviction",
  "natural-disaster",
] as const;

function isValidCrisisType(v: string): v is (typeof CRISIS_TYPES)[number] {
  return CRISIS_TYPES.includes(v as (typeof CRISIS_TYPES)[number]);
}

const SEED_POSTS: Array<{
  crisisType: (typeof CRISIS_TYPES)[number];
  state?: string;
  content: string;
  upvotes: number;
}> = [
  {
    crisisType: "job-loss",
    state: "Arizona",
    content:
      "File for unemployment the same week if you can — backdating varies by state and you do not want to leave money on the table.",
    upvotes: 24,
  },
  {
    crisisType: "job-loss",
    content:
      "COBRA sounded scary expensive but I used the marketplace with my job loss as a qualifying event and paid less than I expected.",
    upvotes: 18,
  },
  {
    crisisType: "medical-bills",
    state: "Arizona",
    content:
      "Ask for an itemized bill before you pay anything. My statement had duplicate charges that were removed after one phone call.",
    upvotes: 31,
  },
  {
    crisisType: "medical-bills",
    content:
      "The hospital financial assistance form looked long but I qualified for a 60% reduction. Worth the hour it took.",
    upvotes: 22,
  },
  {
    crisisType: "medical-bills",
    content:
      "Do not put the balance on a credit card until you have talked to billing about a zero-interest plan.",
    upvotes: 40,
  },
  {
    crisisType: "car-accident",
    state: "Texas",
    content:
      "Photos of every angle of both cars and the street signs saved me when the other driver changed their story.",
    upvotes: 15,
  },
  {
    crisisType: "car-accident",
    content:
      "I felt fine day one but got checked anyway — soft tissue stuff showed up on day three and having a record helped the claim.",
    upvotes: 12,
  },
  {
    crisisType: "car-accident",
    content:
      "Rental coverage was buried in my policy. If you have it, ask the adjuster how many days they will authorize up front.",
    upvotes: 9,
  },
  {
    crisisType: "eviction",
    content:
      "Legal aid answered the phone on the second try. They told me exactly what to put in writing to my landlord — game changer.",
    upvotes: 27,
  },
  {
    crisisType: "eviction",
    content:
      "Emergency rental assistance paid two months to my landlord directly. Apply even if you think you might not qualify.",
    upvotes: 33,
  },
  {
    crisisType: "natural-disaster",
    state: "Florida",
    content:
      "Document damage with video walkthrough before you move anything for cleanup. Insurers want that sequence.",
    upvotes: 20,
  },
  {
    crisisType: "natural-disaster",
    content:
      "Keep receipts for tarps, chainsaw fuel, and fans — my adjuster reimbursed temporary protective purchases.",
    upvotes: 14,
  },
];

async function ensureSeed() {
  const n = await CommunityPostModel.countDocuments();
  if (n > 0) return;
  const stagger = SEED_POSTS.map((p, i) => ({
    ...p,
    createdAt: new Date(Date.now() - (i + 1) * 3600_000 * 3),
  }));
  await CommunityPostModel.insertMany(stagger);
}

function serialize(doc: {
  _id: mongoose.Types.ObjectId;
  crisisType: string;
  state?: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}) {
  return {
    _id: String(doc._id),
    crisisType: doc.crisisType,
    state: doc.state ?? "",
    content: doc.content,
    upvotes: doc.upvotes,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await ensureSeed();

    const raw = request.nextUrl.searchParams.get("crisisType") || "all";
    if (raw !== "all" && raw !== "" && !isValidCrisisType(raw)) {
      return NextResponse.json({ error: "Invalid crisis type" }, { status: 400 });
    }
    const filter =
      raw === "all" || raw === "" ? {} : { crisisType: raw };

    const posts = await CommunityPostModel.find(filter)
      .sort({ upvotes: -1, createdAt: -1 })
      .lean()
      .exec();

    return NextResponse.json({
      posts: posts.map((p) =>
        serialize({
          _id: p._id as mongoose.Types.ObjectId,
          crisisType: p.crisisType,
          state: p.state,
          content: p.content,
          upvotes: p.upvotes ?? 0,
          createdAt: p.createdAt ?? new Date(),
        })
      ),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body?.postId && typeof body.postId === "string") {
      if (!mongoose.isValidObjectId(body.postId)) {
        return NextResponse.json({ error: "Invalid post" }, { status: 400 });
      }
      await connectToDatabase();
      const updated = await CommunityPostModel.findByIdAndUpdate(
        body.postId,
        { $inc: { upvotes: 1 } },
        { new: true }
      ).lean();
      if (!updated) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({
        ok: true,
        post: serialize({
          _id: updated._id as mongoose.Types.ObjectId,
          crisisType: updated.crisisType,
          state: updated.state,
          content: updated.content,
          upvotes: updated.upvotes ?? 0,
          createdAt: updated.createdAt ?? new Date(),
        }),
      });
    }

    const crisisType = typeof body?.crisisType === "string" ? body.crisisType.trim() : "";
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";
    const state = typeof body?.state === "string" ? body.state.trim() : "";

    if (!isValidCrisisType(crisisType)) {
      return NextResponse.json({ error: "Invalid crisis type" }, { status: 400 });
    }
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json(
        { error: "Content must be between 1 and 500 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureSeed();

    const created = await CommunityPostModel.create({
      crisisType,
      content,
      state: state || undefined,
      upvotes: 0,
    });

    const doc = created.toObject();
    return NextResponse.json({
      post: serialize({
        _id: doc._id as mongoose.Types.ObjectId,
        crisisType: doc.crisisType,
        state: doc.state,
        content: doc.content,
        upvotes: doc.upvotes ?? 0,
        createdAt: doc.createdAt ?? new Date(),
      }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
