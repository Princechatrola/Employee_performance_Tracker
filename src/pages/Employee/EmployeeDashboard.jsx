import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import {
  ClipboardList,
  CheckCircle2,
  Clock3,
  TrendingUp,
  CalendarCheck,
  MessageSquare,
  Bell,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    employee: {
      name: "Employee",
      employeeId: "EMP001",
      department: "General",
      position: "Team Member",
      status: "Active",
    },
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
    },
    performance: {
      score: 0,
      taskCompletionRate: 0,
      attendanceRate: 95,
      goalProgress: 0,
      ratingLabel: "Good Performance",
    },
    recentTasks: [],
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/employee/dashboard",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Employee Dashboard Response:", data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to load dashboard data");
      }

      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(err.message || "Something went wrong loading your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { employee, stats, performance, recentTasks } = dashboardData;

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Dashboard statistics cards config
  const statsCards = [
    {
      title: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      description: "Tasks assigned to you",
      icon: ClipboardList,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Completed",
      value: stats?.completedTasks ?? 0,
      description: `${stats?.completionRate ?? 0}% completion rate`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending Tasks",
      value: (stats?.pendingTasks ?? 0) + (stats?.inProgressTasks ?? 0),
      description: `${stats?.pendingTasks ?? 0} pending, ${stats?.inProgressTasks ?? 0} active`,
      icon: Clock3,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Performance",
      value: `${performance?.score ?? 0}/10`,
      description: performance?.ratingLabel || "Current score",
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ==============================
          SIDEBAR
      ============================== */}
      <EmployeeSidebar />

      {/* ==============================
          MAIN CONTENT
      ============================== */}
      <main className="ml-64 min-h-screen">
        {/* ==============================
            HEADER
        ============================== */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-sm text-slate-500">Employee / Dashboard</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">
                Employee Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                title="Refresh Dashboard"
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin text-blue-600" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Notification */}
              <Link
                to="/employee/notifications"
                title="View Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <Bell size={19} />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
              </Link>
            </div>
          </div>
        </header>

        {/* ==============================
            CONTENT
        ============================== */}
        <div className="p-6 lg:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchDashboardData}
                className="text-xs font-bold underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-500">
                Loading your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* ==============================
                  WELCOME SECTION
              ============================== */}
              <div className="mb-7 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-6 shadow-lg shadow-blue-600/10">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      Welcome back,
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {employee?.name || "Employee"} 👋
                    </h2>
                    <p className="mt-2 text-sm text-blue-100">
                      Here is your real-time performance and task assignments
                      overview.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur">
                    <p className="text-xs text-blue-100">Employee ID</p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {employee?.employeeId || "EMP001"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ==============================
                  EMPLOYEE INFORMATION
              ============================== */}
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600 shadow-sm">
                      {employee?.name ? employee.name.charAt(0).toUpperCase() : "E"}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {employee?.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {employee?.position || "Software Developer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-slate-400">Department</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {employee?.department || "General"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Employee ID</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {employee?.employeeId || "EMP001"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          employee?.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {employee?.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==============================
                  STATISTICS
              ============================== */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statsCards.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500">
                            {stat.title}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-slate-900">
                            {stat.value}
                          </h3>
                        </div>

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                        >
                          <Icon size={21} className={stat.iconColor} />
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* ==============================
                  MAIN GRID
              ============================== */}
              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                {/* ==============================
                    RECENT TASKS
                ============================== */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Recent Tasks
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Your recently assigned tasks from management
                      </p>
                    </div>

                    <Link
                      to="/EmployeeTasks"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      View All
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    {recentTasks && recentTasks.length > 0 ? (
                      <table className="w-full min-w-[650px]">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Task
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Deadline
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Priority
                            </th>
                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {recentTasks.map((task) => {
                            const formattedDeadline = task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "No deadline";

                            const formattedAssigned = task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-";

                            return (
                              <tr
                                key={task._id}
                                className="border-b border-slate-100 transition hover:bg-slate-50"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                      <ClipboardList
                                        size={17}
                                        className="text-blue-600"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                                        {task.title}
                                      </p>
                                      <p className="mt-0.5 text-xs text-slate-400">
                                        Assigned {formattedAssigned}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar size={14} className="text-slate-400" />
                                    {formattedDeadline}
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      task.priority === "High"
                                        ? "bg-red-50 text-red-600"
                                        : task.priority === "Medium"
                                        ? "bg-yellow-50 text-yellow-600"
                                        : "bg-blue-50 text-blue-600"
                                    }`}
                                  >
                                    {task.priority || "Medium"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      task.status === "Completed"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : task.status === "In Progress"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {task.status || "Pending"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-10 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                          <ClipboardList size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          No tasks assigned yet
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          When tasks are assigned to you by admin, they will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ==============================
                    PERFORMANCE CARD
                ============================== */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        My Performance
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Current performance overview
                      </p>
                    </div>

                    <TrendingUp size={20} className="text-purple-600" />
                  </div>

                  {/* Score */}
                  <div className="mt-7 text-center">
                    <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-purple-100 bg-purple-50/30">
                      <div>
                        <p className="text-3xl font-bold text-slate-900">
                          {performance?.score ?? 0}
                        </p>
                        <p className="text-xs text-slate-400">out of 10</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-emerald-600">
                      {performance?.ratingLabel || "Good Performance"}
                    </p>
                  </div>

                  {/* Performance details */}
                  <div className="mt-7 space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Task Completion
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {performance?.taskCompletionRate ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${performance?.taskCompletionRate ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Attendance Rate
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {performance?.attendanceRate ?? 95}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${performance?.attendanceRate ?? 95}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Goal Progress
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {performance?.goalProgress ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-500"
                          style={{
                            width: `${performance?.goalProgress ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/employee/performance")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50/50 hover:bg-purple-100/70 transition"
                  >
                    View Full Performance Analysis
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>

              {/* ==============================
                  BOTTOM CARDS
              ============================== */}
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {/* Attendance */}
                <Link
                  to="/employee/attendance"
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-200 block group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <CalendarCheck size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Today's Attendance
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {todayFormatted}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition" />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      Open Attendance Portal
                    </span>

                    <span className="text-xs font-semibold text-slate-500">
                      Clock In / Out →
                    </span>
                  </div>
                </Link>

                {/* Feedback */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <MessageSquare size={19} className="text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Latest Feedback
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">
                        From your HR manager
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-500">
                    {stats.completedTasks > 0
                      ? "Great progress on your assigned tasks. Keep up the high standard of work!"
                      : "Welcome! Please review your assigned tasks in the My Tasks section."}
                  </p>
                </div>

                {/* Notifications */}
                <Link
                  to="/employee/notifications"
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-yellow-200 block group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition">
                        <Bell size={19} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Notifications
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Admin announcements & updates
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight size={16} className="text-slate-400 group-hover:text-yellow-600 transition" />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-600">
                      View Official Alerts →
                    </p>

                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-[11px] font-bold text-white">
                      {stats.pendingTasks + stats.inProgressTasks}
                    </span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;