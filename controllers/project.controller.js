import Project from "../model/project.model.js";

export const createProject = async (req, res) => {
  const userId = req.user._id;
  try {
    const { projectName, description } = req.body;
    const project = await Project.create({
      projectName,
      description,
      user: userId,
    });
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const projects = await Project.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      projects,
      totalProjects: projects.length,
      totalPages: Math.ceil(projects.length / limit),
      currentPage: page,
      nextPage: page < Math.ceil(projects.length / limit) ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  const ProjectId = req.params.id;
  try {
    const project = await Project.findById(ProjectId);
    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  const projectId = req.params.id;
//   const userId = req.user._id;
  const { projectName, description } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      { projectName, description, 
        // user: userId 
    },
      { new: true }
    );
    if (!project) {
      return res.status(400).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
    const projectId = req.params.id

    try {
        const project = await Project.findByIdAndDelete(projectId)
        if (!project) {
            return res.status(400).json({
                success: false,
                message: "Project not found",
            })
        }
        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            project,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: error.message,
          });
    }
 }
