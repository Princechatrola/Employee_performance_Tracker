import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TEMPORARY ADMIN ID
  // We will connect this with login later.
  const adminId = "6ab3d1b49adc6118e898ba9e";

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/profile/${adminId}`
        );

        const data = await response.json();

        console.log("Admin Profile Response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch admin profile"
          );
        }

        setAdmin(data.admin);
      } catch (error) {
        console.error("Profile Error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          Loading Admin Profile...
        </h2>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // No admin
  if (!admin) {
    return (
      <div className="p-6">
        Admin profile not found.
      </div>
    );
  }

  return (
<div className="min-h-screen bg-slate-100 text-slate-900">        
    <AdminSidebar />
      {/* PAGE TITLE */}
      <main className="ml-64 min-h-screen px-6 py-6">

      
      <h1 className="text-2xl font-bold mb-6">
        Admin Profile
      </h1>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl">

        {/* HEADER */}
        <div className="flex items-center gap-5 mb-8">

          {/* PROFILE CIRCLE */}
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {admin.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">
              {admin.name}
            </h2>

            <p className="text-gray-500">
              {admin.role}
            </p>
          </div>

        </div>


        {/* PROFILE INFORMATION */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* NAME */}
          <div>
            <p className="text-sm text-gray-500">
              Full Name
            </p>

            <p className="font-semibold mt-1">
              {admin.name}
            </p>
          </div>


          {/* EMAIL */}
          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="font-semibold mt-1">
              {admin.email}
            </p>
          </div>


          {/* PHONE */}
          <div>
            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="font-semibold mt-1">
              {admin.phone}
            </p>
          </div>


          {/* ROLE */}
          <div>
            <p className="text-sm text-gray-500">
              Role
            </p>

            <p className="font-semibold mt-1 capitalize">
              {admin.role}
            </p>
          </div>


          {/* STATUS */}
          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold mt-1">
              {admin.status}
            </p>
          </div>


          {/* PERFORMANCE */}
          <div>
            <p className="text-sm text-gray-500">
              Performance Score
            </p>

            <p className="font-semibold mt-1">
              {admin.performanceScore}/10
            </p>
          </div>


          {/* CREATED DATE */}
          <div>
            <p className="text-sm text-gray-500">
              Account Created
            </p>

            <p className="font-semibold mt-1">
              {admin.createdAt
                ? new Date(admin.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>


          {/* UPDATED DATE */}
          <div>
            <p className="text-sm text-gray-500">
              Last Updated
            </p>

            <p className="font-semibold mt-1">
              {admin.updatedAt
                ? new Date(admin.updatedAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

        </div>

      </div>
    
    </main>
    </div>
  );
};

export default AdminProfile;