import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: new Date().setHours(0, 0, 0, 0),
    },
    status: {
      type: String,
      enum: ["not_started", "working", "on_break", "completed"],
      default: "not_started",
    },
    punchInTime: {
      type: Date,
      default: null,
    },
    punchOutTime: {
      type: Date,
      default: null,
    },
    breaks: [
      {
        breakStart: Date,
        breakEnd: Date,
        totalBreakTime: Number, // in milliseconds
      },
    ],
    totalTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;