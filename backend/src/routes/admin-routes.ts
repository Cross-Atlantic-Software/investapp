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

const router = express.Router();

// Initialize Controllers
const siteUserController = new SiteUserManagementController();
const emailTemplateController = new EmailTemplateManagementController();

// CMS User Authentication (no middleware required)
router.post("/login", cmsLogin);        // CMS users login

// Apply admin middleware to all other routes
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

export default router;
