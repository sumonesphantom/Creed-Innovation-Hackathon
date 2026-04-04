import mongoose, { Schema } from "mongoose";

const ProfileSchema = new Schema({
  deviceId: { type: String, required: true, unique: true, index: true },
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

const ScoreSchema = new Schema({
  deviceId: { type: String, required: true, index: true },
  score: { type: Number, required: true },
  breakdown: {
    savings: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    documents: { type: Number, default: 0 },
    awareness: { type: Number, default: 0 },
  },
  calculatedAt: { type: Date, default: Date.now },
});

const CommunityPostSchema = new Schema({
  crisisType: { type: String, required: true },
  state: { type: String, default: "" },
  content: { type: String, required: true, maxlength: 500 },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const VaultMetadataSchema = new Schema({
  deviceId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  category: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export const Score =
  mongoose.models.Score || mongoose.model("Score", ScoreSchema);
export const CommunityPostModel =
  mongoose.models.CommunityPost || mongoose.model("CommunityPost", CommunityPostSchema);
export const VaultMetadata =
  mongoose.models.VaultMetadata || mongoose.model("VaultMetadata", VaultMetadataSchema);
