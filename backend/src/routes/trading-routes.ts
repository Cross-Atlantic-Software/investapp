import express from "express";
import { BuyStockService } from "../controllers/trading/buyStock";
import { SellStockService } from "../controllers/trading/sellStock";
import jwtAuthMiddleware from "../utils/middleware";

const router = express.Router();
const buyStockService = new BuyStockService();
const sellStockService = new SellStockService();

// Buy stock route (protected)
router.post("/buy", jwtAuthMiddleware, buyStockService.buyStock);

// Sell stock route (protected)
router.post("/sell", jwtAuthMiddleware, sellStockService.sellStock);

export default router;

