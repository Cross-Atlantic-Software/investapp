import express from "express";
import adminMiddleware from "../utils/middlewares/admin-middleware";
import { uploadIcon, uploadBanner, uploadBlogImage, uploadInsightVideo, uploadKnowledgeCenterImage, uploadHomeInsightFile } from "../utils/middlewares/s3Upload";
import updateLastActive from "../utils/middlewares/updateLastActive";

// User Management Controllers
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getFilterOptions
} from "../controllers/admin/userManagement";

// Stock Management Controllers
import {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getStockStats,
  bulkDeleteStocks
} from "../controllers/admin/stockManagement";

// CMS Auth Controllers
import { cmsLogin } from "../controllers/admin/cmsAuth";

// Site User Management Controllers
import { SiteUserManagementController } from "../controllers/admin/siteUserManagement";
import { EmailTemplateManagementController } from "../controllers/admin/emailTemplateManagement";
import { PrivateMarketNewsManagementController } from "../controllers/admin/privateMarketNewsManagement";
import { TaxonomyManagementController } from "../controllers/admin/taxonomyManagement";
import { NotableActivityManagementController } from "../controllers/admin/notableActivityManagement";
import { ActivityTypeManagementController } from "../controllers/admin/activityTypeManagement";
import { BulkDealsManagementController } from "../controllers/admin/bulkDealsManagement";
import { StockMasterManagementController } from "../controllers/admin/stockMasterManagement";
import { PriceChangePeriodController } from "../controllers/admin/priceChangePeriodController";
import { ValuationController } from "../controllers/admin/valuationController";
import { ValuationRangeController } from "../controllers/admin/valuationRangeController";
import { ThemeController } from "../controllers/admin/themeController";
import { InsightSectorController } from "../controllers/admin/insightSectorController";
import { InsightSubsectorController } from "../controllers/admin/insightSubsectorController";
import { InsightTopicController } from "../controllers/admin/insightTopicController";
import { InsightSubtopicController } from "../controllers/admin/insightSubtopicController";
import { InsightThemeController } from "../controllers/admin/insightThemeController";
import { MarketInsightController } from "../controllers/admin/marketInsightController";
import { KnowledgeCenterController } from "../controllers/admin/knowledgeCenterController";
import { KnowledgeSectorController } from "../controllers/admin/knowledgeSectorController";
import { KnowledgeSubsectorController } from "../controllers/admin/knowledgeSubsectorController";
import { KnowledgeTopicController } from "../controllers/admin/knowledgeTopicController";
import { KnowledgeSubtopicController } from "../controllers/admin/knowledgeSubtopicController";
import { KnowledgeThemeController } from "../controllers/admin/knowledgeThemeController";
import { StockPerformanceScoreController } from "../controllers/admin/stockPerformanceScoreController";
import { UserPortfolioController } from "../controllers/admin/userPortfolioController";
import { UserReportController, upload as uploadReport } from "../controllers/admin/userReportController";
import { StockScorecardManagementController } from "../controllers/admin/stockScorecardManagement";
import { StockInvestmentRationaleManagementController } from "../controllers/admin/stockInvestmentRationaleManagement";
import { StockPerformancePdfManagementController, uploadMiddleware } from "../controllers/admin/stockPerformancePdfManagement";
import { StockSectorOutlookManagementController } from "../controllers/admin/stockSectorOutlookManagement";
import { StockSectorInsightsPdfManagementController } from "../controllers/admin/stockSectorInsightsPdfManagement";
import { MethodologyNotesManagementController } from "../controllers/admin/methodologyNotesManagement";
import { FinancialDataController } from "../controllers/admin/financialDataController";
import { StockShareholdingController } from "../controllers/admin/stockShareholdingController";
import { WishlistController } from "../controllers/stocks/wishlistController";
import { ShareholderTypeController } from "../controllers/admin/shareholderTypeController";
import { StockNewsSectionController } from "../controllers/admin/stockNewsSectionController";
import { StockFaqController } from "../controllers/admin/stockFaqController";
import { SectorManagementController } from "../controllers/admin/sectorManagement";
import { ContactFaqController } from "../controllers/admin/contactFaqController";
import { KYCManagementController } from "../controllers/admin/kycManagement";
import { uploadPdf } from "../utils/middlewares/s3Upload";
import { getBuyRequestsCount, getBuyRequestsData } from "../controllers/admin/buyRequestsController";
import { HomeInsightController } from "../controllers/admin/homeInsightController";
import { TransactionController } from "../controllers/admin/transactionController";

