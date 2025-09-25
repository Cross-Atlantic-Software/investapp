import authRoutes from "./auth-routes";
import healthRoutes from "./health-routes";
import adminRoutes from "./admin-routes";
import stockRoutes from "./stock-routes";
import tradingRoutes from "./trading-routes";
import enquiryRoutes from "./enquiry-routes";
import subscriberRoutes from "./subscriber-routes";
import express from "express";

const router = express.Router();

// Frontend authentication routes (for regular users)
router.use('/auth', authRoutes);

// Health and monitoring routes
router.use('/health', healthRoutes);

// Public stock routes (no authentication required)
router.use('/stocks', stockRoutes);

// Trading routes (protected - requires authentication)
router.use('/trading', tradingRoutes);

// Admin CMS routes (for admin users)
router.use('/admin', adminRoutes);

// Enquiry routes (public for submission, protected for admin management)
router.use('/enquiries', enquiryRoutes);

// Subscriber routes (public for newsletter subscription)
router.use('/subscribers', subscriberRoutes);

export default router;
