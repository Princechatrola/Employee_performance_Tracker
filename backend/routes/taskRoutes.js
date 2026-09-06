const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/User");
const Notification = require("../models/notification");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// ADMIN: CREATE / ASSIGN TASK
// POST /api/admin/tasks
// =====================================================
router.post("/tasks", adminMiddleware, async (req, res) => {
  try {
    const {
      employeeId,
      assignedTo,
      title,
      description,
      priority,
      startDate,
      dueDate,
      performanceWeight,
    } = req.body;

    const targetEmployeeIdentifier = employeeId || assignedTo;

    // Validation
    if (!targetEmployeeIdentifier || !title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Employee, title, description, and due date are required.",
      });
    }

    // Find Employee (by MongoDB _id, employeeId string like 'EMP001', or email)
    let employee;
    if (mongoose.isValidObjectId(targetEmployeeIdentifier)) {
      employee = await User.findById(targetEmployeeIdentifier);
    }

    if (!employee) {
      employee = await User.findOne({
        employeeId: { $regex: new RegExp(`^${targetEmployeeIdentifier}$`, "i") },
      });
    }

    if (!employee) {
      employee = await User.findOne({
        email: targetEmployeeIdentifier.toLowerCase().trim(),
      });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Assigned employee not found.",
      });
    }

    // Validate dates
    const parsedDueDate = new Date(dueDate);
    const parsedStartDate = startDate ? new Date(startDate) : new Date();

    if (parsedDueDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be earlier than start date.",
      });
    }

    // Create Task
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      assignedTo: employee._id,
      employeeId: employee.employeeId || "",
      assignedBy: req.user._id,
      priority: priority || "Medium",
      startDate: parsedStartDate,
      dueDate: parsedDueDate,
      performanceWeight: Number(performanceWeight) || 10,
      status: "Pending",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email");

    // Automatically trigger notification for the employee
    try {
      await Notification.create({
        recipient: employee._id,
        recipientEmployeeId: employee.employeeId || "",
        sender: req.user._id,
        type: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: `Admin assigned you a new task: "${task.title}". Priority: ${task.priority}. Due: ${new Date(task.dueDate).toLocaleDateString()}.`,
        link: "/EmployeeTasks",
        isRead: false,
      });
    } catch (notifErr) {
      console.error("Failed to generate task notification:", notifErr);
    }

    res.status(201).json({
      success: true,
      message: "Task assigned successfully.",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Assign Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign task.",
    });
  }
});

// =====================================================
// ADMIN: GET ALL TASKS
// GET /api/admin/tasks
// =====================================================
router.get("/tasks", adminMiddleware, async (req, res) => {
  try {
    const { employeeId, status, priority, search } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (employeeId && employeeId !== "All") {
      if (mongoose.isValidObjectId(employeeId)) {
        query.assignedTo = employeeId;
      } else {
        const matchedUser = await User.findOne({ employeeId });
        if (matchedUser) {
          query.assignedTo = matchedUser._id;
        }
      }
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
    });
  }
});

// =====================================================
// ADMIN: UPDATE TASK
// PUT /api/admin/tasks/:id
// =====================================================
router.put("/tasks/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      startDate,
      dueDate,
      performanceWeight,
      status,
      employeeId,
      assignedTo,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (priority) task.priority = priority;
    if (startDate) task.startDate = new Date(startDate);
    if (dueDate) task.dueDate = new Date(dueDate);
    if (performanceWeight !== undefined)
      task.performanceWeight = Number(performanceWeight);
    if (status) task.status = status;

    const targetEmp = employeeId || assignedTo;
    if (targetEmp) {
      let emp;
      if (mongoose.isValidObjectId(targetEmp)) {
        emp = await User.findById(targetEmp);
      } else {
        emp = await User.findOne({ employeeId: targetEmp });
      }
      if (emp) task.assignedTo = emp._id;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task.",
    });
  }
});

// =====================================================
// ADMIN: UPDATE TASK STATUS
// PATCH /api/admin/tasks/:id/status
// =====================================================
router.patch("/tasks/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be Pending, In Progress, or Completed.",
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status.",
    });
  }
});

// =====================================================
// ADMIN: DELETE TASK
// DELETE /api/admin/tasks/:id
// =====================================================
router.delete("/tasks/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task.",
    });
  }
});

// =====================================================
// EMPLOYEE: GET LOGGED-IN EMPLOYEE'S TASKS
// GET /api/tasks/my-tasks
// =====================================================
router.get("/my-tasks", authMiddleware, async (req, res) => {
  try {
    const userObjectId = req.user._id;
    const userEmpId = req.user.employeeId;

    const queryConditions = [{ assignedTo: userObjectId }];
    if (userEmpId) {
      queryConditions.push({ employeeId: userEmpId });
    }

    const tasks = await Task.find({ $or: queryConditions })
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      employee: {
        id: req.user._id,
        name: req.user.name,
        employeeId: req.user.employeeId,
        email: req.user.email,
      },
      tasks,
    });
  } catch (error) {
    console.error("Get My Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your tasks.",
    });
  }
});

// =====================================================
// EMPLOYEE: UPDATE TASK STATUS
// PATCH /api/tasks/:id/status
// =====================================================
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    // Find task and ensure it belongs to the logged-in employee (or admin)
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const isOwner =
      task.assignedTo.toString() === req.user._id.toString() ||
      (task.employeeId && req.user.employeeId && task.employeeId === req.user.employeeId);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task.",
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status.",
    });
  }
});

module.exports = router;