// Stock Draft Controllers
import {
  saveDraft,
  getDrafts,
  getDraftById,
  deleteDraft,
  cleanupExpiredDrafts
} from "../controllers/admin/stockDraftController";

// Stock Price Data Controllers
import { 
  uploadPriceDataCSV, 
  getPriceData, 
  getLatestPriceData, 
  deleteAllPriceData, 
  checkPriceDataExists,
  exportPriceDataCSV,
  deletePriceDataAdmin,
  upload 
} from "../controllers/admin/stockPriceController";

// Enquiry Management Controllers
import {
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats
} from "../controllers/enquiries/enquiryController";

// Subscriber Management Controllers
import {
  createSubscriber,
  getAllSubscribers,
  deleteSubscriber,
  getSubscriberStats
} from "../controllers/subscribers/subscriberController";

const router = express.Router();

// Initialize Controllers
const siteUserController = new SiteUserManagementController();
const emailTemplateController = new EmailTemplateManagementController();
const privateMarketNewsController = new PrivateMarketNewsManagementController();
const taxonomyController = new TaxonomyManagementController();
const notableActivityController = new NotableActivityManagementController();
const activityTypeController = new ActivityTypeManagementController();
const bulkDealsController = new BulkDealsManagementController();
const stockMasterController = new StockMasterManagementController();
const methodologyNotesController = new MethodologyNotesManagementController();
const homeInsightController = new HomeInsightController();
const transactionController = new TransactionController();

// CMS User Authentication (no middleware required)
router.post("/login", cmsLogin);        // CMS users login

// SECURITY: require admin authentication for ALL routes below.
// (The /login route registered above is intentionally exempt.)
// A previous path-substring "testing" bypass left destructive CMS create/update/delete
// endpoints (sectors, stock-masters, bulk-deals, valuations, scorecards, faqs, news, etc.)
// reachable without any authentication. Never gate auth on req.path substrings.
router.use(adminMiddleware);

// Apply last active update middleware to all authenticated routes
router.use(updateLastActive);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/filter-options", getFilterOptions);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Stock Management Routes
router.get("/stocks", getAllStocks);
router.get("/stocks/stats", getStockStats);
router.get("/stocks/:id", getStockById);
router.post("/stocks", uploadIcon.any(), createStock);
router.put("/stocks/:id", uploadIcon.any(), updateStock);
router.delete("/stocks/:id", deleteStock);
router.delete("/stocks/bulk", bulkDeleteStocks);

// User Report Routes
router.get("/users/:userId/report", UserReportController.getUserReport);
router.post("/users/:userId/report", uploadReport.single('report'), UserReportController.uploadReport);
router.delete("/users/:userId/report", UserReportController.deleteUserReport);

// Site User Management Routes
router.get("/site-users", siteUserController.getAllSiteUsers);
router.get("/site-users/stats", siteUserController.getSiteUserStats);
router.get("/site-users/:id", siteUserController.getSiteUserById);
router.put("/site-users/:id", siteUserController.updateSiteUser);
router.delete("/site-users/:id", siteUserController.deleteSiteUser);
router.delete("/site-users/:id/related-records", siteUserController.deleteAllRelatedRecords);
router.delete("/site-users/:id/force", siteUserController.forceDeleteSiteUser);

// Email Template Management Routes
router.get("/email-templates", emailTemplateController.getAllEmailTemplates);
router.get("/email-templates/stats", emailTemplateController.getEmailTemplateStats);
router.get("/email-templates/:id", emailTemplateController.getEmailTemplateById);
router.post("/email-templates", emailTemplateController.createEmailTemplate);
router.put("/email-templates/:id", emailTemplateController.updateEmailTemplate);
router.delete("/email-templates/:id", emailTemplateController.deleteEmailTemplate);

// Enquiry Management Routes
router.get("/enquiries", getAllEnquiries);
router.get("/enquiries/stats", getEnquiryStats);
router.get("/enquiries/:id", getEnquiryById);
router.put("/enquiries/:id/status", updateEnquiryStatus);
router.delete("/enquiries/:id", deleteEnquiry);

