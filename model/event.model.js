import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["meeting", "schedule", "call", "deadline", "reminder", "other"],
      default: "other",
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    attendees: { type: [attendeeSchema], default: [] },
    color: { type: String, default: "#3b82f6" },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "biweekly", "monthly"],
      default: "none",
    },
    reminderMinutes: { type: Number, default: 15 },
    reminderSent: { type: Boolean, default: false },
    visibleToTeam: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
