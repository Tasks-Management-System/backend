import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TMS_uploads/resumes",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TMS_uploads/profiles",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

export const upload = multer({ storage: resumeStorage });
export const uploadImage = multer({ storage: imageStorage });