// Subscriber Management Routes
router.get("/subscribers", getAllSubscribers);
router.get("/subscribers/stats", getSubscriberStats);
router.delete("/subscribers/:id", deleteSubscriber);

// Private Market News Management Routes
router.get("/private-market-news", privateMarketNewsController.getAllPrivateMarketNews);
router.get("/private-market-news/stats", privateMarketNewsController.getPrivateMarketNewsStats);
router.get("/private-market-news/:id", privateMarketNewsController.getPrivateMarketNewsById);
router.post("/private-market-news", uploadIcon.any(), privateMarketNewsController.createPrivateMarketNews);
router.put("/private-market-news/:id", uploadIcon.any(), privateMarketNewsController.updatePrivateMarketNews);
router.delete("/private-market-news/:id", privateMarketNewsController.deletePrivateMarketNews);

// Taxonomy Management Routes
router.get("/taxonomies", taxonomyController.getAllTaxonomies);
router.get("/taxonomies/stats", taxonomyController.getTaxonomyStats);
router.get("/taxonomies/status/active", taxonomyController.getActiveTaxonomies);
router.get("/taxonomies/:id", taxonomyController.getTaxonomyById);
router.post("/taxonomies", taxonomyController.createTaxonomy);
router.put("/taxonomies/:id", taxonomyController.updateTaxonomy);
router.delete("/taxonomies/:id", taxonomyController.deleteTaxonomy);

// Notable Activity Management Routes
router.get("/notable-activities", notableActivityController.getAllNotableActivities);
router.get("/notable-activities/stats", notableActivityController.getNotableActivityStats);
router.get("/notable-activities/:id", notableActivityController.getNotableActivityById);
router.post("/notable-activities", uploadIcon.any(), notableActivityController.createNotableActivity);
router.put("/notable-activities/:id", uploadIcon.any(), notableActivityController.updateNotableActivity);
router.delete("/notable-activities/:id", notableActivityController.deleteNotableActivity);

// Home Insight Management Routes
router.get("/home-insights", homeInsightController.getAllHomeInsights);
router.get("/home-insights/:id", homeInsightController.getHomeInsightById);
router.post("/home-insights", uploadHomeInsightFile.single('file'), homeInsightController.createHomeInsight);
router.put("/home-insights/:id", uploadHomeInsightFile.single('file'), homeInsightController.updateHomeInsight);
router.delete("/home-insights/:id", homeInsightController.deleteHomeInsight);

// Transaction Management Routes
router.get("/transactions", transactionController.getAllTransactions);
router.get("/transactions/stats", transactionController.getTransactionStats);
router.get("/transactions/:id", transactionController.getTransactionById);
router.post("/transactions/:id/approve", transactionController.approveTransaction);
router.post("/transactions/:id/reject", transactionController.rejectTransaction);
router.put("/transactions/:id", transactionController.updateTransaction);

// Activity Type Management Routes
router.get("/activity-types", activityTypeController.getAllActivityTypes);
router.get("/activity-types/stats", activityTypeController.getActivityTypeStats);
router.get("/activity-types/select", activityTypeController.getAllActivityTypesForSelect);
router.get("/activity-types/:id", activityTypeController.getActivityTypeById);
router.post("/activity-types", activityTypeController.createActivityType);
router.put("/activity-types/:id", activityTypeController.updateActivityType);
router.delete("/activity-types/:id", activityTypeController.deleteActivityType);

// Bulk Deals Management Routes
router.get("/bulk-deals", bulkDealsController.getAllBulkDeals);
router.get("/bulk-deals/stats", bulkDealsController.getBulkDealsStats);
router.get("/bulk-deals/:id", bulkDealsController.getBulkDealById);
router.post("/bulk-deals", uploadIcon.any(), bulkDealsController.createBulkDeal);
router.put("/bulk-deals/:id", uploadIcon.any(), bulkDealsController.updateBulkDeal);
router.delete("/bulk-deals/:id", bulkDealsController.deleteBulkDeal);
router.delete("/bulk-deals/bulk", bulkDealsController.bulkDeleteBulkDeals);

