import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  CalendarCheck,
  Bell,
  LogOut,
  ArrowUpRight,
} from "lucide-react";

const EmployeeSidebar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:5000/api/notifications/my-notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {
        // silent
      }
    };
    fetchUnread();
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/EmployeeDashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Tasks",
      path: "/EmployeeTasks",
      icon: ClipboardList,
    },
    {
      name: "My Performance",
      path: "/employee/performance",
      icon: TrendingUp,
    },
    {
      name: "Attendance",
      path: "/employee/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Notifications",
      path: "/employee/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  let user = { name: "Employee", role: "employee" };
  try {
    const stored = localStorage.getItem("user");
    if (stored) user = JSON.parse(stored);
  } catch (e) {
    console.error(e);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">

      {/* ==============================
          LOGO
      ============================== */}
      <div className="flex h-24 items-center border-b border-white/10 px-5">

        <div className="flex items-center gap-3">

          {/* Logo Icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
            <ArrowUpRight
              size={23}
              className="text-blue-400"
            />
          </div>

          {/* Logo Text */}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Performance<span className="text-blue-400">Track</span>
            </h1>

            <p className="text-[11px] text-slate-500">
              Employee Performance Tracker
            </p>
          </div>

        </div>

      </div>

      {/* ==============================
          MENU
      ============================== */}
      <nav className="flex-1 space-y-1 px-3 py-6">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >

              <div className="flex items-center gap-3">

                <Icon
                  size={19}
                  strokeWidth={1.8}
                />

                <span>
                  {item.name}
                </span>

              </div>

              {/* Notification Badge */}
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}

            </NavLink>
          );
        })}

      </nav>

      {/* ==============================
          EMPLOYEE INFO
      ============================== */}
      <div className="border-t border-white/10 px-3 py-4">

        <div className="mb-3 rounded-xl bg-white/[0.04] px-3 py-3">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
              {user.name ? user.name.charAt(0).toUpperCase() : "E"}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-medium text-white">
                {user.name || "Employee"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.employeeId || "Employee Account"}
              </p>

            </div>

          </div>

        </div>

        {/* ==============================
            LOGOUT
        ============================== */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut
            size={19}
            strokeWidth={1.8}
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
};

export default EmployeeSidebar;