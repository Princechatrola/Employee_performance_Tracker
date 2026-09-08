const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// MONGODB
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error
    );
  });

// =========================
// ROUTE HANDLERS
// =========================

const authRoutes = require("./routes/authRoutes");
const adminEmployeeRoutes = require("./routes/adminEmployeeRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const employeeDashboardRoutes = require("./routes/employeeDashboardRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// =========================
// AUTH ROUTES
// =========================
app.use("/api/auth", authRoutes);

// =========================
// ADMIN ROUTES
// =========================
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin", adminEmployeeRoutes);
app.use("/api/admin", taskRoutes);
app.use("/api/admin", attendanceRoutes);

// =========================
// EMPLOYEE & COMMON ROUTES
// =========================
app.use("/api/employee", employeeDashboardRoutes);
app.use("/api/employee/attendance", attendanceRoutes);
app.use("/api/employee/tasks", taskRoutes);
app.use("/api/employee/notifications", notificationRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);

// =========================
// HOME
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PerformanceTrack Backend is running",
  });
});

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});