import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserIdentifier } from "@/lib/get-user";
import { FlowPlan } from "@/lib/models";
import type { LifePathScenario } from "@/types";

function serializeFlowPlan(doc: {
  _id: mongoose.Types.ObjectId;
  deviceId?: string;
  userId?: string;
  name: string;
  templateId: string;
  selections?: Record<string, number> | Map<string, number>;
  customEvents?: unknown[];
  manualMilestones?: unknown[];
  generatedMilestoneCompletion?: Record<string, boolean> | Map<string, boolean>;
  notes?: string;
  zoom?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): LifePathScenario {
  return {
    id: String(doc._id),
    deviceId: doc.deviceId ?? "",
    userId: doc.userId ?? "",
    name: doc.name,
    templateId: doc.templateId,
    selections:
      doc.selections instanceof Map ? Object.fromEntries(doc.selections.entries()) : (doc.selections ?? {}),
    customEvents: Array.isArray(doc.customEvents) ? (doc.customEvents as LifePathScenario["customEvents"]) : [],
    manualMilestones: Array.isArray(doc.manualMilestones) ? (doc.manualMilestones as LifePathScenario["manualMilestones"]) : [],
    generatedMilestoneCompletion:
      doc.generatedMilestoneCompletion instanceof Map
        ? Object.fromEntries(doc.generatedMilestoneCompletion.entries())
        : (doc.generatedMilestoneCompletion ?? {}),
    notes: doc.notes ?? "",
    zoom: (doc.zoom as LifePathScenario["zoom"]) ?? "year",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

function normalizeScenarioBody(body: Record<string, unknown>) {
  return {
    name: typeof body.name === "string" ? body.name.trim().slice(0, 120) : "",
    templateId: typeof body.templateId === "string" ? body.templateId.trim() : "",
    selections: typeof body.selections === "object" && body.selections ? (body.selections as Record<string, number>) : {},
    customEvents: Array.isArray(body.customEvents) ? body.customEvents : [],
    manualMilestones: Array.isArray(body.manualMilestones) ? body.manualMilestones : [],
    generatedMilestoneCompletion:
      typeof body.generatedMilestoneCompletion === "object" && body.generatedMilestoneCompletion
        ? (body.generatedMilestoneCompletion as Record<string, boolean>)
        : {},
    notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : "",
    zoom: body.zoom === "month" || body.zoom === "year" || body.zoom === "fiveYear" ? body.zoom : "year",
  };
}

function getIdFromRequest(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/");
  return parts[parts.length - 1] || "";
}

export async function GET(request: NextRequest) {
  const id = getIdFromRequest(request);
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);
  if (!userId && !resolvedDeviceId) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  const query = userId ? { _id: id, userId } : { _id: id, deviceId: resolvedDeviceId };
  const plan = await FlowPlan.findOne(query).exec();
  if (!plan) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: serializeFlowPlan(
      plan.toObject({
        flattenMaps: true,
      }) as Parameters<typeof serializeFlowPlan>[0]
    ),
  });
}

export async function PATCH(request: NextRequest) {
  const id = getIdFromRequest(request);
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const bodyDeviceId = typeof body.deviceId === "string" ? body.deviceId : "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(bodyDeviceId);
  if (!userId && !resolvedDeviceId) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  const payload = normalizeScenarioBody(body);
  if (!payload.name || !payload.templateId) {
    return NextResponse.json({ error: "name and templateId are required" }, { status: 400 });
  }

  await connectToDatabase();
  const query = userId ? { _id: id, userId } : { _id: id, deviceId: resolvedDeviceId };
  const updated = await FlowPlan.findOneAndUpdate(
    query,
    {
      ...payload,
      updatedAt: new Date(),
    },
    { new: true }
  ).exec();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: serializeFlowPlan(
      updated.toObject({
        flattenMaps: true,
      }) as Parameters<typeof serializeFlowPlan>[0]
    ),
  });
}

export async function DELETE(request: NextRequest) {
  const id = getIdFromRequest(request);
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);
  if (!userId && !resolvedDeviceId) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  const query = userId ? { _id: id, userId } : { _id: id, deviceId: resolvedDeviceId };
  const deleted = await FlowPlan.findOneAndDelete(query).exec();
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
