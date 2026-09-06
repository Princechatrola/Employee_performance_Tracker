import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  ClipboardList,
  User,
  CalendarDays,
  Flag,
  Target,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";

const AssignTasks = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    description: "",
    priority: "Medium",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    performanceWeight: 10,
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/admin/employees", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load employees");
      }
      setEmployees(data.employees || []);
    } catch (err) {
      console.error("Fetch Employees Error:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/admin/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter task title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter task description.");
      return;
    }

    if (!formData.startDate) {
      setError("Please select start date.");
      return;
    }

    if (!formData.dueDate) {
      setError("Please select due date.");
      return;
    }

    if (new Date(formData.dueDate) < new Date(formData.startDate)) {
      setError("Due date cannot be before start date.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/admin/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign task");
      }

      setSuccess("Task assigned successfully!");

      // Reset form
      setFormData({
        employeeId: "",
        title: "",
        description: "",
        priority: "Medium",
        startDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        performanceWeight: 10,
      });

      // Refresh task list
      fetchTasks();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || "Could not delete task");
    }
  };

  // Update status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || "Could not update task status");
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const titleMatch = task.title?.toLowerCase().includes(search.toLowerCase());
    const descMatch = task.description?.toLowerCase().includes(search.toLowerCase());
    const empNameMatch = task.assignedTo?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const empIdMatch = task.assignedTo?.employeeId
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesSearch =
      search === "" || titleMatch || descMatch || empNameMatch || empIdMatch;

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    const matchesEmployee =
      employeeFilter === "All" ||
      task.assignedTo?._id === employeeFilter ||
      task.assignedTo?.employeeId === employeeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesEmployee;
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-6 lg:p-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Assign tasks to employees, set priorities, and track progress
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchTasks();
                fetchEmployees();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-slate-300 text-sm transition"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loadingTasks ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/20"
            >
              <PlusCircle size={17} />
              {showForm ? "Hide Assign Form" : "Assign New Task"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </p>
                <h3 className="text-2xl font-bold mt-1 text-white">{totalCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Layers size={22} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Pending
                </p>
                <h3 className="text-2xl font-bold mt-1 text-amber-400">{pendingCount}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  In Progress
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-400">
                  {inProgressCount}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Sparkles size={22} />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Completed
                </p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                  {completedCount}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Task Assignment Form */}
        {showForm && (
          <div className="mb-8">
            <form
              onSubmit={handleSubmit}
              className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Form Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Assign New Task
                    </h2>
                    <p className="text-xs text-slate-400">
                      Fill in the details below to assign work to an employee
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Employee Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Assign To <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      disabled={loadingEmployees}
                      className="w-full appearance-none bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white outline-none focus:border-blue-500 focus:bg-slate-800 transition"
                    >
                      <option value="">
                        {loadingEmployees
                          ? "Loading employees..."
                          : "-- Select Employee --"}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.employeeId || "No ID"}) —{" "}
                          {emp.department || "General"}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Task Title <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <ClipboardList
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Implement User Authentication Module"
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-800 transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Description & Objectives <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-3.5 top-3.5 text-slate-500"
                    />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe the task requirements, acceptance criteria, and expected deliverables..."
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-slate-800 resize-none transition"
                    />
                  </div>
                </div>

                {/* Priority, Weight & Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Priority
                    </label>
                    <div className="relative">
                      <Flag
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full appearance-none bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Weight (%)
                    </label>
                    <div className="relative">
                      <Target
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="number"
                        name="performanceWeight"
                        value={formData.performanceWeight}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Due Date <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-6 py-4 bg-slate-900/60 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm disabled:opacity-50 transition shadow-lg shadow-blue-600/20"
                >
                  <Send size={16} />
                  {submitting ? "Assigning Task..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assigned Tasks Table Section */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {/* Table Controls */}
          <div className="p-5 sm:p-6 border-b border-white/10">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">All Assigned Tasks</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Showing {filteredTasks.length} of {tasks.length} total tasks
                </p>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search tasks or employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-slate-800 border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 transition"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none bg-slate-800 border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 transition"
                  >
                    <option value="All">All Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* Employee Filter */}
                <div className="relative">
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="appearance-none bg-slate-800 border border-white/10 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 transition"
                  >
                    <option value="All">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
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
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Task</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Priority & Weight</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingTasks ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={18} className="animate-spin text-blue-400" />
                        <span>Loading assigned tasks...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <ClipboardList size={36} className="mx-auto mb-2 text-slate-600" />
                      <p className="text-base font-medium text-slate-300">
                        No tasks found
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try changing filters or assign a new task above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      new Date(task.dueDate) < new Date() &&
                      task.status !== "Completed";

                    return (
                      <tr
                        key={task._id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Task Title & Desc */}
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-semibold text-white truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                            {task.description}
                          </p>
                        </td>

                        {/* Assigned Employee */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 font-semibold flex items-center justify-center text-xs">
                              {task.assignedTo?.name
                                ? task.assignedTo.name.charAt(0).toUpperCase()
                                : "E"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-200 text-xs">
                                {task.assignedTo?.name || "Unassigned"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {task.assignedTo?.employeeId || "EMP"} •{" "}
                                {task.assignedTo?.department || "General"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Priority & Weight */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-white/5">
                              {task.performanceWeight || 10}%
                            </span>
                          </div>
                        </td>

                        {/* Timeline */}
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-300 flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-slate-500" />
                            <span>
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          {isOverdue && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                              Overdue
                            </span>
                          )}
                        </td>

                        {/* Status (Interactive) */}
                        <td className="px-6 py-4">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task._id, e.target.value)
                            }
                            className={`text-xs font-medium rounded-lg px-2.5 py-1 border outline-none cursor-pointer bg-slate-900 transition ${getStatusBadge(
                              task.status
                            )}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignTasks;