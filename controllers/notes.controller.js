import Notes from "../model/notes.model.js";

export const getMyNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const wantArchived = req.query.archived === "true";
    const notes = await Notes.find({
      user: userId,
      isArchived: wantArchived,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      notes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching notes",
      error: error.message,
    });
  }
};

const NOTE_COLORS = new Set([
  "lemon",
  "mint",
  "sky",
  "lilac",
  "peach",
  "paper",
]);

function clampPct(n, fallback) {
  const x = Number(n);
  if (Number.isNaN(x)) return fallback;
  return Math.min(100, Math.max(0, x));
}

export const createNote = async (req, res) => {
  try {
    const { title, content, color, positionX, positionY } = req.body;
    const userId = req.user._id;
    const c = NOTE_COLORS.has(color) ? color : "lemon";
    const px =
      positionX !== undefined
        ? clampPct(positionX, 12)
        : 8 + Math.random() * 35;
    const py =
      positionY !== undefined
        ? clampPct(positionY, 12)
        : 8 + Math.random() * 28;

    const note = await Notes.create({
      user: userId,
      title,
      content,
      color: c,
      positionX: px,
      positionY: py,
    });
    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating note",
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const note = await Notes.findOne({
      _id: req.params.id,
      user: userId,
      isArchived: false,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    const { title, content, color, positionX, positionY } = req.body;

    if (title !== undefined) note.title = String(title);
    if (content !== undefined) note.content = String(content);
    if (color !== undefined && NOTE_COLORS.has(color)) note.color = color;
    if (positionX !== undefined) note.positionX = clampPct(positionX, note.positionX);
    if (positionY !== undefined) note.positionY = clampPct(positionY, note.positionY);

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating note",
      error: error.message,
    });
  }
};
