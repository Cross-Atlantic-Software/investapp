import authRoutes from "./auth-routes";
import healthRoutes from "./health-routes";
import adminRoutes from "./admin-routes";
import stockRoutes from "./stock-routes";
import tradingRoutes from "./trading-routes";
import enquiryRoutes from "./enquiry-routes";
import subscriberRoutes from "./subscriber-routes";
import publicRoutes from "./public-routes";
import migrationRoutes from "./migration-routes";
import wishlistRoutes from "./wishlist-routes";
import { UserPortfolioController } from "../controllers/admin/userPortfolioController";
import { UserHoldingsController } from "../controllers/userHoldingsController";
import { UserReportController } from "../controllers/admin/userReportController";
import { UserProfileController } from "../controllers/userProfileController";
import { StockMasterManagementController } from "../controllers/admin/stockMasterManagement";
import jwtAuthMiddleware from "../utils/middleware";
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

// Wishlist routes (protected - requires authentication)
router.use('/wishlist', wishlistRoutes);

// User Portfolio routes (protected - requires authentication)
router.get('/user-portfolio', UserPortfolioController.getCurrentUserPortfolio);

// User Holdings routes (protected - requires authentication)
router.get('/user-holdings', UserHoldingsController.getUserHoldings);

// User Report routes (protected - requires authentication)
router.get('/user-report', jwtAuthMiddleware, UserReportController.getCurrentUserReport);

// User Profile routes (protected - requires authentication)
router.get('/user-profile', jwtAuthMiddleware, UserProfileController.getCurrentUserProfile);
router.put('/user-profile', jwtAuthMiddleware, UserProfileController.updateCurrentUserProfile);

// Admin CMS routes (for admin users)
router.use('/admin', adminRoutes);

// Enquiry routes (public for submission, protected for admin management)
router.use('/enquiries', enquiryRoutes);

// Subscriber routes (public for newsletter subscription)
router.use('/subscribers', subscriberRoutes);

// Migration routes (for database setup)
router.use('/migrations', migrationRoutes);

// Public routes for frontend display (private market news, notable activities)
router.use('/', publicRoutes);

// Public stock tags route (no authentication required)
const stockMasterController = new StockMasterManagementController();
router.get('/stock-tags', stockMasterController.getStockTags);

export default router;
