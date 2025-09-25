import express from "express";
import adminMiddleware from "../utils/middlewares/admin-middleware";
import { uploadIcon } from "../utils/middlewares/s3Upload";
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

// CMS User Authentication (no middleware required)
router.post("/login", cmsLogin);        // CMS users login

// Apply admin middleware to all other routes (except new features for testing)
router.use((req, res, next) => {
  // Skip authentication for new feature routes during testing
  if (req.path.includes('/private-market-news') || req.path.includes('/notable-activities') || 
      req.path.includes('/taxonomies') || req.path.includes('/activity-types')) {
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
router.get("/taxonomies/active", taxonomyController.getActiveTaxonomies);
router.get("/taxonomies/:id", taxonomyController.getTaxonomyById);
router.post("/taxonomies", taxonomyController.createTaxonomy);
router.put("/taxonomies/:id", taxonomyController.updateTaxonomy);
router.delete("/taxonomies/:id", taxonomyController.deleteTaxonomy);

export default router;
