import Attendance from "../model/attendence.model.js";
import { calculateWorkingTime } from "../utils/calculateWorkingTime.js";
import { formatDuration } from "../utils/timeFormatter.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Worked time today: finished segments + current open session (if any). */
function computeDayWorkedMs(attendance) {
  const base = attendance.dayTotalMs || 0;
  if (!attendance.punchInTime) return base;
  if (attendance.status !== "working" && attendance.status !== "on_break") {
    return base;
  }
  return base + calculateWorkingTime(attendance);
}

function enrichAttendance(att) {
  const doc = att.toObject ? att.toObject() : { ...att };
  const dayMs = computeDayWorkedMs(att);
  return {
    ...doc,
    readableDayTotal: formatDuration(dayMs),
    dayWorkedMs: dayMs,
  };
}

function copyBreaks(breaks) {
  return (breaks || []).map((b) => ({
    breakStart: b.breakStart,
    breakEnd: b.breakEnd,
    totalBreakTime: b.totalBreakTime,
  }));
}

export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = startOfToday();

    let record = await Attendance.findOne({ user: userId, date: today });

    if (
      record &&
      record.punchInTime &&
      (record.status === "working" || record.status === "on_break")
    ) {
      return res.status(400).json({
        success: false,
        message: "You are already clocked in. Punch out first.",
      });
    }

    if (!record) {
      record = await Attendance.create({
        user: userId,
        date: today,
        punchInTime: new Date(),
        status: "working",
        breaks: [],
        segments: [],
        dayTotalMs: 0,
      });
    } else {
      if (
        record.status === "completed" &&
        record.punchInTime &&
        record.punchOutTime &&
        (!record.segments || record.segments.length === 0)
      ) {
        const legacyMs = calculateWorkingTime(record);
        record.segments = [
          {
            punchInTime: record.punchInTime,
            punchOutTime: record.punchOutTime,
            breaks: copyBreaks(record.breaks),
            totalTime: legacyMs,
          },
        ];
        record.dayTotalMs = (record.dayTotalMs || 0) + legacyMs;
      }

      record.punchInTime = new Date();
      record.punchOutTime = null;
      record.breaks = [];
      record.status = "working";
      await record.save();
    }

    return res.status(200).json({
      success: true,
      message: "Punched in successfully",
      attendance: enrichAttendance(record),
    });
  } catch (error) {
    console.error("❌ Error punching in:", error);
    return res.status(500).json({
      success: false,
      message: "Error punching in",
      error: error.message,
    });
  }
};

export const startBreak = async (req, res) => {
  const userId = req.user._id;

  try {
    const today = startOfToday();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance || !attendance.punchInTime) {
      return res.status(400).json({
        success: false,
        message: "You haven't punched in yet",
      });
    }

    attendance.breaks.push({ breakStart: new Date() });
    attendance.status = "on_break";
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Break started successfully",
      attendance: enrichAttendance(attendance),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error starting break",
      error: error.message,
    });
  }
};

export const endBreak = async (req, res) => {
  const userId = req.user._id;

  try {
    const today = startOfToday();
    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (
      !attendance ||
      !attendance.punchInTime ||
      attendance.status !== "on_break"
    ) {
      return res.status(400).json({
        success: false,
        message: "You haven't started a break yet",
      });
    }

    const currentBreak = attendance.breaks[attendance.breaks.length - 1];
    currentBreak.breakEnd = new Date();
    currentBreak.totalBreakTime =
      currentBreak.breakEnd - currentBreak.breakStart;

    attendance.status = "working";
    attendance.totalTime = calculateWorkingTime(attendance);
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Break ended successfully",
      attendance: enrichAttendance(attendance),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error ending break",
      error: error.message,
    });
  }
};

export const punchOut = async (req, res) => {
  const userId = req.user._id;

  try {
    const today = startOfToday();
    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (
      !attendance ||
      !attendance.punchInTime ||
      (attendance.status !== "working" && attendance.status !== "on_break")
    ) {
      return res.status(400).json({
        success: false,
        message: "You haven't punched in yet or you're not working",
      });
    }

    if (attendance.status === "on_break") {
      const lastBreak = attendance.breaks[attendance.breaks.length - 1];
      if (lastBreak && !lastBreak.breakEnd) {
        lastBreak.breakEnd = new Date();
        lastBreak.totalBreakTime = lastBreak.breakEnd - lastBreak.breakStart;
      }
    }

    attendance.punchOutTime = new Date();
    const sessionMs = calculateWorkingTime(attendance);

    attendance.segments = attendance.segments || [];
    attendance.segments.push({
      punchInTime: attendance.punchInTime,
      punchOutTime: attendance.punchOutTime,
      breaks: copyBreaks(attendance.breaks),
      totalTime: sessionMs,
    });

    attendance.dayTotalMs = (attendance.dayTotalMs || 0) + sessionMs;
    attendance.punchInTime = null;
    attendance.punchOutTime = null;
    attendance.breaks = [];
    attendance.status = "not_started";
    attendance.totalTime = attendance.dayTotalMs;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Punched out successfully",
      attendance: enrichAttendance(attendance),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error punching out",
      error: error.message,
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance;

    if (role === "admin") {
      attendance = await Attendance.find({ date: today })
        .sort({ date: -1 })
        .populate("user", "name email role");
    } else {
      attendance = await Attendance.find({ user: userId, date: today })
        .sort({ date: -1 })
        .populate("user", "name email role");
    }

    const enriched = attendance.map((a) => enrichAttendance(a));

    return res.status(200).json({
      success: true,
      message:
        role === "admin"
          ? "All users' attendance fetched successfully"
          : "Your attendance fetched successfully",
      attendance: enriched,
    });
  } catch (error) {
    console.error("❌ Error fetching attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting attendance",
      error: error.message,
    });
  }
};
