import Task from "../model/tasks.model.js";
import User from "../model/user.model.js";
import { formatDuration } from "../utils/timeFormatter.js";

export const createTask = async (req, res) => {
  const { project, assignedTo, taskName, priority, status } = req.body;

  try {
    const user = await User.findById(assignedTo || null);
    console.log("user ==>", user);
    if (!user && assignedTo === null) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const newTask = await Task.create({
      project,
      assignedTo,
      taskName,
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

    // ✅ Base query
    let query =
      userRole === "admin" || userRole === "manager" || userRole === "hr"
        ? {}
        : { assignedTo: userId };

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

    // ✅ Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Fetch tasks with filters
    let tasks = await Task.find(query)
      .populate("project", "projectName")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ✅ Search filter
    const search = req.query.search?.trim()?.toLowerCase();
    if (search) {
      tasks = tasks.filter((task) => {
        const taskNameMatch = task.taskName?.toLowerCase().includes(search);
        const projectMatch = task.project?.projectName
          ?.toLowerCase()
          .includes(search);
        const assignedMatch = task.assignedTo?.name
          ?.toLowerCase()
          .includes(search);

        return taskNameMatch || projectMatch || assignedMatch;
      });
    }

    // ✅ Add readable time format
    const formattedTasks = tasks.map((task) => ({
      ...task.toObject(),
      readableTotalTime: formatDuration(task.totalTime),
    }));

    // ✅ Pagination meta
    const totalTasks = formattedTasks.length;

    return res.status(200).json({
      success: true,
      message:
        userRole === "admin"
          ? "All tasks fetched successfully"
          : "Your assigned tasks fetched successfully",
      tasks: formattedTasks,
      pagination: {
        totalTasks,
        totalPages: Math.ceil(totalTasks / limit),
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

    const { status, taskName, priority } = req.body;

    if (status) {
      // If moving to "in_progress" → start timer
      if (status === "in_progress" && !task.startTime) {
        task.startTime = new Date();
      }

      // If moving to "completed" → stop timer
      if (status === "completed" && !task.endTime) {
        task.endTime = new Date();
        const timeDiff = task.endTime - task.startTime;
        task.totalTime = timeDiff;
      }

      task.status = status;
    }

    if (taskName) task.taskName = taskName;
    if (priority) task.priority = priority;

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
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
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
    const task = await Task.findById(id)
    if(!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      })
    }

    const newQuery = { message }
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

    const task= await Task.findById(taskId)
    if(!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      })
    } 

    const query = task.queries.id(queryId)
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