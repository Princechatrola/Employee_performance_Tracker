const express = require("express");
const User = require("../models/User");
const Task = require("../models/task");
const Attendance = require("../models/attendance");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   EMPLOYEE DASHBOARD
   GET /api/employee/dashboard
===================================================== */
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch employee details (excluding password)
    const employee = await User.findById(userId).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    // 2. Fetch all tasks assigned to this employee
    const queryConditions = [{ assignedTo: userId }];
    if (employee.employeeId) {
      queryConditions.push({ employeeId: employee.employeeId });
    }

    const allTasks = await Task.find({ $or: queryConditions })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    ).length;
    const pendingTasks = allTasks.filter(
      (t) => t.status?.toLowerCase() === "pending"
    ).length;
    const inProgressTasks = allTasks.filter(
      (t) => t.status?.toLowerCase() === "in progress"
    ).length;

    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status?.toLowerCase() !== "completed"
    ).length;

    // Calculate completion rate
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Performance score calculation:
    // If employee model has performanceScore, use it; otherwise compute weighted score or simple ratio
    let performanceScore = employee.performanceScore;
    if (!performanceScore || performanceScore === 0) {
      if (totalTasks > 0) {
        performanceScore = Number(((completedTasks / totalTasks) * 10).toFixed(1));
      } else {
        performanceScore = 0;
      }
    }

    // 3. Recent 5 tasks
    const recentTasks = allTasks.slice(0, 5);

    // 4. Performance breakdown metrics
    const performance = {
      score: performanceScore,
      taskCompletionRate: completionRate,
      attendanceRate: 95, // Default active attendance
      goalProgress: completionRate,
      ratingLabel:
        performanceScore >= 8.5
          ? "Excellent Performance"
          : performanceScore >= 6.5
          ? "Good Performance"
          : performanceScore >= 4
          ? "Average Performance"
          : "Needs Improvement",
    };

    res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        employeeId: employee.employeeId || "EMP001",
        department: employee.department || "General",
        position: employee.position || "Employee",
        status: employee.status || "Active",
        joiningDate: employee.joiningDate,
        employmentType: employee.employmentType,
        performanceScore: performanceScore,
      },
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
      },
      performance,
      recentTasks,
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching employee dashboard.",
    });
  }
});

/* =====================================================
   EMPLOYEE PERFORMANCE ANALYTICS
   GET /api/employee/performance
===================================================== */
router.get("/performance", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch employee
    const employee = await User.findById(userId).select("-password");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found.",
      });
    }

    // 2. Fetch all tasks
    const queryConditions = [{ assignedTo: userId }];
    if (employee.employeeId) {
      queryConditions.push({ employeeId: employee.employeeId });
    }

    const tasks = await Task.find({ $or: queryConditions })
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    );
    const pendingTasks = tasks.filter(
      (t) => t.status?.toLowerCase() === "pending"
    );
    const inProgressTasks = tasks.filter(
      (t) => t.status?.toLowerCase() === "in progress"
    );

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status?.toLowerCase() !== "completed"
    );

    // On-Time completed tasks
    const onTimeTasks = completedTasks.filter((t) => {
      if (!t.dueDate) return true;
      const finishedAt = new Date(t.updatedAt || t.createdAt);
      return finishedAt <= new Date(t.dueDate);
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
    const onTimeRate =
      completedTasks.length > 0
        ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
        : totalTasks > 0
        ? 0
        : 100;

    // High priority stats
    const highPriorityTasks = tasks.filter((t) => t.priority === "High");
    const highPriorityCompleted = highPriorityTasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    );
    const highPriorityRate =
      highPriorityTasks.length > 0
        ? Math.round(
            (highPriorityCompleted.length / highPriorityTasks.length) * 100
          )
        : 100;

    // 3. Fetch Attendance records
    const attendanceRecords = await Attendance.find({ employee: userId });
    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === "Present" || a.status === "Late"
    ).length;
    const lateDays = attendanceRecords.filter((a) => a.status === "Late").length;
    const totalHoursLogged = attendanceRecords
      .reduce((sum, a) => sum + (a.workingHours || 0), 0)
      .toFixed(1);

    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round((presentDays / totalAttendanceDays) * 100)
        : 95; // Default 95% if new

    const punctualityRate =
      presentDays > 0
        ? Math.round(((presentDays - lateDays) / presentDays) * 100)
        : 95;

    // 4. Calculate Overall Performance Score (out of 10)
    let score = employee.performanceScore;
    if (!score || score === 0) {
      if (totalTasks > 0 || totalAttendanceDays > 0) {
        const rawScore =
          (completionRate * 0.45 +
            attendanceRate * 0.25 +
            onTimeRate * 0.2 +
            punctualityRate * 0.1) /
          10;
        score = Number(rawScore.toFixed(1));
      } else {
        score = 8.5; // Baseline score for new accounts
      }
    }

    let ratingBadge = "Good";
    let ratingDescription = "Consistently meets performance expectations";
    if (score >= 9.0) {
      ratingBadge = "Top Performer";
      ratingDescription = "Exceeds all benchmarks with exceptional output quality";
    } else if (score >= 8.0) {
      ratingBadge = "Excellent";
      ratingDescription = "Consistently delivers high-quality work ahead of time";
    } else if (score >= 6.5) {
      ratingBadge = "Good";
      ratingDescription = "Dependable with steady productivity and quality";
    } else if (score >= 5.0) {
      ratingBadge = "Average";
      ratingDescription = "Meets standard expectations with room for growth";
    } else {
      ratingBadge = "Needs Improvement";
      ratingDescription = "Action required to meet task deadlines and attendance";
    }

    res.status(200).json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId || "EMP001",
        department: employee.department || "General",
        position: employee.position || "Employee",
        email: employee.email,
        joiningDate: employee.joiningDate,
      },
      overall: {
        score,
        ratingBadge,
        ratingDescription,
      },
      taskMetrics: {
        totalAssigned: totalTasks,
        completedCount: completedTasks.length,
        pendingCount: pendingTasks.length,
        inProgressCount: inProgressTasks.length,
        overdueCount: overdueTasks.length,
        completionRate,
        onTimeRate,
        highPriorityRate,
      },
      attendanceMetrics: {
        totalDays: totalAttendanceDays,
        daysPresent,
        lateDays,
        attendanceRate,
        punctualityRate,
        totalHoursLogged: Number(totalHoursLogged),
      },
      kpiBreakdown: [
        {
          name: "Task Delivery & Completion",
          score: completionRate,
          description: `${completedTasks.length} of ${totalTasks} tasks completed`,
        },
        {
          name: "On-Time Precision",
          score: onTimeRate,
          description: `${onTimeTasks.length} tasks finished on or before deadline`,
        },
        {
          name: "Attendance & Reliability",
          score: attendanceRate,
          description: `${presentDays} days logged as present`,
        },
        {
          name: "High Priority Task Success",
          score: highPriorityRate,
          description: `${highPriorityCompleted.length} of ${highPriorityTasks.length} high priority tasks closed`,
        },
      ],
      recentTasks: tasks.slice(0, 6),
    });
  } catch (error) {
    console.error("Employee Performance Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching performance details.",
    });
  }
});

module.exports = router;

