import Leave from "../model/leave.model.js";
import User from "../model/user.model.js";
import { leaveRequestTemplate } from "../utils/mailService/leaveRequestTemplate.js";
import { leaveStatusTemplate } from "../utils/mailService/leaveStatusTemplat.js";
import { sendEmail } from "../utils/mailService/sendMail.js";

export const applyLeave = async (req, res) => {
  const { days, subType, fromDate, toDate, reason } = req.body;
  const userId = req.user._id;

  try {
    // Validate dates
    if (days === "single" && !fromDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate is required for single day leave",
      });
    }
    if (days === "multiple" && (!fromDate || !toDate)) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required for multiple day leave",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize leave balance if missing
    if (!user.leaves || user.leaves.length === 0) {
      user.leaves = [{ totalBalance: 24, paidLeave: 12, leaveTaken: 0 }];
    }

    const leaveBalance = user.leaves[0];
    const from = new Date(fromDate);
    const month = from.getMonth();
    const year = from.getFullYear();

    // ✅ Count all leaves this month (approved or pending)
    const existingLeaves = await Leave.find({
      user: userId,
      status: { $in: ["approved", "pending"] },
      fromDate: {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month + 1, 0),
      },
    });

    let leaveType = "unpaidLeave";

    let totalDays = 1; // default single day
    if (days === "multiple") {
      const diff = new Date(toDate) - new Date(fromDate);
      totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // ✅ If half day
    if (subType === "halfDay") {
      totalDays = 0.5;
    }

    // ✅ Only the very first leave in this month gets "paidLeave"
    if (existingLeaves.length === 0 && leaveBalance.paidLeave > 0) {
      leaveType = "paidLeave";
      leaveBalance.paidLeave -= totalDays;
    } else {
      // If already taken or requested paid leave this month
      if (leaveBalance.totalBalance >= totalDays) {
        leaveBalance.totalBalance -= totalDays;
      } else {
        leaveType = "unpaidLeave";
      }
    }

    // Create leave record
    const leave = await Leave.create({
      user: userId,
      type: leaveType,
      days,
      subType,
      fromDate,
      toDate: days === "multiple" ? toDate : fromDate,
      reason,
    });

    leaveBalance.leaveTaken += totalDays;
    user.markModified("leaves");
    await user.save();

    const hrEmail = process.env.ADMIN_EMAIL;
    const html = leaveRequestTemplate({
      employeeName: user.name,
      leaveType: leaveType,
      fromDate: fromDate,
      toDate: toDate,
      reason: reason,
    })

    await sendEmail(hrEmail, "New Leave Request Submitted", html);
    console.log("Email sent to HR");
    res.status(201).json({
      success: true,
      message: "Leave request applied successfully",
      leave,
      updatedBalance: leaveBalance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error applying leave",
      error: error.message,
    });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const loggedInUser = req.user; // from auth middleware

    // ✅ Only admin or HR can update leave status
    if (!["admin", "hr"].includes(loggedInUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin or HR can change leave status.",
      });
    }

    // ✅ Fetch leave and populate user details
    const leave = await Leave.findById(id).populate("user");
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    // ✅ Prevent updating if already in final state
    if (leave.status === "rejected" && status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "This leave has already been rejected.",
      });
    }

    if (leave.status === "approved" && status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This leave has already been approved.",
      });
    }

    const user = leave.user;

    // ✅ Handle rejected leaves — refund balances
    if (status === "rejected" && user && user.leaves?.length > 0) {
      const leaveBalance = user.leaves[0];

      if (leave.type === "paidLeave") {
        leaveBalance.paidLeave += 1;
      } else if (
        leave.type === "unpaidLeave" &&
        leaveBalance.totalBalance < 24
      ) {
        leaveBalance.totalBalance += 1;
      }

      user.markModified("leaves");
      await user.save();
    }

    // ✅ Update leave record
    leave.status = status;
    leave.adminComment = adminComment || "";
    await leave.save();

    const html = leaveStatusTemplate({
      employeeName: user.name,
      status: status,
      leaveType: leave.type,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
    })
    await sendEmail(user.email, "Leave Status Update", html);
    console.log(`Email sent to ${user.email}`);


    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully.`,
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating leave status",
      error: error.message,
    });
  }
};

export const getLeaveHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const leaves = await Leave.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Leave history fetched successfully",
      leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave history",
      error: error.message,
    });
  }
};

export const getLeaveById = async (req, res) => {
  const { id } = req.params;
  try {
    const leave = await Leave.findById(id).populate("user", "name leaves");
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Leave fetched successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave",
      error: error.message,
    });
  }
};
