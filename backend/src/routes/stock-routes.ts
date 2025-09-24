import express from "express";
import { getAllStocks, getStockById } from "../controllers/admin/stockManagement";

const router = express.Router();

// Public stock routes (no authentication required)
router.get("/", getAllStocks);
router.get("/:id", getStockById);

export default router;
