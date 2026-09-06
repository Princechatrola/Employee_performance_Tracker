import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
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
} from "lucide-react";

const AdminPerformance = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");

  // Demo performance data
  useEffect(() => {
    const performanceData = [
      {
        id: 1,
        name: "Rahul Sharma",
        employeeId: "EMP1001",
        department: "Development",
        position: "Senior Developer",
        score: 92,
        goals: 95,
        attendance: 98,
        status: "Excellent",
      },
      {
        id: 2,
        name: "Priya Patel",
        employeeId: "EMP1002",
        department: "Design",
        position: "UI/UX Designer",
        score: 88,
        goals: 90,
        attendance: 96,
        status: "Excellent",
      },
      {
        id: 3,
        name: "Amit Shah",
        employeeId: "EMP1003",
        department: "Development",
        position: "Frontend Developer",
        score: 81,
        goals: 84,
        attendance: 94,
        status: "Good",
      },
      {
        id: 4,
        name: "Neha Mehta",
        employeeId: "EMP1004",
        department: "HR",
        position: "HR Executive",
        score: 76,
        goals: 79,
        attendance: 92,
        status: "Good",
      },
      {
        id: 5,
        name: "Vivek Joshi",
        employeeId: "EMP1005",
        department: "Marketing",
        position: "Marketing Executive",
        score: 68,
        goals: 70,
        attendance: 88,
        status: "Average",
      },
      {
        id: 6,
        name: "Karan Patel",
        employeeId: "EMP1006",
        department: "Development",
        position: "Junior Developer",
        score: 58,
        goals: 61,
        attendance: 85,
        status: "Needs Improvement",
      },
    ];

    setEmployees(performanceData);
  }, []);

  const departments = [
    "All Departments",
    ...new Set(employees.map((employee) => employee.department)),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      department === "All Departments" ||
      employee.department === department;

    return matchesSearch && matchesDepartment;
  });

  const totalEmployees = employees.length;

  const averageScore =
    employees.length > 0
      ? Math.round(
          employees.reduce((total, employee) => total + employee.score, 0) /
            employees.length
        )
      : 0;

  const excellentPerformers = employees.filter(
    (employee) => employee.score >= 85
  ).length;

  const needsImprovement = employees.filter(
    (employee) => employee.score < 70
  ).length;

  const getScoreClass = (score) => {
    if (score >= 85) {
      return "text-green-400";
    }

    if (score >= 70) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  const getProgressClass = (score) => {
    if (score >= 85) {
      return "bg-green-500";
    }

    if (score >= 70) {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  };

  const getStatusClass = (status) => {
    if (status === "Excellent") {
      return "bg-green-500/10 text-green-400 border-green-500/20";
    }

    if (status === "Good") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }

    if (status === "Average") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminSidebar />

      <main className="ml-64 min-h-screen p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Performance Management
            </h1>

            <p className="text-slate-400 mt-1">
              Monitor and evaluate employee performance
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
            <BarChart3 size={18} />
            Performance Report
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* Total Employees */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Employees Evaluated
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalEmployees}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="text-blue-400" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>12% from last month</span>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Average Performance
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {averageScore}%
                </h2>
              </div>

              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Target className="text-purple-400" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span>5.4% improvement</span>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Top Performers
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {excellentPerformers}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Award className="text-yellow-400" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-yellow-400 text-sm">
              <Star size={16} />
              <span>85%+ performance score</span>
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Needs Improvement
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {needsImprovement}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="text-red-400" size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-red-400 text-sm">
              <TrendingDown size={16} />
              <span>Below 70%</span>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Performance Overview
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Current employee performance distribution
              </p>
            </div>

            <BarChart3 className="text-blue-400" size={24} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Excellent */}
            <div className="border border-white/10 rounded-lg p-5">
              <div className="flex justify-between mb-3">
                <span className="text-slate-300">
                  Excellent
                </span>

                <span className="text-green-400 font-semibold">
                  85% - 100%
                </span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      totalEmployees
                        ? (excellentPerformers / totalEmployees) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <p className="text-slate-500 text-sm mt-3">
                {excellentPerformers} employees
              </p>
            </div>

            {/* Good */}
            <div className="border border-white/10 rounded-lg p-5">
              <div className="flex justify-between mb-3">
                <span className="text-slate-300">
                  Good
                </span>

                <span className="text-yellow-400 font-semibold">
                  70% - 84%
                </span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{
                    width: `${
                      totalEmployees
                        ? (employees.filter(
                            (employee) =>
                              employee.score >= 70 &&
                              employee.score < 85
                          ).length /
                            totalEmployees) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <p className="text-slate-500 text-sm mt-3">
                {
                  employees.filter(
                    (employee) =>
                      employee.score >= 70 &&
                      employee.score < 85
                  ).length
                }{" "}
                employees
              </p>
            </div>

            {/* Needs Improvement */}
            <div className="border border-white/10 rounded-lg p-5">
              <div className="flex justify-between mb-3">
                <span className="text-slate-300">
                  Needs Improvement
                </span>

                <span className="text-red-400 font-semibold">
                  Below 70%
                </span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${
                      totalEmployees
                        ? (needsImprovement / totalEmployees) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <p className="text-slate-500 text-sm mt-3">
                {needsImprovement} employees
              </p>
            </div>
          </div>
        </div>

        {/* Employee Performance */}
        <div className="bg-slate-900 border border-white/10 rounded-xl">
          {/* Table Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Employee Performance
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Review individual employee performance
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Department */}
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Employee
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Department
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Performance
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Goals
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-medium text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition"
                  >
                    {/* Employee */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-semibold">
                          {employee.name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {employee.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">
                        {employee.department}
                      </p>

                      <p className="text-xs text-slate-500">
                        {employee.position}
                      </p>
                    </td>

                    {/* Performance */}
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-semibold ${getScoreClass(
                            employee.score
                          )}`}
                        >
                          {employee.score}%
                        </span>
                      </div>

                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressClass(
                            employee.score
                          )}`}
                          style={{
                            width: `${employee.score}%`,
                          }}
                        ></div>
                      </div>
                    </td>

                    {/* Goals */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {employee.goals}%
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {employee.attendance}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                        onClick={() =>
                          alert(
                            `Performance details for ${employee.name}`
                          )
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <div className="py-12 text-center">
                <Users
                  size={40}
                  className="mx-auto text-slate-600 mb-3"
                />

                <p className="text-slate-400">
                  No employees found
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPerformance;