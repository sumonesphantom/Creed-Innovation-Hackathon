import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { VaultMetadata } from "@/lib/models";
import { getUserIdentifier, buildUserQuery } from "@/lib/get-user";

const CATEGORIES = ["insurance", "id", "lease", "medical", "financial"] as const;

function isValidCategory(v: string): v is (typeof CATEGORIES)[number] {
  return CATEGORIES.includes(v as (typeof CATEGORIES)[number]);
}

function serialize(doc: {
  _id: mongoose.Types.ObjectId;
  deviceId?: string;
  userId?: string;
  fileName: string;
  fileType: string;
  category: string;
  uploadedAt: Date;
}) {
  return {
    _id: String(doc._id),
    fileName: doc.fileName,
    fileType: doc.fileType,
    category: doc.category,
    uploadedAt: doc.uploadedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);
  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const items = await VaultMetadata.find(query).sort({ uploadedAt: -1 }).lean().exec();
    return NextResponse.json({
      items: items.map((p) =>
        serialize({
          _id: p._id as mongoose.Types.ObjectId,
          deviceId: p.deviceId,
          userId: p.userId,
          fileName: p.fileName,
          fileType: p.fileType,
          category: p.category,
          uploadedAt: p.uploadedAt ?? new Date(),
        })
      ),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load vault" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deviceIdBody = typeof body?.deviceId === "string" ? body.deviceId : "";
    const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceIdBody);
    const query = buildUserQuery(userId, resolvedDeviceId);
    if (!query) {
      return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
    }

    const category = typeof body?.category === "string" ? body.category.trim() : "";
    const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "";
    const fileType = typeof body?.fileType === "string" ? body.fileType.trim() : "application/octet-stream";

    if (!isValidCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (fileName.length < 1 || fileName.length > 512) {
      return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
    }

    await connectToDatabase();
    const created = await VaultMetadata.create(
      userId
        ? {
            userId,
            deviceId: resolvedDeviceId || "",
            fileName,
            fileType,
            category,
          }
        : {
            deviceId: resolvedDeviceId,
            fileName,
            fileType,
            category,
          }
    );

    const doc = created.toObject();
    return NextResponse.json({
      item: serialize({
        _id: doc._id as mongoose.Types.ObjectId,
        deviceId: doc.deviceId,
        userId: doc.userId,
        fileName: doc.fileName,
        fileType: doc.fileType,
        category: doc.category,
        uploadedAt: doc.uploadedAt ?? new Date(),
      }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  if (!id || !mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);
  const query = buildUserQuery(userId, resolvedDeviceId);
  if (!query) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const deleted = await VaultMetadata.findOneAndDelete({
      _id: id,
      ...query,
    }).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
