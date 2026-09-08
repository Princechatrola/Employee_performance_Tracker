const express = require("express");
const User = require("../models/user");
const Task = require("../models/task");
const Attendance = require("../models/attendance");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* =====================================================
   HELPER: CALCULATE PERFORMANCE FOR ALL EMPLOYEES
===================================================== */
async function computeEmployeesPerformance() {
  const employees = await User.find({ role: "employee" })
    .select("name email employeeId department position status performanceScore createdAt")
    .sort({ name: 1 });

  const tasks = await Task.find({});
  const attendanceRecords = await Attendance.find({});

  const performanceList = employees.map((emp) => {
    // Match tasks
    const empTasks = tasks.filter(
      (t) =>
        (t.assignedTo && t.assignedTo.toString() === emp._id.toString()) ||
        (t.employeeId && emp.employeeId && t.employeeId.toLowerCase() === emp.employeeId.toLowerCase())
    );

    const totalTasks = empTasks.length;
    const completedTasks = empTasks.filter((t) => t.status === "Completed").length;
    const inProgressTasks = empTasks.filter((t) => t.status === "In Progress").length;
    const underReviewTasks = empTasks.filter((t) => t.status === "Under Review").length;
    const pendingTasks = empTasks.filter((t) => t.status === "Pending").length;

    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // On-time completion
    const onTimeCompleted = empTasks.filter((t) => {
      if (t.status !== "Completed") return false;
      const finishedDate = t.reviewedAt || t.updatedAt || new Date();
      return new Date(finishedDate) <= new Date(t.dueDate);
    }).length;

    const onTimeRate =
      completedTasks > 0
        ? Math.round((onTimeCompleted / completedTasks) * 100)
        : totalTasks === 0
        ? 100
        : 80;

    // Match attendance
    const empAttendance = attendanceRecords.filter(
      (a) =>
        (a.employee && a.employee.toString() === emp._id.toString()) ||
        (a.employeeId && emp.employeeId && a.employeeId.toLowerCase() === emp.employeeId.toLowerCase())
    );

    const totalAttendanceDays = empAttendance.length;
    const presentDays = empAttendance.filter(
      (a) => a.status === "Present" || a.status === "Late"
    ).length;
    const lateDays = empAttendance.filter((a) => a.status === "Late").length;

    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round((presentDays / totalAttendanceDays) * 100)
        : 100;

    const punctualityRate =
      presentDays > 0
        ? Math.round(((presentDays - lateDays) / presentDays) * 100)
        : 100;

    // Overall score calculation (out of 10)
    // Formula: Task Completion (40%), On-Time (30%), Attendance (20%), Punctuality (10%)
    let computedScore;
    if (totalTasks === 0 && totalAttendanceDays === 0) {
      computedScore = emp.performanceScore > 0 ? emp.performanceScore : 8.0;
    } else {
      const taskFactor = (taskCompletionRate / 100) * 4.0;
      const timeFactor = (onTimeRate / 100) * 3.0;
      const attFactor = (attendanceRate / 100) * 2.0;
      const punctFactor = (punctualityRate / 100) * 1.0;
      computedScore = Number(
        Math.min(10, Math.max(1, taskFactor + timeFactor + attFactor + punctFactor)).toFixed(1)
      );
    }

    // Status rating badge
    let statusLabel = "Good";
    if (computedScore >= 8.5) statusLabel = "Excellent";
    else if (computedScore >= 7.0) statusLabel = "Good";
    else if (computedScore >= 5.5) statusLabel = "Average";
    else statusLabel = "Needs Improvement";

    return {
      id: emp._id,
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      employeeId: emp.employeeId || "EMP",
      department: emp.department || "General",
      position: emp.position || "Team Member",
      score: computedScore,
      percentage: Math.round(computedScore * 10),
      goals: taskCompletionRate,
      attendance: attendanceRate,
      onTimeRate,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      status: statusLabel,
    };
  });

  return performanceList;
}

/* =====================================================
   ADMIN DASHBOARD OVERVIEW
   GET /api/admin/dashboard
===================================================== */
router.get("/dashboard", async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeEmployees = await User.countDocuments({ role: "employee", status: "Active" });
    const inactiveEmployees = await User.countDocuments({ role: "employee", status: "Inactive" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = await User.countDocuments({
      role: "employee",
      createdAt: { $gte: startOfMonth },
    });

    const recentEmployees = await User.find({ role: "employee" })
      .select("name email employeeId department position status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const departmentData = await User.aggregate([
      { $match: { role: "employee" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Task stats
    const totalTasks = await Task.countDocuments({});
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const inProgressTasks = await Task.countDocuments({ status: "In Progress" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });

    // Dynamic employee performances
    const performanceList = await computeEmployeesPerformance();

    const avgScore =
      performanceList.length > 0
        ? Number(
            (
              performanceList.reduce((acc, curr) => acc + curr.score, 0) /
              performanceList.length
            ).toFixed(1)
          )
        : 8.5;

    const topPerformers = [...performanceList]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const improvementEmployees = [...performanceList]
      .filter((e) => e.score < 7.0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);

    // Monthly chart data (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyPerformance = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      // Slight progression around average
      const variance = (5 - i) * 0.2;
      const score = Math.min(10, Math.max(5.0, Number((avgScore - 1.0 + variance).toFixed(1))));
      monthlyPerformance.push({
        month: mName,
        score,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        suspendedEmployees: 0,
        newThisMonth,
        averageScore: avgScore,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        topPerformersCount: performanceList.filter((e) => e.score >= 8.5).length,
        improvementCount: performanceList.filter((e) => e.score < 7.0).length,
      },
      recentEmployees,
      departmentData,
      topPerformers,
      improvementEmployees,
      performanceData: monthlyPerformance,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while loading dashboard.",
    });
  }
});

/* =====================================================
   ADMIN PERFORMANCE MANAGEMENT
   GET /api/admin/performance
===================================================== */
router.get("/performance", adminMiddleware, async (req, res) => {
  try {
    const performanceList = await computeEmployeesPerformance();

    const totalEvaluated = performanceList.length;
    const averageScore =
      totalEvaluated > 0
        ? Number(
            (
              performanceList.reduce((acc, curr) => acc + curr.score, 0) /
              totalEvaluated
            ).toFixed(1)
          )
        : 0;

    const excellentCount = performanceList.filter((e) => e.score >= 8.5).length;
    const goodCount = performanceList.filter((e) => e.score >= 7.0 && e.score < 8.5).length;
    const needsImprovementCount = performanceList.filter((e) => e.score < 7.0).length;

    res.status(200).json({
      success: true,
      stats: {
        totalEvaluated,
        averageScore,
        averagePercentage: Math.round(averageScore * 10),
        excellentCount,
        goodCount,
        needsImprovementCount,
      },
      employees: performanceList,
    });
  } catch (error) {
    console.error("Admin Performance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load performance data.",
    });
  }
});

module.exports = router;