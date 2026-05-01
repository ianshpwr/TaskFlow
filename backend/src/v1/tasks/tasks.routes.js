import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from "./tasks.controller.js";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

router.get("/", getAllTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
