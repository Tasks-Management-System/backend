import mongoose from "mongoose";
import crypto from "crypto";

const OrganizationInviteSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    token: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
      unique: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const OrganizationInvite = mongoose.model(
  "OrganizationInvite",
  OrganizationInviteSchema
);
export default OrganizationInvite;
