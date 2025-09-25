import express from "express";
import { PrivateMarketNewsManagementController } from "../controllers/admin/privateMarketNewsManagement";

const router = express.Router();

// Initialize Controllers
const privateMarketNewsController = new PrivateMarketNewsManagementController();

// Public routes for frontend display (no authentication required)

// Private Market News Routes
router.get("/private-market-news", privateMarketNewsController.getAllPrivateMarketNews);


export default router;
