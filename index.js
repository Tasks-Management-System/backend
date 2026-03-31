import "./loadEnv.js";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./utils/db.js";
import healthCheck from "./routes/healthCheck.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import attendanceRoutes from "./routes/attendence.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import hiringRoutes from "./routes/hiring.route.js";
import salaryRoutes from "./routes/salary.routes.js";
import { generateOpenAPIDocument } from "./swagger/index.js";
import notesRoutes from "./routes/notes.routes.js";
import eventRoutes from "./routes/event.routes.js";
import { startReminderJob } from "./jobs/reminderJob.js";

const app = express();
app.use(cors(
    {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }
));
app.use(express.json());

const PORT = process.env.PORT || 5051;

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
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/events", eventRoutes);

const swaggerDocument = generateOpenAPIDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs.json", (req, res) => res.json(swaggerDocument));

const startServer = async () => {
  await connectDB();
  startReminderJob();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
