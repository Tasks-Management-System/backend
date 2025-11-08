import Attendance from "../model/attendence.model.js";
import { calculateWorkingTime } from "../utils/calculateWorkingTime.js";
import { formatDuration } from "../utils/timeFormatter.js";

export const punchIn = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ Correct way to extract user ID
    console.log("userId ==>", userId);

    // 🕒 Set today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔍 Check if already punched in today
    const record = await Attendance.findOne({ user: userId, date: today });
    console.log("record ==>", record);

    if (record && record.punchInTime && record.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You have already punched in today",
      });
    }

    // ✅ Create new punch-in record
    const newAttendance = await Attendance.create({
      user: userId,
      date: today,
      punchInTime: new Date(),
      status: "working",
    });

    return res.status(200).json({
      success: true,
      message: "Punched in successfully",
      attendance: newAttendance,
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
    const today = new Date().setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance || !attendance.punchInTime) {
      return res.status(400).json({
        success: false,
        message: "You haven't punched in yet",
      });
    }

    // const newBreak = await Attendance.findByIdAndUpdate(record._id, {
    //   $push: {
    //     breaks: {
    //       startTime: new Date(),
    //       status: "on_break",
    //     },
    //   },
    // });

    attendance.breaks.push({ breakStart: new Date() });
    attendance.status = "on_break";
    await attendance.save();

    console.log("attendance ==>", attendance);

    return res.status(200).json({
      success: true,
      message: "Break started successfully",
      attendance,
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
    const today = new Date().setHours(0, 0, 0, 0);
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
    await attendance.save();

    // ✅ Recalculate total working time
    const totalWorkTime = calculateWorkingTime(attendance);
    attendance.totalTime = totalWorkTime;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Break ended successfully",
      attendance: {
        ...attendance.toObject(),
        readableTotalTime: formatDuration(totalWorkTime),
      },
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
    const today = new Date().setHours(0, 0, 0, 0);
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

    // End any ongoing break if user punches out while on break
    if (attendance.status === "on_break") {
      const lastBreak = attendance.breaks[attendance.breaks.length - 1];
      if (lastBreak && !lastBreak.breakEnd) {
        lastBreak.breakEnd = new Date();
        lastBreak.totalBreakTime = lastBreak.breakEnd - lastBreak.breakStart;
      }
    }

    attendance.punchOutTime = new Date();
    attendance.status = "completed";

    // ✅ Calculate total working time
    const totalWorkTime = calculateWorkingTime(attendance);
    attendance.totalTime = totalWorkTime;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Punched out successfully",
      attendance: {
        ...attendance.toObject(),
        readableTotalTime: formatDuration(totalWorkTime),
      },
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

    // 🕒 Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance;

    if (role === "admin") {
      // ✅ Admin can see all users' attendance
      attendance = await Attendance.find({ date: today })
        .sort({ date: -1 })
        .populate("user", "name email role");
    } else {
      // ✅ Employees can see only their own attendance
      attendance = await Attendance.find({ user: userId, date: today })
        .sort({ date: -1 })
        .populate("user", "name email role");
    }

    return res.status(200).json({
      success: true,
      message:
        role === "admin"
          ? "All users' attendance fetched successfully"
          : "Your attendance fetched successfully",
      attendance,
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
