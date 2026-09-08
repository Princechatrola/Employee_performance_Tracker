import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import { getEmployeeToken } from "../../utils/auth";
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

      const token = getEmployeeToken();
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
      const token = getEmployeeToken();
      const res = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Mark Read Error:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      const token = getEmployeeToken();
      const res = await fetch(
        "http://localhost:5000/api/notifications/mark-all-read",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Mark All Read Error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      const token = getEmployeeToken();
      const res = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error("Delete Notification Error:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "tasks") return n.type === "TASK_ASSIGNED" || n.type === "TASK_UPDATED";
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <ClipboardList className="text-blue-600" size={18} />;
      case "TASK_UPDATED":
        return <CheckCircle2 className="text-emerald-600" size={18} />;
      case "FEEDBACK":
        return <Sparkles className="text-purple-600" size={18} />;
      default:
        return <Bell className="text-amber-600" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100 text-blue-600">
                <Bell size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee Portal
                </p>
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                  Notification Center
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition"
                >
                  <CheckCheck size={14} />
                  <span>Mark All Read</span>
                </button>
              )}

              <button
                onClick={fetchNotifications}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "tasks"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Task Updates
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500 font-medium">
                <Loader2 size={22} className="animate-spin text-blue-600" />
                Loading your updates...
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No Notifications
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                You're all caught up! New alerts and task updates will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`rounded-2xl border p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                    !notif.isRead
                      ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-100"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                        {notif.link && (
                          <Link
                            to={notif.link}
                            className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Go to Task</span>
                            <ArrowRight size={11} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
