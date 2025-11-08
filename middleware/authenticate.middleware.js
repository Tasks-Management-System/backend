// middleware/authenticate.js
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const authenticateMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ decoded should contain { id, role }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Attach role and _id properly
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: Array.isArray(user.role) ? user.role[0] : user.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error authenticating user",
      error: error.message,
    });
  }
};
