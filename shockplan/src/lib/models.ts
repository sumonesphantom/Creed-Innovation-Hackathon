import mongoose, { Schema } from "mongoose";

// ─── User (Auth) ─────────────────────────────────────────────────────────────

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "" },
  image: { type: String, default: "" },
  provider: { type: String, default: "auth0" },
  providerId: { type: String, default: "" },
  deviceId: { type: String, default: "", index: true },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
});

// ─── Profile ─────────────────────────────────────────────────────────────────

const ProfileSchema = new Schema({
  deviceId: { type: String, default: "", index: true },
  userId: { type: String, default: "", index: true },
  household: { type: String, default: "" },
  housing: { type: String, default: "" },
  incomeType: { type: String, default: "" },
  incomeRange: { type: String, default: "" },
  state: { type: String, default: "" },
  insurance: { type: [String], default: [] },
  dependents: { type: Number, default: 0 },
  canCover500: { type: String, default: "" },
  language: { type: String, default: "en" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index: find profile by userId first, then deviceId fallback
ProfileSchema.index({ userId: 1, deviceId: 1 });

// ─── Score ───────────────────────────────────────────────────────────────────

const ScoreSchema = new Schema({
  deviceId: { type: String, default: "", index: true },
  userId: { type: String, default: "", index: true },
  score: { type: Number, required: true },
  breakdown: {
    savings: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    awareness: { type: Number, default: 0 },
  },
  calculatedAt: { type: Date, default: Date.now },
});

// ─── Community ───────────────────────────────────────────────────────────────

const CommunityPostSchema = new Schema({
  crisisType: { type: String, required: true },
  state: { type: String, default: "" },
  content: { type: String, required: true, maxlength: 500 },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const BuddyChatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "buddy"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BuddyChatSchema = new Schema({
  deviceId: { type: String, default: "", index: true },
  userId: { type: String, default: "", index: true },
  messages: { type: [BuddyChatMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BuddyChatSchema.index({ userId: 1, deviceId: 1 });

const FlowPlanCustomEventSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
    monthlyIncomeDelta: { type: Number, default: 0 },
    monthlyExpenseDelta: { type: Number, default: 0 },
    oneTimeCashDelta: { type: Number, default: 0 },
    startMonthOffset: { type: Number, default: 0 },
    durationMonths: { type: Number, default: 1 },
    risk: { type: String, default: "stable" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const FlowPlanManualMilestoneSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, default: "" },
    phase: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const FlowPlanSchema = new Schema({
  deviceId: { type: String, default: "", index: true },
  userId: { type: String, default: "", index: true },
  name: { type: String, required: true, maxlength: 120 },
  templateId: { type: String, required: true },
  selections: { type: Map, of: Number, default: {} },
  customEvents: { type: [FlowPlanCustomEventSchema], default: [] },
  manualMilestones: { type: [FlowPlanManualMilestoneSchema], default: [] },
  generatedMilestoneCompletion: { type: Map, of: Boolean, default: {} },
  notes: { type: String, default: "" },
  zoom: { type: String, default: "year" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FlowPlanSchema.index({ userId: 1, deviceId: 1, updatedAt: -1 });

// ─── Exports ─────────────────────────────────────────────────────────────────

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export const Score =
  mongoose.models.Score || mongoose.model("Score", ScoreSchema);
export const CommunityPostModel =
  mongoose.models.CommunityPost || mongoose.model("CommunityPost", CommunityPostSchema);
export const BuddyChat =
  mongoose.models.BuddyChat || mongoose.model("BuddyChat", BuddyChatSchema);
export const FlowPlan =
  mongoose.models.FlowPlan || mongoose.model("FlowPlan", FlowPlanSchema);
