import express from "express";
import { PrivateMarketNewsManagementController } from "../controllers/admin/privateMarketNewsManagement";
import { NotableActivityManagementController } from "../controllers/admin/notableActivityManagement";

const router = express.Router();

// Initialize Controllers
const privateMarketNewsController = new PrivateMarketNewsManagementController();
const notableActivityController = new NotableActivityManagementController();

// Public routes for frontend display (no authentication required)

// Private Market News Routes
router.get("/private-market-news", privateMarketNewsController.getAllPrivateMarketNews);

// Notable Activities Routes
router.get("/notable-activities", notableActivityController.getPublicNotableActivities);

export default router;
