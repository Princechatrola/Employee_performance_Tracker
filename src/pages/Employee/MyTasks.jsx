import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Loader2,
  Target,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
  GitBranch,
  Send,
  X,
  MessageSquare,
  FolderCheck,
  ShieldCheck,
  Edit3,
} from "lucide-react";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";
import { getEmployeeToken } from "../../utils/auth";

// GitHub repository URL validator
const isValidGitHubUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const regex = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/i;
  return regex.test(url.trim());
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  // Submission Modal State
  const [activeTaskToSubmit, setActiveTaskToSubmit] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getEmployeeToken();

      const response = await fetch(
        "http://localhost:5000/api/tasks/my-tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Fetch My Tasks Error:", err);
      setError(err.message || "Something went wrong loading your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quick status change for Pending/In Progress
  const handleStatusChange = async (taskId, newStatus) => {
    if (newStatus === "Under Review" || newStatus === "Completed") {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        handleOpenSubmitModal(task);
      }
      return;
    }

    try {
      setUpdatingId(taskId);
      const token = getEmployeeToken();

      const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? data.task || { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || "Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Submit Modal
  const handleOpenSubmitModal = (task) => {
    setActiveTaskToSubmit(task);
    setSubmissionUrl(task.submissionGithubUrl || "");
    setSubmissionNotes(task.submissionNotes || "");
    setSubmissionError("");
  };

  // Close Submit Modal
  const handleCloseSubmitModal = () => {
    setActiveTaskToSubmit(null);
    setSubmissionUrl("");
    setSubmissionNotes("");
    setSubmissionError("");
  };

  // Submit Completed Task with GitHub Repository URL
  const handleSubmitCompletedTask = async (e) => {
    e.preventDefault();
    setSubmissionError("");

    if (!submissionUrl.trim()) {
      setSubmissionError("GitHub repository URL is required to submit completed task.");
      return;
    }

    if (!isValidGitHubUrl(submissionUrl)) {
      setSubmissionError(
        "Invalid GitHub repository URL. Example format: https://github.com/username/project"
      );
      return;
    }

    try {
      setSubmittingTask(true);
      const token = getEmployeeToken();

      const response = await fetch(
        `http://localhost:5000/api/tasks/${activeTaskToSubmit._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            submissionGithubUrl: submissionUrl.trim(),
            submissionNotes: submissionNotes.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit task");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === activeTaskToSubmit._id ? data.task : t))
      );

      handleCloseSubmitModal();
      setSuccessMessage(
        "Task submitted successfully with your GitHub repository! Admin will review your code and complete the task."
      );
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setSubmissionError(err.message || "Failed to submit task.");
    } finally {
      setSubmittingTask(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "Under Review") {
      return "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-300";
    }
    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "text-red-600 bg-red-50 border-red-200";
    }
    if (priority === "Medium") {
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    }
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      search === "" ||
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase()) ||
      task.submissionGithubUrl?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "pending"
  ).length;
  const inProgressCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "in progress"
  ).length;
  const underReviewCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "under review"
  ).length;
  const completedCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <EmployeeSidebar />

      <main className="ml-64 min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100 text-blue-600">
                <ClipboardList size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee Portal
                </p>
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                  My Assigned Tasks
                </h1>
              </div>
            </div>

            <button
              onClick={fetchTasks}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-blue-600" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {totalCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
                  <ClipboardList size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pending
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-amber-600">
                    {pendingCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
                  <AlertCircle size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    In Progress
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-blue-600">
                    {inProgressCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 border border-blue-100">
                  <Sparkles size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                    Under Review
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-purple-800">
                    {underReviewCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 border border-purple-200">
                  <FolderCheck size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Completed
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-emerald-600">
                    {completedCount}
                  </h2>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700 font-medium flex items-center gap-3 shadow-xs">
              <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600 font-medium flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search your tasks, description, GitHub links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 shadow-xs transition"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 shadow-xs transition"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 size={22} className="animate-spin text-blue-600" />
                Loading your tasks...
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ClipboardList size={30} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                No Tasks Found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {tasks.length === 0
                  ? "You don't have any tasks assigned to you right now."
                  : "No tasks matched your search filter."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "Completed";

                const isUnderReview = task.status === "Under Review";
                const isCompleted = task.status === "Completed";

                return (
                  <div
                    key={task._id}
                    className={`rounded-2xl border bg-white p-6 transition shadow-sm hover:shadow-md ${
                      isUnderReview
                        ? "border-purple-300 ring-1 ring-purple-100"
                        : isCompleted
                        ? "border-emerald-300"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="flex-1">
                        {/* Badges row */}
                        <div className="flex items-center gap-2 flex-wrap mb-2.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            {task.priority} Priority
                          </span>

                          {task.performanceWeight && (
                            <span className="flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                              <Target size={12} />
                              Weight: {task.performanceWeight}%
                            </span>
                          )}

                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${getStatusStyle(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>

                          {isOverdue && (
                            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                              Overdue
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h2 className="text-lg font-bold text-slate-900">
                          {task.title}
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {task.description}
                        </p>

                        {/* Starter GitHub Repo Link from Admin */}
                        {task.githubRepoUrl && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-semibold">
                              Starter Repository:
                            </span>
                            <a
                              href={task.githubRepoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-medium text-blue-600 transition"
                            >
                              <GitBranch size={13} />
                              <span>{task.githubRepoUrl.replace(/^https?:\/\/github\.com\//i, "")}</span>
                              <ExternalLink size={11} className="opacity-75" />
                            </a>
                          </div>
                        )}

                        {/* Submitted GitHub Info & Status Banner */}
                        {isUnderReview && (
                          <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <ShieldCheck size={15} className="text-purple-700" />
                                Under Review — GitHub Repository Submitted
                              </p>
                              <div className="flex items-center gap-2">
                                <a
                                  href={task.submissionGithubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-mono font-medium text-purple-700 hover:underline flex items-center gap-1"
                                >
                                  {task.submissionGithubUrl}
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Admin is manually checking your project folders and code before approving completion.
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenSubmitModal(task)}
                              className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition"
                            >
                              <Edit3 size={13} />
                              Update Repo Link
                            </button>
                          </div>
                        )}

                        {/* Completed Task Banner with GitHub Link */}
                        {isCompleted && task.submissionGithubUrl && (
                          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                <CheckCircle2 size={15} className="text-emerald-600" />
                                Completed & Approved by Admin
                              </span>
                              <a
                                href={task.submissionGithubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono font-medium text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                View Submitted Repo
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            {task.adminFeedback && (
                              <p className="text-xs text-slate-600 mt-1 italic">
                                Admin Feedback: "{task.adminFeedback}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Controls for Employee */}
                      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                        {!isCompleted && !isUnderReview && (
                          <button
                            onClick={() => handleOpenSubmitModal(task)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition group"
                          >
                            <GitBranch size={15} className="group-hover:rotate-12 transition-transform" />
                            <span>Submit Completed Task</span>
                          </button>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Status:
                          </label>
                          <select
                            value={task.status}
                            disabled={updatingId === task._id || isCompleted}
                            onChange={(e) =>
                              handleStatusChange(task._id, e.target.value)
                            }
                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer bg-white shadow-xs transition ${getStatusStyle(
                              task.status
                            )}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Under Review">Submit for Review</option>
                            {isCompleted && <option value="Completed">Completed</option>}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Task Meta Information Footer */}
                    <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3 text-xs">
                      <div>
                        <p className="text-slate-400 font-medium">Start Date</p>
                        <p className="mt-0.5 text-slate-700 font-semibold">
                          {task.startDate
                            ? new Date(task.startDate).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 font-medium">Due Date</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-slate-700 font-semibold">
                          <CalendarDays size={14} className="text-slate-400" />
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No deadline"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-slate-400 font-medium">Assigned By</p>
                        <p className="mt-0.5 text-slate-700 font-semibold">
                          {task.assignedBy?.name || "HR Admin"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Submit Completed Task GitHub Modal */}
      {activeTaskToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                  <GitBranch size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Submit Completed Task
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide your GitHub repository link for admin verification
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseSubmitModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitCompletedTask} className="p-6 space-y-4">
              {/* Task Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Task
                </p>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeTaskToSubmit.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {activeTaskToSubmit.description}
                </p>
              </div>

              {/* GitHub Repo URL Input (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  GitHub Repository URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GitBranch
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="url"
                    required
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono outline-none focus:border-purple-500 focus:bg-white transition"
                  />
                </div>

                {/* Real-time GitHub URL validation message */}
                {submissionUrl.trim() && (
                  <p
                    className={`text-xs mt-1.5 flex items-center gap-1.5 ${
                      isValidGitHubUrl(submissionUrl)
                        ? "text-emerald-600 font-medium"
                        : "text-amber-600"
                    }`}
                  >
                    {isValidGitHubUrl(submissionUrl) ? (
                      <>
                        <CheckCircle2 size={13} />
                        Valid GitHub repository URL format
                      </>
                    ) : (
                      <>
                        <AlertCircle size={13} />
                        Must look like: https://github.com/username/project
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Submission Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Notes / Comments for Admin (Optional)
                </label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows="3"
                  placeholder="e.g., Completed all required authentication endpoints and added unit tests in /tests folder."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white transition resize-none"
                />
              </div>

              {/* Admin Manual Review Notice */}
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
                <ShieldCheck size={18} className="shrink-0 text-purple-700 mt-0.5" />
                <span>
                  <strong>Admin Verification Process:</strong> Your task will be marked as <em>Under Review</em>. Admin will manually check your GitHub repository folder before marking the task as completed.
                </span>
              </div>

              {/* Error Message */}
              {submissionError && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-600 font-medium flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseSubmitModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingTask || !submissionUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
                >
                  <Send size={14} />
                  {submittingTask ? "Submitting..." : "Submit for Admin Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;