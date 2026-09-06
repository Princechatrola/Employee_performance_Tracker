import React, { useEffect, useState } from "react";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
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

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view your attendance.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/attendance/my-attendance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load attendance records");
      }

      setAttendanceData(data);
    } catch (err) {
      console.error("Fetch Attendance Error:", err);
      setError(err.message || "Something went wrong loading attendance.");
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

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Check-in failed");
      }

      setSuccess(data.message || "Checked in successfully!");
      setNotes("");
      fetchAttendance();
    } catch (err) {
      setError(err.message || "Failed to process check-in.");
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

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Check-out failed");
      }

      setSuccess(data.message || "Checked out successfully!");
      setNotes("");
      fetchAttendance();
    } catch (err) {
      setError(err.message || "Failed to process check-out.");
    } finally {
      setActionLoading(false);
    }
  };

  const { stats, today, records } = attendanceData;

  const isCheckedIn = Boolean(today && today.checkIn);
  const isCheckedOut = Boolean(today && today.checkOut);

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    const matchesStatus =
      statusFilter === "All" || rec.status?.toLowerCase() === statusFilter.toLowerCase();
    const formattedDate = new Date(rec.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const matchesSearch =
      searchQuery === "" ||
      formattedDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Late":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Half Day":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "On Leave":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
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
            <div className="rounded-2xl bg-emerald-500/10 p-3 border border-emerald-500/20">
              <CalendarCheck className="text-emerald-400" size={26} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                My Attendance
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                Log your daily working hours, clock-in / clock-out, and review history
              </p>
            </div>
          </div>

          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-slate-300 text-sm font-medium transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-emerald-400" : ""} />
            Refresh
          </button>
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

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess("")} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Check-In / Clock-In Interactive Card */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Live Clock Card */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/60 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current Time
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="mt-4">
                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </h2>
                <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                  <Calendar size={15} className="text-slate-500" />
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Standard Shift:</span>
              <span className="font-semibold text-slate-200">09:00 AM - 06:00 PM</span>
            </div>
          </div>

          {/* Clock In / Out Action Box */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Today's Action</h3>
                  <p className="text-xs text-slate-400">
                    Record your attendance punch for today
                  </p>
                </div>

                {today && (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                      today.status
                    )}`}
                  >
                    Status: {today.status}
                  </span>
                )}
              </div>

              {/* Status Details Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/60 p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Check In
                  </p>
                  <p className="mt-1 text-base font-bold text-emerald-400">
                    {today?.checkIn
                      ? new Date(today.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-slate-950/60 p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Check Out
                  </p>
                  <p className="mt-1 text-base font-bold text-blue-400">
                    {today?.checkOut
                      ? new Date(today.checkOut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/[0.06] bg-slate-950/60 p-3.5">
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    Total Logged
                  </p>
                  <p className="mt-1 text-base font-bold text-purple-400">
                    {today?.workingHours ? `${today.workingHours} hrs` : "0.0 hrs"}
                  </p>
                </div>
              </div>

              {/* Optional Notes Input */}
              {!isCheckedOut && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Optional note / task summary for today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogIn size={18} />
                  )}
                  Check In for Today
                </button>
              ) : !isCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}
                  Check Out (End Day)
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/[0.04] border border-white/10 px-6 py-3 text-sm font-medium text-emerald-400">
                  <CheckCircle2 size={18} />
                  Attendance Complete for Today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Days Present
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">
                  {stats?.totalDaysPresent ?? 0}
                </h3>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Total active verified days
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attendance Rate
                </p>
                <h3 className="mt-1 text-2xl font-bold text-blue-400">
                  {stats?.attendanceRate ?? 100}%
                </h3>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                <TrendingUp size={22} />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${stats?.attendanceRate ?? 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Late Days
                </p>
                <h3 className="mt-1 text-2xl font-bold text-amber-400">
                  {stats?.totalLate ?? 0}
                </h3>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <Hourglass size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Check-ins after 09:30 AM
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Hours
                </p>
                <h3 className="mt-1 text-2xl font-bold text-purple-400">
                  {stats?.totalWorkingHours ?? 0}h
                </h3>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400">
                <Clock size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Cumulative hours logged
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search by date or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h3 className="text-lg font-bold text-white">Attendance Logs</h3>
              <p className="text-xs text-slate-400">
                Detailed history of your working sessions
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 size={22} className="animate-spin text-emerald-400" />
                  Loading attendance records...
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                  <CalendarDays size={28} />
                </div>
                <h4 className="text-base font-semibold text-white">No Records Found</h4>
                <p className="mt-1 text-xs text-slate-400">
                  {records.length === 0
                    ? "You haven't logged any attendance punches yet. Click Check In above!"
                    : "No records matched your search or status filter."}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4">Working Hours</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Notes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06] text-sm">
                  {filteredRecords.map((rec) => {
                    const formattedDate = new Date(rec.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    const inTime = rec.checkIn
                      ? new Date(rec.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                    const outTime = rec.checkOut
                      ? new Date(rec.checkOut).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                    return (
                      <tr key={rec._id} className="transition hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                          <Calendar size={15} className="text-slate-500" />
                          {formattedDate}
                        </td>

                        <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                          {inTime}
                        </td>

                        <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                          {outTime}
                        </td>

                        <td className="px-6 py-4 text-slate-300 font-semibold text-xs">
                          {rec.workingHours ? `${rec.workingHours} hrs` : "-"}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                              rec.status
                            )}`}
                          >
                            {rec.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                          {rec.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Attendance;
