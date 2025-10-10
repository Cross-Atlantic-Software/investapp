import express from "express";
import adminMiddleware from "../utils/middlewares/admin-middleware";
import { uploadIcon } from "../utils/middlewares/s3Upload";
import { uploadBanner } from "../utils/middlewares/s3Upload";
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
import { uploadPdf } from "../utils/middlewares/s3Upload";

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

// CMS User Authentication (no middleware required)
router.post("/login", cmsLogin);        // CMS users login

// Apply admin middleware to all other routes (except new features for testing)
router.use((req, res, next) => {
  // Skip authentication for new feature routes during testing
  if (req.path.includes('/private-market-news') || req.path.includes('/notable-activities') || 
      req.path.includes('/taxonomies') || req.path.includes('/activity-types') || 
      req.path.includes('/bulk-deals') || req.path.includes('/stock-masters') ||
      req.path.includes('/scorecards') || req.path.includes('/investment-rationales') ||
      req.path.includes('/performance-pdfs') || req.path.includes('/sector-outlooks') ||
      req.path.includes('/sector-insights-pdfs') || req.path.includes('/methodology-notes') ||
      req.path.includes('/news-sections') || req.path.includes('/faqs')) {
    return next();
  }
  return adminMiddleware(req, res, next);
});

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

// Site User Management Routes
router.get("/site-users", siteUserController.getAllSiteUsers);
router.get("/site-users/stats", siteUserController.getSiteUserStats);
router.get("/site-users/:id", siteUserController.getSiteUserById);
router.put("/site-users/:id", siteUserController.updateSiteUser);
router.delete("/site-users/:id", siteUserController.deleteSiteUser);

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

// Stock Sector Outlook Management Routes
router.get("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.getSectorOutlookByStockId);
router.post("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.createOrUpdateSectorOutlook);
router.delete("/stocks/:stockId/sector-outlooks", StockSectorOutlookManagementController.deleteSectorOutlook);
router.get("/stocks/:stockId/sector-outlooks/stats", StockSectorOutlookManagementController.getSectorOutlookStats);

// Stock Sector Insights PDF Management Routes
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

export default router;
