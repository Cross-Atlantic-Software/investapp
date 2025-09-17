import authRoutes from "./auth-routes";
import healthRoutes from "./health-routes";
import express from "express";

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Health and monitoring routes
router.use('/health', healthRoutes);

export default router;
