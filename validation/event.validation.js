import { z } from "zod";

const objectId = z.string().min(1);

export const EventTypeEnum = z.enum([
  "meeting",
  "schedule",
  "call",
  "deadline",
  "reminder",
  "other",
]);

export const RecurrenceEnum = z.enum([
  "none",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
]);

const AttendeeSchema = z.object({
  userId: objectId,
  name: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

export const EventsRangeQuerySchema = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((q) => q.end >= q.start, {
    message: "end must be on or after start",
  });

export const EventsTeamQuerySchema = z
  .object({
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
    userIds: z.preprocess(
      (v) => {
        if (v === undefined || v === null) return [];
        if (Array.isArray(v)) return v;
        return [v];
      },
      z.array(objectId).min(1, "At least one userIds entry is required")
    ),
  })
  .superRefine((q, ctx) => {
    const hasS = q.start !== undefined;
    const hasE = q.end !== undefined;
    if (hasS !== hasE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide both start and end, or neither",
      });
    }
    if (hasS && hasE && q.end < q.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end must be on or after start",
      });
    }
  });

export const CreateEventBodySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    type: EventTypeEnum.optional().default("other"),
    start: z.coerce.date(),
    end: z.coerce.date(),
    allDay: z.boolean().optional().default(false),
    location: z.string().optional().default(""),
    description: z.string().optional().default(""),
    attendees: z.array(AttendeeSchema).optional().default([]),
    color: z.string().optional().default("#3b82f6"),
    recurrence: RecurrenceEnum.optional().default("none"),
    reminderMinutes: z.coerce.number().int().min(0).max(4320).optional().default(15),
    reminderSent: z.boolean().optional().default(false),
    visibleToTeam: z.boolean().optional().default(true),
  })
  .refine((b) => b.end >= b.start, {
    message: "end must be on or after start",
  });

export const UpdateEventBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    type: EventTypeEnum.optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
    allDay: z.boolean().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    attendees: z.array(AttendeeSchema).optional(),
    color: z.string().optional(),
    recurrence: RecurrenceEnum.optional(),
    reminderMinutes: z.coerce.number().int().min(0).max(4320).optional(),
    reminderSent: z.boolean().optional(),
    visibleToTeam: z.boolean().optional(),
  })
  .superRefine((b, ctx) => {
    if (b.start !== undefined && b.end !== undefined && b.end < b.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end must be on or after start",
      });
    }
  });

export const EventIdParamSchema = z.object({
  id: objectId,
});
