const express = require("express");
const Attendance = require("../models/attendance");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const getTodayDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* =====================================================
   GET TODAY'S ATTENDANCE STATUS (EMPLOYEE)
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

/* =====================================================
   ADMIN: GET ALL ATTENDANCE RECORDS & SUMMARY
   GET /api/attendance/admin/all OR /api/admin/attendance
===================================================== */
const handleAdminAttendance = async (req, res) => {
  try {
    const { date, department, status, search } = req.query;

    const targetDateStr = date || getTodayDateString();

    // Fetch all active employees
    const allEmployees = await User.find({ role: "employee" })
      .select("name email employeeId department position status")
      .sort({ name: 1 });

    // Fetch attendance records for target date
    const dayRecords = await Attendance.find({ dateString: targetDateStr })
      .populate("employee", "name email employeeId department position status");

    // Build complete record list (including employees who have not marked attendance as Absent)
    let combinedList = allEmployees.map((emp) => {
      const existing = dayRecords.find(
        (r) =>
          (r.employee && r.employee._id.toString() === emp._id.toString()) ||
          (r.employeeId && emp.employeeId && r.employeeId.toLowerCase() === emp.employeeId.toLowerCase())
      );

      if (existing) {
        return {
          _id: existing._id,
          employee: {
            _id: emp._id,
            name: emp.name,
            email: emp.email,
            employeeId: emp.employeeId,
            department: emp.department,
            position: emp.position,
            status: emp.status,
          },
          employeeId: emp.employeeId,
          date: existing.date,
          dateString: existing.dateString,
          checkIn: existing.checkIn,
          checkOut: existing.checkOut,
          workingHours: existing.workingHours || 0,
          status: existing.status,
          notes: existing.notes || "",
          hasRecord: true,
        };
      }

      return {
        _id: `absent_${emp._id}`,
        employee: {
          _id: emp._id,
          name: emp.name,
          email: emp.email,
          employeeId: emp.employeeId,
          department: emp.department,
          position: emp.position,
          status: emp.status,
        },
        employeeId: emp.employeeId,
        date: new Date(targetDateStr),
        dateString: targetDateStr,
        checkIn: null,
        checkOut: null,
        workingHours: 0,
        status: "Absent",
        notes: "Not marked yet",
        hasRecord: false,
      };
    });

    // Summary statistics
    const totalStaff = combinedList.length;
    const presentCount = combinedList.filter((r) => r.status === "Present").length;
    const lateCount = combinedList.filter((r) => r.status === "Late").length;
    const halfDayCount = combinedList.filter((r) => r.status === "Half Day").length;
    const absentCount = combinedList.filter((r) => r.status === "Absent").length;

    const totalPresentOrLate = presentCount + lateCount + halfDayCount;
    const attendancePercentage =
      totalStaff > 0 ? Math.round((totalPresentOrLate / totalStaff) * 100) : 100;

    // Apply filters
    if (department && department !== "All Departments" && department !== "All") {
      combinedList = combinedList.filter(
        (r) => r.employee?.department === department
      );
    }

    if (status && status !== "All Status" && status !== "All") {
      combinedList = combinedList.filter((r) => r.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      combinedList = combinedList.filter(
        (r) =>
          r.employee?.name?.toLowerCase().includes(q) ||
          r.employee?.employeeId?.toLowerCase().includes(q) ||
          r.employee?.email?.toLowerCase().includes(q) ||
          r.employee?.department?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      date: targetDateStr,
      summary: {
        totalStaff,
        presentCount,
        lateCount,
        halfDayCount,
        absentCount,
        attendancePercentage,
      },
      records: combinedList,
    });
  } catch (error) {
    console.error("Admin Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin attendance records.",
    });
  }
};

router.get("/admin/all", adminMiddleware, handleAdminAttendance);
router.get("/admin/attendance", adminMiddleware, handleAdminAttendance);
router.get("/admin-records", adminMiddleware, handleAdminAttendance);

/* =====================================================
   ADMIN: UPDATE ATTENDANCE STATUS / NOTES
   PATCH /api/attendance/admin/:id/status
===================================================== */
router.patch("/admin/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, employeeId, dateString } = req.body;

    let record;
    if (id.startsWith("absent_") || !id.match(/^[0-9a-fA-F]{24}$/)) {
      // Create a record if employee was previously unmarked (Absent)
      const emp = await User.findOne({
        $or: [{ employeeId }, { _id: id.replace("absent_", "") }],
      });

      if (!emp) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const dStr = dateString || getTodayDateString();
      const now = new Date();

      record = new Attendance({
        employee: emp._id,
        employeeId: emp.employeeId || "",
        date: new Date(dStr),
        dateString: dStr,
        checkIn: status !== "Absent" ? now : null,
        status: status || "Present",
        notes: notes || "Marked by Admin",
      });
      await record.save();
    } else {
      record = await Attendance.findById(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Attendance record not found.",
        });
      }
      if (status) record.status = status;
      if (notes !== undefined) record.notes = notes;
      await record.save();
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      record,
    });
  } catch (error) {
    console.error("Admin Update Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attendance.",
    });
  }
});

module.exports = router;
