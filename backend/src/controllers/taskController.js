const Task = require("../models/Task");

// Create new task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user.userId,
      assignedTo: assignedTo || req.user.userId,
    });

    await task.populate("createdBy", "name email");
    await task.populate("assignedTo", "name email");

    // Emit socket event
    if (req.io) {
      req.io.emit("taskCreated", task);
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};

    // Non-admin users see only their tasks
    if (req.user.role !== "admin") {
      query.$or = [
        { createdBy: req.user.userId },
        { assignedTo: req.user.userId },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get task by ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check access permissions
    if (
      req.user.role !== "admin" &&
      task.createdBy._id.toString() !== req.user.userId &&
      task.assignedTo?._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only task creator or admin can update.",
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, assignedTo },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    // Emit socket event
    if (req.io) {
      req.io.emit("taskUpdated", task);
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only task creator or admin can delete.",
      });
    }

    await task.deleteOne();

    // Emit socket event
    if (req.io) {
      req.io.emit("taskDeleted", { taskId: req.params.id });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get task statistics
exports.getTaskStats = async (req, res, next) => {
  try {
    let matchQuery = {};

    if (req.user.role !== "admin") {
      matchQuery = {
        $or: [{ createdBy: req.user.userId }, { assignedTo: req.user.userId }],
      };
    }

    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      todo: 0,
      inprogress: 0,
      completed: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json({
      success: true,
      data: { stats: formattedStats },
    });
  } catch (error) {
    next(error);
  }
};
