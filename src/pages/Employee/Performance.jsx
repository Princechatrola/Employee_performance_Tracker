import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
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
  ShieldCheck,
  Star,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";

const Performance = () => {
  const navigate = useNavigate();

  const [performanceData, setPerformanceData] = useState({
    employee: {
      name: "Employee",
      employeeId: "EMP001",
      department: "General",
      position: "Team Member",
    },
    overall: {
      score: 8.5,
      ratingBadge: "Good",
      ratingDescription: "Consistently meets performance expectations",
    },
    taskMetrics: {
      totalAssigned: 0,
      completedCount: 0,
      pendingCount: 0,
      inProgressCount: 0,
      overdueCount: 0,
      completionRate: 0,
      onTimeRate: 100,
      highPriorityRate: 100,
    },
    attendanceMetrics: {
      totalDays: 0,
      daysPresent: 0,
      lateDays: 0,
      attendanceRate: 95,
      punctualityRate: 95,
      totalHoursLogged: 0,
    },
    kpiBreakdown: [],
    recentTasks: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/employee/performance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load performance analytics");
      }

      setPerformanceData(data);
    } catch (err) {
      console.error("Fetch Performance Error:", err);
      setError(err.message || "Something went wrong loading performance data.");
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
    recentTasks,
  } = performanceData;

  const getScoreColor = (score) => {
    if (score >= 9.0) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 8.0) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    if (score >= 6.5) return "text-purple-400 border-purple-500/30 bg-purple-500/10";
    if (score >= 5.0) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
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
            <div className="rounded-2xl bg-purple-500/10 p-3 border border-purple-500/20">
              <TrendingUp className="text-purple-400" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  My Performance
                </h1>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                  Analytics & Growth
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Track your output score, on-time completion rates, KPIs, and quality metrics
              </p>
            </div>
          </div>

          <button
            onClick={fetchPerformance}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin text-purple-400" : ""}
            />
            Refresh Analytics
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-center justify-between">
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
            <Loader2 size={32} className="animate-spin text-purple-400" />
            <p className="text-sm font-medium text-slate-400">
              Calculating your performance metrics...
            </p>
          </div>
        ) : (
          <>
            {/* Hero Performance Score & Summary */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              {/* Score Circular Card */}
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-10 -top-10 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Overall Score
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold flex items-center gap-1.5 ${getScoreColor(
                      overall?.score ?? 8.5
                    )}`}
                  >
                    <Sparkles size={13} />
                    {overall?.ratingBadge || "Good"}
                  </span>
                </div>

                <div className="my-6 flex flex-col items-center text-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-purple-500/20 bg-purple-500/5 shadow-inner">
                    <div>
                      <span className="text-4xl font-extrabold text-white font-mono">
                        {overall?.score ?? 8.5}
                      </span>
                      <span className="text-xs text-slate-400 block font-sans">
                        out of 10
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-white">
                    {employee?.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {overall?.ratingDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Employee ID:</span>
                  <span className="font-semibold text-slate-200">
                    {employee?.employeeId || "EMP001"}
                  </span>
                </div>
              </div>

              {/* Performance Highlights Matrix */}
              <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Core Performance KPIs
                      </h3>
                      <p className="text-xs text-slate-400">
                        Weighted performance breakdown based on assignments and delivery
                      </p>
                    </div>
                    <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                      <Target size={22} />
                    </div>
                  </div>

                  {/* Progress KPI items */}
                  <div className="space-y-4">
                    {kpiBreakdown.map((kpi) => (
                      <div key={kpi.name}>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-semibold text-slate-200">
                            {kpi.name}
                          </span>
                          <span className="font-bold text-purple-400">
                            {kpi.score}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${kpi.score}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {kpi.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-400">
                    Department: <strong className="text-white">{employee?.department}</strong>
                  </span>
                  <Link
                    to="/EmployeeTasks"
                    className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    View Assigned Tasks
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Completed Tasks
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-emerald-400">
                      {taskMetrics?.completedCount ?? 0}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {taskMetrics?.completionRate ?? 0}% overall completion
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      On-Time Delivery
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-blue-400">
                      {taskMetrics?.onTimeRate ?? 100}%
                    </h3>
                  </div>
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                    <Clock size={22} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Delivered on or before deadline
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Attendance Rate
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-purple-400">
                      {attendanceMetrics?.attendanceRate ?? 95}%
                    </h3>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                    <CalendarCheck size={22} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {attendanceMetrics?.daysPresent ?? 0} days verified
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      High Priority Success
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-amber-400">
                      {taskMetrics?.highPriorityRate ?? 100}%
                    </h3>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                    <Zap size={22} />
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Critical task closure rate
                </p>
              </div>
            </div>

            {/* Bottom Grid: Recent Task Contribution & Growth Recommendations */}
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Recent Task Contribution */}
              <div className="xl:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Task Performance Records
                    </h3>
                    <p className="text-xs text-slate-400">
                      Recent assignments and weight contribution to your score
                    </p>
                  </div>
                  <Link
                    to="/EmployeeTasks"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    View All →
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  {recentTasks.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400">
                      No task performance data recorded yet.
                    </div>
                  ) : (
                    <table className="w-full min-w-[650px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02] uppercase tracking-wider text-slate-400 font-semibold">
                          <th className="px-5 py-4">Task Title</th>
                          <th className="px-5 py-4">Priority</th>
                          <th className="px-5 py-4">Performance Weight</th>
                          <th className="px-5 py-4">Due Date</th>
                          <th className="px-5 py-4">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/[0.06]">
                        {recentTasks.map((t) => (
                          <tr
                            key={t._id}
                            className="transition hover:bg-white/[0.02]"
                          >
                            <td className="px-5 py-4 font-semibold text-white">
                              {t.title}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 font-semibold ${
                                  t.priority === "High"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : t.priority === "Medium"
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}
                              >
                                {t.priority}
                              </span>
                            </td>

                            <td className="px-5 py-4 font-mono text-purple-400 font-bold">
                              {t.performanceWeight || 10}% weight
                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              {t.dueDate
                                ? new Date(t.dueDate).toLocaleDateString()
                                : "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 font-semibold ${
                                  t.status === "Completed"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : t.status === "In Progress"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
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

              {/* Management Feedback & Growth Card */}
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Growth & Evaluation
                      </h3>
                      <p className="text-xs text-slate-400">
                        Official management recommendation
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 mb-4">
                    <p className="text-xs leading-relaxed text-slate-300">
                      {overall?.score >= 8.5
                        ? "Outstanding work across your assignments. You are maintaining exceptional delivery precision and high attendance reliability."
                        : overall?.score >= 6.5
                        ? "Solid performance. Continue focusing on closing high-priority tasks ahead of deadlines to boost your score to Top Performer status."
                        : "Review pending tasks in the My Tasks section and ensure daily check-ins to raise your score."}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>Regular attendance punches verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-400 shrink-0" />
                      <span>Consistent task status updates</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <Link
                    to="/employee/attendance"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 py-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.08] transition"
                  >
                    View Attendance Record
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Performance;
