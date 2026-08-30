import React from "react";
import {
  LayoutDashboard,
  Target,
  ClipboardList,
  BarChart3,
  MessageSquare,
  User,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock3,
  AlertCircle,
  CalendarDays,
  Award,
  Menu,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

import { Link } from "react-router-dom";

const performanceData = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 76 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 82 },
  { month: "May", score: 85 },
  { month: "Jun", score: 89 },
  { month: "Jul", score: 91 },
];

const goals = [
  {
    title: "Complete React Dashboard",
    category: "Technical",
    progress: 90,
    deadline: "20 Aug 2026",
    status: "In Progress",
  },
  {
    title: "Improve API Development Skills",
    category: "Technical",
    progress: 75,
    deadline: "25 Aug 2026",
    status: "In Progress",
  },
  {
    title: "Complete Team Documentation",
    category: "Teamwork",
    progress: 100,
    deadline: "10 Aug 2026",
    status: "Completed",
  },
];

const tasks = [
  {
    title: "Create Employee API",
    priority: "High",
    deadline: "15 Aug 2026",
    status: "In Progress",
  },
  {
    title: "Fix Dashboard UI",
    priority: "Medium",
    deadline: "18 Aug 2026",
    status: "In Progress",
  },
  {
    title: "Update Project Documentation",
    priority: "Low",
    deadline: "20 Aug 2026",
    status: "Pending",
  },
];

