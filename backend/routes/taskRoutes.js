const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/task");
const User = require("../models/user");
const Notification = require("../models/notification");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { recalculateEmployeePerformance } = require("../utils/performanceCalculator");

const router = express.Router();

// Helper: GitHub repository URL validator
const GITHUB_REPO_REGEX =
  /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/i;

const isValidGitHubRepoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return GITHUB_REPO_REGEX.test(url.trim());
};

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
      githubRepoUrl,
    } = req.body;

    const targetEmployeeIdentifier = employeeId || assignedTo;

    // Validation
    if (!targetEmployeeIdentifier || !title || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Employee, title, description, and due date are required.",
      });
    }

    // Optional validation for Admin's Starter GitHub Repo URL
    if (githubRepoUrl && githubRepoUrl.trim() && !isValidGitHubRepoUrl(githubRepoUrl)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid GitHub repository URL. Format should be: https://github.com/username/project",
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
      githubRepoUrl: githubRepoUrl ? githubRepoUrl.trim() : "",
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
        message: `Admin assigned you a new task: "${task.title}". Priority: ${task.priority}. Due: ${new Date(task.dueDate).toLocaleDateString()}.${githubRepoUrl ? " GitHub repo link attached." : ""}`,
        link: "/EmployeeTasks",
        isRead: false,
      });
    } catch (notifErr) {
      console.error("Failed to generate task notification:", notifErr);
    }

    // Automatically recalculate employee performance metrics
    recalculateEmployeePerformance(employee._id).catch((pErr) =>
      console.error("Performance recalculation error:", pErr)
    );

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
      githubRepoUrl,
      submissionGithubUrl,
      adminFeedback,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    if (githubRepoUrl !== undefined) {
      if (githubRepoUrl && githubRepoUrl.trim() && !isValidGitHubRepoUrl(githubRepoUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid GitHub repository URL. Format should be: https://github.com/username/project",
        });
      }
      task.githubRepoUrl = githubRepoUrl.trim();
    }

    if (submissionGithubUrl !== undefined) {
      if (submissionGithubUrl && submissionGithubUrl.trim() && !isValidGitHubRepoUrl(submissionGithubUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid submission GitHub repository URL. Format should be: https://github.com/username/project",
        });
      }
      task.submissionGithubUrl = submissionGithubUrl.trim();
    }

    if (adminFeedback !== undefined) task.adminFeedback = adminFeedback.trim();
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (priority) task.priority = priority;
    if (startDate) task.startDate = new Date(startDate);
    if (dueDate) task.dueDate = new Date(dueDate);
    if (performanceWeight !== undefined)
      task.performanceWeight = Number(performanceWeight);
    if (status) {
      task.status = status;
      if (status === "Completed") {
        task.reviewedAt = new Date();
      }
    }

    const targetEmp = employeeId || assignedTo;
    if (targetEmp) {
      let emp;
      if (mongoose.isValidObjectId(targetEmp)) {
        emp = await User.findById(targetEmp);
      } else {
        emp = await User.findOne({ employeeId: targetEmp });
      }
      if (emp) {
        task.assignedTo = emp._id;
        task.employeeId = emp.employeeId || "";
      }
    }

    await task.save();

    // Automatically recalculate performance for the assigned employee
    if (task.assignedTo) {
      recalculateEmployeePerformance(task.assignedTo).catch((pErr) =>
        console.error("Performance recalculation error:", pErr)
      );
    }

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
// ADMIN: UPDATE TASK STATUS / REVIEW TASK
// PATCH /api/admin/tasks/:id/status
// =====================================================
router.patch("/tasks/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback } = req.body;

    if (!["Pending", "In Progress", "Under Review", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be Pending, In Progress, Under Review, or Completed.",
      });
    }

    const updateFields = { status };
    if (adminFeedback !== undefined) {
      updateFields.adminFeedback = adminFeedback.trim();
    }
    if (status === "Completed") {
      updateFields.reviewedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      id,
      updateFields,
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

    // Automatically recalculate employee performance when task status changes (e.g. Completed)
    if (task.assignedTo && task.assignedTo._id) {
      recalculateEmployeePerformance(task.assignedTo._id).catch((pErr) =>
        console.error("Performance recalculation error:", pErr)
      );
    }

    // Send notification to employee
    try {
      if (task.assignedTo && task.assignedTo._id) {
        let notifTitle = "Task Status Updated";
        let notifMsg = `Your task "${task.title}" status is now ${status}.`;
        
        if (status === "Completed") {
          notifTitle = "Task Approved & Completed! 🎉";
          notifMsg = `Great work! Admin reviewed your GitHub repository submission and marked "${task.title}" as Completed.${adminFeedback ? ` Feedback: "${adminFeedback}"` : ""}`;
        } else if (status === "In Progress" && adminFeedback) {
          notifTitle = "Task Review Feedback";
          notifMsg = `Admin reviewed "${task.title}" and requested changes: "${adminFeedback}"`;
        }

        await Notification.create({
          recipient: task.assignedTo._id,
          recipientEmployeeId: task.assignedTo.employeeId || "",
          sender: req.user._id,
          type: "TASK_UPDATED",
          title: notifTitle,
          message: notifMsg,
          link: "/EmployeeTasks",
          isRead: false,
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify employee on status change:", notifErr);
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

    if (task.assignedTo) {
      recalculateEmployeePerformance(task.assignedTo).catch((pErr) =>
        console.error("Performance recalculation error:", pErr)
      );
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
// EMPLOYEE: SUBMIT TASK WITH GITHUB REPO URL
// POST /api/tasks/:id/submit
// =====================================================
router.post("/:id/submit", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionGithubUrl, githubUrl, submissionNotes } = req.body;

    const targetUrl = (submissionGithubUrl || githubUrl || "").trim();

    // 1. Validate that submitted URL is not empty
    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        message: "GitHub repository URL is required to submit the completed task.",
      });
    }

    // 2. Validate that submitted URL looks like a valid GitHub repo URL
    if (!isValidGitHubRepoUrl(targetUrl)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid GitHub repository URL. Must be in format: https://github.com/username/project",
      });
    }

    // Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Check employee ownership or admin
    const isOwner =
      task.assignedTo.toString() === req.user._id.toString() ||
      (task.employeeId && req.user.employeeId && task.employeeId === req.user.employeeId);

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit this task.",
      });
    }

    // Update task submission info and change status to 'Under Review'
    task.submissionGithubUrl = targetUrl;
    if (submissionNotes !== undefined) {
      task.submissionNotes = submissionNotes.trim();
    }
    task.submittedAt = new Date();
    task.status = "Under Review";

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId department position")
      .populate("assignedBy", "name email");

    // Notify Admin that task is submitted for manual folder/repo check
    try {
      const adminUsers = await User.find({ role: "admin" });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          sender: req.user._id,
          type: "TASK_UPDATED",
          title: "Task Submitted for Review",
          message: `${req.user.name} submitted GitHub repository for task "${task.title}". Please check repository and complete task.`,
          link: "/AssignTasks",
          isRead: false,
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify admin on task submission:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: "Task submitted successfully with GitHub repository! Admin will review your submission.",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Submit Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit task.",
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
    const { status, submissionGithubUrl, githubUrl, submissionNotes } = req.body;

    if (!["Pending", "In Progress", "Under Review", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be Pending, In Progress, Under Review, or Completed.",
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

    // If attempting to mark as Under Review or Completed, enforce GitHub repository URL validation
    const providedUrl = (submissionGithubUrl || githubUrl || "").trim();
    if (status === "Under Review" || (status === "Completed" && req.user.role !== "admin")) {
      const effectiveUrl = providedUrl || task.submissionGithubUrl;
      if (!effectiveUrl) {
        return res.status(400).json({
          success: false,
          message: "A valid GitHub repository URL is required to complete/submit this task.",
        });
      }
      if (!isValidGitHubRepoUrl(effectiveUrl)) {
        return res.status(400).json({
          success: false,
          message: "Invalid GitHub repository URL. Example format: https://github.com/username/project",
        });
      }
      task.submissionGithubUrl = effectiveUrl;
      if (submissionNotes) task.submissionNotes = submissionNotes.trim();
      task.submittedAt = new Date();
      // Employee sets status to Under Review for Admin verification
      task.status = "Under Review";
    } else {
      task.status = status;
      if (providedUrl) {
        if (!isValidGitHubRepoUrl(providedUrl)) {
          return res.status(400).json({
            success: false,
            message: "Invalid GitHub repository URL. Example format: https://github.com/username/project",
          });
        }
        task.submissionGithubUrl = providedUrl;
      }
    }

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
