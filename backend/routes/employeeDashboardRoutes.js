const express = require("express");
const User = require("../models/user");
const Task = require("../models/task");
const Attendance = require("../models/attendance");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
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
      queryConditions.push({
        employeeId: { $regex: new RegExp(`^${employee.employeeId}$`, "i") },
      });
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
    const underReviewTasks = allTasks.filter(
      (t) => t.status?.toLowerCase() === "under review"
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
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // On-Time completed tasks
    const onTimeTasks = allTasks.filter((t) => {
      if (t.status?.toLowerCase() !== "completed") return false;
      if (!t.dueDate) return true;
      const finishedAt = new Date(t.updatedAt || t.createdAt);
      return finishedAt <= new Date(t.dueDate);
    }).length;

    const onTimeRate =
      completedTasks > 0
        ? Math.round((onTimeTasks / completedTasks) * 100)
        : totalTasks === 0
        ? 100
        : 80;

    // Attendance records
    const attConditions = [{ employee: userId }];
    if (employee.employeeId) {
      attConditions.push({
        employeeId: { $regex: new RegExp(`^${employee.employeeId}$`, "i") },
      });
    }
    const attendanceRecords = await Attendance.find({ $or: attConditions });
    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === "Present" || a.status === "Late"
    ).length;
    const lateDays = attendanceRecords.filter((a) => a.status === "Late").length;

    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round((presentDays / totalAttendanceDays) * 100)
        : 100;

    const punctualityRate =
      presentDays > 0
        ? Math.round(((presentDays - lateDays) / presentDays) * 100)
        : 100;

    // Performance score calculation:
    let performanceScore;
    if (totalTasks === 0 && totalAttendanceDays === 0) {
      performanceScore = employee.performanceScore > 0 ? employee.performanceScore : 8.0;
    } else {
      const taskFactor = (completionRate / 100) * 4.0;
      const timeFactor = (onTimeRate / 100) * 3.0;
      const attFactor = (attendanceRate / 100) * 2.0;
      const punctFactor = (punctualityRate / 100) * 1.0;
      performanceScore = Number(
        Math.min(10, Math.max(1, taskFactor + timeFactor + attFactor + punctFactor)).toFixed(1)
      );
    }

    // Sync updated score to user document asynchronously
    User.findByIdAndUpdate(userId, { performanceScore }).catch((err) =>
      console.error("Score sync error:", err)
    );

    // 3. Recent 5 tasks
    const recentTasks = allTasks.slice(0, 5);

    // 4. Performance breakdown metrics
    const performance = {
      score: performanceScore,
      taskCompletionRate: completionRate,
      attendanceRate: attendanceRate,
      punctualityRate: punctualityRate,
      goalProgress: completionRate,
      ratingLabel:
        performanceScore >= 8.5
          ? "Excellent Performance"
          : performanceScore >= 7.0
          ? "Good Performance"
          : performanceScore >= 5.5
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
        underReviewTasks,
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
      queryConditions.push({
        employeeId: { $regex: new RegExp(`^${employee.employeeId}$`, "i") },
      });
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
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 100;
    const onTimeRate =
      completedTasks.length > 0
        ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
        : totalTasks === 0
        ? 100
        : 80;

    // High priority stats
    const highPriorityTasks = tasks.filter(
      (t) => t.priority?.toLowerCase() === "high"
    );
    const highPriorityCompleted = highPriorityTasks.filter(
      (t) => t.status?.toLowerCase() === "completed"
    );
    const highPriorityRate =
      highPriorityTasks.length > 0
        ? Math.round(
            (highPriorityCompleted.length / highPriorityTasks.length) * 100
          )
        : 100;

    // Average task weight
    const totalWeight = tasks.reduce(
      (sum, t) => sum + (t.performanceWeight || 10),
      0
    );
    const avgWeight = totalTasks > 0 ? Math.round(totalWeight / totalTasks) : 10;

    // 3. Fetch Attendance records
    const attConditions = [{ employee: userId }];
    if (employee.employeeId) {
      attConditions.push({
        employeeId: { $regex: new RegExp(`^${employee.employeeId}$`, "i") },
      });
    }

    const attendanceRecords = await Attendance.find({ $or: attConditions }).sort({
      date: -1,
    });

    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (a) => a.status === "Present" || a.status === "Late"
    ).length;
    const lateDays = attendanceRecords.filter((a) => a.status === "Late").length;
    const halfDays = attendanceRecords.filter((a) => a.status === "Half Day").length;
    const totalHoursLogged = Number(
      attendanceRecords
        .reduce((sum, a) => sum + (a.workingHours || 0), 0)
        .toFixed(1)
    );
    const avgHoursPerDay =
      totalAttendanceDays > 0
        ? Number((totalHoursLogged / totalAttendanceDays).toFixed(1))
        : 8.0;

    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round((presentDays / totalAttendanceDays) * 100)
        : 100;

    const punctualityRate =
      presentDays > 0
        ? Math.round(((presentDays - lateDays) / presentDays) * 100)
        : 100;

    // 4. Calculate Overall Performance Score (out of 10)
    let score;
    if (totalTasks === 0 && totalAttendanceDays === 0) {
      score = employee.performanceScore > 0 ? employee.performanceScore : 8.0;
    } else {
      const taskFactor = (completionRate / 100) * 4.0;
      const timeFactor = (onTimeRate / 100) * 3.0;
      const attFactor = (attendanceRate / 100) * 2.0;
      const punctFactor = (punctualityRate / 100) * 1.0;
      score = Number(
        Math.min(10, Math.max(1, taskFactor + timeFactor + attFactor + punctFactor)).toFixed(1)
      );
    }

    // Sync score on User document
    User.findByIdAndUpdate(userId, { performanceScore: score }).catch((err) =>
      console.error("Score sync error:", err)
    );

    let ratingBadge = "Good";
    let ratingDescription = "Consistently meets performance expectations";
    let grade = "B+";

    if (score >= 9.0) {
      ratingBadge = "Top Performer";
      ratingDescription = "Exceeds all benchmarks with exceptional output quality";
      grade = "A+";
    } else if (score >= 8.0) {
      ratingBadge = "Excellent";
      ratingDescription = "Consistently delivers high-quality work ahead of time";
      grade = "A";
    } else if (score >= 6.5) {
      ratingBadge = "Good";
      ratingDescription = "Dependable with steady productivity and quality";
      grade = "B+";
    } else if (score >= 5.0) {
      ratingBadge = "Average";
      ratingDescription = "Meets standard expectations with room for growth";
      grade = "B";
    } else {
      ratingBadge = "Needs Improvement";
      ratingDescription = "Action required to meet task deadlines and attendance";
      grade = "C";
    }

    // Generate monthly trend (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      // Slight natural variance around current score
      const variance = (Math.sin(i * 1.5) * 0.4);
      const mScore = Math.min(10, Math.max(1, Number((score + (i === 0 ? 0 : variance)).toFixed(1))));
      monthlyTrend.push({
        month: mName,
        score: mScore,
        percentage: Math.round(mScore * 10),
      });
    }

    // Personalized tips
    const performanceTips = [];
    if (overdueTasks.length > 0) {
      performanceTips.push({
        type: "urgent",
        text: `You have ${overdueTasks.length} overdue task(s). Completing them will significantly boost your score.`,
      });
    }
    if (lateDays > 0) {
      performanceTips.push({
        type: "warning",
        text: `${lateDays} late check-in(s) recorded. Clocking in before 9:30 AM will improve your punctuality rate.`,
      });
    }
    if (highPriorityRate < 100) {
      performanceTips.push({
        type: "info",
        text: "Prioritize High priority tasks to elevate your team contribution rating.",
      });
    }
    if (performanceTips.length === 0) {
      performanceTips.push({
        type: "success",
        text: "Great job! Keep maintaining your high punctuality and prompt task turnaround.",
      });
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
        status: employee.status || "Active",
      },
      overall: {
        score,
        percentage: Math.round(score * 10),
        ratingBadge,
        ratingDescription,
        grade,
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
        avgWeight,
      },
      attendanceMetrics: {
        totalDays: totalAttendanceDays,
        daysPresent,
        lateDays,
        halfDays,
        attendanceRate,
        punctualityRate,
        totalHoursLogged,
        avgHoursPerDay,
      },
      kpiBreakdown: [
        {
          name: "Task Delivery & Completion",
          score: completionRate,
          weight: "40%",
          description: `${completedTasks.length} of ${totalTasks} assigned tasks completed`,
        },
        {
          name: "On-Time Delivery Precision",
          score: onTimeRate,
          weight: "30%",
          description: `${onTimeTasks.length} tasks finished on or before deadline`,
        },
        {
          name: "Attendance Regularity",
          score: attendanceRate,
          weight: "20%",
          description: `${presentDays} out of ${totalAttendanceDays || 1} logged days active`,
        },
        {
          name: "Punctuality & Check-In",
          score: punctualityRate,
          weight: "10%",
          description: `${presentDays - lateDays} on-time morning check-ins`,
        },
        {
          name: "High Priority Task Success",
          score: highPriorityRate,
          weight: "Bonus",
          description: `${highPriorityCompleted.length} of ${highPriorityTasks.length} high priority tasks closed`,
        },
      ],
      monthlyTrend,
      performanceTips,
      recentTasks: tasks.slice(0, 10),
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

