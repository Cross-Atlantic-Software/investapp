import express from "express";
import adminMiddleware from "../utils/middleware/admin-middleware";
import { uploadIcon } from "../utils/middleware/s3Upload";

// User Management Controllers
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
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

const router = express.Router();

// CMS User Authentication (no middleware required)
router.post("/login", cmsLogin);        // CMS users login

// Apply admin middleware to all other routes
router.use(adminMiddleware);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
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

export default router;
