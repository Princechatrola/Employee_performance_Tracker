import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getAdminToken } from "../../utils/auth";

import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  KeyRound,
  Copy,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

const Admin_emp_managment = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [department, setDepartment] =
    useState("All Departments");

  const [status, setStatus] =
    useState("All Status");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [temporaryPassword, setTemporaryPassword] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [resettingPassword, setResettingPassword] =
    useState(false);

  // View & Edit Modals
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    status: "Active",
    employmentType: "Full Time",
    address: "",
    city: "",
    state: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // =====================================================
  // API URL
  // =====================================================

  const API_URL =
    "http://localhost:5000/api/admin/employees";

  // =====================================================
  // FETCH EMPLOYEES
  // =====================================================

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        API_URL,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch employees"
        );
      }

      setEmployees(
        data.employees || []
      );
    } catch (error) {
      console.error(
        "Fetch Employees Error:",
        error
      );

      setError(
        error.message ||
          "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =====================================================
  // DELETE EMPLOYEE
  // =====================================================

  const handleDelete = async (
    employeeId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this employee?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = getAdminToken();

      const response =
        await fetch(
          `${API_URL}/${employeeId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete employee"
        );
      }

      // Remove from UI
      setEmployees((prev) =>
        prev.filter(
          (employee) =>
            employee.employeeId !==
            employeeId
        )
      );

      alert(
        "Employee deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete employee"
      );
    }
  };

  // =====================================================
  // RESET EMPLOYEE PASSWORD
  // =====================================================

  const handleResetPassword = async (
    employee
  ) => {
    const confirmReset =
      window.confirm(
        `Generate a new temporary password for ${employee.name}?`
      );

    if (!confirmReset) {
      return;
    }

    try {
      setResettingPassword(true);

      const token = getAdminToken();

      const response =
        await fetch(
          `${API_URL}/${employee.employeeId}/reset-password`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reset password"
        );
      }

      // Store generated password
      setSelectedEmployee(
        employee
      );

      setTemporaryPassword(
        data.temporaryPassword
      );

      setCopied(false);

      setShowPasswordModal(true);
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      alert(
        error.message ||
          "Failed to reset password"
      );
    } finally {
      setResettingPassword(false);
    }
  };

  // =====================================================
  // COPY PASSWORD
  // =====================================================

  const handleCopyPassword =
    async () => {
      try {
        await navigator.clipboard.writeText(
          temporaryPassword
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error(
          "Copy Error:",
          error
        );
      }
    };

  // =====================================================
  // CLOSE PASSWORD MODAL
  // =====================================================

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setTemporaryPassword("");
    setSelectedEmployee(null);
    setCopied(false);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================
  const handleOpenEdit = (employee) => {
    setEditEmployee(employee);
    setEditForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "Development",
      position: employee.position || "",
      status: employee.status || "Active",
      employmentType: employee.employmentType || "Full Time",
      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
    });
  };

  // =====================================================
  // SAVE EDIT EMPLOYEE
  // =====================================================
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editEmployee) return;

    try {
      setSavingEdit(true);
      const token = getAdminToken();

      const response = await fetch(`${API_URL}/${editEmployee.employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee");
      }

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === editEmployee.employeeId ? { ...emp, ...data.employee } : emp
        )
      );

      setEditEmployee(null);
      alert("Employee updated successfully!");
    } catch (err) {
      alert(err.message || "Error updating employee");
    } finally {
      setSavingEdit(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const filteredEmployees =
    employees.filter(
      (employee) => {
        const searchValue =
          search.toLowerCase();

        const matchesSearch =
          employee.name
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.email
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.employeeId
            ?.toLowerCase()
            .includes(searchValue) ||
          employee.department
            ?.toLowerCase()
            .includes(searchValue);

        const matchesDepartment =
          department ===
            "All Departments" ||
          employee.department ===
            department;

        const matchesStatus =
          status === "All Status" ||
          employee.status === status;

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );
      }
    );

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status ===
        "Active"
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status ===
        "Inactive"
    ).length;

  const currentYear =
    new Date().getFullYear();

  const newEmployees =
    employees.filter(
      (employee) => {
        if (!employee.joiningDate) {
          return false;
        }

        return (
          new Date(
            employee.joiningDate
          ).getFullYear() ===
          currentYear
        );
      }
    ).length;

  // =====================================================
  // RETURN
  // =====================================================

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

            <div>

              <p className="text-sm text-slate-500">
                Admin / Employees
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900">
                Employee Management
              </h1>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/admin/AddEmployee"
                )
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Plus size={17} />

              Add Employee
            </button>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="p-6 lg:p-8">

          {/* =================================================
              PAGE INTRO
          ================================================= */}

          <div className="mb-7">

            <h2 className="text-2xl font-bold text-slate-900">
              Employees
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage employees and monitor their basic information.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Employees
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {totalEmployees}
                  </h3>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                  <Users
                    size={21}
                    className="text-blue-600"
                  />

                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                All registered employees
              </p>

            </div>

            {/* ACTIVE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Active Employees
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {activeEmployees}
                  </h3>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                  <UserCheck
                    size={21}
                    className="text-emerald-600"
                  />

                </div>

              </div>

              <p className="mt-4 text-xs font-medium text-emerald-600">
                Currently working
              </p>

            </div>

            {/* INACTIVE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Inactive Employees
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {inactiveEmployees}
                  </h3>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">

                  <UserX
                    size={21}
                    className="text-red-500"
                  />

                </div>

              </div>

              <p className="mt-4 text-xs text-slate-500">
                Currently inactive
              </p>

            </div>

            {/* NEW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    New Employees
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {newEmployees}
                  </h3>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">

                  <UserPlus
                    size={21}
                    className="text-purple-600"
                  />

                </div>

              </div>

              <p className="mt-4 text-xs text-purple-600">
                Joined this year
              </p>

            </div>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="border-b border-slate-200 p-5">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    All Employees
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredEmployees.length} employees found
                  </p>

                </div>

                {/* FILTERS */}

                <div className="flex flex-col gap-3 sm:flex-row">

                  {/* SEARCH */}

                  <div className="relative">

                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white sm:w-64"
                    />

                  </div>

                  {/* DEPARTMENT */}

                  <div className="relative">

                    <Filter
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      value={department}
                      onChange={(e) =>
                        setDepartment(
                          e.target.value
                        )
                      }
                      className="h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-600 outline-none focus:border-blue-500"
                    >

                      <option>
                        All Departments
                      </option>

                      <option>
                        Development
                      </option>

                      <option>
                        IT
                      </option>

                      <option>
                        Marketing
                      </option>

                      <option>
                        HR
                      </option>

                      <option>
                        Sales
                      </option>

                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                  {/* STATUS */}

                  <div className="relative">

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value
                        )
                      }
                      className="h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-sm text-slate-600 outline-none focus:border-blue-500"
                    >

                      <option>
                        All Status
                      </option>

                      <option>
                        Active
                      </option>

                      <option>
                        Inactive
                      </option>

                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px]">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Employee
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Department
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Position
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Performance
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    {/* PASSWORD */}

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Password
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {/* LOADING */}

                  {loading ? (

                    <tr>

                      <td
                        colSpan="8"
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <RefreshCw
                            size={25}
                            className="animate-spin text-blue-600"
                          />

                          <p className="mt-3 text-sm text-slate-500">
                            Loading employees...
                          </p>

                        </div>

                      </td>

                    </tr>

                  ) : filteredEmployees.length >
                    0 ? (

                    filteredEmployees.map(
                      (employee) => (

                        <tr
                          key={
                            employee._id
                          }
                          className="border-b border-slate-100 transition hover:bg-slate-50/70"
                        >

                          {/* EMPLOYEE */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">

                                {employee.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}

                              </div>

                              <div>

                                <p className="text-sm font-semibold text-slate-800">
                                  {employee.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {
                                    employee.employeeId
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td className="px-6 py-4">

                            <div className="space-y-1">

                              <div className="flex items-center gap-2">

                                <Mail
                                  size={13}
                                  className="text-slate-400"
                                />

                                <span className="text-xs text-slate-500">
                                  {
                                    employee.email
                                  }
                                </span>

                              </div>

                              <div className="flex items-center gap-2">

                                <Phone
                                  size={13}
                                  className="text-slate-400"
                                />

                                <span className="text-xs text-slate-500">
                                  {
                                    employee.phone
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-6 py-4">

                            <span className="text-sm text-slate-600">
                              {
                                employee.department
                              }
                            </span>

                          </td>

                          {/* POSITION */}

                          <td className="px-6 py-4">

                            <span className="text-sm text-slate-600">
                              {
                                employee.position
                              }
                            </span>

                          </td>

                          {/* PERFORMANCE */}

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                employee.performanceScore >=
                                8
                                  ? "bg-emerald-50 text-emerald-600"
                                  : employee.performanceScore >=
                                    6
                                  ? "bg-yellow-50 text-yellow-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >

                              {employee.performanceScore ??
                                0}{" "}
                              / 10

                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                employee.status ===
                                "Active"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >

                              {
                                employee.status
                              }

                            </span>

                          </td>

                          {/* PASSWORD */}

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                handleResetPassword(
                                  employee
                                )
                              }
                              disabled={
                                resettingPassword
                              }
                              title="Generate new temporary password"
                              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              <KeyRound
                                size={14}
                              />

                              Reset & Copy

                            </button>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-4">

                            <div className="flex items-center justify-end gap-1">

                              {/* VIEW */}

                              <button
                                title="View Employee"
                                onClick={() => setViewEmployee(employee)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                              >

                                <Eye
                                  size={16}
                                />

                              </button>

                              {/* EDIT */}

                              <button
                                title="Edit Employee"
                                onClick={() => handleOpenEdit(employee)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >

                                <Pencil
                                  size={16}
                                />

                              </button>

                              {/* DELETE */}

                              <button
                                title="Delete Employee"
                                onClick={() =>
                                  handleDelete(
                                    employee.employeeId
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >

                                <Trash2
                                  size={16}
                                />

                              </button>

                              {/* MORE */}

                              <button
                                title="More"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              >

                                <MoreVertical
                                  size={16}
                                />

                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="8"
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                            <Users
                              size={22}
                              className="text-slate-400"
                            />

                          </div>

                          <h3 className="mt-4 text-sm font-semibold text-slate-700">
                            No employees found
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Try changing your search or filters.
                          </p>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">
                  {filteredEmployees.length}
                </span>

                {" "}of{" "}

                <span className="font-semibold text-slate-700">
                  {employees.length}
                </span>

                {" "}employees

              </p>

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                  <KeyRound
                    size={22}
                    className="text-blue-600"
                  />

                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  Temporary Password
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Login credentials for{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      selectedEmployee?.name
                    }
                  </span>
                </p>

              </div>

              <button
                onClick={
                  closePasswordModal
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >

                <X size={18} />

              </button>

            </div>

            {/* EMPLOYEE ID */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <p className="text-xs font-medium text-slate-500">
                Employee ID
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {
                  selectedEmployee?.employeeId
                }
              </p>

              <p className="mt-4 text-xs font-medium text-slate-500">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {
                  selectedEmployee?.email
                }
              </p>

            </div>

            {/* PASSWORD */}

            <div className="mt-4">

              <p className="mb-2 text-xs font-medium text-slate-500">
                Temporary Password
              </p>

              <div className="flex items-center gap-2">

                <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-bold text-slate-800">
                  {
                    temporaryPassword
                  }
                </div>

                <button
                  onClick={
                    handleCopyPassword
                  }
                  className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                >

                  {copied ? (
                    <>
                      <Check
                        size={16}
                      />

                      Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        size={16}
                      />

                      Copy
                    </>
                  )}

                </button>

              </div>

            </div>

            {/* WARNING */}

            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4">

              <p className="text-xs leading-5 text-yellow-700">

                <strong>
                  Important:
                </strong>{" "}
                Send this Employee ID and temporary password to the employee. The password is not stored in plain text and cannot be displayed again after closing this window.

              </p>

            </div>

            {/* CLOSE */}

            <button
              onClick={
                closePasswordModal
              }
              className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Done
            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          VIEW EMPLOYEE MODAL
      ===================================================== */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-600">
                  {viewEmployee.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewEmployee.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewEmployee.employeeId}</p>
                </div>
              </div>
              <button
                onClick={() => setViewEmployee(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Department</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewEmployee.department || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Position / Role</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewEmployee.position || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="font-medium text-slate-800 mt-0.5 truncate">{viewEmployee.email || "-"}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Phone</p>
                  <p className="font-medium text-slate-800 mt-0.5">{viewEmployee.phone || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewEmployee.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                  }`}>
                    {viewEmployee.status || "Active"}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Employment Type</p>
                  <p className="font-medium text-slate-800 mt-0.5">{viewEmployee.employmentType || "Full Time"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Joining Date</p>
                  <p className="font-medium text-slate-800 mt-0.5">{formatDate(viewEmployee.joiningDate)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Performance Score</p>
                  <p className="font-bold text-blue-600 mt-0.5">{viewEmployee.performanceScore ?? 0} / 10</p>
                </div>
              </div>

              {(viewEmployee.address || viewEmployee.city || viewEmployee.state) && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400 font-medium">Address</p>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {[viewEmployee.address, viewEmployee.city, viewEmployee.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewEmployee(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT EMPLOYEE MODAL
      ===================================================== */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl my-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Employee</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editEmployee.employeeId} • {editEmployee.name}
                </p>
              </div>
              <button
                onClick={() => setEditEmployee(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option>Development</option>
                    <option>IT</option>
                    <option>Marketing</option>
                    <option>HR</option>
                    <option>Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin_emp_managment;