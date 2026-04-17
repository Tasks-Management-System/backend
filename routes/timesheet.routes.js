import express from "express";
import {
  logTime,
  getTimesheets,
  updateTimesheetEntry,
  deleteTimesheetEntry,
  exportTimesheetCsv,
} from "../controllers/timesheet.controller.js";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";

const router = express.Router();

router.get("/", authenticateMiddleware, getTimesheets);
router.get("/export/csv", authenticateMiddleware, exportTimesheetCsv);
router.post("/log", authenticateMiddleware, logTime);
router.put("/:id", authenticateMiddleware, updateTimesheetEntry);
router.delete("/:id", authenticateMiddleware, deleteTimesheetEntry);

export default router;
