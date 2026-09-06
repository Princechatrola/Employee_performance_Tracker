const express = require("express");
const Attendance = require("../models/attendance");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const getTodayDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* =====================================================
   GET TODAY'S ATTENDANCE STATUS
   GET /api/attendance/today
===================================================== */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const todayStr = getTodayDateString();
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      dateString: todayStr,
    });

    res.status(200).json({
      success: true,
      today: attendance || null,
    });
  } catch (error) {
    console.error("Get Today Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's attendance.",
    });
  }
});

/* =====================================================
   EMPLOYEE CHECK-IN
   POST /api/attendance/check-in
===================================================== */
router.post("/check-in", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const todayStr = getTodayDateString(now);

    let attendance = await Attendance.findOne({
      employee: req.user._id,
      dateString: todayStr,
    });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You have already checked in for today.",
        attendance,
      });
    }

    // Determine status: If after 09:30 AM local time, mark Late, else Present
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let status = "Present";
    if (hours > 9 || (hours === 9 && minutes > 30)) {
      status = "Late";
    }

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!attendance) {
      attendance = new Attendance({
        employee: req.user._id,
        employeeId: req.user.employeeId || "",
        date: startOfDay,
        dateString: todayStr,
        checkIn: now,
        status,
        notes: req.body.notes || "",
      });
    } else {
      attendance.checkIn = now;
      attendance.status = status;
      if (req.body.notes) attendance.notes = req.body.notes;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}!`,
      attendance,
    });
  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process check-in.",
    });
  }
});

/* =====================================================
   EMPLOYEE CHECK-OUT
   POST /api/attendance/check-out
===================================================== */
router.post("/check-out", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const todayStr = getTodayDateString(now);

    const attendance = await Attendance.findOne({
      employee: req.user._id,
      dateString: todayStr,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "You need to check in before you can check out.",
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already checked out for today.",
        attendance,
      });
    }

    attendance.checkOut = now;

    // Calculate working hours
    const diffMs = now - new Date(attendance.checkIn);
    const hoursWorked = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    attendance.workingHours = hoursWorked;

    // If worked less than 4 hours, label as Half Day if not already marked Late
    if (hoursWorked < 4 && attendance.status !== "Late") {
      attendance.status = "Half Day";
    }

    if (req.body.notes) {
      attendance.notes = req.body.notes;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total worked: ${hoursWorked} hours.`,
      attendance,
    });
  } catch (error) {
    console.error("Check-out Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process check-out.",
    });
  }
});

/* =====================================================
   GET EMPLOYEE ATTENDANCE HISTORY & STATS
   GET /api/attendance/my-attendance
===================================================== */
router.get("/my-attendance", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;

    const query = { employee: req.user._id };

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalDaysPresent = records.filter(
      (r) => r.status === "Present" || r.status === "Late"
    ).length;
    const totalLate = records.filter((r) => r.status === "Late").length;
    const totalHalfDays = records.filter((r) => r.status === "Half Day").length;

    const totalWorkingHours = records
      .reduce((sum, r) => sum + (r.workingHours || 0), 0)
      .toFixed(1);

    const now = new Date();
    const todayStr = getTodayDateString(now);
    const todayRecord = records.find((r) => r.dateString === todayStr) || null;

    // Attendance rate
    const workingDaysCount = Math.max(records.length, 1);
    const attendanceRate = Math.round((totalDaysPresent / workingDaysCount) * 100);

    res.status(200).json({
      success: true,
      stats: {
        totalDaysPresent,
        totalLate,
        totalHalfDays,
        totalWorkingHours: Number(totalWorkingHours),
        attendanceRate: isNaN(attendanceRate) ? 100 : attendanceRate,
      },
      today: todayRecord,
      records,
    });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load attendance history.",
    });
  }
});

module.exports = router;
