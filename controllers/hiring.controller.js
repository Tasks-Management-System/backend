import User from "../model/user.model.js";
import Hiring from "../model/hiring.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const createHiring = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      currentSalary,
      expectedSalary,
      noticePeriod,
      skills,
      status,
      experience,
      linkedInProfile,
      gitHubLink,
      portfolioLink,
      note,
    } = req.body;

    const existingHiring = await Hiring.findOne({ email });
    if (existingHiring) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Hiring already exists with this email",
      });
    }

    const userId = req.user?._id; // from authenticateMiddleware
    console.log("User ID:==>", userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }
    cloudinary.api
      .ping()
      .then((res) => console.log("✅ Cloudinary connected:", res))
      .catch((err) => console.error("❌ Cloudinary connection failed:", err));

    const resumeUrl = req.file.path; // Cloudinary URL
    console.log("Resume URL:", resumeUrl);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hiring = await Hiring.create({
      user: userId,
      name,
      email,
      phone,
      resume: resumeUrl,
      currentSalary,
      expectedSalary,
      noticePeriod,
      skills: skills ? skills.split(",") : [],
      experience,
      linkedInProfile,
      gitHubLink,
      portfolioLink,
      status,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Hiring created successfully",
      hiring,
    });
  } catch (error) {
    console.error("Error creating hiring:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating hiring",
      error: error.message,
    });
  }
};

export const getAllHirings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const total = await Hiring.countDocuments();
    const hiring = await Hiring.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalPages = Math.ceil(total / limit);
    const currentPage = page;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    const nextPage = hasNextPage ? page + 1 : null;
    const previousPage = hasPreviousPage ? page - 1 : null;

    return res.status(200).json({
      success: true,
      message: "All hiring details fetched successfully",
      hiring,
      totalHirings: total,
      totalPages,
      currentPage,
      hasNextPage,
      hasPreviousPage,
      nextPage,
      previousPage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting all hiring details",
      error: error.message,
    });
  }
};

export const getHiringById = async (req, res) => {
  const hiringId = req.params.id;

  try {
    const hiring = await Hiring.findById(hiringId);
    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring detail not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hiring detail fetched successfully",
      hiring,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed hiring details",
      error: error.message,
    });
  }
};

export const updateHiring = async (req, res) => {
  const hiringId = req.params.id;
  const {
    name,
    email,
    phone,
    currentSalary,
    expectedSalary,
    noticePeriod,
    skills,
    status,
    experience,
    linkedInProfile,
    gitHubLink,
    portfolioLink,
    note,
  } = req.body;

  console.log("name", name);
  

  try {
    const hiring = await Hiring.findByIdAndUpdate(
      hiringId,
      {
        name,
        email,
        phone,
        currentSalary,
        expectedSalary,
        noticePeriod,
        skills,
        status,
        experience,
        linkedInProfile,
        gitHubLink,
        portfolioLink,
        note,
      },
      { new: true }
    );
    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hiring data updated successfully",
      hiring,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error getting updated hiring data",
      error: error.message,
    });
  }
};

export const deleteHiring = async (req, res) => {
  const hiringId = req.params.id
  try {
    const hiring = await Hiring.findByIdAndDelete(hiringId)
    if (!hiring) {
      return res.status(404).json({
        success: false,
        message: "Hiring data not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Hiring data deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
          success: false,
          message: "Failed hiring details",
          error: error.message
        })
  }
};
