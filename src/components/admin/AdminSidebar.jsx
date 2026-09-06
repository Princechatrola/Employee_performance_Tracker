import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // Admin sidebar menu
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/admin/employees",
      icon: Users,
    },
    {
      name: "Assign Tasks",
      path: "/admin/tasks",
      icon: BarChart3,
    },
    {
      name: "Performance",
      path: "/admin/performance",
      icon: Target,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: CalendarDays,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950 text-white">

      {/* =================================
          LOGO
      ================================= */}
      <div className="px-5 py-6">

        <div className="flex items-center gap-3">

          {/* Logo Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20">
            <TrendingUp
              size={21}
              className="text-blue-400"
            />
          </div>

          {/* Logo Text */}
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Performance
              <span className="text-blue-400">
                Track
              </span>
            </h1>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Employee Performance Tracker
            </p>
          </div>

        </div>

      </div>

      {/* =================================
          MENU
      ================================= */}
      <nav className="flex-1 overflow-y-auto px-3">

        <div className="space-y-1">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >

                <div className="flex items-center gap-3">

                  <Icon
                    size={17}
                    strokeWidth={1.8}
                  />

                  <span>
                    {item.name}
                  </span>

                </div>

                {/* Notification */}
                {item.notification && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white">
                    {item.notification}
                  </span>
                )}

              </NavLink>
            );

          })}

        </div>

      </nav>

      

      {/* =================================
          LOGOUT
      ================================= */}
      <div className="border-t border-white/10 px-3 py-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >

          <LogOut
            size={17}
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

export default AdminSidebar;