import express from "express";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  assignAsset,
  returnAsset,
  deleteAsset,
} from "../controllers/asset.controller.js";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/", authenticateMiddleware, getAssets);
router.get("/:id", authenticateMiddleware, getAssetById);

router.post(
  "/create",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  createAsset
);

router.put(
  "/:id",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  updateAsset
);

router.patch(
  "/:id/assign",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  assignAsset
);

router.patch(
  "/:id/return",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  returnAsset
);

router.delete(
  "/:id",
  authenticateMiddleware,
  authorize("super-admin", "admin", "hr"),
  deleteAsset
);

export default router;
