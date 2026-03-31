import express from "express";
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createEvent,
  deleteEvent,
  getEvents,
  getTeamEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import {
  CreateEventBodySchema,
  EventIdParamSchema,
  EventsRangeQuerySchema,
  EventsTeamQuerySchema,
  UpdateEventBodySchema,
} from "../validation/event.validation.js";

const router = express.Router();

router.get(
  "/team",
  authenticateMiddleware,
  authorize("manager", "hr", "admin", "super-admin"),
  validate({ query: EventsTeamQuerySchema }),
  getTeamEvents
);

router.get(
  "/",
  authenticateMiddleware,
  validate({ query: EventsRangeQuerySchema }),
  getEvents
);

router.post(
  "/",
  authenticateMiddleware,
  validate({ body: CreateEventBodySchema }),
  createEvent
);

router.put(
  "/:id",
  authenticateMiddleware,
  validate({
    params: EventIdParamSchema,
    body: UpdateEventBodySchema,
  }),
  updateEvent
);

router.delete(
  "/:id",
  authenticateMiddleware,
  validate({ params: EventIdParamSchema }),
  deleteEvent
);

export default router;
