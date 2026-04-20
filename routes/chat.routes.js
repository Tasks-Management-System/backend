import { Router } from "express";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";
import { getMessages, getOnlineUsersList } from "../controllers/chat.controller.js";

const router = Router();

router.use(authenticateMiddleware);

router.get("/online", getOnlineUsersList);
router.get("/:receiverId", getMessages);

export default router;
