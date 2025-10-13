import express from 'express';
import { WishlistController } from '../controllers/stocks/wishlistController';
import jwtAuthMiddleware from '../utils/middleware';

const router = express.Router();

// User wishlist routes (authenticated)
router.post('/add/:stockId', jwtAuthMiddleware, WishlistController.addToWishlist);
router.delete('/remove/:stockId', jwtAuthMiddleware, WishlistController.removeFromWishlist);
router.get('/my-wishlist', jwtAuthMiddleware, WishlistController.getUserWishlist);
router.get('/check/:stockId', jwtAuthMiddleware, WishlistController.checkWishlistStatus);

// Admin routes
router.get('/user/:userId', jwtAuthMiddleware, WishlistController.getUserWishlistAdmin);

export default router;
