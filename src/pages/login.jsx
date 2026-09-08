import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { setAuthSession } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Store authentication session safely for admin / employee
      setAuthSession(data.token, data.user);

      setLoading(false);

      // Redirect according to role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "employee") {
        navigate("/EmployeeDashboard");
      } else {
        setError("Invalid user role.");
      }

    } catch (error) {
      console.error("Login Error:", error);

      setLoading(false);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center px-5 py-10">

      {/* BACK BUTTON */}

      <Link
        to="/"
        className="absolute top-6 left-5 sm:left-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      {/* LOGIN CONTAINER */}

      <div className="w-full max-w-md">

        {/* LOGIN HEADER */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-5">

            <ShieldCheck
              size={28}
              className="text-blue-400"
            />

          </div>

          <h1 className="text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to your PerformanceTrack account
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl">

          <form onSubmit={handleSubmit}>

            {/* EMAIL OR EMPLOYEE ID */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address or Employee ID
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email or employee ID"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="mb-5">

              <div className="flex items-center justify-between mb-2">

                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot Password?
                </Link>

              </div>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50 shadow-lg shadow-blue-600/20"
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}

            </button>

          </form>

          {/* REGISTER */}

          <div className="mt-7 pt-6 border-t border-white/10 text-center">

            <p className="text-sm text-slate-500">

              Don't have an Admin account?

              <Link
                to="/AdminRegister"
                className="ml-2 font-medium text-blue-400 hover:text-blue-300 transition"
              >
                Create Admin Account
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;