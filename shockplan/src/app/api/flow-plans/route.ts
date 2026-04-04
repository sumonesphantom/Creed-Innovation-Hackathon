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
  const selections =
    doc.selections instanceof Map ? Object.fromEntries(doc.selections.entries()) : (doc.selections ?? {});
  const completion =
    doc.generatedMilestoneCompletion instanceof Map
      ? Object.fromEntries(doc.generatedMilestoneCompletion.entries())
      : (doc.generatedMilestoneCompletion ?? {});

  return {
    id: String(doc._id),
    deviceId: doc.deviceId ?? "",
    userId: doc.userId ?? "",
    name: doc.name,
    templateId: doc.templateId,
    selections,
    customEvents: Array.isArray(doc.customEvents) ? doc.customEvents : [],
    manualMilestones: Array.isArray(doc.manualMilestones) ? doc.manualMilestones : [],
    generatedMilestoneCompletion: completion,
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

async function migrateAnonymousPlans(userId: string, deviceId: string) {
  if (!userId || !deviceId) return;
  await FlowPlan.updateMany(
    { deviceId, userId: { $in: ["", null] } },
    { $set: { userId, updatedAt: new Date() } }
  );
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("deviceId") || "";
  const { userId, deviceId: resolvedDeviceId } = await getUserIdentifier(deviceId);

  if (!userId && !resolvedDeviceId) {
    return NextResponse.json({ error: "Not authenticated and no deviceId" }, { status: 400 });
  }

  await connectToDatabase();
  await migrateAnonymousPlans(userId, resolvedDeviceId);

  const query = userId ? { userId } : { deviceId: resolvedDeviceId };
  const plans = await FlowPlan.find(query).sort({ updatedAt: -1 }).exec();
  return NextResponse.json({
    items: plans.map((plan) =>
      serializeFlowPlan(
        plan.toObject({
          flattenMaps: true,
        }) as Parameters<typeof serializeFlowPlan>[0]
      )
    ),
  });
}

export async function POST(request: NextRequest) {
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
  await migrateAnonymousPlans(userId, resolvedDeviceId);

  const created = await FlowPlan.create({
    ...payload,
    userId,
    deviceId: resolvedDeviceId,
    updatedAt: new Date(),
  });

  return NextResponse.json({
    item: serializeFlowPlan(
      created.toObject({
        flattenMaps: true,
      }) as Parameters<typeof serializeFlowPlan>[0]
    ),
  });
}