// Stock Master Management Routes
router.get("/stock-masters", stockMasterController.getAllStockMasters);
router.get("/stock-masters/stats", stockMasterController.getStockMasterStats);
router.get("/stock-masters/select", stockMasterController.getAllStockMastersForSelect);
router.get("/stock-masters/:id", stockMasterController.getStockMasterById);
router.post("/stock-masters", stockMasterController.createStockMaster);
router.put("/stock-masters/:id", stockMasterController.updateStockMaster);
router.delete("/stock-masters/:id", stockMasterController.deleteStockMaster);

// Price Change Period Management Routes
router.get("/price-change-periods", PriceChangePeriodController.getAllPriceChangePeriods);
router.get("/price-change-periods/select", PriceChangePeriodController.getPriceChangePeriodsForSelect);
router.get("/price-change-periods/:id", PriceChangePeriodController.getPriceChangePeriodById);
router.post("/price-change-periods", PriceChangePeriodController.createPriceChangePeriod);
router.put("/price-change-periods/:id", PriceChangePeriodController.updatePriceChangePeriod);
router.delete("/price-change-periods/:id", PriceChangePeriodController.deletePriceChangePeriod);

// Valuation Management Routes
router.get("/valuations", ValuationController.getAllValuations);
router.get("/valuations/select", ValuationController.getValuationsForSelect);
router.get("/valuations/ranges", ValuationController.getValuationRanges);
router.get("/valuations/:id", ValuationController.getValuationById);
router.post("/valuations", ValuationController.createValuation);
router.put("/valuations/:id", ValuationController.updateValuation);
router.delete("/valuations/:id", ValuationController.deleteValuation);

// Valuation Range Management Routes
router.get("/valuation-ranges", ValuationRangeController.getAllValuationRanges);
router.get("/valuation-ranges/filters", ValuationRangeController.getValuationRangesForFilters);
router.get("/valuation-ranges/:id", ValuationRangeController.getValuationRangeById);
router.post("/valuation-ranges", ValuationRangeController.createValuationRange);
router.put("/valuation-ranges/:id", ValuationRangeController.updateValuationRange);
router.delete("/valuation-ranges/:id", ValuationRangeController.deleteValuationRange);

// Valuation mapping endpoint
router.get("/valuation-mapping", ValuationController.getValuationMapping);

// Theme Management Routes
router.get("/themes", ThemeController.getAllThemes);
router.get("/themes/select", ThemeController.getThemesForSelect);
router.get("/themes/:id", ThemeController.getThemeById);
router.post("/themes", ThemeController.createTheme);
router.put("/themes/:id", ThemeController.updateTheme);
router.delete("/themes/:id", ThemeController.deleteTheme);

// Sector Management Routes
router.get("/sectors", SectorManagementController.getAllSectors);
router.get("/sectors/stats", SectorManagementController.getSectorStats);
router.get("/sectors/select", SectorManagementController.getAllSectorsForSelect);
router.get("/sectors/:id", SectorManagementController.getSectorById);
router.post("/sectors", SectorManagementController.createSector);
router.put("/sectors/:id", SectorManagementController.updateSector);
router.delete("/sectors/:id", SectorManagementController.deleteSector);

// Subsector Management Routes
router.get("/subsectors", SectorManagementController.getAllSubsectors);
router.get("/sectors/:sectorId/subsectors", SectorManagementController.getSubsectorsBySectorId);
router.get("/subsectors/:id", SectorManagementController.getSubsectorById);
router.post("/subsectors", SectorManagementController.createSubsector);
router.put("/subsectors/:id", SectorManagementController.updateSubsector);
router.delete("/subsectors/:id", SectorManagementController.deleteSubsector);

// Stock Scorecard Management Routes
router.get("/stocks/:stockId/scorecards", StockScorecardManagementController.getScorecardsByStockId);
router.get("/scorecards/:id", StockScorecardManagementController.getScorecardById);
router.post("/stocks/:stockId/scorecards", StockScorecardManagementController.createScorecard);
router.post("/stocks/:stockId/scorecards/bulk", StockScorecardManagementController.bulkCreateScorecards);
router.put("/scorecards/:id", StockScorecardManagementController.updateScorecard);
router.delete("/scorecards/:id", StockScorecardManagementController.deleteScorecard);
router.get("/stocks/:stockId/scorecards/stats", StockScorecardManagementController.getScorecardStats);

// Stock Investment Rationale Management Routes
router.get("/stocks/:stockId/investment-rationales", StockInvestmentRationaleManagementController.getRationalesByStockId);
router.get("/investment-rationales/:id", StockInvestmentRationaleManagementController.getRationaleById);
router.post("/stocks/:stockId/investment-rationales", uploadIcon.single('icon'), StockInvestmentRationaleManagementController.createRationale);
router.post("/stocks/:stockId/investment-rationales/bulk", StockInvestmentRationaleManagementController.bulkCreateRationales);
router.put("/investment-rationales/:id", uploadIcon.single('icon'), StockInvestmentRationaleManagementController.updateRationale);
router.delete("/investment-rationales/:id", StockInvestmentRationaleManagementController.deleteRationale);
router.get("/stocks/:stockId/investment-rationales/stats", StockInvestmentRationaleManagementController.getRationaleStats);

// Stock Performance PDF Management Routes
router.get("/stocks/:stockId/performance-pdfs", StockPerformancePdfManagementController.getPdfsByStockId);
router.get("/performance-pdfs/:id", StockPerformancePdfManagementController.getPdfById);
router.post("/stocks/:stockId/performance-pdfs", uploadMiddleware, StockPerformancePdfManagementController.createPdf);
router.post("/stocks/:stockId/performance-pdfs/bulk", StockPerformancePdfManagementController.bulkCreatePdfs);
router.put("/performance-pdfs/:id", StockPerformancePdfManagementController.updatePdf);
router.put("/performance-pdfs/:id/replace", uploadMiddleware, StockPerformancePdfManagementController.replacePdf);
router.delete("/performance-pdfs/:id", StockPerformancePdfManagementController.deletePdf);
router.get("/stocks/:stockId/performance-pdfs/stats", StockPerformancePdfManagementController.getPdfStats);

