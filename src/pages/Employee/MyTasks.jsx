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
  Filter,
  Sparkles,
} from "lucide-react";
import EmployeeSidebar from "../../components/Employee/EmployeeSidebar";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/tasks/my-tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("My Tasks API Response:", data);

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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      const token = localStorage.getItem("token");

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
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || "Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (status === "In Progress") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "text-red-400 bg-red-500/10 border-red-500/20";
    }
    if (priority === "Medium") {
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    }
    return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CheckCircle2 size={16} />;
    }
    if (status === "In Progress") {
      return <Clock size={16} />;
    }
    return <AlertCircle size={16} />;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      search === "" ||
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());

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
  const completedCount = tasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <EmployeeSidebar />

      <main className="ml-64 min-h-screen p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <ClipboardList className="text-blue-400" size={26} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                My Assigned Tasks
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                View your active assignments, due dates, and update progress
              </p>
            </div>
          </div>

          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/[0.06] text-slate-300 text-sm transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {totalCount}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                <ClipboardList size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Pending
                </p>
                <h2 className="mt-1 text-2xl font-bold text-amber-400">
                  {pendingCount}
                </h2>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  In Progress
                </p>
                <h2 className="mt-1 text-2xl font-bold text-blue-400">
                  {inProgressCount}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                <Sparkles size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Completed
                </p>
                <h2 className="mt-1 text-2xl font-bold text-emerald-400">
                  {completedCount}
                </h2>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500 transition"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400 flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 size={22} className="animate-spin text-blue-400" />
              Loading your tasks...
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <ClipboardList size={30} />
            </div>
            <h2 className="text-lg font-semibold text-white">
              No Tasks Found
            </h2>
            <p className="mt-1 text-sm text-slate-400">
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

              return (
                <div
                  key={task._id}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-white/20 shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority} Priority
                        </span>

                        {task.performanceWeight && (
                          <span className="flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
                            <Target size={12} />
                            Weight: {task.performanceWeight}%
                          </span>
                        )}

                        {isOverdue && (
                          <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                            Overdue
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-bold text-white">
                        {task.title}
                      </h2>

                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {task.description}
                      </p>
                    </div>

                    {/* Status Select dropdown for employee */}
                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Update Status:
                      </label>
                      <select
                        value={task.status}
                        disabled={updatingId === task._id}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold outline-none cursor-pointer bg-slate-950 transition ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Task Meta Information Footer */}
                  <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3 text-xs">
                    <div>
                      <p className="text-slate-500">Start Date</p>
                      <p className="mt-1 text-slate-300 font-medium">
                        {task.startDate
                          ? new Date(task.startDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Due Date</p>
                      <div className="mt-1 flex items-center gap-1.5 text-slate-300 font-medium">
                        <CalendarDays size={14} className="text-slate-500" />
                        <span>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No deadline"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-500">Assigned By</p>
                      <p className="mt-1 text-slate-300 font-medium">
                        {task.assignedBy?.name || "HR Admin"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTasks;