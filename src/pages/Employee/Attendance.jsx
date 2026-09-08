import React, { useEffect, useState } from "react";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import { getEmployeeToken } from "../../utils/auth";
import {
  CalendarCheck,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  Sparkles,
  Hourglass,
  CalendarDays,
} from "lucide-react";

const Attendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [attendanceData, setAttendanceData] = useState({
    stats: {
      totalDaysPresent: 0,
      totalLate: 0,
      totalHalfDays: 0,
      totalWorkingHours: 0,
      attendanceRate: 100,
    },
    today: null,
    records: [],
  });

  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Attendance Records
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getEmployeeToken();
      if (!token) {
        setError("Please login to view your attendance.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/employee/attendance/my-attendance",
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
        throw new Error(data.message || "Failed to load attendance records.");
      }

      setAttendanceData({
        stats: data.stats || {
          totalDaysPresent: 0,
          totalLate: 0,
          totalHalfDays: 0,
          totalWorkingHours: 0,
          attendanceRate: 100,
        },
        today: data.today || null,
        records: data.records || [],
      });
    } catch (err) {
      console.error("Fetch Attendance Error:", err);
      setError(err.message || "Could not load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Handle Check-In
  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getEmployeeToken();
      const response = await fetch(
        "http://localhost:5000/api/employee/attendance/check-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Check-in failed.");
      }

      setSuccess(
        `Successfully Checked In at ${data.attendance.checkInTime}! Status: ${data.attendance.status}`
      );
      setNotes("");
      fetchAttendance();
    } catch (err) {
      setError(err.message || "Could not complete check-in.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const token = getEmployeeToken();
      const response = await fetch(
        "http://localhost:5000/api/employee/attendance/check-out",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Check-out failed.");
      }

      setSuccess(
        `Successfully Checked Out at ${data.attendance.checkOutTime}! Total Logged: ${data.attendance.workingHours} hrs.`
      );
      setNotes("");
      fetchAttendance();
    } catch (err) {
      setError(err.message || "Could not complete check-out.");
    } finally {
      setActionLoading(false);
    }
  };

  const { stats, today, records } = attendanceData;

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    const formattedDate = new Date(rec.date).toLocaleDateString();
    const matchesSearch =
      searchQuery === "" ||
      formattedDate.includes(searchQuery) ||
      rec.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || rec.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Late":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Half Day":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Absent":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const isCheckedIn = !!today?.checkInTime;
  const isCheckedOut = !!today?.checkOutTime;

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
              <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-100 text-emerald-600">
                <CalendarCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee Portal
                </p>
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                  Attendance & Time Logging
                </h1>
              </div>
            </div>

            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-emerald-600" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 space-y-7">
          {/* Alerts */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-xs hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-medium flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess("")} className="text-xs hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Check-In / Clock-In Interactive Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Live Clock Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Clock
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="mt-4">
                  <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                    {currentTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-2 font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Shift Schedule:</span>
                <span className="font-bold text-slate-800">09:00 AM - 06:00 PM</span>
              </div>
            </div>

            {/* Clock In / Out Action Box */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Daily Punch In / Out</h3>
                    <p className="text-xs text-slate-500">
                      Record your attendance punch for today
                    </p>
                  </div>

                  {today && (
                    <span
                      className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(
                        today.status
                      )}`}
                    >
                      Status: {today.status}
                    </span>
                  )}
                </div>

                {/* Status Punch Timestamps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Clock In Time
                      </p>
                      <p className="text-base font-extrabold text-slate-900 mt-0.5">
                        {today?.checkInTime || "--:--"}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <LogIn size={18} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Clock Out Time
                      </p>
                      <p className="text-base font-extrabold text-slate-900 mt-0.5">
                        {today?.checkOutTime || "--:--"}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <LogOut size={18} />
                    </div>
                  </div>
                </div>

                {/* Optional Note */}
                {!isCheckedOut && (
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional punch note (e.g. Remote work, Client meeting)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-3">
                {!isCheckedIn ? (
                  <button
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                  >
                    <LogIn size={16} />
                    <span>{actionLoading ? "Punching In..." : "Clock In (Check-In)"}</span>
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                  >
                    <LogOut size={16} />
                    <span>{actionLoading ? "Punching Out..." : "Clock Out (Check-Out)"}</span>
                  </button>
                ) : (
                  <div className="flex-1 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                    ✓ You have completed both Clock-In and Clock-Out for today! Logged: {today?.workingHours || 0} hrs.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Days Present
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {stats?.totalDaysPresent || 0}
                  </h3>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Late Check-Ins
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-amber-600">
                    {stats?.totalLate || 0}
                  </h3>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-amber-600">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Half Days
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-blue-600">
                    {stats?.totalHalfDays || 0}
                  </h3>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-blue-600">
                  <Hourglass size={20} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Attendance Rate
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-purple-700">
                    {stats?.attendanceRate || 100}%
                  </h3>
                </div>
                <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5 text-purple-600">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Attendance History Log
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete record of your punch timestamps and working durations
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <CalendarDays size={36} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">No attendance logs found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your clocked in days will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Clock In</th>
                      <th className="px-6 py-4">Clock Out</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {new Date(rec.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {rec.checkInTime || "--:--"}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {rec.checkOutTime || "--:--"}
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-900">
                          {rec.workingHours ? `${rec.workingHours} hrs` : "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusBadge(
                              rec.status
                            )}`}
                          >
                            {rec.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-500 italic">
                          {rec.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
