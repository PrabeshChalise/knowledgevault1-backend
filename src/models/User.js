import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    // CW1 conceptual actors (+ legacy roles for backward compatibility)
    role: {
      type: String,
      enum: [
        "junior_consultant",
        "senior_consultant",
        "knowledge_champion",
        "governance_council_member",
        "system_admin",
      ],
      default: "junior_consultant",
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
    },
    dateJoined: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