const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= MOBILE HEADER ================= */}

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-5">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <TrendingUp size={19} />
          </div>

          <h1 className="font-bold">
            Performance<span className="text-blue-400">Track</span>
          </h1>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed lg:fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-white/10 transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}

        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">

          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <TrendingUp size={21} />
          </div>

          <div>
            <h1 className="font-bold">
              Performance<span className="text-blue-400">Track</span>
            </h1>

            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Employee Portal
            </p>
          </div>

        </div>

        {/* User Profile */}

        <div className="px-4 py-5">

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              PP
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                Prince Patel
              </p>

              <p className="text-xs text-slate-500 truncate">
                Software Developer
              </p>
            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="px-4 space-y-1">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            title="Dashboard"
            active
            to="/employee/dashboard"
          />

          <SidebarItem
            icon={<Target size={18} />}
            title="My Goals"
            to="/employee/goals"
          />

          <SidebarItem
            icon={<ClipboardList size={18} />}
            title="My Tasks"
            to="/employee/tasks"
          />

          <SidebarItem
            icon={<BarChart3 size={18} />}
            title="My Performance"
            to="/employee/performance"
          />

          <SidebarItem
            icon={<MessageSquare size={18} />}
            title="Feedback"
            to="/employee/feedback"
          />

          <SidebarItem
            icon={<CalendarDays size={18} />}
            title="Attendance"
            to="/employee/attendance"
          />

          <SidebarItem
            icon={<User size={18} />}
            title="My Profile"
            to="/employee/profile"
          />

        </nav>

        {/* Bottom Navigation */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-1">

          <SidebarItem
            icon={<Settings size={18} />}
            title="Settings"
            to="/employee/settings"
          />

          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition">
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="lg:ml-64 pt-16 lg:pt-0">

        {/* Top Navbar */}

        <div className="h-20 hidden lg:flex items-center justify-between px-8 border-b border-white/10 bg-slate-950">

          <div>
            <p className="text-sm text-slate-500">
              Employee Portal
            </p>

            <h2 className="text-xl font-semibold">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-5">

            <button className="relative p-2.5 rounded-lg hover:bg-white/5">
              <Bell size={20} />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                PP
              </div>

              <div>
                <p className="text-sm font-medium">
                  Prince Patel
                </p>

                <p className="text-xs text-slate-500">
                  Employee
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Page Content */}

        <div className="p-5 sm:p-6 lg:p-8">

          {/* ================= WELCOME ================= */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">

            <div>

              <p className="text-slate-400 text-sm">
                Thursday, August 13, 2026
              </p>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
                Good Evening, Prince 👋
              </h1>

              <p className="mt-2 text-slate-500">
                Here's an overview of your performance and progress.
              </p>

            </div>

            <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold text-sm">
              <Target size={17} />
              View My Goals
            </button>

          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <StatCard
              icon={<Award size={21} />}
              title="Overall Performance"
              value="91%"
              change="+8.2%"
              positive
              description="vs last quarter"
            />

            <StatCard
              icon={<Target size={21} />}
              title="Goals Completed"
              value="8 / 10"
              change="80%"
              positive
              description="completion rate"
            />

            <StatCard
              icon={<ClipboardList size={21} />}
              title="Tasks Completed"
              value="18 / 22"
              change="82%"
              positive
              description="completion rate"
            />

            <StatCard
              icon={<TrendingUp size={21} />}
              title="KPI Score"
              value="89%"
              change="+5.4%"
              positive
              description="vs last quarter"
            />

          </div>

          {/* ================= MAIN GRID ================= */}

          <div className="grid xl:grid-cols-3 gap-5 mt-5">

            {/* Performance Chart */}

            <div className="xl:col-span-2 p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>
                  <h3 className="font-semibold text-lg">
                    Performance Overview
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Your performance score over the last 7 months
                  </p>
                </div>

                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <TrendingUp size={16} />
                  +8.2%
                </div>

              </div>

              <div className="h-72 mt-8">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart data={performanceData}>

                    <defs>
                      <linearGradient
                        id="performanceGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[60, 100]}
                      stroke="#64748b"
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#performanceGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* Performance Score */}

            <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-slate-900">

              <div>
                <h3 className="font-semibold text-lg">
                  Current Performance
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Q3 2026
                </p>
              </div>

              <div className="flex justify-center py-8">

                <div className="relative w-44 h-44">

                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 120 120"
                  >

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="10"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset="28"
                    />

                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-4xl font-bold">
                      91%
                    </span>

                    <span className="text-xs text-slate-500">
                      Overall Score
                    </span>

                  </div>

                </div>

              </div>

              <div className="space-y-4">

                <ScoreItem
                  title="Goals"
                  value="94%"
                />

                <ScoreItem
                  title="KPIs"
                  value="89%"
                />

                <ScoreItem
                  title="Manager Review"
                  value="92%"
                />

                <ScoreItem
                  title="Self Evaluation"
                  value="88%"
                />

              </div>

            </div>

          </div>

          {/* ================= GOALS + TASKS ================= */}

          <div className="grid xl:grid-cols-2 gap-5 mt-5">

            {/* Goals */}

            <div className="rounded-2xl border border-white/10 bg-slate-900">

              <div className="p-5 border-b border-white/10 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold">
                    My Goals
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Track your assigned goals
                  </p>
                </div>

                <Link
                  to="/employee/goals"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>

              </div>

              <div className="p-5 space-y-5">

                {goals.map((goal, index) => (
                  <GoalItem
                    key={index}
                    {...goal}
                  />
                ))}

              </div>

            </div>

            {/* Tasks */}

            <div className="rounded-2xl border border-white/10 bg-slate-900">

              <div className="p-5 border-b border-white/10 flex items-center justify-between">

                <div>
                  <h3 className="font-semibold">
                    My Tasks
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Recent assigned tasks
                  </p>
                </div>

                <Link
                  to="/employee/tasks"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View All
                </Link>

              </div>

              <div className="divide-y divide-white/5">

                {tasks.map((task, index) => (
                  <TaskItem
                    key={index}
                    {...task}
                  />
                ))}

              </div>

            </div>

          </div>

          {/* ================= BOTTOM GRID ================= */}

          <div className="grid lg:grid-cols-3 gap-5 mt-5">

            {/* Feedback */}

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <MessageSquare size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Latest Feedback
                    </h3>

                    <p className="text-xs text-slate-500">
                      From your manager
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <span
                      key={item}
                      className="text-yellow-400"
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-sm text-slate-300 leading-6">
                  "Excellent progress this quarter. Your technical
                  skills and ability to complete tasks on time have
                  improved significantly."
                </p>

                <div className="mt-4 flex items-center gap-3">

                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    RS
                  </div>

                  <div>
                    <p className="text-xs font-medium">
                      Rahul Shah
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Engineering Manager
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Upcoming Deadlines */}

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Clock3 size={19} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Upcoming Deadlines
                  </h3>

                  <p className="text-xs text-slate-500">
                    Tasks and goals
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-4">

                <Deadline
                  title="Create Employee API"
                  date="15 Aug"
                  urgent
                />

                <Deadline
                  title="React Dashboard"
                  date="20 Aug"
                />

                <Deadline
                  title="API Documentation"
                  date="25 Aug"
                />

              </div>

            </div>

            {/* Attendance */}

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Attendance
                  </h3>

                  <p className="text-xs text-slate-500">
                    August 2026
                  </p>
                </div>

              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">

                <AttendanceStat
                  value="22"
                  label="Present"
                />

                <AttendanceStat
                  value="1"
                  label="Absent"
                />

                <AttendanceStat
                  value="2"
                  label="Leave"
                />

              </div>

              <div className="mt-5">

                <div className="flex justify-between text-xs mb-2">

                  <span className="text-slate-400">
                    Attendance Rate
                  </span>

                  <span className="font-semibold">
                    88%
                  </span>

                </div>

                <div className="h-2 rounded-full bg-white/5">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: "88%" }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ================= FOOTER ================= */}

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-600">

            <p>
              © 2026 PerformanceTrack. Employee Performance Tracker.
            </p>

            <p>
              Need help? Contact your administrator.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

