import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { CommunityPostModel, CommunityCommentModel } from "@/lib/models";

function serializeComment(doc: {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  upvotes: number;
  createdAt: Date;
}) {
  return {
    _id: String(doc._id),
    postId: String(doc.postId),
    content: doc.content,
    upvotes: doc.upvotes,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  if (!mongoose.isValidObjectId(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const comments = await CommunityCommentModel.find({ postId })
      .sort({ upvotes: -1, createdAt: 1 })
      .lean()
      .exec();

    return NextResponse.json({
      comments: comments.map((c) =>
        serializeComment({
          _id: c._id as mongoose.Types.ObjectId,
          postId: c.postId as mongoose.Types.ObjectId,
          content: c.content,
          upvotes: c.upvotes ?? 0,
          createdAt: c.createdAt ?? new Date(),
        })
      ),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  if (!mongoose.isValidObjectId(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Upvote a comment
    if (body?.commentId && typeof body.commentId === "string") {
      if (!mongoose.isValidObjectId(body.commentId)) {
        return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
      }
      await connectToDatabase();
      const updated = await CommunityCommentModel.findByIdAndUpdate(
        body.commentId,
        { $inc: { upvotes: 1 } },
        { new: true }
      ).lean();
      if (!updated) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      }
      return NextResponse.json({
        comment: serializeComment({
          _id: updated._id as mongoose.Types.ObjectId,
          postId: updated.postId as mongoose.Types.ObjectId,
          content: updated.content,
          upvotes: updated.upvotes ?? 0,
          createdAt: updated.createdAt ?? new Date(),
        }),
      });
    }

    // Add a new comment
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json(
        { error: "Comment must be between 1 and 500 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const post = await CommunityPostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await CommunityCommentModel.create({ postId, content });

    // Increment comment count on the post
    await CommunityPostModel.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const doc = comment.toObject();
    return NextResponse.json({
      comment: serializeComment({
        _id: doc._id as mongoose.Types.ObjectId,
        postId: doc.postId as mongoose.Types.ObjectId,
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
