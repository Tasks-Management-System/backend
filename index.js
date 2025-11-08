import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db.js";
import healthCheck from "./routes/healthCheck.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import attendanceRoutes from "./routes/attendence.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import hiringRoutes from "./routes/hiring.route.js";
import salaryRoutes from "./routes/salary.routes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5051;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connectDB();
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/v1/health", healthCheck);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/leave", leaveRoutes);
app.use("/api/v1/hiring", hiringRoutes);
app.use("/api/v1/salary", salaryRoutes);