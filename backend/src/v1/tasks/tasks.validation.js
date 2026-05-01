import { z } from "zod";

const statusEnum = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: statusEnum.optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().optional(),
  status: statusEnum.optional(),
});
