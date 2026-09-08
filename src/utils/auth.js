/**
 * Auth storage helper to prevent session collision between Admin and Employee roles.
 * Supports both tab-isolated sessionStorage and persistent localStorage.
 */

// Helper to safely parse JSON
const safeParse = (str) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

/**
 * Save authentication session for Admin or Employee
 */
export const setAuthSession = (token, user) => {
  if (!token || !user) return;

  const role = user.role || (user.isAdmin ? "admin" : "employee");
  const userStr = JSON.stringify(user);

  if (role === "admin") {
    sessionStorage.setItem("admin_token", token);
    sessionStorage.setItem("admin_user", userStr);
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", userStr);
  } else {
    sessionStorage.setItem("employee_token", token);
    sessionStorage.setItem("employee_user", userStr);
    localStorage.setItem("employee_token", token);
    localStorage.setItem("employee_user", userStr);
  }

  // Session-isolated generic token for current tab
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", userStr);

  // Global fallback
  localStorage.setItem("token", token);
  localStorage.setItem("user", userStr);
};

/**
 * Retrieve Admin JWT token
 */
export const getAdminToken = () => {
  return (
    sessionStorage.getItem("admin_token") ||
    localStorage.getItem("admin_token") ||
    (getStoredRole(sessionStorage) === "admin" ? sessionStorage.getItem("token") : null) ||
    (getStoredRole(localStorage) === "admin" ? localStorage.getItem("token") : null) ||
    localStorage.getItem("token") ||
    ""
  );
};

/**
 * Retrieve Admin User profile
 */
export const getAdminUser = () => {
  return (
    safeParse(sessionStorage.getItem("admin_user")) ||
    safeParse(localStorage.getItem("admin_user")) ||
    safeParse(sessionStorage.getItem("user")) ||
    safeParse(localStorage.getItem("user")) ||
    { name: "Admin", role: "admin" }
  );
};

/**
 * Retrieve Employee JWT token
 */
export const getEmployeeToken = () => {
  return (
    sessionStorage.getItem("employee_token") ||
    localStorage.getItem("employee_token") ||
    (getStoredRole(sessionStorage) === "employee" ? sessionStorage.getItem("token") : null) ||
    (getStoredRole(localStorage) === "employee" ? localStorage.getItem("token") : null) ||
    localStorage.getItem("token") ||
    ""
  );
};

/**
 * Retrieve Employee User profile
 */
export const getEmployeeUser = () => {
  return (
    safeParse(sessionStorage.getItem("employee_user")) ||
    safeParse(localStorage.getItem("employee_user")) ||
    safeParse(sessionStorage.getItem("user")) ||
    safeParse(localStorage.getItem("user")) ||
    { name: "Employee", role: "employee" }
  );
};

/**
 * Helper to check role in storage
 */
const getStoredRole = (storage) => {
  try {
    const userStr = storage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user?.role || null;
  } catch (e) {
    return null;
  }
};

/**
 * Admin Logout
 */
export const logoutAdmin = () => {
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_user");
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");

  if (getStoredRole(sessionStorage) === "admin") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }
  if (getStoredRole(localStorage) === "admin") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

/**
 * Employee Logout
 */
export const logoutEmployee = () => {
  sessionStorage.removeItem("employee_token");
  sessionStorage.removeItem("employee_user");
  localStorage.removeItem("employee_token");
  localStorage.removeItem("employee_user");

  if (getStoredRole(sessionStorage) === "employee") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }
  if (getStoredRole(localStorage) === "employee") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
