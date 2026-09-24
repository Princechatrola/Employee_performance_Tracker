const User = require("../models/user");

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        message: "User is not admin"
      });
    }

    res.json(admin);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = { getAdminProfile };