import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeRegistration from "./pages/EmployeeRegister";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/Registration" element={<EmployeeRegistration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;