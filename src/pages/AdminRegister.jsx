import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Handle admin registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register-admin",
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
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      setSuccess(
        "Admin registration successful! Redirecting to login..."
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Go to login page
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration Error:", error);

      setError(
        "Unable to connect to server. Please make sure the backend is running."
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= NAVBAR ================= */}

      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <TrendingUp size={21} />
              </div>

              <div>
                <h1 className="font-bold">
                  Performance
                  <span className="text-blue-400">Track</span>
                </h1>

                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Employee Performance
                </p>
              </div>

            </Link>

            {/* Login */}
            <div className="text-sm text-slate-400">

              Already have an account?

              <Link
                to="/login"
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign In
              </Link>

            </div>

          </div>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="py-12 px-5">

        <div className="max-w-3xl mx-auto">

          {/* ================= HEADING ================= */}

          <div className="text-center mb-10">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm mb-5">
              <ShieldCheck size={15} />
              HR / Admin Registration
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold">
              Create Admin Account
            </h1>

            <p className="mt-3 text-slate-400">
              Register your HR account to manage employees and track
              performance.
            </p>

          </div>

          {/* ================= FORM CARD ================= */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">

            {/* Form Header */}

            <div className="p-6 sm:p-8 border-b border-white/10">

              <h2 className="text-xl font-semibold">
                Admin Information
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Enter your information to create your HR/Admin account.
              </p>

            </div>

            <form onSubmit={handleSubmit}>

              {/* ================= PERSONAL INFORMATION ================= */}

              <div className="p-6 sm:p-8">

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Name */}

                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={<User size={18} />}
                    required
                  />

                  {/* Email */}

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    icon={<Mail size={18} />}
                    required
                  />

                  {/* Phone */}

                  <div className="md:col-span-2">

                    <InputField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      icon={<Phone size={18} />}
                      required
                    />

                  </div>

                </div>

              </div>

              {/* ================= SECURITY ================= */}

              <div className="border-t border-white/10 p-6 sm:p-8">

                <div className="mb-6">

                  <h2 className="text-xl font-semibold">
                    Account Security
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Create a secure password for your Admin account.
                  </p>

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Password */}

                  <PasswordField
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    placeholder="Minimum 8 characters"
                  />

                  {/* Confirm Password */}

                  <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                    placeholder="Confirm your password"
                  />

                </div>

                {/* Password Requirements */}

                <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">

                  <p className="text-xs text-slate-400 mb-3">
                    Password should contain:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-500">

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-400" />
                      At least 8 characters
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-400" />
                      One uppercase letter
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-400" />
                      One lowercase letter
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-400" />
                      One number
                    </div>

                  </div>

                </div>

              </div>

              {/* ================= ERROR ================= */}

              {error && (
                <div className="mx-6 sm:mx-8 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* ================= SUCCESS ================= */}

              {success && (
                <div className="mx-6 sm:mx-8 mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  {success}
                </div>
              )}

              {/* ================= SUBMIT ================= */}

              <div className="border-t border-white/10 p-6 sm:p-8">

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-600/50"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Admin Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

          {/* ================= LOGIN ================= */}

          <p className="text-center text-sm text-slate-500 mt-7">

            Already have an Admin account?

            <Link
              to="/login"
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              Sign in here
            </Link>

          </p>

        </div>

      </main>

    </div>
  );
};


/* =====================================================
   INPUT FIELD
===================================================== */

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  required = false,
}) => {
  return (
    <div>

      <label className="block text-sm font-medium text-slate-300 mb-2">

        {label}

        {required && (
          <span className="text-red-400 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl bg-slate-950 border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />

      </div>

    </div>
  );
};


/* =====================================================
   PASSWORD FIELD
===================================================== */

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
}) => {
  return (
    <div>

      <label className="block text-sm font-medium text-slate-300 mb-2">

        {label}

        <span className="text-red-400 ml-1">
          *
        </span>

      </label>

      <div className="relative">

        <Lock
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full rounded-xl bg-slate-950 border border-white/10 pl-11 pr-12 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

      </div>

    </div>
  );
};

export default AdminRegister;
