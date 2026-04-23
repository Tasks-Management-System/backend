import mongoose from "mongoose";

const OrganizationJoinRequestSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const OrganizationJoinRequest = mongoose.model(
  "OrganizationJoinRequest",
  OrganizationJoinRequestSchema
);
export default OrganizationJoinRequest;
