import express from "express";
import { getAllStocks, getStockById, getStockByName } from "../controllers/admin/stockManagement";
import { getHomeDisplayStocks } from "../controllers/stocks/homeDisplayStocks";
import { getBannerDisplayStocks } from "../controllers/stocks/bannerDisplayStocks";

const router = express.Router();

// Public stock routes (no authentication required)
router.get("/", getAllStocks);
router.get("/home-display", getHomeDisplayStocks);
router.get("/banner-display", getBannerDisplayStocks);
router.get("/name/:name", getStockByName);
router.get("/:id", getStockById);

export default router;
