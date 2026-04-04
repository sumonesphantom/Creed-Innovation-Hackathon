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
    documents: { type: Number, default: 0 },
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

// ─── Vault ───────────────────────────────────────────────────────────────────

const VaultMetadataSchema = new Schema({
  deviceId: { type: String, default: "", index: true },
  userId: { type: String, default: "", index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  category: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// ─── Exports ─────────────────────────────────────────────────────────────────

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);
export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export const Score =
  mongoose.models.Score || mongoose.model("Score", ScoreSchema);
export const CommunityPostModel =
  mongoose.models.CommunityPost || mongoose.model("CommunityPost", CommunityPostSchema);
export const VaultMetadata =
  mongoose.models.VaultMetadata || mongoose.model("VaultMetadata", VaultMetadataSchema);
