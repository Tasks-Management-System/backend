import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      profileImage,
      address,
      phone,
      skills,
      education,
      experience,
      leaves,
      dob,
      aadharCardNumber,
      panCardNumber,
      bankAccountNo,
      bankName,
      bankIFSC,
      bankBranch,
      gender,
    } = req.body;

    // Step 1: Required field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Step 2: Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Step 3: Create a new user (auto-hash via pre('save'))
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      profileImage,
      address,
      phone,
      skills,
      education,
      experience,
      leaves,
      dob,
      aadharCardNumber,
      panCardNumber,
      bankAccountNo,
      bankName,
      bankIFSC,
      bankBranch,
      gender,
    });

    // Step 4: Prepare response (exclude password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Step 5: Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;

  const {
    name,
    email,
    password,
    role,
    profileImage,
    address,
    phone,
    skills,
    education,
    experience,
    leaves,
    dob,
    aadharCardNumber,
    panCardNumber,
    bankAccountNo,
    bankName,
    bankIFSC,
    bankBranch,
    gender,
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        password,
        role,
        profileImage,
        address,
        phone,
        skills,
        education,
        experience,
        leaves,
        dob,
        aadharCardNumber,
        panCardNumber,
        bankAccountNo,
        bankName,
        bankIFSC,
        bankBranch,
        gender,
      },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching all users",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Optionally, if you’re using cookies:
    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "strict" });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: error.message,
    });
  }
};