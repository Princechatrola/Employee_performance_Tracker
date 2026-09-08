import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  Edit3,
  X,
  Check,
  Building2,
  Layers,
} from "lucide-react";

const AdminAttendance = () => {
  const getTodayDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalStaff: 0,
    presentCount: 0,
    lateCount: 0,
    halfDayCount: 0,
    absentCount: 0,
    attendancePercentage: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit Modal
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("Present");
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchAttendance = async (date = selectedDate) => {
    try {
      setLoading(true);
      setError("");
      const token = getAdminToken();

      if (!token) {
        setError("Admin session expired. Please login.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/attendance?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load attendance records");
      }

      setRecords(data.records || data.attendance || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Admin Attendance Fetch Error:", err);
      setError(err.message || "Could not fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  // Handle Edit Submit
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      setUpdating(true);
      const token = getAdminToken();

      const response = await fetch(
        `http://localhost:5000/api/admin/attendance/${editingRecord._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: editStatus,
            notes: editNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update attendance status");
      }

      // Update local state
      setRecords((prev) =>
        prev.map((rec) => (rec._id === editingRecord._id ? data.attendance : rec))
      );

      setEditingRecord(null);
      fetchAttendance(selectedDate);
    } catch (err) {
      alert(err.message || "Could not update attendance.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setEditStatus(rec.status || "Present");
    setEditNotes(rec.notes || "");
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const nameMatch = r.employee?.name?.toLowerCase().includes(search.toLowerCase());
    const idMatch = r.employee?.employeeId?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = r.employee?.email?.toLowerCase().includes(search.toLowerCase());
    const depMatch = r.employee?.department?.toLowerCase().includes(search.toLowerCase());

    const matchesSearch =
      search === "" || nameMatch || idMatch || emailMatch || depMatch;

    const matchesDepartment =
      department === "All" || r.employee?.department === department;

    const matchesStatus =
      statusFilter === "All" || r.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
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

  // Unique departments
  const departments = [
    "All",
    ...new Set(
      records
        .map((r) => r.employee?.department)
        .filter((d) => d && typeof d === "string")
    ),
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin / Attendance Audit
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                Attendance Management
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Picker */}
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2">
                <CalendarDays size={16} className="text-blue-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={() => fetchAttendance(selectedDate)}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition disabled:opacity-50"
                title="Refresh Attendance"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-6 lg:p-8 space-y-7">
          {/* Error Alert */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Staff */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Staff
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">
                    {summary.totalStaff}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">All registered active members</p>
            </div>

            {/* Present */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Present On Time
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                    {summary.presentCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="text-[11px] text-emerald-600 mt-2 font-medium">Checked in on schedule</p>
            </div>

            {/* Late */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Late Arrivals
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-amber-600">
                    {summary.lateCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-[11px] text-amber-600 mt-2 font-medium">Punch-in after 09:30 AM</p>
            </div>

            {/* Half Day */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Half Day
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600">
                    {summary.halfDayCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Layers size={20} />
                </div>
              </div>
              <p className="text-[11px] text-blue-600 mt-2 font-medium">Less than 6h recorded</p>
            </div>

            {/* Absent */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Absent / Not In
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-red-600">
                    {summary.absentCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <AlertCircle size={20} />
                </div>
              </div>
              <p className="text-[11px] text-red-600 mt-2 font-medium">No punch-in recorded</p>
            </div>
          </div>

          {/* Attendance Table Section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Controls */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Staff Attendance List
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredRecords.length} records for {selectedDate}
                </p>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name, ID, department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                {/* Department */}
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {departments.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep === "All" ? "All Departments" : dep}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* Status */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department & Role</th>
                    <th className="px-6 py-4">Check-In Time</th>
                    <th className="px-6 py-4">Check-Out Time</th>
                    <th className="px-6 py-4">Total Hours</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={18} className="animate-spin text-blue-600" />
                          <span>Loading attendance logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                        <CalendarDays size={36} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-base font-semibold text-slate-700">
                          No attendance records found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting the date or filter criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr
                        key={rec._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {rec.employee?.name?.charAt(0).toUpperCase() || "E"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {rec.employee?.name || "Unknown"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {rec.employee?.employeeId || "EMP"} • {rec.employee?.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-slate-800">
                            {rec.employee?.department || "General"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {rec.employee?.position || "Staff"}
                          </p>
                        </td>

                        {/* Check-In */}
                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {rec.checkInTime ? (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Clock size={13} />
                              {rec.checkInTime}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">--:--</span>
                          )}
                        </td>

                        {/* Check-Out */}
                        <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                          {rec.checkOutTime ? (
                            <span className="flex items-center gap-1 text-slate-700">
                              <Clock size={13} />
                              {rec.checkOutTime}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">--:--</span>
                          )}
                        </td>

                        {/* Working Hours */}
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {rec.workingHours ? `${rec.workingHours} hrs` : "-"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold ${getStatusBadge(
                              rec.status
                            )}`}
                          >
                            {rec.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Attendance Status"
                          >
                            <Edit3 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Attendance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Attendance Record
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingRecord.employee?.name} ({editingRecord.employee?.employeeId})
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Audit Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g., Excused sick leave approved by HR"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white resize-none transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
