import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const EmployeeRegister = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    department: "",
    designation: "",
    joiningDate: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Demo success
    setSuccess("Registration successful!");

    console.log({
      ...formData,
      role: "employee",
    });

    // Later connect this to your backend
    // navigate("/login");
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

        <div className="max-w-4xl mx-auto">

          {/* Heading */}

          <div className="text-center mb-10">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-sm mb-5">

              <User size={15} />

              Employee Registration

            </div>

            <h1 className="text-3xl sm:text-4xl font-bold">
              Create Your Employee Account
            </h1>

            <p className="mt-3 text-slate-400">
              Enter your details to create your Employee Performance Tracker
              account.
            </p>

          </div>

          {/* Form Card */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">

            {/* Form Header */}

            <div className="p-6 sm:p-8 border-b border-white/10">

              <h2 className="text-xl font-semibold">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Please provide accurate information.
              </p>

            </div>

            <form onSubmit={handleSubmit}>

              {/* ================= PERSONAL INFORMATION ================= */}

              <div className="p-6 sm:p-8">

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Full Name */}

                  <InputField
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
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
                    placeholder="example@company.com"
                    icon={<Mail size={18} />}
                    required
                  />

                  {/* Phone */}

                  <InputField
                    label="Mobile Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    icon={<Phone size={18} />}
                    required
                  />

                  {/* DOB */}

                  <InputField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    icon={<Calendar size={18} />}
                    required
                  />

                  {/* Gender */}

                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    icon={<User size={18} />}
                    required
                    options={[
                      "Male",
                      "Female",
                      "Other",
                      "Prefer not to say",
                    ]}
                  />

                  {/* State */}

                  <SelectField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    icon={<MapPin size={18} />}
                    required
                    options={[
                      "Gujarat",
                      "Maharashtra",
                      "Rajasthan",
                      "Madhya Pradesh",
                      "Delhi",
                      "Karnataka",
                      "Tamil Nadu",
                      "Telangana",
                      "West Bengal",
                      "Uttar Pradesh",
                      "Other",
                    ]}
                  />

                  {/* City */}

                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    icon={<MapPin size={18} />}
                    required
                  />

                  {/* Address */}

                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Address
                      <span className="text-red-400 ml-1">*</span>
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      required
                      placeholder="Enter your complete address"
                      className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
                    />

                  </div>

                </div>

              </div>

              {/* ================= PROFESSIONAL INFORMATION ================= */}

              <div className="border-t border-white/10 p-6 sm:p-8">

                <div className="mb-6">

                  <h2 className="text-xl font-semibold">
                    Professional Information
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Information about your current employment.
                  </p>

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Department */}

                  <SelectField
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    icon={<Building2 size={18} />}
                    required
                    options={[
                      "Information Technology",
                      "Human Resources",
                      "Finance",
                      "Marketing",
                      "Sales",
                      "Operations",
                      "Design",
                      "Customer Support",
                      "Research & Development",
                    ]}
                  />

                  {/* Designation */}

                  <InputField
                    label="Designation / Job Title"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                    icon={<Briefcase size={18} />}
                    required
                  />

                  {/* Joining Date */}

                  <InputField
                    label="Joining Date"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    icon={<Calendar size={18} />}
                    required
                  />

                </div>

              </div>

              {/* ================= SECURITY ================= */}

              <div className="border-t border-white/10 p-6 sm:p-8">

                <div className="mb-6">

                  <h2 className="text-xl font-semibold">
                    Account Security
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Create a secure password for your account.
                  </p>

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  {/* Password */}

                  <div>

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                      <span className="text-red-400 ml-1">*</span>
                    </label>

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
                        required
                        placeholder="Minimum 8 characters"
                        className="w-full rounded-xl bg-slate-950 border border-white/10 pl-11 pr-12 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
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

                  {/* Confirm Password */}

                  <div>

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                      <span className="text-red-400 ml-1">*</span>
                    </label>

                    <div className="relative">

                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                        className="w-full rounded-xl bg-slate-950 border border-white/10 pl-11 pr-12 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                </div>

                {/* Password Requirements */}

                <div className="mt-5 p-4 rounded-xl bg-white/[0.03] border border-white/5">

                  <p className="text-xs text-slate-400 mb-3">
                    Password should contain:
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-500">

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-400"
                      />
                      At least 8 characters
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-400"
                      />
                      One uppercase letter
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-400"
                      />
                      One lowercase letter
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        size={14}
                        className="text-green-400"
                      />
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

                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

                  <p className="text-xs text-slate-500">
                    By registering, you agree to the platform's
                    terms and privacy policy.
                  </p>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold shadow-lg shadow-blue-600/20"
                  >
                    Create Employee Account
                    <ArrowRight size={18} />
                  </button>

                </div>

              </div>

            </form>

          </div>

          {/* Login */}

          <p className="text-center text-sm text-slate-500 mt-7">

            Already have an account?

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
   SELECT FIELD
===================================================== */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
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

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          {icon}
        </div>

        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none rounded-xl bg-slate-950 border border-white/10 pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >

          <option value="" className="bg-slate-900">
            Select {label}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-slate-900"
            >
              {option}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
};

export default EmployeeRegister;