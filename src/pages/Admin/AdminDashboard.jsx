import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";

import {
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  UserPlus,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  /* =====================================================
     DASHBOARD DATA
  ===================================================== */

  const [dashboardData, setDashboardData] =
    useState({
      stats: {
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        suspendedEmployees: 0,
        newThisMonth: 0,
        averageScore: 8.5,
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        topPerformersCount: 0,
        improvementCount: 0,
      },

      recentEmployees: [],
      departmentData: [],
      topPerformers: [],
      improvementEmployees: [],
      performanceData: [],
    });

  /* =====================================================
     STATES
  ===================================================== */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();

      if (!token) {
        setError(
          "Please login again."
        );

        setLoading(false);

        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load dashboard."
        );
      }

      setDashboardData(data);

      setLoading(false);
    } catch (error) {
      console.error(
        "Dashboard Fetch Error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong."
      );

      setLoading(false);
    }
  };

  /* =====================================================
     LOAD DASHBOARD
  ===================================================== */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalEmployees =
    dashboardData.stats?.totalEmployees || 0;

  const newThisMonth =
    dashboardData.stats?.newThisMonth || 0;

  const averageScore =
    dashboardData.stats?.averageScore || 8.5;

  const topPerformersCount =
    dashboardData.stats?.topPerformersCount || 0;

  const improvementCount =
    dashboardData.stats?.improvementCount || 0;

  /* =====================================================
     CURRENT MONTH
  ===================================================== */

  const currentMonth = new Date().toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  /* =====================================================
     STAT CARDS
  ===================================================== */

  const stats = [
    {
      title: "Total Employees",

      value: totalEmployees,

      change:
        `+${newThisMonth} this month`,

      icon: Users,

      iconBg: "bg-blue-50",

      iconColor: "text-blue-600",

      changeColor: "text-green-600",
    },

    {
      title: "Average Performance",

      value: `${averageScore} / 10`,

      change: `${Math.round(averageScore * 10)}% organization rating`,

      icon: TrendingUp,

      iconBg: "bg-emerald-50",

      iconColor: "text-emerald-600",

      changeColor: "text-green-600",
    },

    {
      title: "Top Performers",

      value: topPerformersCount,

      change:
        totalEmployees > 0
          ? `${Math.round(
              (topPerformersCount / totalEmployees) * 100
            )}% of employees`
          : "0% of employees",

      icon: Award,

      iconBg: "bg-purple-50",

      iconColor: "text-purple-600",

      changeColor: "text-slate-500",
    },

    {
      title: "Need Improvement",

      value: improvementCount,

      change:
        totalEmployees > 0
          ? `${Math.round(
              (improvementCount / totalEmployees) * 100
            )}% of employees`
          : "0% of employees",

      icon: AlertTriangle,

      iconBg: "bg-red-50",

      iconColor: "text-red-500",

      changeColor: "text-slate-500",
    },
  ];

  /* =====================================================
     PERFORMANCE CHART
  ===================================================== */

  const performanceData =
    dashboardData.performanceData && dashboardData.performanceData.length > 0
      ? dashboardData.performanceData
      : [
          { month: "Jan", score: 7.0 },
          { month: "Feb", score: 7.5 },
          { month: "Mar", score: 8.0 },
          { month: "Apr", score: 8.2 },
          { month: "May", score: 8.5 },
          { month: "Jun", score: averageScore },
        ];

  /* =====================================================
     TOP PERFORMERS
  ===================================================== */

  const topPerformers =
    dashboardData.topPerformers && dashboardData.topPerformers.length > 0
      ? dashboardData.topPerformers
      : [];

  /* =====================================================
     IMPROVEMENT EMPLOYEES
  ===================================================== */

  const improvementEmployees =
    dashboardData.improvementEmployees && dashboardData.improvementEmployees.length > 0
      ? dashboardData.improvementEmployees
      : [];

  /* =====================================================
     RECENT ACTIVITIES
  ===================================================== */

  const activities = dashboardData.recentEmployees.map(
    (employee) => ({
      title: "New employee added",

      description: `${employee.name} joined ${employee.department || "the organization"}`,

      time: new Date(
        employee.createdAt
      ).toLocaleDateString(),

      icon: UserPlus,

      iconBg: "bg-purple-100",

      iconColor: "text-purple-600",
    })
  );

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex h-20 items-center justify-between px-6 lg:px-8">

            <div>

              <p className="text-sm text-slate-500">
                Admin Dashboard
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900">
                Performance Overview
              </h1>

            </div>

            <div className="flex items-center gap-4">

              {/* DATE */}

              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">

                <CalendarDays
                  size={16}
                  className="text-slate-500"
                />

                <span className="text-sm text-slate-600">
                  Today
                </span>

              </div>

              {/* REFRESH */}

              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                title="Refresh Dashboard"
              >

                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

              </button>

              {/* ADMIN */}

              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  A
                </div>

                <div className="hidden sm:block">

                  <p className="text-sm font-semibold text-slate-800">
                    Admin
                  </p>

                  <p className="text-xs text-slate-500">
                    HR Administrator
                  </p>

                </div>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-6 lg:p-8">

          {/* WELCOME */}

          <div className="mb-7">

            <h2 className="text-2xl font-bold text-slate-900">
              Welcome back, Admin!
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening in your organization today.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => {

              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>

                      <h3 className="mt-2 text-2xl font-bold text-slate-900">

                        {loading
                          ? "..."
                          : stat.value}

                      </h3>

                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                    >

                      <Icon
                        size={21}
                        className={stat.iconColor}
                      />

                    </div>

                  </div>

                  <p
                    className={`mt-4 text-xs font-medium ${stat.changeColor}`}
                  >
                    {stat.change}
                  </p>

                </div>
              );
            })}

          </div>

          {/* =================================================
              PERFORMANCE + TOP PERFORMERS
          ================================================= */}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* PERFORMANCE CHART */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Performance Overview
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Average employee performance over the last 6 months
                  </p>

                </div>

                <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">
                  Last 6 Months
                </button>

              </div>

              <div className="mt-7">

                <div className="relative h-64">

                  {/* HORIZONTAL LINES */}

                  <div className="absolute inset-0 flex flex-col justify-between">

                    {[10, 8, 6, 4, 2, 0].map(
                      (number) => (
                        <div
                          key={number}
                          className="flex items-center gap-3"
                        >

                          <span className="w-5 text-right text-[10px] text-slate-400">
                            {number}
                          </span>

                          <div className="h-px flex-1 bg-slate-100" />

                        </div>
                      )
                    )}

                  </div>

                  {/* BARS */}

                  <div className="absolute bottom-0 left-10 right-0 top-0 flex items-end justify-around">

                    {performanceData.map(
                      (item) => {

                        const height =
                          `${item.score * 10}%`;

                        return (
                          <div
                            key={item.month}
                            className="flex h-full w-12 flex-col items-center justify-end"
                          >

                            <div className="mb-2 text-xs font-semibold text-blue-600">
                              {item.score}
                            </div>

                            <div
                              className="w-7 rounded-t-lg bg-blue-500 transition hover:bg-blue-600"
                              style={{
                                height,
                              }}
                            />

                            <span className="mt-3 text-xs text-slate-400">
                              {item.month}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* TOP PERFORMERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Top Performers
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Highest performing employees
                  </p>

                </div>

                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </button>

              </div>

              <div className="mt-5 space-y-4">

                {topPerformers.map(
                  (employee, index) => (

                    <div
                      key={employee.name}
                      className="flex items-center gap-3"
                    >

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                        {index + 1}
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {employee.name.charAt(
                          0
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {employee.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {employee.department}
                        </p>

                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        {employee.score}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              IMPROVEMENT + RECENT ACTIVITY
          ================================================= */}

          <div className="mt-6 grid gap-6 xl:grid-cols-3">

            {/* NEED IMPROVEMENT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Employees Needing Improvement
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Employees requiring attention
                  </p>

                </div>

                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </button>

              </div>

              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[600px]">

                  <thead>

                    <tr className="border-b border-slate-100 text-left">

                      <th className="pb-3 text-xs font-semibold text-slate-400">
                        Employee
                      </th>

                      <th className="pb-3 text-xs font-semibold text-slate-400">
                        Department
                      </th>

                      <th className="pb-3 text-xs font-semibold text-slate-400">
                        Performance Score
                      </th>

                      <th className="pb-3 text-xs font-semibold text-slate-400">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {improvementEmployees.map(
                      (employee) => (

                        <tr
                          key={employee.name}
                          className="border-b border-slate-50 last:border-0"
                        >

                          <td className="py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                {employee.name.charAt(
                                  0
                                )}
                              </div>

                              <span className="text-sm font-semibold text-slate-700">
                                {employee.name}
                              </span>

                            </div>

                          </td>

                          <td className="py-4 text-sm text-slate-500">
                            {employee.department}
                          </td>

                          <td className="py-4">

                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-500">
                              {employee.score}
                            </span>

                          </td>

                          <td className="py-4">

                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500">
                              Needs Improvement
                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* RECENT ACTIVITIES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Recent Activities
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest organization updates
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-4">

                {activities.length === 0 ? (

                  <p className="py-6 text-center text-sm text-slate-400">
                    No recent activities.
                  </p>

                ) : (

                  activities.map(
                    (activity, index) => {

                      const Icon =
                        activity.icon;

                      return (
                        <div
                          key={index}
                          className="flex gap-3"
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                          >

                            <Icon
                              size={16}
                              className={
                                activity.iconColor
                              }
                            />

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <p className="text-xs font-semibold leading-5 text-slate-700">
                                {activity.title}
                              </p>

                              <span className="shrink-0 text-[10px] text-slate-400">
                                {activity.time}
                              </span>

                            </div>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {activity.description}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              DATABASE SUMMARY
          ================================================= */}

          <div className="mt-6 grid gap-5 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Active Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {loading
                  ? "..."
                  : dashboardData.stats
                      .activeEmployees}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Inactive Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-600">
                {loading
                  ? "..."
                  : dashboardData.stats
                      .inactiveEmployees}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-slate-500">
                Suspended Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-red-500">
                {loading
                  ? "..."
                  : dashboardData.stats
                      .suspendedEmployees}
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;