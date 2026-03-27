import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    /** Preset id: lemon | mint | sky | lilac | peach | paper */
    color: {
        type: String,
        enum: ["lemon", "mint", "sky", "lilac", "peach", "paper"],
        default: "lemon",
    },
    /** Horizontal position on board (0–100, % from left). */
    positionX: {
        type: Number,
        default: 12,
    },
    /** Vertical position on board (0–100, % from top). */
    positionY: {
        type: Number,
        default: 12,
    },
}, { timestamps: true });

const Notes = mongoose.model("Notes", notesSchema);
export default Notes;