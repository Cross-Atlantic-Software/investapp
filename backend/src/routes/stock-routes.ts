import express from "express";
import { getAllStocks, getStockById, getStockByName } from "../controllers/admin/stockManagement";
import { getHomeDisplayStocks } from "../controllers/stocks/homeDisplayStocks";
import { getBannerDisplayStocks } from "../controllers/stocks/bannerDisplayStocks";
import { WishlistController } from "../controllers/stocks/wishlistController";
import jwtAuthMiddleware from "../utils/middleware";

const router = express.Router();

// Public stock routes (no authentication required)
// Note: Main /stocks route is handled by public-routes.ts
router.get("/home-display", getHomeDisplayStocks);
router.get("/banner-display", getBannerDisplayStocks);
router.get("/name/:name", getStockByName);
router.get("/:id", getStockById);

// Wishlist routes for stocks (authenticated)
router.post("/:stockId/wishlist", jwtAuthMiddleware, WishlistController.addToWishlist);
router.delete("/:stockId/wishlist", jwtAuthMiddleware, WishlistController.removeFromWishlist);
router.get("/:stockId/wishlist/check", jwtAuthMiddleware, WishlistController.checkWishlistStatus);

export default router;
