import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import { getEmployeeToken, logoutEmployee } from "../../utils/auth";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Zap,
  Target,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const Performance = () => {
  const navigate = useNavigate();

  const [performanceData, setPerformanceData] = useState({
    employee: {
      name: "Employee",
      employeeId: "EMP001",
      department: "General",
      position: "Team Member",
      status: "Active",
    },
    overall: {
      score: 8.0,
      percentage: 80,
      ratingBadge: "Good",
      ratingDescription: "Consistently meets performance expectations",
      grade: "B+",
    },
    taskMetrics: {
      totalAssigned: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0,
      overdueCount: 0,
      completionRate: 100,
      onTimeRate: 100,
      highPriorityRate: 100,
      avgWeight: 10,
    },
    attendanceMetrics: {
      totalDays: 0,
      daysPresent: 0,
      lateDays: 0,
      halfDays: 0,
      attendanceRate: 100,
      punctualityRate: 100,
      totalHoursLogged: 0,
      avgHoursPerDay: 8.0,
    },
    kpiBreakdown: [],
    monthlyTrend: [],
    performanceTips: [],
    recentTasks: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskFilter, setTaskFilter] = useState("All");
  const [searchTask, setSearchTask] = useState("");

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getEmployeeToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/employee/performance",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          logoutEmployee();
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to load performance scorecard.");
      }

      setPerformanceData(data);
    } catch (err) {
      console.error("Fetch Performance Error:", err);
      setError(err.message || "Failed to calculate performance scorecard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const {
    employee,
    overall,
    taskMetrics,
    attendanceMetrics,
    kpiBreakdown,
    monthlyTrend,
    performanceTips,
    recentTasks,
  } = performanceData;

  const getScoreColor = (score) => {
    if (score >= 8.5) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (score >= 7.0) return "text-blue-600 border-blue-500 bg-blue-50";
    if (score >= 5.5) return "text-yellow-600 border-yellow-500 bg-yellow-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const getRatingBadgeClass = (badge) => {
    switch (badge) {
      case "Top Performer":
      case "Excellent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Good":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Average":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 border border-red-200";
      case "Medium":
        return "text-yellow-700 bg-yellow-50 border border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border border-blue-200";
    }
  };

  // Filter recent tasks
  const filteredTasks = (recentTasks || []).filter((t) => {
    const matchesSearch =
      searchTask === "" ||
      t.title?.toLowerCase().includes(searchTask.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTask.toLowerCase());

    const matchesStatus =
      taskFilter === "All" ||
      t.status?.toLowerCase() === taskFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
              <div className="rounded-xl bg-purple-50 p-2.5 border border-purple-100 text-purple-600">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee Portal
                </p>
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                  My Performance Scorecard
                </h1>
              </div>
            </div>

            <button
              onClick={fetchPerformance}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-purple-600" : ""}
              />
              Refresh Scorecard
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 lg:p-8 space-y-7">
          {/* Error Alert */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchPerformance}
                className="text-xs font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-purple-600" />
              <p className="text-sm font-semibold text-slate-500">
                Computing your weighted score & KPI metrics...
              </p>
            </div>
          ) : (
            <>
              {/* Profile & Score Banner Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                  {/* Left: Employee Info */}
                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-2xl border border-purple-200">
                      {employee?.name?.charAt(0).toUpperCase() || "E"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">
                          {employee?.name}
                        </h2>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {employee?.employeeId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {employee?.position} •{" "}
                        <span className="text-slate-800 font-semibold">{employee?.department}</span>
                      </p>
                      <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500 flex-wrap justify-center sm:justify-start">
                        <span>Status: <strong className="text-emerald-600">{employee?.status || "Active"}</strong></span>
                        <span>Member since: <strong className="text-slate-700">{employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "Active Member"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Gauge Card */}
                  <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-purple-100 bg-white shadow-xs">
                      <div className="text-center">
                        <span className="text-2xl font-extrabold text-slate-900 block">
                          {overall?.score ?? 8.0}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block -mt-1">
                          / 10
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getRatingBadgeClass(overall?.ratingBadge)}`}>
                          {overall?.ratingBadge}
                        </span>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Grade {overall?.grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 max-w-[210px] leading-relaxed pt-1">
                        {overall?.ratingDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Task Completion Rate */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Task Completion
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-900">
                        {taskMetrics?.completionRate ?? 100}%
                      </h3>
                    </div>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-blue-600">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${taskMetrics?.completionRate ?? 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    {taskMetrics?.completedCount} of {taskMetrics?.totalAssigned} assigned tasks completed
                  </p>
                </div>

                {/* On-Time Delivery Rate */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        On-Time Delivery
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                        {taskMetrics?.onTimeRate ?? 100}%
                      </h3>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-600">
                      <Clock size={20} />
                    </div>
                  </div>
                  <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${taskMetrics?.onTimeRate ?? 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    Finished on or before deadline
                  </p>
                </div>

                {/* Attendance Rate */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Attendance Regularity
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-purple-700">
                        {attendanceMetrics?.attendanceRate ?? 100}%
                      </h3>
                    </div>
                    <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5 text-purple-600">
                      <CalendarCheck size={20} />
                    </div>
                  </div>
                  <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${attendanceMetrics?.attendanceRate ?? 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    {attendanceMetrics?.daysPresent} days present logged
                  </p>
                </div>

                {/* Punctuality Rate */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Punctuality Rate
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-amber-600">
                        {attendanceMetrics?.punctualityRate ?? 100}%
                      </h3>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-amber-600">
                      <Zap size={20} />
                    </div>
                  </div>
                  <div className="mt-3.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${attendanceMetrics?.punctualityRate ?? 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-medium">
                    {attendanceMetrics?.lateDays ?? 0} late arrival(s)
                  </p>
                </div>
              </div>

              {/* KPI Breakdown Section */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Weighted KPI Performance Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How your score is calculated across task delivery, deadline adherence, attendance regularity, and punctuality
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(kpiBreakdown || []).map((kpi, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {kpi.name}
                        </span>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          Weight: {kpi.weight}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">{kpi.description}</span>
                        <span className="font-bold text-slate-900">{kpi.score}%</span>
                      </div>

                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${kpi.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Tasks List */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Task Performance
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed tasks reviewed and approved by admin
                    </p>
                  </div>

                  {/* Filter / Search */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTask}
                        onChange={(e) => setSearchTask(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>

                    <select
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {filteredTasks.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <p className="text-sm font-semibold text-slate-600">No tasks found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting the filter</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                          <th className="px-5 py-3.5">Task Title</th>
                          <th className="px-5 py-3.5">Priority</th>
                          <th className="px-5 py-3.5">Weight</th>
                          <th className="px-5 py-3.5">Due Date</th>
                          <th className="px-5 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTasks.map((t) => (
                          <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                              <p className="text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                            </td>

                            <td className="px-5 py-4">
                              <span className={`rounded-full px-2.5 py-0.5 font-bold ${getPriorityColor(t.priority)}`}>
                                {t.priority}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-slate-700 font-bold">
                              {t.performanceWeight || 10}%
                            </td>

                            <td className="px-5 py-4 text-slate-600 font-medium">
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 font-bold ${
                                  t.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : t.status === "Under Review"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : t.status === "In Progress"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Performance;
