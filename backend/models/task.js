const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employeeId: {
      type: String,
      trim: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    performanceWeight: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Under Review", "Completed"],
      default: "Pending",
    },

    githubRepoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    submissionGithubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    submissionNotes: {
      type: String,
      trim: true,
      default: "",
    },

    submittedAt: {
      type: Date,
    },

    adminFeedback: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);