import Event from "../model/event.model.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";
import { queueReminderCheckForEvent } from "../jobs/reminderJob.js";

/** Ensure reminder emails can be resolved — UI may send userId without email. */
async function enrichAttendeesForSave(attendees) {
  if (!Array.isArray(attendees) || attendees.length === 0) return attendees;
  const out = [];
  for (const a of attendees) {
    const email = a.email && String(a.email).trim();
    if (email && email.includes("@")) {
      out.push(a);
      continue;
    }
    if (a.userId && mongoose.isValidObjectId(String(a.userId))) {
      const u = await User.findById(a.userId).select("email name").lean();
      out.push({
        ...a,
        email: (u?.email && String(u.email).trim()) || email || "",
        name: a.name || u?.name || "",
      });
      continue;
    }
    out.push(a);
  }
  return out;
}

/** Express `req.query` values are often strings after `Object.assign`; Zod may parse Dates that get lost. */
function asDate(v) {
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d;
}

function isElevated(role) {
  return role === "admin" || role === "super-admin";
}

function canModifyEvent(event, userId, role) {
  if (isElevated(role)) return true;
  return event.createdBy.toString() === userId.toString();
}

function advanceRecurrence(from, recurrence) {
  const d = new Date(from);
  switch (recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      return d;
    case "weekly":
      d.setDate(d.getDate() + 7);
      return d;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      return d;
    case "monthly": {
      const n = new Date(d);
      n.setMonth(n.getMonth() + 1);
      return n;
    }
    default:
      return d;
  }
}

/**
 * @param {Record<string, unknown>} plain lean or plain object
 * @param {Date} rangeStart
 * @param {Date} rangeEnd
 */
function expandOccurrences(plain, rangeStart, rangeEnd) {
  const origStart = new Date(plain.start);
  const origEnd = new Date(plain.end);
  const duration = origEnd.getTime() - origStart.getTime();
  const rec = plain.recurrence || "none";
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();

  const base = { ...plain };

  if (rec === "none") {
    if (origEnd.getTime() >= rs && origStart.getTime() <= re) {
      return [
        {
          ...base,
          occurrenceId: String(plain._id),
        },
      ];
    }
    return [];
  }

  const out = [];
  let cur = new Date(origStart);
  let guard = 0;
  while (cur.getTime() + duration < rs && guard < 3000) {
    cur = advanceRecurrence(cur, rec);
    guard++;
  }

  guard = 0;
  while (cur.getTime() <= re && guard < 3000) {
    const occStart = new Date(cur);
    const occEnd = new Date(occStart.getTime() + duration);
    if (occEnd.getTime() >= rs && occStart.getTime() <= re) {
      out.push({
        ...base,
        start: occStart,
        end: occEnd,
        occurrenceId: `${plain._id}_${occStart.toISOString()}`,
        seriesId: String(plain._id),
      });
    }
    cur = advanceRecurrence(cur, rec);
    guard++;
  }
  return out;
}

function visibilityFilter(userId, role) {
  if (isElevated(role)) return {};
  return {
    $or: [
      { visibleToTeam: true },
      { createdBy: userId },
      { "attendees.userId": userId },
    ],
  };
}

/** Events that may intersect [rangeStart, rangeEnd] including recurring series. */
function rangeQuery(rangeStart, rangeEnd) {
  return {
    $or: [
      {
        recurrence: "none",
        start: { $lte: rangeEnd },
        end: { $gte: rangeStart },
      },
      {
        recurrence: { $in: ["daily", "weekly", "biweekly", "monthly"] },
        start: { $lte: rangeEnd },
      },
    ],
  };
}

export const getEvents = async (req, res) => {
  try {
    const rangeStart = asDate(req.query.start);
    const rangeEnd = asDate(req.query.end);
    const userId = req.user._id;
    const role = req.user.role;

    const docs = await Event.find({
      $and: [rangeQuery(rangeStart, rangeEnd), visibilityFilter(userId, role)],
    })
      .populate("createdBy", "name email")
      .sort({ start: 1 })
      .lean();

    const expanded = docs.flatMap((d) => expandOccurrences(d, rangeStart, rangeEnd));

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      events: expanded,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

export const getTeamEvents = async (req, res) => {
  try {
    const userIds = req.query.userIds.map((id) => new mongoose.Types.ObjectId(id));

    let rangeStart;
    let rangeEnd;
    if (!req.query.start || !req.query.end) {
      const now = new Date();
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
      rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      rangeStart = asDate(req.query.start);
      rangeEnd = asDate(req.query.end);
    }

    const teamOr = {
      $or: [
        { createdBy: { $in: userIds } },
        { "attendees.userId": { $in: userIds } },
      ],
    };

    const docs = await Event.find({
      $and: [rangeQuery(rangeStart, rangeEnd), teamOr],
    })
      .populate("createdBy", "name email")
      .sort({ start: 1 })
      .lean();

    const expanded = docs.flatMap((d) => expandOccurrences(d, rangeStart, rangeEnd));

    return res.status(200).json({
      success: true,
      message: "Team events fetched successfully",
      events: expanded,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching team events",
      error: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (Array.isArray(body.attendees)) {
      body.attendees = await enrichAttendeesForSave(body.attendees);
    }
    const event = await Event.create({
      ...body,
      createdBy: req.user._id,
      // Never trust client — must be false so the reminder job can run
      reminderSent: false,
    });
    const populated = await Event.findById(event._id)
      .populate("createdBy", "name email")
      .lean();

    queueReminderCheckForEvent(event._id);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!canModifyEvent(event, req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or an admin can update this event",
      });
    }

    const prevStartMs = event.start ? new Date(event.start).getTime() : NaN;
    const prevEndMs = event.end ? new Date(event.end).getTime() : NaN;
    const prevReminderMinutes = Number(event.reminderMinutes);

    const allowed = [
      "title",
      "type",
      "start",
      "end",
      "allDay",
      "location",
      "description",
      "attendees",
      "color",
      "recurrence",
      "reminderMinutes",
      "reminderSent",
      "visibleToTeam",
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        event[key] = req.body[key];
      }
    }

    let scheduleOrReminderChanged = false;
    if (req.body.start !== undefined) {
      scheduleOrReminderChanged =
        scheduleOrReminderChanged ||
        new Date(req.body.start).getTime() !== prevStartMs;
    }
    if (req.body.end !== undefined) {
      scheduleOrReminderChanged =
        scheduleOrReminderChanged ||
        new Date(req.body.end).getTime() !== prevEndMs;
    }
    if (req.body.reminderMinutes !== undefined) {
      scheduleOrReminderChanged =
        scheduleOrReminderChanged ||
        Number(req.body.reminderMinutes) !== prevReminderMinutes;
    }
    if (scheduleOrReminderChanged) {
      event.reminderSent = false;
    }

    if (req.body.attendees !== undefined) {
      event.attendees = await enrichAttendeesForSave(req.body.attendees);
    }

    await event.save();
    queueReminderCheckForEvent(event._id);

    const populated = await Event.findById(event._id)
      .populate("createdBy", "name email")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!canModifyEvent(event, req.user._id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or an admin can delete this event",
      });
    }

    await Event.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};
