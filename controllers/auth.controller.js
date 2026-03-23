import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/mailService/sendMail.js";
import { verifyEmailTemplate } from "../utils/mailService/verifyEmailTemplate.js";

const buildLoginRedirectUrl = () => {
  if (process.env.FRONTEND_LOGIN_URL) return process.env.FRONTEND_LOGIN_URL;
  if (process.env.FRONTEND_URL) return `${process.env.FRONTEND_URL.replace(/\/$/, "")}/login`;
  return "http://localhost:5173/login";
};

const ADMIN_ASSIGNABLE_ROLES = ["employee", "hr", "manager"];

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
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

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Step 3: Create a new user (auto-hash via pre('save'))
    const newUser = await User.create({
      name,
      email,
      password,
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
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpiresAt,
    });

    const verifyLink = `${process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`}/api/v1/auth/verify-email?token=${emailVerificationToken}`;

    try {
      await sendEmail(
        newUser.email,
        "Verify your email address",
        verifyEmailTemplate({
          name: newUser.name,
          verifyUrl: verifyLink,
          expiryMinutes: 10,
          appName: "Task Management System",
          supportEmail: process.env.SUPPORT_EMAIL || "",
        })
      );
    } catch (mailError) {
      console.error("Error sending verification email:", mailError);
    }

    // Step 4: Prepare response (exclude password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Step 5: Send response
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email before login.",
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
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
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
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
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

export const verifyUserEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const redirectUrl = buildLoginRedirectUrl();

    if (!token) {
      return res.redirect(`${redirectUrl}?verified=false&reason=missing_token`);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(`${redirectUrl}?verified=false&reason=invalid_or_expired`);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    return res.redirect(`${redirectUrl}?verified=true`);
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.redirect(`${buildLoginRedirectUrl()}?verified=false&reason=server_error`);
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

const parseField = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

export const updateUser = async (req, res) => {
  const userId = req.params.id;

  const {
    name,
    email,
    password,
    role,
    phone,
    dob,
    aadharCardNumber,
    panCardNumber,
    bankAccountNo,
    bankName,
    bankIFSC,
    bankBranch,
    gender,
  } = req.body;

  const profileImage = req.file ? req.file.path : req.body.profileImage;

  const address = parseField(req.body.address);
  const skills = parseField(req.body.skills);
  const education = parseField(req.body.education);
  const experience = parseField(req.body.experience);
  const leaves = parseField(req.body.leaves);

  try {
    if (role !== undefined) {
      const actorRole = req.user?.role;
      const normalizedRoles = Array.isArray(role) ? role : [role];

      if (!["super-admin", "admin"].includes(actorRole)) {
        return res.status(403).json({
          success: false,
          message: "Only admin or super-admin can change roles",
        });
      }

      if (
        actorRole === "admin" &&
        normalizedRoles.some((requestedRole) => !ADMIN_ASSIGNABLE_ROLES.includes(requestedRole))
      ) {
        return res.status(403).json({
          success: false,
          message: "Admin can assign only employee, hr, or manager roles",
        });
      }
    }

    const normalizedRole = role !== undefined ? (Array.isArray(role) ? role : [role]) : undefined;
    const updateData = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(password !== undefined && { password }),
      ...(normalizedRole !== undefined && { role: normalizedRole }),
      ...(profileImage !== undefined && { profileImage }),
      ...(phone !== undefined && { phone }),
      ...(dob !== undefined && { dob }),
      ...(aadharCardNumber !== undefined && { aadharCardNumber }),
      ...(panCardNumber !== undefined && { panCardNumber }),
      ...(bankAccountNo !== undefined && { bankAccountNo }),
      ...(bankName !== undefined && { bankName }),
      ...(bankIFSC !== undefined && { bankIFSC }),
      ...(bankBranch !== undefined && { bankBranch }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(skills !== undefined && { skills }),
      ...(education !== undefined && { education }),
      ...(experience !== undefined && { experience }),
      ...(leaves !== undefined && { leaves }),
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

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