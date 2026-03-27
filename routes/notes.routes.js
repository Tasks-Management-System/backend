import express from "express";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";
import { createNote, getMyNotes, updateNote } from "../controllers/notes.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  CreateNoteBodySchema,
  NoteIdParamSchema,
  UpdateNoteBodySchema,
} from "../validation/notes.validation.js";

const router = express.Router();

router.get("/", authenticateMiddleware, getMyNotes);
router.post(
  "/create",
  authenticateMiddleware,
  validate({ body: CreateNoteBodySchema }),
  createNote
);
router.patch(
  "/:id",
  authenticateMiddleware,
  validate({ params: NoteIdParamSchema, body: UpdateNoteBodySchema }),
  updateNote
);

export default router;
