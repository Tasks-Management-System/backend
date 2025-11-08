import express from "express"
import { authenticateMiddleware } from "../middleware/authenticate.middleware.js"
import { createSalary, deleteSalary, generatePDF, getSalary, getSalaryById, updateSalary } from "../controllers/salary.controller.js"

const router = express.Router()

router.post("/create", authenticateMiddleware, createSalary)
router.get("/", authenticateMiddleware, getSalary)
router.get("/:id", authenticateMiddleware, getSalaryById)
router.put("/:id", authenticateMiddleware, updateSalary)
router.delete("/:id", authenticateMiddleware, deleteSalary)
router.get("/pdf/:id", authenticateMiddleware, generatePDF)


export default router