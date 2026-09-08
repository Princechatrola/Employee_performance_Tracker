const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String, // format YYYY-MM-DD for fast querying
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Half Day", "Absent", "On Leave"],
      default: "Present",
    },
    workingHours: {
      type: Number, // in hours e.g. 8.5
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ employee: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
