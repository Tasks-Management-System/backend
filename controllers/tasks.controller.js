import Task from "../model/tasks.model.js";
import User from "../model/user.model.js";
import Project from "../model/project.model.js";
import { formatDuration } from "../utils/timeFormatter.js";
import {
  getOrgCreatorUserIds,
  resolveOrgAdminId,
  userBelongsToOrg,
} from "../utils/teamScope.js";

async function getOrgProjectIds(orgAdminId) {
  if (!orgAdminId) return [];
  const creatorIds = await getOrgCreatorUserIds(orgAdminId);
  const ids = await Project.find({ user: { $in: creatorIds } }).distinct("_id");
  return ids;
}

async function taskAccessibleByUser(taskDoc, reqUser) {
  if (!taskDoc) return false;
  if (reqUser.role === "super-admin") return true;

  const orgAdminId = resolveOrgAdminId(reqUser);
  if (!orgAdminId) return false;

  let ownerId = taskDoc.project?.user;
  if (!ownerId && taskDoc.project) {
    const p = await Project.findById(taskDoc.project).select("user").lean();
    ownerId = p?.user;
  }
  if (!ownerId) return false;

  const creatorIds = await getOrgCreatorUserIds(orgAdminId);
  const inOrg = creatorIds.some((id) => id.equals(ownerId));
  if (!inOrg) return false;

  if (["admin", "manager", "hr"].includes(reqUser.role)) return true;
  return taskDoc.assignedTo?.toString() === reqUser._id.toString();
}

const ROLES_CAN_ASSIGN_OTHERS = new Set([
  "super-admin",
  "admin",
  "manager",
  "hr",
]);

