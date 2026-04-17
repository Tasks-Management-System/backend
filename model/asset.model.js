import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    date: { type: Date, default: Date.now },
    condition: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    orgAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      default: "",
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedDate: {
      type: Date,
      default: null,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    conditionOnHandover: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      default: "good",
    },
    status: {
      type: String,
      enum: ["available", "assigned", "under_repair", "retired"],
      default: "available",
    },
    transferHistory: {
      type: [transferSchema],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
