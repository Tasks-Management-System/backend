import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open",
  },
}, {timestamps: true});

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "urgent"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    queries:{
      type: [querySchema],
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    totalTime: {
      type: String,
    },
  },
  { timestamps: true }
);

taskSchema.pre("save", async function (next) {
  if (this.isModified("status") && this.status === "in_progress") {
    this.startTime = new Date();
    if (this.isModified("status") && this.status === "completed") {
      this.endTime = new Date();
      const timeDiff = this.endTime - this.startTime;
      this.totalTime = timeDiff;
    }
  }
  next()
});

const Task = mongoose.model("Task", taskSchema)
export default Task