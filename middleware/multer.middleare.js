import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  
  params: {
    folder: "TMS_uploads",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
  },
});


export const upload = multer({ storage });
