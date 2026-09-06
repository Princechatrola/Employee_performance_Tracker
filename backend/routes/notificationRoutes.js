const express = require("express");
const Notification = require("../models/notification");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/* =====================================================
   GET LOGGED-IN EMPLOYEE'S NOTIFICATIONS
   GET /api/notifications/my-notifications
===================================================== */
router.get("/my-notifications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const employeeId = req.user.employeeId;

    const query = {
      $or: [{ recipient: userId }],
    };

    if (employeeId) {
      query.$or.push({ recipientEmployeeId: employeeId });
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});

/* =====================================================
   MARK SINGLE NOTIFICATION AS READ
   PATCH /api/notifications/:id/read
===================================================== */
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (
      notification.recipient.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notification.",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
});

/* =====================================================
   MARK ALL NOTIFICATIONS AS READ
   PATCH /api/notifications/read-all
===================================================== */
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const employeeId = req.user.employeeId;

    const query = {
      $or: [{ recipient: userId }],
    };
    if (employeeId) {
      query.$or.push({ recipientEmployeeId: employeeId });
    }

    await Notification.updateMany(query, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
    });
  }
});

/* =====================================================
   DELETE A NOTIFICATION
   DELETE /api/notifications/:id
===================================================== */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    if (
      notification.recipient.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification.",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notification dismissed successfully.",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
});

/* =====================================================
   ADMIN: SEND CUSTOM NOTIFICATION
   POST /api/notifications/admin/send
===================================================== */
router.post("/admin/send", adminMiddleware, async (req, res) => {
  try {
    const { recipientId, title, message, type, link, broadcast } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    if (broadcast) {
      // Send to all employees
      const employees = await User.find({ role: "employee" });
      const notificationsToCreate = employees.map((emp) => ({
        recipient: emp._id,
        recipientEmployeeId: emp.employeeId || "",
        sender: req.user._id,
        type: type || "ANNOUNCEMENT",
        title: title.trim(),
        message: message.trim(),
        link: link || "/EmployeeDashboard",
        isRead: false,
      }));

      await Notification.insertMany(notificationsToCreate);

      return res.status(201).json({
        success: true,
        message: `Notification broadcasted to ${employees.length} employees.`,
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient employee is required.",
      });
    }

    const employee = await User.findById(recipientId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Recipient employee not found.",
      });
    }

    const notification = await Notification.create({
      recipient: employee._id,
      recipientEmployeeId: employee.employeeId || "",
      sender: req.user._id,
      type: type || "GENERAL",
      title: title.trim(),
      message: message.trim(),
      link: link || "/EmployeeDashboard",
      isRead: false,
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully.",
      notification,
    });
  } catch (error) {
    console.error("Admin Send Notification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification.",
    });
  }
});

module.exports = router;
