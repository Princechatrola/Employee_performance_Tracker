const Task = require("../models/task");
const Attendance = require("../models/attendance");
const User = require("../models/user");

/**
 * Recalculates and saves performance score for an employee based on completed tasks & attendance.
 * Only tasks with status === "Completed" (approved by Admin) count towards task completion score.
 * 
 * @param {string|mongoose.Types.ObjectId} employeeIdentifier - User _id or employeeId string
 * @returns {Promise<number|null>} computed performance score out of 10
 */
async function recalculateEmployeePerformance(employeeIdentifier) {
  try {
    if (!employeeIdentifier) return null;

    let employee;
    if (typeof employeeIdentifier === "string" && !employeeIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await User.findOne({ employeeId: employeeIdentifier });
    } else {
      employee = await User.findById(employeeIdentifier);
    }

    if (!employee) return null;

    // Fetch all tasks assigned to this employee
    const queryConditions = [{ assignedTo: employee._id }];
    if (employee.employeeId) {
      queryConditions.push({
        employeeId: { $regex: new RegExp(`^${employee.employeeId}$`, "i") },
      });
    }

    const allTasks = await Task.find({ $or: queryConditions });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (t) => t.status === "Completed"
    );

    // 1. Task Completion Rate (Weighted by task performanceWeight)
    let taskCompletionRate = 100;
    if (totalTasks > 0) {
      const totalWeight = allTasks.reduce(
        (sum, t) => sum + (Number(t.performanceWeight) || 10),
        0
      );
      const completedWeight = completedTasks.reduce(
        (sum, t) => sum + (Number(t.performanceWeight) || 10),
        0
      );
      taskCompletionRate =
        totalWeight > 0
          ? Math.round((completedWeight / totalWeight) * 100)
          : Math.round((completedTasks.length / totalTasks) * 100);
    }

    // 2. On-Time Delivery Rate for Completed Tasks
    let onTimeRate = 100;
    if (completedTasks.length > 0) {
      const onTimeTasks = completedTasks.filter((t) => {
        if (!t.dueDate) return true;
        const finishedDate = t.reviewedAt || t.updatedAt || new Date();
        return new Date(finishedDate) <= new Date(t.dueDate);
      }).length;
      onTimeRate = Math.round((onTimeTasks / completedTasks.length) * 100);
    } else if (totalTasks > 0) {
      onTimeRate = 0;
    }

    // 3. Attendance & Punctuality
    const attConditions = [{ employee: employee._id }];
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

    // 4. Overall Performance Score Calculation (out of 10)
    // Formula:
    // - Task Completion: 40% (4.0 pts)
    // - On-Time Delivery: 30% (3.0 pts)
    // - Attendance Rate: 20% (2.0 pts)
    // - Punctuality: 10% (1.0 pts)
    let computedScore;
    if (totalTasks === 0 && totalAttendanceDays === 0) {
      computedScore = 8.0; // Standard default baseline for new accounts
    } else {
      const taskFactor = (taskCompletionRate / 100) * 4.0;
      const timeFactor = (onTimeRate / 100) * 3.0;
      const attFactor = (attendanceRate / 100) * 2.0;
      const punctFactor = (punctualityRate / 100) * 1.0;

      computedScore = Number(
        Math.min(10, Math.max(1, taskFactor + timeFactor + attFactor + punctFactor)).toFixed(1)
      );
    }

    // Save updated performance score on user document
    await User.findByIdAndUpdate(employee._id, {
      performanceScore: computedScore,
    });

    return computedScore;
  } catch (error) {
    console.error("Failed to recalculate employee performance:", error);
    return null;
  }
}

module.exports = {
  recalculateEmployeePerformance,
};
