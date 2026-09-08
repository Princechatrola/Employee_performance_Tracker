import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Target,
  BarChart3,
  Search,
  Eye,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  CalendarCheck,
  ChevronDown,
  X,
  Sparkles,
  Zap,
} from "lucide-react";

const AdminPerformance = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");

  const [stats, setStats] = useState({
    totalEvaluated: 0,
    averageScore: 0,
    averagePercentage: 0,
    excellentCount: 0,
    goodCount: 0,
    needsImprovementCount: 0,
  });

  // Detailed Modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAdminToken();

      if (!token) {
        setError("Admin session expired. Please login.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/admin/performance", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load performance metrics");
      }

      setEmployees(data.employees || []);
      if (data.overview) {
        setStats(data.overview);
      }
    } catch (err) {
      console.error("Admin Performance Fetch Error:", err);
      setError(err.message || "Could not load performance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Filter list
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      search === "" ||
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      department === "All Departments" || emp.department === department;

    return matchesSearch && matchesDept;
  });

  const departmentsList = [
    "All Departments",
    ...Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
  ];

  const getScoreClass = (score) => {
    if (score >= 8.5) return "text-emerald-600";
    if (score >= 7.0) return "text-blue-600";
    if (score >= 5.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressClass = (score) => {
    if (score >= 8.5) return "bg-emerald-500";
    if (score >= 7.0) return "bg-blue-500";
    if (score >= 5.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Excellent":
      case "Top Performer":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Good":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Average":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Needs Improvement":
      case "Needs Attention":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar />

      <main className="ml-64 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin / Performance Analytics
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                Performance Evaluation & Scoring
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPerformanceData}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
                <span>Refresh Metrics</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 space-y-7">
          {/* Error Alert */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center gap-3">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Statistics 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Evaluated */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Employees Evaluated
                  </p>
                  <h2 className="text-3xl font-bold mt-1 text-slate-900">
                    {stats.totalEvaluated}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">All active team members</p>
            </div>

            {/* Average Score */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Avg Org Score
                  </p>
                  <h2 className="text-3xl font-bold mt-1 text-purple-700">
                    {stats.averageScore} <span className="text-sm text-slate-400 font-normal">/ 10</span>
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Target size={22} />
                </div>
              </div>
              <p className="text-xs text-purple-700 font-medium mt-2">{stats.averagePercentage}% organizational score</p>
            </div>

            {/* Top Performers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Top Performers
                  </p>
                  <h2 className="text-3xl font-bold mt-1 text-emerald-600">
                    {stats.excellentCount}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Award size={22} />
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-2">Score ≥ 8.5 / 10</p>
            </div>

            {/* Needs Improvement */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                    Needs Attention
                  </p>
                  <h2 className="text-3xl font-bold mt-1 text-red-600">
                    {stats.needsImprovementCount}
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <TrendingDown size={22} />
                </div>
              </div>
              <p className="text-xs text-red-600 font-medium mt-2">Score &lt; 5.5 / 10</p>
            </div>
          </div>

          {/* Performance Table Section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Filter Controls */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Employee Performance Scores
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculated dynamically from approved task completions, on-time rate, and attendance
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search employee or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                {/* Department Dropdown */}
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition"
                  >
                    {departmentsList.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
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
                    <th className="px-6 py-4">Performance Score</th>
                    <th className="px-6 py-4">Task Completion</th>
                    <th className="px-6 py-4">Attendance Rate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-14 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={20} className="animate-spin text-blue-600" />
                          <span>Computing live employee performance...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-14 text-center text-slate-500">
                        <Users size={38} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-base font-semibold text-slate-700">
                          No employees found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your search criteria or department filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id || employee._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                              {employee.name?.charAt(0).toUpperCase() || "E"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {employee.name}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                {employee.employeeId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-800 font-semibold">
                            {employee.department}
                          </p>
                          <p className="text-xs text-slate-400">
                            {employee.position}
                          </p>
                        </td>

                        {/* Performance */}
                        <td className="px-6 py-4 min-w-[180px]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-bold text-sm ${getScoreClass(employee.score)}`}>
                              {employee.score} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {employee.percentage}%
                            </span>
                          </div>

                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full ${getProgressClass(employee.score)}`}
                              style={{ width: `${Math.min(100, employee.percentage)}%` }}
                            />
                          </div>
                        </td>

                        {/* Task Completion */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-800">
                            {employee.goals}%
                          </span>
                          <p className="text-[11px] text-slate-400">
                            {employee.completedTasks}/{employee.totalTasks} completed
                          </p>
                        </td>

                        {/* Attendance */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-800">
                            {employee.attendance}%
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Active presence
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full border text-xs font-bold ${getStatusClass(
                              employee.status
                            )}`}
                          >
                            {employee.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
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

      {/* Performance Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-lg font-bold">
                  {selectedEmployee.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedEmployee.employeeId} • {selectedEmployee.department} ({selectedEmployee.position})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Score Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Overall Performance Score
                </p>
                <h4 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {selectedEmployee.score} <span className="text-sm font-normal text-slate-400">/ 10</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Evaluation: <span className="font-bold text-slate-800">{selectedEmployee.status}</span>
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getStatusClass(
                  selectedEmployee.status
                )}`}
              >
                {selectedEmployee.status}
              </span>
            </div>

            {/* KPI Metrics */}
            <div className="space-y-4">
              {/* Task Completion */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-bold">Task Delivery & Completion</span>
                  <span className="font-bold text-emerald-600">{selectedEmployee.goals}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${selectedEmployee.goals}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  {selectedEmployee.completedTasks} completed out of {selectedEmployee.totalTasks} assigned tasks
                </p>
              </div>

              {/* On-Time Delivery */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-bold">On-Time Delivery Precision</span>
                  <span className="font-bold text-blue-600">{selectedEmployee.onTimeRate || 100}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${selectedEmployee.onTimeRate || 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  Deliverables completed on or before target deadline
                </p>
              </div>

              {/* Attendance */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-bold">Attendance Regularity</span>
                  <span className="font-bold text-purple-600">{selectedEmployee.attendance}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${selectedEmployee.attendance}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  Consistent on-time logged presence rate
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPerformance;