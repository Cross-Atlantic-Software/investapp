import express from "express";
import { PrivateMarketNewsManagementController } from "../controllers/admin/privateMarketNewsManagement";
import { NotableActivityManagementController } from "../controllers/admin/notableActivityManagement";
import { getPriceData } from "../controllers/admin/stockPriceController";
import { StockSectorOutlookManagementController } from "../controllers/admin/stockSectorOutlookManagement";
import { StockSectorInsightsPdfManagementController } from "../controllers/admin/stockSectorInsightsPdfManagement";
import { StockDisplayController } from "../controllers/stocks/stockDisplayController";
import { FinancialDataController } from "../controllers/admin/financialDataController";
import { ShareholderTypeController } from "../controllers/admin/shareholderTypeController";
import { StockNewsSectionController } from "../controllers/admin/stockNewsSectionController";
import { StockFaqController } from "../controllers/admin/stockFaqController";
import { ContactFaqController } from "../controllers/admin/contactFaqController";
import { ThemeController } from "../controllers/admin/themeController";
import { MarketInsightController } from "../controllers/admin/marketInsightController";
import { KnowledgeCenterController } from "../controllers/admin/knowledgeCenterController";
import { InsightTopicController } from "../controllers/admin/insightTopicController";
import { InsightSubtopicController } from "../controllers/admin/insightSubtopicController";
import { KnowledgeTopicController } from "../controllers/admin/knowledgeTopicController";
import { KnowledgeSubtopicController } from "../controllers/admin/knowledgeSubtopicController";
import { HomeInsightController } from "../controllers/admin/homeInsightController";

const router = express.Router();

// Initialize Controllers
const privateMarketNewsController = new PrivateMarketNewsManagementController();
const notableActivityController = new NotableActivityManagementController();

// Public routes for frontend display (no authentication required)

// Stock Display Routes
router.get("/stocks/banner-display", StockDisplayController.getBannerDisplayStocks);
router.get("/stocks/home-display", StockDisplayController.getHomeDisplayStocks);

// Public Stocks Route (for invest page)
router.get("/stocks", StockDisplayController.getPublicStocks);

// Available Filter Options Route
router.get("/filter-options", StockDisplayController.getAvailableFilterOptions);

// Private Market News Routes
router.get("/private-market-news", privateMarketNewsController.getAllPrivateMarketNews);

// Notable Activities Routes
router.get("/notable-activities", notableActivityController.getPublicNotableActivities);

// Public Stock Price Data Routes (no authentication required)
router.get("/stocks/:id/price-data", getPriceData);

// Public Sector & Comapany outlook Routes (no authentication required)
router.get("/stocks/:id/sector-outlooks", StockSectorOutlookManagementController.getSectorOutlookByStockIdPublic);

// Public Sector & Comapany insights PDF Routes (no authentication required)
router.get("/stocks/:id/sector-insights-pdfs", StockSectorInsightsPdfManagementController.getPdfsByStockIdPublic);

import { StockShareholdingController } from "../controllers/admin/stockShareholdingController";

// Public Financial Data Routes (no authentication required)
router.get("/stocks/:id/financial-data/:category", FinancialDataController.getStockFinancialDataPublic);

// Public Shareholding Routes (no authentication required)
router.get("/stocks/:id/shareholding", StockShareholdingController.getStockShareholding);

// Public Shareholder Type Routes (no authentication required)
router.get("/shareholder-types", ShareholderTypeController.getAllShareholderTypes);

// Public Stock News Section Routes (no authentication required)
router.get("/stocks/:stockId/news-sections", StockNewsSectionController.getStockNewsSections);
router.get("/news-sections/:id", StockNewsSectionController.getNewsSectionById);

// Public Stock FAQ Routes (no authentication required)
router.get("/stocks/:stockId/faqs", StockFaqController.getStockFaqs);

// Public Contact FAQ Routes (no authentication required)
router.get("/contact-faqs", ContactFaqController.getContactFaqs);

// Public Theme Routes (no authentication required)
router.get("/themes", ThemeController.getAllThemes);
router.get("/themes/select", ThemeController.getThemesForSelect);

// Public Market Insights Routes (no authentication required)
router.get("/market-insights", MarketInsightController.getAllMarketInsights);
router.get("/market-insights/featured", MarketInsightController.getFeaturedMarketInsights);
router.get("/market-insights/slug/:slug", MarketInsightController.getMarketInsightBySlug);

// Public Knowledge Center Routes (no authentication required)
router.get("/knowledge-centers", KnowledgeCenterController.getAllKnowledgeCenters);
router.get("/knowledge-centers/featured", KnowledgeCenterController.getFeaturedKnowledgeCenters);
router.get("/knowledge-centers/slug/:slug", KnowledgeCenterController.getKnowledgeCenterBySlug);

// Public Insight Topics Routes (no authentication required)
router.get("/insight-topics", InsightTopicController.getAllInsightTopics);
router.get("/insight-subtopics", InsightSubtopicController.getAllInsightSubtopics);

// Public Knowledge Topics Routes (no authentication required)
router.get("/knowledge-topics", KnowledgeTopicController.getAllKnowledgeTopics);
router.get("/knowledge-subtopics", KnowledgeSubtopicController.getAllKnowledgeSubtopics);

// Public Home Insights Routes (no authentication required)
router.get("/home-insights", (req, res) => {
  const controller = new HomeInsightController();
  return controller.getAllPublicHomeInsights(req, res);
});

export default router;
