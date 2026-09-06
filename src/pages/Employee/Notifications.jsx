import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter,
} from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications/my-notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
      setError(err.message || "Something went wrong loading notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete / Dismiss notification
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const deleted = notifications.find((n) => n._id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.isRead;
    if (activeTab === "tasks")
      return notif.type === "TASK_ASSIGNED" || notif.type === "TASK_UPDATED";
    if (activeTab === "announcements")
      return notif.type === "ANNOUNCEMENT" || notif.type === "GENERAL";
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return {
          icon: ClipboardList,
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };
      case "TASK_UPDATED":
        return {
          icon: Sparkles,
          bg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      case "FEEDBACK":
        return {
          icon: MessageSquare,
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      default:
        return {
          icon: Bell,
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/10 p-3 border border-blue-500/20 relative">
              <Bell className="text-blue-400" size={26} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Admin Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Official alerts, task assignments, and updates sent by management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={actionLoading}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-xs font-semibold text-slate-300 transition disabled:opacity-50"
              >
                <CheckCheck size={16} className="text-blue-400" />
                Mark All Read
              </button>
            )}

            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-xs font-semibold text-slate-300 transition"
              title="Refresh Notifications"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin text-blue-400" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab("unread")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "tasks"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            Task Assignments
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "announcements"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            Admin Announcements
          </button>
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 size={30} className="animate-spin text-blue-400" />
            <p className="text-sm font-medium text-slate-400">
              Loading your notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-12 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Bell size={30} />
            </div>
            <h3 className="text-lg font-bold text-white">No Notifications</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              {notifications.length === 0
                ? "You don't have any notifications right now. When admin assigns you a task or sends an update, it will appear here."
                : "No notifications match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((notif) => {
              const { icon: Icon, bg } = getNotificationIcon(notif.type);

              return (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  className={`group relative rounded-2xl border p-5 transition cursor-pointer shadow-lg ${
                    notif.isRead
                      ? "border-white/[0.06] bg-slate-900/60 hover:border-white/20"
                      : "border-blue-500/30 bg-gradient-to-r from-blue-950/40 to-slate-900 hover:border-blue-500/50"
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${bg}`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3
                            className={`text-sm font-bold ${
                              notif.isRead ? "text-slate-200" : "text-white font-extrabold"
                            }`}
                          >
                            {notif.title}
                          </h3>

                          {/* Sender badge */}
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                            <ShieldCheck size={11} className="text-blue-400" />
                            {notif.sender?.name || "Admin"}
                          </span>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed break-words">
                          {notif.message}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimestamp(notif.createdAt)}
                          </span>

                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition"
                            >
                              View Details
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif._id);
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:bg-blue-600 hover:text-white transition text-xs"
                          title="Mark as Read"
                        >
                          <CheckCheck size={15} />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDeleteNotification(notif._id, e)}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition text-xs"
                        title="Dismiss"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