// Stock Sector & Comapany outlook Management Routes
router.get("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.getSectorOutlookByStockId);
router.post("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.createOrUpdateSectorOutlook);
router.delete("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.deleteSectorOutlook);
router.get("/stocks/:stockId/sector-outlooks/stats", StockSectorOutlookManagementController.getSectorOutlookStats);

// Stock Sector & Comapany insights PDF Management Routes
router.get("/stocks/:stockId/sector-insights-pdfs", StockSectorInsightsPdfManagementController.getPdfsByStockId);
router.get("/sector-insights-pdfs/:id", StockSectorInsightsPdfManagementController.getPdfById);
router.post("/stocks/:stockId/sector-insights-pdfs", uploadPdf.single('pdf'), StockSectorInsightsPdfManagementController.createPdf);
router.post("/stocks/:stockId/sector-insights-pdfs/bulk", StockSectorInsightsPdfManagementController.bulkCreatePdfs);
router.put("/sector-insights-pdfs/:id", StockSectorInsightsPdfManagementController.updatePdf);
router.put("/sector-insights-pdfs/:id/replace", uploadPdf.single('pdf'), StockSectorInsightsPdfManagementController.replacePdf);
router.put("/sector-insights-pdfs/:id/set-active", StockSectorInsightsPdfManagementController.setActivePdf);
router.delete("/sector-insights-pdfs/:id", StockSectorInsightsPdfManagementController.deletePdf);
router.get("/stocks/:stockId/sector-insights-pdfs/stats", StockSectorInsightsPdfManagementController.getPdfStats);

// Stock Draft Management Routes
router.post("/stock-drafts", saveDraft);
router.get("/stock-drafts", getDrafts);
router.get("/stock-drafts/:id", getDraftById);
router.delete("/stock-drafts/:id", deleteDraft);
router.post("/stock-drafts/cleanup", cleanupExpiredDrafts);

// Stock Price Data Management Routes
router.post("/stocks/:id/price-data/upload", upload.single('csvFile'), uploadPriceDataCSV);
router.get("/stocks/:id/price-data", getPriceData);
router.get("/stocks/:id/price-data/export", exportPriceDataCSV);
router.get("/stocks/:id/price-data/latest", getLatestPriceData);
router.delete("/stocks/:id/price-data", deleteAllPriceData);
router.delete("/stocks/:id/price-data/admin", deletePriceDataAdmin);
router.get("/stocks/:id/price-data/exists", checkPriceDataExists);

// Financial Data Management Routes
router.get("/financial-kpis/:category", FinancialDataController.getKpisByCategory);
router.get("/stocks/:stockId/financial-data/:category", FinancialDataController.getStockFinancialData);
router.post("/stocks/:stockId/financial-data/:category/upload", upload.single('csvFile'), FinancialDataController.uploadFinancialDataCSV);
router.get("/stocks/:stockId/financial-data/:category/export", FinancialDataController.exportFinancialDataCSV);
router.delete("/stocks/:stockId/financial-data/:category", FinancialDataController.deleteFinancialData);
router.get("/stocks/:stockId/financial-data/:category/exists", FinancialDataController.checkFinancialDataExists);

// Methodology Notes Management Routes
router.get("/methodology-notes", methodologyNotesController.getAllMethodologyNotes);
router.get("/methodology-notes/active", methodologyNotesController.getAllActiveMethodologyNotes);
router.get("/methodology-notes/:id", methodologyNotesController.getMethodologyNoteById);
router.post("/methodology-notes", methodologyNotesController.createMethodologyNote);
router.put("/methodology-notes/:id", methodologyNotesController.updateMethodologyNote);
router.delete("/methodology-notes/:id", methodologyNotesController.deleteMethodologyNote);

// Stock Shareholding Management Routes
router.get("/stocks/:id/shareholding", StockShareholdingController.getStockShareholding);
router.post("/stocks/:id/shareholding", StockShareholdingController.createShareholding);
router.put("/shareholding/:id", StockShareholdingController.updateShareholding);
router.delete("/shareholding/:id", StockShareholdingController.deleteShareholding);

// Wishlist Management Routes
router.get("/wishlist/user/:userId", WishlistController.getUserWishlistAdmin);

// Shareholder Type Management Routes
router.get("/shareholder-types", ShareholderTypeController.getAllShareholderTypesAdmin);
router.post("/shareholder-types", ShareholderTypeController.createShareholderType);
router.put("/shareholder-types/:id", ShareholderTypeController.updateShareholderType);
router.delete("/shareholder-types/:id", ShareholderTypeController.deleteShareholderType);
router.patch("/shareholder-types/:id/toggle-status", ShareholderTypeController.toggleActiveStatus);

// Stock News Section Management Routes
router.get("/news-sections", StockNewsSectionController.getAllNewsSections);
router.get("/news-sections/:id", StockNewsSectionController.getNewsSectionById);
router.post("/news-sections", StockNewsSectionController.createNewsSection);
router.put("/news-sections/:id", StockNewsSectionController.updateNewsSection);
router.delete("/news-sections/:id", StockNewsSectionController.deleteNewsSection);
router.post("/news-sections/bulk-delete", StockNewsSectionController.bulkDeleteNewsSections);

// Stock News Section File Upload Routes
router.post("/news-sections/upload-banner", uploadBanner.single('banner'), StockNewsSectionController.uploadBanner);

// Stock-specific News Section Routes
router.get("/stocks/:stockId/news-sections", StockNewsSectionController.getStockNewsSections);

// Stock FAQ Management Routes
router.get("/faqs", StockFaqController.getAllFaqs);
router.get("/faqs/:id", StockFaqController.getFaqById);
router.post("/faqs", StockFaqController.createFaq);
router.put("/faqs/:id", StockFaqController.updateFaq);
router.delete("/faqs/:id", StockFaqController.deleteFaq);
router.post("/faqs/bulk-delete", StockFaqController.bulkDeleteFaqs);

// Stock-specific FAQ routes
router.get("/stocks/:stockId/faqs", StockFaqController.getStockFaqsAdmin);

// KYC Management Routes (Admin only)
const kycController = new KYCManagementController();
router.get("/kyc", kycController.getAllKYCApplications);
router.get("/kyc/stats", kycController.getKYCStats);
router.get("/kyc/:id", kycController.getKYCApplicationById);
router.put("/kyc/:id/status", kycController.updateKYCStatus);
router.delete("/kyc/:id", kycController.deleteKYCApplication);

// Contact FAQ Management Routes (Admin only)
router.get("/contact-faqs", ContactFaqController.getAllContactFaqs);
router.get("/contact-faqs/:id", ContactFaqController.getFaqById);
router.post("/contact-faqs", ContactFaqController.createFaq);
router.put("/contact-faqs/:id", ContactFaqController.updateFaq);
router.delete("/contact-faqs/:id", ContactFaqController.deleteFaq);
router.delete("/contact-faqs/bulk-delete", ContactFaqController.bulkDeleteFaqs);

// Buy Requests Management Routes (Admin only)
router.post("/buy-requests-count", getBuyRequestsCount);
router.post("/buy-requests-data", getBuyRequestsData);

// Market Insights Management Routes (Admin only)
// Insight Sectors
router.get("/insight-sectors", InsightSectorController.getAllInsightSectors);
router.get("/insight-sectors/:id", InsightSectorController.getInsightSectorById);
router.post("/insight-sectors", InsightSectorController.createInsightSector);
router.put("/insight-sectors/:id", InsightSectorController.updateInsightSector);
router.delete("/insight-sectors/:id", InsightSectorController.deleteInsightSector);

// Insight Subsectors
router.get("/insight-subsectors", InsightSubsectorController.getAllInsightSubsectors);
router.get("/insight-subsectors/:id", InsightSubsectorController.getInsightSubsectorById);
router.post("/insight-subsectors", InsightSubsectorController.createInsightSubsector);
router.put("/insight-subsectors/:id", InsightSubsectorController.updateInsightSubsector);
router.delete("/insight-subsectors/:id", InsightSubsectorController.deleteInsightSubsector);

// Insight Topics
router.get("/insight-topics", InsightTopicController.getAllInsightTopics);
router.get("/insight-topics/:id", InsightTopicController.getInsightTopicById);
router.post("/insight-topics", InsightTopicController.createInsightTopic);
router.put("/insight-topics/:id", InsightTopicController.updateInsightTopic);
router.delete("/insight-topics/:id", InsightTopicController.deleteInsightTopic);

// Insight Subtopics
router.get("/insight-subtopics", InsightSubtopicController.getAllInsightSubtopics);
router.get("/insight-subtopics/:id", InsightSubtopicController.getInsightSubtopicById);
router.post("/insight-subtopics", InsightSubtopicController.createInsightSubtopic);
router.put("/insight-subtopics/:id", InsightSubtopicController.updateInsightSubtopic);
router.delete("/insight-subtopics/:id", InsightSubtopicController.deleteInsightSubtopic);

// Insight Themes
router.get("/insight-themes", InsightThemeController.getAllInsightThemes);
router.get("/insight-themes/:id", InsightThemeController.getInsightThemeById);
router.post("/insight-themes", InsightThemeController.createInsightTheme);
router.put("/insight-themes/:id", InsightThemeController.updateInsightTheme);
router.delete("/insight-themes/:id", InsightThemeController.deleteInsightTheme);

// Market Insights - handle both blog_image and video_file
router.get("/market-insights", MarketInsightController.getAllMarketInsights);
router.get("/market-insights/featured", MarketInsightController.getFeaturedMarketInsights);
router.get("/market-insights/slug/:slug", MarketInsightController.getMarketInsightBySlug);
router.get("/market-insights/:id", MarketInsightController.getMarketInsightById);
router.post("/market-insights", uploadBlogImage.fields([
  { name: 'blog_image', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]), MarketInsightController.createMarketInsight);
router.put("/market-insights/:id", uploadBlogImage.fields([
  { name: 'blog_image', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]), MarketInsightController.updateMarketInsight);
router.delete("/market-insights/:id", MarketInsightController.deleteMarketInsight);

// Knowledge Centers - handle both blog_image and video_file
router.get("/knowledge-centers", KnowledgeCenterController.getAllKnowledgeCenters);
router.get("/knowledge-centers/featured", KnowledgeCenterController.getFeaturedKnowledgeCenters);
router.get("/knowledge-centers/slug/:slug", KnowledgeCenterController.getKnowledgeCenterBySlug);
router.get("/knowledge-centers/:id", KnowledgeCenterController.getKnowledgeCenterById);
router.post("/knowledge-centers", uploadKnowledgeCenterImage.fields([
  { name: 'blog_image', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]), KnowledgeCenterController.createKnowledgeCenter);
router.put("/knowledge-centers/:id", uploadKnowledgeCenterImage.fields([
  { name: 'blog_image', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]), KnowledgeCenterController.updateKnowledgeCenter);
router.delete("/knowledge-centers/:id", KnowledgeCenterController.deleteKnowledgeCenter);

// Knowledge Sectors
router.get("/knowledge-sectors", KnowledgeSectorController.getAllKnowledgeSectors);
router.get("/knowledge-sectors/:id", KnowledgeSectorController.getKnowledgeSectorById);
router.post("/knowledge-sectors", KnowledgeSectorController.createKnowledgeSector);
router.put("/knowledge-sectors/:id", KnowledgeSectorController.updateKnowledgeSector);
router.delete("/knowledge-sectors/:id", KnowledgeSectorController.deleteKnowledgeSector);

// Knowledge Subsectors
router.get("/knowledge-subsectors", KnowledgeSubsectorController.getAllKnowledgeSubsectors);
router.get("/knowledge-subsectors/:id", KnowledgeSubsectorController.getKnowledgeSubsectorById);
router.post("/knowledge-subsectors", KnowledgeSubsectorController.createKnowledgeSubsector);
router.put("/knowledge-subsectors/:id", KnowledgeSubsectorController.updateKnowledgeSubsector);
router.delete("/knowledge-subsectors/:id", KnowledgeSubsectorController.deleteKnowledgeSubsector);

// Knowledge Topics
router.get("/knowledge-topics", KnowledgeTopicController.getAllKnowledgeTopics);
router.get("/knowledge-topics/:id", KnowledgeTopicController.getKnowledgeTopicById);
router.post("/knowledge-topics", KnowledgeTopicController.createKnowledgeTopic);
router.put("/knowledge-topics/:id", KnowledgeTopicController.updateKnowledgeTopic);
router.delete("/knowledge-topics/:id", KnowledgeTopicController.deleteKnowledgeTopic);

// Knowledge Subtopics
router.get("/knowledge-subtopics", KnowledgeSubtopicController.getAllKnowledgeSubtopics);
router.get("/knowledge-subtopics/:id", KnowledgeSubtopicController.getKnowledgeSubtopicById);
router.post("/knowledge-subtopics", KnowledgeSubtopicController.createKnowledgeSubtopic);
router.put("/knowledge-subtopics/:id", KnowledgeSubtopicController.updateKnowledgeSubtopic);
router.delete("/knowledge-subtopics/:id", KnowledgeSubtopicController.deleteKnowledgeSubtopic);

// Knowledge Themes
router.get("/knowledge-themes", KnowledgeThemeController.getAllKnowledgeThemes);
router.get("/knowledge-themes/:id", KnowledgeThemeController.getKnowledgeThemeById);
router.post("/knowledge-themes", KnowledgeThemeController.createKnowledgeTheme);
router.put("/knowledge-themes/:id", KnowledgeThemeController.updateKnowledgeTheme);
router.delete("/knowledge-themes/:id", KnowledgeThemeController.deleteKnowledgeTheme);

// Stock Performance Score Routes
router.get("/stock-performance-scores", StockPerformanceScoreController.getAllStockPerformanceScores);
router.get("/stock-performance-scores/:id", StockPerformanceScoreController.getStockPerformanceScoreById);
router.post("/stock-performance-scores", StockPerformanceScoreController.createStockPerformanceScore);
router.put("/stock-performance-scores/:id", StockPerformanceScoreController.updateStockPerformanceScore);
router.delete("/stock-performance-scores/:id", StockPerformanceScoreController.deleteStockPerformanceScore);
router.get("/products", StockPerformanceScoreController.getAllProducts);
router.get("/products/stock-tags", stockMasterController.getStockTags);

// User Portfolio Routes
router.get("/user-portfolios", UserPortfolioController.getAllUserPortfolios);
router.get("/user-portfolios/:userId", UserPortfolioController.getUserPortfolioById);
router.get("/user-portfolios-stats", UserPortfolioController.getPortfolioStatistics);
router.post("/user-portfolios/refresh-all", UserPortfolioController.refreshAllPortfolios);
router.post("/user-portfolios/:userId/refresh", UserPortfolioController.refreshUserPortfolioById);
router.get("/user-portfolios-top-performing", UserPortfolioController.getTopPerformingPortfolios);
router.get("/user-portfolios-by-performance", UserPortfolioController.getPortfoliosByPerformanceRange);

export default router;
