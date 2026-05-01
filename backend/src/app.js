import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./v1/auth/auth.routes.js";
import taskRoutes from "./v1/tasks/tasks.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import { swaggerUi, swaggerDocument } from "./config/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

// Swagger docs
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`TaskFlow API server running on port ${PORT}`);
});

export default app;
