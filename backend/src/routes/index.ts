import authRoutes from "./auth-routes";
import healthRoutes from "./health-routes";
import adminRoutes from "./admin-routes";
import express from "express";

const router = express.Router();

// Frontend authentication routes (for regular users)
router.use('/auth', authRoutes);

// Health and monitoring routes
router.use('/health', healthRoutes);

// Admin CMS routes (for admin users)
router.use('/admin', adminRoutes);

export default router;
