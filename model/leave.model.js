import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["paidLeave", "unpaidLeave"],
    default: "unpaidLeave",
  },
  days: {
    type: String,
    enum: ["single", "multiple"],
    required: true,
  },
  subType: {
    type: String,
    enum: ["halfDay", "fullDay"],
    default: "fullDay",
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  adminComment: {
    type: String,
  },
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
