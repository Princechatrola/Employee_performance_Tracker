import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/login";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import EmployeeTasks from "./pages/Employee/MyTasks";
import EmployeeAttendance from "./pages/Employee/Attendance";
import EmployeeNotifications from "./pages/Employee/Notifications";
import EmployeePerformance from "./pages/Employee/Performance";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminEmployees from "./pages/Admin/emp_management";
import AdminAddEmployee from "./pages/Admin/AddEmployee";
import AdminPerformance from "./pages/Admin/Performance";
import AdminAssignTasks from "./pages/Admin/AssignTasks";
import AdminAttendance from "./pages/Admin/Attendance";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AdminRegister" element={<AdminRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/EmployeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/EmployeeTasks" element={<EmployeeTasks />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/notifications" element={<EmployeeNotifications />} />
        <Route path="/employee/performance" element={<EmployeePerformance />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/AddEmployee" element={<AdminAddEmployee />} />
        <Route path="/admin/performance" element={<AdminPerformance />} />
        <Route path="/admin/tasks" element={<AdminAssignTasks />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;