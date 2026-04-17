import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  markAsRead,
  pinAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/", authenticateMiddleware, getAnnouncements);

router.post(
  "/create",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  createAnnouncement
);

router.put(
  "/:id",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  updateAnnouncement
);

router.patch(
  "/:id/pin",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  pinAnnouncement
);

router.patch("/:id/read", authenticateMiddleware, markAsRead);

router.delete(
  "/:id",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  deleteAnnouncement
);

export default router;