export const createTask = async (req, res) => {
  const { project, assignedTo, taskName, description, dueDate, priority, status } = req.body;

  try {
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (req.user.role !== "super-admin") {
      const orgAdminId = resolveOrgAdminId(req.user);
      const creatorIds = await getOrgCreatorUserIds(orgAdminId);
      if (
        !orgAdminId ||
        !creatorIds.some((id) => id.equals(projectDoc.user))
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only create tasks on projects in your organization",
        });
      }
    }

    const canAssignOthers = ROLES_CAN_ASSIGN_OTHERS.has(req.user.role);
    let assigneeId = assignedTo;

    if (!canAssignOthers) {
      if (
        assignedTo &&
        String(assignedTo) !== String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only create tasks assigned to yourself",
        });
      }
      assigneeId = req.user._id;
    }

    if (assigneeId) {
      const user = await User.findById(assigneeId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      if (req.user.role !== "super-admin") {
        const orgAdminId = resolveOrgAdminId(req.user);
        const allowed = await userBelongsToOrg(assigneeId, orgAdminId);
        if (!allowed) {
          return res.status(403).json({
            success: false,
            message: "You can assign tasks only to users in your organization",
          });
        }
      }
    }
    const newTask = await Task.create({
      project,
      assignedTo: assigneeId || undefined,
      taskName,
      description: description ?? "",
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      status,
    });
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    // 🔐 Ensure user exists (from middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No user found in request.",
      });
    }

    const { _id: userId, role } = req.user;
    const userRole = Array.isArray(role) ? role[0] : role;

    let query = {};
    let canSeeAll =
      userRole === "admin" || userRole === "manager" || userRole === "hr";

    if (userRole === "super-admin") {
      query = {};
    } else {
      const orgAdminId = resolveOrgAdminId(req.user);
      const projectIds = await getOrgProjectIds(orgAdminId);
      if (canSeeAll) {
        query = { project: { $in: projectIds } };
      } else {
        query = { assignedTo: userId, project: { $in: projectIds } };
      }
    }

    if (req.query.scope === "my") {
      if (userRole === "super-admin") {
        query = { assignedTo: userId };
      } else {
        const orgAdminId = resolveOrgAdminId(req.user);
        const projectIds = await getOrgProjectIds(orgAdminId);
        query = { assignedTo: userId, project: { $in: projectIds } };
      }
      canSeeAll = false;
    }

    // ✅ Date filter (fromDate, toDate)
    const { fromDate, toDate } = req.query;

    if (fromDate || toDate) {
      query.createdAt = {};

      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        // Include the full day for toDate (till 23:59:59)
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    if (req.query.project) {
      query.project = req.query.project;
    }

    if (req.query.archived === "true") {
      query.archived = true;
    } else {
      query.archived = { $ne: true };
    }

    const search = req.query.search?.trim();
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.taskName = rx;
    }

    // ✅ Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "projectName")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Add readable time format
    const formattedTasks = tasks.map((task) => ({
      ...task.toObject(),
      readableTotalTime: formatDuration(task.totalTime),
    }));

    return res.status(200).json({
      success: true,
      message: canSeeAll
        ? "Organization tasks fetched successfully"
        : "Your assigned tasks fetched successfully",
      tasks: formattedTasks,
      pagination: {
        totalTasks,
        totalPages: Math.ceil(totalTasks / limit) || 1,
        currentPage: page,
        nextPage: page * limit < totalTasks ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error("❌ Error getting tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const allowed = await taskAccessibleByUser(task, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update this task",
      });
    }

    const { status, taskName, priority, description, dueDate, archived } = req.body;

    if (status) {
      // Start work timer when entering in_progress (not on review)
      if (status === "in_progress" && !task.startTime) {
        task.startTime = new Date();
      }

      // Review: no timer change (work paused for approval)

      // Stop timer when completed
      if (status === "completed" && !task.endTime) {
        task.endTime = new Date();
        if (task.startTime) {
          task.totalTime = task.endTime - task.startTime;
        }
      }

      task.status = status;
    }

    if (taskName) task.taskName = taskName;
    if (priority) task.priority = priority;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (archived !== undefined) task.archived = archived;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: {
        ...task.toObject(),
        readableTotalTime: formatDuration(task.totalTime),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

export const taskById = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId)
      .populate("project")
      .populate("assignedTo");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const allowed = await taskAccessibleByUser(task, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to view this task",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      task: {
        ...task.toObject(),
        totalTime: formatDuration(task.totalTime),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting task",
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const allowed = await taskAccessibleByUser(task, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to delete this task",
      });
    }

    await Task.findByIdAndDelete(taskId);
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

export const addQuery = async (req, res) => {
  const {id} = req.params;
  const {message} = req.body
  const userId = req.user._id

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.assignedTo?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the assignee can add a query to this task",
      });
    }

    const allowed = await taskAccessibleByUser(task, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to add a query on this task",
      });
    }

    const newQuery = { message };
    task.queries.push(newQuery)
    await task.save()
    return res.status(200).json({
      success: true,
      message: "Query added successfully",
      query: newQuery
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding query",
      error: error.message,
    });
  }
}

export const replyQuery = async (req, res) => {
  const {taskId, queryId} = req.params;
  const {reply} = req.body
  const {role} = req.user

  try {
    const userRole = Array.isArray(role) ? role[0] : role
    if(userRole !== "admin" && userRole !== "manager") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reply to this query"
      })
    }

    const task = await Task.findById(taskId).populate("project", "user");
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (req.user.role !== "super-admin") {
      const orgAdminId = resolveOrgAdminId(req.user);
      const creatorIds = await getOrgCreatorUserIds(orgAdminId);
      const ownerId = task.project?.user;
      if (
        !ownerId ||
        !creatorIds.some((id) => id.equals(ownerId))
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to reply to this query",
        });
      }
    }

    const query = task.queries.id(queryId);
    if(!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found"
      })
    }
    query.reply = reply
    query.status = "resolved",
    query.updatedAt = new Date()
    await task.save()
    return res.status(200).json({
      success: true,
      message: "Query replied successfully",
      query: {
        ...query.toObject(),
        reply,
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error replying to query",
      error: error.message,
    });
  }
}