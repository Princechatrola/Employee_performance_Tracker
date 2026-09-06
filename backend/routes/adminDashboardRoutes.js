const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* =====================================================
   ADMIN DASHBOARD
   GET /api/admin/dashboard
===================================================== */

router.get("/dashboard", async (req, res) => {
  try {
    /* ================================================
       TOTAL EMPLOYEES
    ================================================ */

    const totalEmployees = await User.countDocuments({
      role: "employee",
    });

    /* ================================================
       ACTIVE EMPLOYEES
    ================================================ */

    const activeEmployees = await User.countDocuments({
      role: "employee",
      status: "Active",
    });

    /* ================================================
       INACTIVE EMPLOYEES
    ================================================ */

    const inactiveEmployees = await User.countDocuments({
      role: "employee",
      status: "Inactive",
    });

    /* ================================================
       SUSPENDED EMPLOYEES
    ================================================ */

    const suspendedEmployees = await User.countDocuments({
      role: "employee",
      status: "Suspended",
    });

    /* ================================================
       NEW EMPLOYEES THIS MONTH
    ================================================ */

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const newThisMonth = await User.countDocuments({
      role: "employee",
      createdAt: {
        $gte: startOfMonth,
      },
    });

    /* ================================================
       RECENT EMPLOYEES
    ================================================ */

    const recentEmployees = await User.find({
      role: "employee",
    })
      .select(
        "name email employeeId department position status createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(5);

    /* ================================================
       DEPARTMENT COUNTS
    ================================================ */

    const departmentData = await User.aggregate([
      {
        $match: {
          role: "employee",
        },
      },
      {
        $group: {
          _id: "$department",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    /* ================================================
       RESPONSE
    ================================================ */

    res.status(200).json({
      success: true,

      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        suspendedEmployees,
        newThisMonth,
      },

      recentEmployees,

      departmentData,
    });
  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while loading dashboard.",
    });
  }
});

module.exports = router;