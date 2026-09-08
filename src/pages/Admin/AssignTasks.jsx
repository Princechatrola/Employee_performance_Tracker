import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";
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
  RefreshCw,
  PlusCircle,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  GitBranch,
  Eye,
  CheckSquare,
  X,
  MessageSquare,
  FolderCheck,
  ShieldCheck,
} from "lucide-react";

// GitHub repo validation helper
const isValidGitHubUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const regex = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/i;
  return regex.test(url.trim());
};

const AssignTasks = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Review Modal State
  const [reviewTask, setReviewTask] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [reviewingAction, setReviewingAction] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    description: "",
    priority: "Medium",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    performanceWeight: 10,
    githubRepoUrl: "",
  });

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const token = getAdminToken();

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
      const token = getAdminToken();

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

    if (formData.githubRepoUrl.trim() && !isValidGitHubUrl(formData.githubRepoUrl)) {
      setError(
        "Invalid GitHub Repository URL. Example format: https://github.com/username/project"
      );
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
      const token = getAdminToken();

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
        githubRepoUrl: "",
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
      const token = getAdminToken();
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

  // Update status directly
  const handleStatusChange = async (taskId, newStatus, feedbackText = "") => {
    try {
      const token = getAdminToken();
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          adminFeedback: feedbackText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? data.task || { ...t, status: newStatus } : t))
      );
      return true;
    } catch (err) {
      alert(err.message || "Could not update task status");
      return false;
    }
  };

  // Open Review Modal
  const handleOpenReview = (task) => {
    setReviewTask(task);
    setAdminFeedback(task.adminFeedback || "");
  };

  // Submit Review Decision
  const handleReviewDecision = async (newStatus) => {
    if (!reviewTask) return;
    setReviewingAction(true);
    const successResult = await handleStatusChange(reviewTask._id, newStatus, adminFeedback);
    setReviewingAction(false);
    if (successResult) {
      setReviewTask(null);
      setAdminFeedback("");
      setSuccess(
        newStatus === "Completed"
          ? "Task marked as Completed! Employee performance score updated."
          : `Task status changed to ${newStatus}.`
      );
      setTimeout(() => setSuccess(""), 4000);
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
  const underReviewCount = tasks.filter((t) => t.status === "Under Review").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Under Review":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-300";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

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
                Admin / Tasks
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-slate-900">
                Task Management & Verification
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchTasks();
                  fetchEmployees();
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
                title="Refresh Data"
              >
                <RefreshCw size={15} className={loadingTasks ? "animate-spin text-blue-600" : ""} />
                Refresh
              </button>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-lg shadow-blue-600/20"
              >
                <PlusCircle size={16} />
                {showForm ? "Hide Form" : "Assign New Task"}
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-6 lg:p-8 space-y-7">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-slate-900">{totalCount}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Layers size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pending
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-amber-600">{pendingCount}</h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <Clock size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    In Progress
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600">
                    {inProgressCount}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Sparkles size={22} />
                </div>
              </div>
            </div>

            {/* Under Review Card */}
            <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    Under Review
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-purple-800">
                    {underReviewCount}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
                  <FolderCheck size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Completed
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                    {completedCount}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 text-sm font-medium">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Task Assignment Form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <ClipboardList size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Assign New Task
                      </h2>
                      <p className="text-xs text-slate-500">
                        Fill in task requirements and optionally provide a GitHub starter link
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Employee Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        disabled={loadingEmployees}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <ClipboardList
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Implement User Authentication Module"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Description & Deliverables <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText
                        size={17}
                        className="absolute left-3.5 top-3.5 text-slate-400"
                      />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe task objectives, acceptance criteria, and expected deliverables..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white resize-none transition"
                      />
                    </div>
                  </div>

                  {/* GitHub Starter Link Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        GitHub Repository Link (Starter / Reference)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Optional starter template
                      </span>
                    </div>
                    <div className="relative">
                      <GitBranch
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="url"
                        name="githubRepoUrl"
                        value={formData.githubRepoUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username/project"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono outline-none focus:border-blue-500 focus:bg-white transition"
                      />
                    </div>
                    {formData.githubRepoUrl.trim() && (
                      <p
                        className={`text-xs mt-1.5 flex items-center gap-1.5 ${
                          isValidGitHubUrl(formData.githubRepoUrl)
                            ? "text-emerald-600 font-medium"
                            : "text-amber-600"
                        }`}
                      >
                        {isValidGitHubUrl(formData.githubRepoUrl) ? (
                          <>
                            <CheckCircle2 size={13} />
                            Valid GitHub repository URL format
                          </>
                        ) : (
                          <>
                            <AlertCircle size={13} />
                            Format: https://github.com/username/project
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Priority, Weight & Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Priority
                      </label>
                      <div className="relative">
                        <Flag
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
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
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Weight (%)
                      </label>
                      <div className="relative">
                        <Target
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="number"
                          name="performanceWeight"
                          value={formData.performanceWeight}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CalendarDays
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CalendarDays
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-700 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-50 transition shadow-lg shadow-blue-600/20"
                  >
                    <Send size={15} />
                    {submitting ? "Assigning Task..." : "Assign Task"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Assigned Tasks Table Section */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Table Controls */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-white">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">All Assigned Tasks</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredTasks.length} of {tasks.length} total tasks
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
                      placeholder="Search tasks or employees..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Under Review">Under Review</option>
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
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
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
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs text-slate-700 font-medium outline-none focus:border-blue-500 focus:bg-white transition"
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
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Task & Starter Repo</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Submitted GitHub Link</th>
                    <th className="px-6 py-4">Timeline</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingTasks ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={18} className="animate-spin text-blue-600" />
                          <span>Loading assigned tasks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <ClipboardList size={36} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-base font-semibold text-slate-700">
                          No tasks found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
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
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Task Title & Desc & Starter Repo */}
                          <td className="px-6 py-4 max-w-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getPriorityBadge(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                              <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {task.performanceWeight || 10}% weight
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 truncate text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {task.description}
                            </p>
                            {task.githubRepoUrl && (
                              <a
                                href={task.githubRepoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-blue-600 transition"
                              >
                                <GitBranch size={12} />
                                <span className="truncate max-w-[170px]">Starter Repo</span>
                                <ExternalLink size={10} className="shrink-0 opacity-70" />
                              </a>
                            )}
                          </td>

                          {/* Assigned Employee */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                {task.assignedTo?.name
                                  ? task.assignedTo.name.charAt(0).toUpperCase()
                                  : "E"}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-xs">
                                  {task.assignedTo?.name || "Unassigned"}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {task.assignedTo?.employeeId || "EMP"} •{" "}
                                  {task.assignedTo?.department || "General"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Submitted GitHub Link */}
                          <td className="px-6 py-4">
                            {task.submissionGithubUrl ? (
                              <div className="space-y-1.5">
                                <a
                                  href={task.submissionGithubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-mono font-medium transition group"
                                  title="Click to manually inspect repository on GitHub"
                                >
                                  <GitBranch size={13} className="text-purple-600" />
                                  <span className="truncate max-w-[150px]">
                                    {task.submissionGithubUrl.replace(/^https?:\/\/github\.com\//i, "")}
                                  </span>
                                  <ExternalLink size={11} className="group-hover:translate-x-0.5 transition-transform opacity-75" />
                                </a>
                                {task.submittedAt && (
                                  <p className="text-[10px] text-slate-400">
                                    Submitted {new Date(task.submittedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Not submitted yet
                              </span>
                            )}
                          </td>

                          {/* Timeline */}
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-slate-400" />
                              <span>
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "-"}
                              </span>
                            </div>
                            {isOverdue && (
                              <span className="inline-block mt-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                Overdue
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task._id, e.target.value)
                              }
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer transition ${getStatusBadge(
                                task.status
                              )}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {task.submissionGithubUrl ? (
                                <button
                                  onClick={() => handleOpenReview(task)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-semibold transition"
                                  title="Review Submission & GitHub Repo"
                                >
                                  <Eye size={14} />
                                  <span>Review</span>
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Task"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Review & Complete Task Modal */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Review Submitted Task
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manually inspect GitHub repository folders and verify completion
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Task Details Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Task Details
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadge(
                      reviewTask.status
                    )}`}
                  >
                    {reviewTask.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {reviewTask.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {reviewTask.description}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Assigned to:{" "}
                    <strong className="text-slate-900">
                      {reviewTask.assignedTo?.name} (
                      {reviewTask.assignedTo?.employeeId || "EMP"})
                    </strong>
                  </span>
                  <span>Due: {new Date(reviewTask.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* GitHub Repository Verification Section */}
              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <GitBranch size={14} className="text-purple-600" />
                    Submitted GitHub Repository
                  </span>
                  {reviewTask.submittedAt && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(reviewTask.submittedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white border border-purple-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                  <span className="font-mono text-xs text-purple-950 font-medium truncate select-all">
                    {reviewTask.submissionGithubUrl || "No URL provided"}
                  </span>

                  {reviewTask.submissionGithubUrl && (
                    <a
                      href={reviewTask.submissionGithubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shrink-0 shadow-sm"
                    >
                      <span>Open in GitHub</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {reviewTask.submissionNotes && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MessageSquare size={12} className="text-purple-600" />
                      Employee Submission Notes
                    </p>
                    <p className="text-xs text-slate-700 italic">
                      "{reviewTask.submissionNotes}"
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-start gap-2 text-xs text-purple-900 bg-purple-100/70 p-2.5 rounded-lg border border-purple-200">
                  <ShieldCheck size={16} className="shrink-0 text-purple-700 mt-0.5" />
                  <span>
                    <strong>Admin Verification:</strong> Click the GitHub link above to review the repository folders and code. Approving will automatically update the employee's performance metrics.
                  </span>
                </div>
              </div>

              {/* Admin Review Feedback */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Feedback / Review Notes (Optional)
                </label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  rows="3"
                  placeholder="e.g., Code reviewed and verified. Clean commit history!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white transition resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setReviewTask(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={reviewingAction}
                  onClick={() => handleReviewDecision("In Progress")}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition"
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  disabled={reviewingAction}
                  onClick={() => handleReviewDecision("Completed")}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
                >
                  <CheckSquare size={15} />
                  {reviewingAction ? "Updating..." : "Approve & Complete Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTasks;