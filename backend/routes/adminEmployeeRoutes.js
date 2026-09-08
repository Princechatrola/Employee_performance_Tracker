const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/user");
const Task = require("../models/task");
const Attendance = require("../models/attendance");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// GENERATE EMPLOYEE ID
// =====================================================

const generateEmployeeId = async () => {
  let employeeId;
  let exists = true;

  while (exists) {
    const count = await User.countDocuments({
      role: "employee",
    });

    const nextNumber = count + 1;

    employeeId = `EMP${String(nextNumber).padStart(3, "0")}`;

    const existingEmployee = await User.findOne({
      employeeId,
    });

    exists = !!existingEmployee;
  }

  return employeeId;
};

// =====================================================
// GENERATE TEMPORARY PASSWORD
// =====================================================

const generateTemporaryPassword = () => {
  const randomPart = crypto
    .randomBytes(4)
    .toString("hex");

  return `PT@${randomPart}`;
};

// =====================================================
// GET ALL EMPLOYEES
// GET /api/admin/employees
// =====================================================

router.get(
  "/employees",
  adminMiddleware,
  async (req, res) => {
    try {
      const employees = await User.find({
        role: "employee",
      })
        .select("-password")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        employees,
      });
    } catch (error) {
      console.error("Get Employees Error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
      });
    }
  }
);

// =====================================================
// ADD EMPLOYEE
// POST /api/admin/employees
// =====================================================

router.post(
  "/employees",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        department,
        position,
        joiningDate,
        employmentType,
        address,
        city,
        state,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================

      if (
        !name ||
        !email ||
        !phone ||
        !department ||
        !position ||
        !joiningDate
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email, phone, department, position and joining date are required",
        });
      }

      // =========================
      // CHECK EMAIL
      // =========================

      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      // =========================
      // GENERATE EMPLOYEE ID
      // =========================

      const employeeId = await generateEmployeeId();

      // =========================
      // GENERATE PASSWORD
      // =========================

      const temporaryPassword =
        generateTemporaryPassword();

      // =========================
      // HASH PASSWORD
      // =========================

      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        10
      );

      // =========================
      // CREATE EMPLOYEE
      // =========================

      const employee = await User.create({
        name,
        email: email.toLowerCase().trim(),
        phone,

        employeeId,

        password: hashedPassword,

        role: "employee",

        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        department,
        position,
        joiningDate,
        employmentType:
          employmentType || undefined,
        address: address || "",
        city: city || "",
        state: state || "",

        status: "Active",

        performanceScore: 0,
      });

      // =========================
      // REMOVE PASSWORD
      // =========================

      const employeeResponse =
        employee.toObject();

      delete employeeResponse.password;

      // =========================
      // RESPONSE
      // =========================

      res.status(201).json({
        success: true,
        message: "Employee created successfully",

        employee: employeeResponse,

        // Show only once after creation
        temporaryPassword,
      });
    } catch (error) {
      console.error(
        "Create Employee Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to create employee",
      });
    }
  }
);

// =====================================================
// GET SINGLE EMPLOYEE
// GET /api/admin/employees/:employeeId
// =====================================================

router.get(
  "/employees/:employeeId",
  adminMiddleware,
  async (req, res) => {
    try {
      const employee = await User.findOne({
        employeeId: req.params.employeeId,
        role: "employee",
      }).select("-password");

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.status(200).json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error("Get Single Employee Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee details",
      });
    }
  }
);

// =====================================================
// UPDATE EMPLOYEE
// PUT /api/admin/employees/:employeeId
// =====================================================

router.put(
  "/employees/:employeeId",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        department,
        position,
        joiningDate,
        employmentType,
        address,
        city,
        state,
        status,
        performanceScore,
      } = req.body;

      const employee = await User.findOne({
        employeeId: req.params.employeeId,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Check email uniqueness if email is changed
      if (email && email.toLowerCase().trim() !== employee.email) {
        const existingUser = await User.findOne({
          email: email.toLowerCase().trim(),
          _id: { $ne: employee._id },
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "Email is already taken by another user",
          });
        }
        employee.email = email.toLowerCase().trim();
      }

      if (name) employee.name = name.trim();
      if (phone) employee.phone = phone.trim();
      if (dateOfBirth) employee.dateOfBirth = dateOfBirth;
      if (gender) employee.gender = gender;
      if (department) employee.department = department.trim();
      if (position) employee.position = position.trim();
      if (joiningDate) employee.joiningDate = joiningDate;
      if (employmentType) employee.employmentType = employmentType;
      if (address !== undefined) employee.address = address;
      if (city !== undefined) employee.city = city;
      if (state !== undefined) employee.state = state;
      if (status && ["Active", "Inactive"].includes(status)) {
        employee.status = status;
      }
      if (performanceScore !== undefined) {
        employee.performanceScore = Math.min(10, Math.max(0, Number(performanceScore)));
      }

      await employee.save();

      const employeeResponse = employee.toObject();
      delete employeeResponse.password;

      res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        employee: employeeResponse,
      });
    } catch (error) {
      console.error("Update Employee Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update employee",
      });
    }
  }
);

// =====================================================
// DELETE EMPLOYEE
// DELETE /api/admin/employees/:employeeId
// =====================================================

router.delete(
  "/employees/:employeeId",
  adminMiddleware,
  async (req, res) => {
    try {
      const employee =
        await User.findOneAndDelete({
          employeeId: req.params.employeeId,
          role: "employee",
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Employee Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete employee",
      });
    }
  }
);

// =====================================================
// RESET EMPLOYEE PASSWORD
// POST /api/admin/employees/:employeeId/reset-password
// =====================================================

router.post(
  "/employees/:employeeId/reset-password",
  adminMiddleware,
  async (req, res) => {
    try {
      const employee =
        await User.findOne({
          employeeId: req.params.employeeId,
          role: "employee",
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Generate new temporary password
      const temporaryPassword =
        generateTemporaryPassword();

      // Hash it
      const hashedPassword =
        await bcrypt.hash(
          temporaryPassword,
          10
        );

      // Update employee password
      employee.password = hashedPassword;

      await employee.save();

      res.status(200).json({
        success: true,
        message:
          "Temporary password generated successfully",

        employeeId: employee.employeeId,

        temporaryPassword,
      });
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to reset employee password",
      });
    }
  }
);

module.exports = router;