/* =====================================================
   SIDEBAR ITEM
===================================================== */

const SidebarItem = ({
  icon,
  title,
  active = false,
  to = "#",
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  icon,
  title,
  value,
  change,
  positive,
  description,
}) => {
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-slate-900 hover:border-blue-500/20 transition">

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
          {icon}
        </div>

        {positive ? (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp size={13} />
            {change}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <TrendingDown size={13} />
            {change}
          </div>
        )}

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <div className="flex items-end gap-2 mt-1">

        <h3 className="text-2xl font-bold">
          {value}
        </h3>

      </div>

      <p className="text-xs text-slate-600 mt-1">
        {description}
      </p>

    </div>
  );
};

/* =====================================================
   SCORE ITEM
===================================================== */

const ScoreItem = ({ title, value }) => {
  const numericValue = parseInt(value);

  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="text-xs text-slate-400">
          {title}
        </span>

        <span className="text-xs font-semibold">
          {value}
        </span>

      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">

        <div
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${numericValue}%`,
          }}
        />

      </div>

    </div>
  );
};

/* =====================================================
   GOAL ITEM
===================================================== */

const GoalItem = ({
  title,
  category,
  progress,
  deadline,
  status,
}) => {
  return (
    <div>

      <div className="flex justify-between gap-4">

        <div className="min-w-0">

          <h4 className="text-sm font-medium truncate">
            {title}
          </h4>

          <div className="flex items-center gap-2 mt-1">

            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
              {category}
            </span>

            <span className="text-[10px] text-slate-600">
              Due {deadline}
            </span>

          </div>

        </div>

        <span
          className={`text-[10px] px-2 py-1 rounded h-fit whitespace-nowrap ${
            status === "Completed"
              ? "bg-green-500/10 text-green-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {status}
        </span>

      </div>

      <div className="mt-3 flex items-center gap-3">

        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">

          <div
            className={`h-full rounded-full ${
              progress === 100
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <span className="text-xs text-slate-400">
          {progress}%
        </span>

      </div>

    </div>
  );
};

/* =====================================================
   TASK ITEM
===================================================== */

const TaskItem = ({
  title,
  priority,
  deadline,
  status,
}) => {
  return (
    <div className="p-5 flex items-center justify-between gap-4">

      <div className="flex items-center gap-3 min-w-0">

        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            status === "Completed"
              ? "bg-green-500/10 text-green-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {status === "Completed" ? (
            <CheckCircle2 size={18} />
          ) : (
            <ClipboardList size={18} />
          )}
        </div>

        <div className="min-w-0">

          <p className="text-sm font-medium truncate">
            {title}
          </p>

          <div className="flex items-center gap-2 mt-1">

            <span
              className={`text-[10px] ${
                priority === "High"
                  ? "text-red-400"
                  : priority === "Medium"
                  ? "text-yellow-400"
                  : "text-slate-500"
              }`}
            >
              {priority} Priority
            </span>

            <span className="text-[10px] text-slate-600">
              Due {deadline}
            </span>

          </div>

        </div>

      </div>

      <span className="text-[10px] text-yellow-400 whitespace-nowrap">
        {status}
      </span>

    </div>
  );
};

/* =====================================================
   DEADLINE
===================================================== */

const Deadline = ({
  title,
  date,
  urgent = false,
}) => {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          urgent
            ? "bg-red-500/10 text-red-400"
            : "bg-orange-500/10 text-orange-400"
        }`}
      >
        {urgent ? (
          <AlertCircle size={17} />
        ) : (
          <Clock3 size={17} />
        )}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-sm truncate">
          {title}
        </p>

        <p className="text-xs text-slate-600 mt-1">
          Due {date}
        </p>

      </div>

    </div>
  );
};

/* =====================================================
   ATTENDANCE
===================================================== */

const AttendanceStat = ({
  value,
  label,
}) => {
  return (
    <div className="text-center p-3 rounded-xl bg-white/[0.03]">

      <p className="text-xl font-bold">
        {value}
      </p>

      <p className="text-[10px] text-slate-500 mt-1">
        {label}
      </p>

    </div>
  );
};

export default EmployeeDashboard;