import prisma from "../../config/db.js";
import { createTaskSchema, updateTaskSchema } from "./tasks.validation.js";

// Helper: check ownership or admin
const canAccess = (task, user) =>
  user.role === "ADMIN" || task.userId === user.id;

// GET /api/v1/tasks
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: req.user.role === "ADMIN" ? {} : { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/tasks
export const createTask = async (req, res, next) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.errors[0].message,
    });
  }

  try {
    const task = await prisma.task.create({
      data: {
        ...result.data,
        userId: req.user.id,
      },
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/:id
export const getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canAccess(task, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/tasks/:id
export const updateTask = async (req, res, next) => {
  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.errors[0].message,
    });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canAccess(task, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: result.data,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canAccess(task, req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await prisma.task.delete({ where: { id: req.params.id } });

    return res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
