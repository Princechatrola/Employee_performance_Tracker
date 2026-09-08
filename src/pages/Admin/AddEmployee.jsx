import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";

import {
  User,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Briefcase,
  Building2,
  ArrowLeft,
  Save,
  X,
  UserRound,
} from "lucide-react";

const AddEmployee = () => {
  const navigate = useNavigate();

  /* =====================================================
     FORM DATA
  ===================================================== */

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    position: "",
    joiningDate: "",
    employmentType: "",
    address: "",
    city: "",
    state: "",
  });

  /* =====================================================
     STATES
  ===================================================== */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================================
     HANDLE INPUT CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =====================================================
     SUBMIT EMPLOYEE
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* ================================================
       REQUIRED FIELD VALIDATION
    ================================================ */

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.department ||
      !formData.position ||
      !formData.joiningDate
    ) {
      setError(
        "Please fill all required fields."
      );

      return;
    }

    setLoading(true);

    try {
      /* ================================================
         GET ADMIN JWT TOKEN
      ================================================ */

      const token = getAdminToken();

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );

        setLoading(false);

        return;
      }

      /* ================================================
         SEND DATA TO BACKEND
      ================================================ */

      const response = await fetch(
        "http://localhost:5000/api/admin/employees",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      );

      /* ================================================
         GET RESPONSE
      ================================================ */

      const data = await response.json();

      /* ================================================
         CHECK RESPONSE
      ================================================ */

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Employee registration failed."
        );
      }

      /* ================================================
         SUCCESS
      ================================================ */

      setLoading(false);

      setSuccess(
        `Employee created successfully. Employee ID: ${data.employee.employeeId}`
      );

      /* ================================================
         SHOW LOGIN INFORMATION
      ================================================ */

      alert(
        `Employee Created Successfully!\n\n` +
        `Employee ID: ${data.employee.employeeId}\n` +
        `Name: ${data.employee.name}\n` +
        `Email: ${data.employee.email}\n` +
        `Temporary Password: ${data.temporaryPassword}\n\n` +
        `Please save these login details.`
      );

      /* ================================================
         REDIRECT
      ================================================ */

      setTimeout(() => {
        navigate("/admin/employees");
      }, 1500);
    } catch (error) {
      console.error(
        "Employee registration error:",
        error
      );

      setLoading(false);

      setError(
        error.message ||
          "Something went wrong."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ml-64 min-h-screen">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

          <div className="flex h-20 items-center justify-between px-6 lg:px-8">

            <div className="flex items-center gap-4">

              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/employees")
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft size={17} />
              </button>

              <div>

                <p className="text-sm text-slate-500">
                  Admin / Employees / Add Employee
                </p>

                <h1 className="mt-1 text-xl font-bold text-slate-900">
                  Add Employee
                </h1>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-6 lg:p-8">

          <div className="mx-auto max-w-5xl">

            {/* PAGE INTRO */}

            <div className="mb-7">

              <h2 className="text-2xl font-bold text-slate-900">
                Employee Registration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the employee's information to create a new employee account.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <div className="border-b border-slate-200 p-6">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                      <UserRound
                        size={19}
                        className="text-blue-600"
                      />

                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900">
                        Personal Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Basic information about the employee
                      </p>

                    </div>

                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* FULL NAME */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Full Name
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <User
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter employee name"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email Address
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Mail
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="employee@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* PHONE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phone Number
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Phone
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* DATE OF BIRTH */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Date of Birth
                      </label>

                      <div className="relative">

                        <CalendarDays
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* GENDER */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Gender
                      </label>

                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      >

                        <option value="">
                          Select Gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    WORK INFORMATION
                ================================================= */}

                <div className="border-b border-slate-200 p-6">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">

                      <Briefcase
                        size={19}
                        className="text-purple-600"
                      />

                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900">
                        Work Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Employee's role and organizational details
                      </p>

                    </div>

                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* DEPARTMENT */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Department
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Building2
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        >

                          <option value="">
                            Select Department
                          </option>

                          <option value="Development">
                            Development
                          </option>

                          <option value="IT">
                            IT
                          </option>

                          <option value="HR">
                            HR
                          </option>

                          <option value="Marketing">
                            Marketing
                          </option>

                          <option value="Sales">
                            Sales
                          </option>

                          <option value="Finance">
                            Finance
                          </option>

                        </select>

                      </div>

                    </div>

                    {/* POSITION */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Position
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <Briefcase
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          placeholder="e.g. Software Developer"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* JOINING DATE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Joining Date
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <CalendarDays
                          size={17}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />

                      </div>

                    </div>

                    {/* EMPLOYMENT TYPE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Employment Type
                      </label>

                      <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      >

                        <option value="">
                          Select Employment Type
                        </option>

                        <option value="Full Time">
                          Full Time
                        </option>

                        <option value="Part Time">
                          Part Time
                        </option>

                        <option value="Contract">
                          Contract
                        </option>

                        <option value="Intern">
                          Intern
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ADDRESS INFORMATION
                ================================================= */}

                <div className="p-6">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

                      <MapPin
                        size={19}
                        className="text-emerald-600"
                      />

                    </div>

                    <div>

                      <h3 className="text-base font-bold text-slate-900">
                        Address Information
                      </h3>

                      <p className="text-xs text-slate-500">
                        Employee's current address
                      </p>

                    </div>

                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* ADDRESS */}

                    <div className="md:col-span-2">

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Address
                      </label>

                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter complete address"
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      />

                    </div>

                    {/* CITY */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      />

                    </div>

                    {/* STATE */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                      />

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ERROR / SUCCESS
                ================================================= */}

                {(error || success) && (
                  <div className="px-6 pb-6">

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                        {success}
                      </div>
                    )}

                  </div>
                )}

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">

                  {/* CANCEL */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/employees")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >

                    <X size={16} />

                    Cancel

                  </button>

                  {/* CREATE */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Creating Employee...
                      </>
                    ) : (
                      <>
                        <Save size={16} />

                        Create Employee
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AddEmployee;