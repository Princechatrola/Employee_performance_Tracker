const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC USER INFORMATION
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Password is always stored as bcrypt hash
    password: {
      type: String,
      required: true,
    },

    // =========================
    // ROLE
    // =========================
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    // =========================
    // EMPLOYEE INFORMATION
    // =========================
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    department: {
      type: String,
      trim: true,
    },

    position: {
      type: String,
      trim: true,
    },

    joiningDate: {
      type: Date,
    },

    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract", "Intern"],
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    // =========================
    // EMPLOYEE STATUS
    // =========================
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // =========================
    // PERFORMANCE
    // =========================
    performanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);