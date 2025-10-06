import express from "express";
import { PrivateMarketNewsManagementController } from "../controllers/admin/privateMarketNewsManagement";
import { NotableActivityManagementController } from "../controllers/admin/notableActivityManagement";
import { getPriceData } from "../controllers/admin/stockPriceController";
import { StockSectorOutlookManagementController } from "../controllers/admin/stockSectorOutlookManagement";
import { StockSectorInsightsPdfManagementController } from "../controllers/admin/stockSectorInsightsPdfManagement";
import { StockDisplayController } from "../controllers/stocks/stockDisplayController";

const router = express.Router();

// Initialize Controllers
const privateMarketNewsController = new PrivateMarketNewsManagementController();
const notableActivityController = new NotableActivityManagementController();

// Public routes for frontend display (no authentication required)

// Stock Display Routes
router.get("/stocks/banner-display", StockDisplayController.getBannerDisplayStocks);
router.get("/stocks/home-display", StockDisplayController.getHomeDisplayStocks);

// Private Market News Routes
router.get("/private-market-news", privateMarketNewsController.getAllPrivateMarketNews);

// Notable Activities Routes
router.get("/notable-activities", notableActivityController.getPublicNotableActivities);

// Public Stock Price Data Routes (no authentication required)
router.get("/stocks/:id/price-data", getPriceData);

// Public Sector Outlook Routes (no authentication required)
router.get("/stocks/:id/sector-outlooks", StockSectorOutlookManagementController.getSectorOutlookByStockIdPublic);

// Public Sector Insights PDF Routes (no authentication required)
router.get("/stocks/:id/sector-insights-pdfs", StockSectorInsightsPdfManagementController.getPdfsByStockIdPublic);

export default router;
