import { Request, Response } from 'express';
import Wishlist from '../../Models/Wishlist';
import Product from '../../Models/Product';
import User from '../../Models/User';
import db from '../../utils/database';

export class WishlistController {
  // Add stock to wishlist
  static async addToWishlist(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if stock exists
      const stock = await Product.findByPk(stockId);
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }

      // Check if already in wishlist
      const existingWishlist = await Wishlist.findOne({
        where: {
          user_id: userId,
          stock_id: stockId,
        },
      });

      if (existingWishlist) {
        return res.status(400).json({
          success: false,
          message: 'Stock already in wishlist'
        });
      }

      // Add to wishlist
      const wishlistItem = await Wishlist.create({
        user_id: userId,
        stock_id: parseInt(stockId as string),
      });

      return res.status(201).json({
        success: true,
        message: 'Stock added to wishlist successfully',
        data: {
          id: wishlistItem.id,
          stock_id: wishlistItem.stock_id,
          created_at: wishlistItem.created_at,
        }
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Remove stock from wishlist
  static async removeFromWishlist(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Find and remove from wishlist
      const wishlistItem = await Wishlist.findOne({
        where: {
          user_id: userId,
          stock_id: stockId,
        },
      });

      if (!wishlistItem) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found in wishlist'
        });
      }

      await wishlistItem.destroy();

      return res.status(200).json({
        success: true,
        message: 'Stock removed from wishlist successfully'
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user's wishlist
  static async getUserWishlist(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const wishlist = await Wishlist.findAll({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: Product,
            as: 'stock',
            attributes: ['id', 'company_name', 'price_per_share', 'logo'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        message: 'Wishlist retrieved successfully',
        data: wishlist
      });
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Check if stock is in wishlist
  static async checkWishlistStatus(req: Request, res: Response) {
    try {
      const stockId = req.params.stockId as string;
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const wishlistItem = await Wishlist.findOne({
        where: {
          user_id: userId,
          stock_id: stockId,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Wishlist status checked',
        data: {
          isInWishlist: !!wishlistItem,
        }
      });
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get wishlist for specific user (admin)
  static async getUserWishlistAdmin(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;

      const wishlist = await Wishlist.findAll({
        where: {
          user_id: userId,
        },
        include: [
          {
            model: Product,
            as: 'stock',
            attributes: ['id', 'company_name', 'price_per_share', 'logo'],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        message: 'User wishlist retrieved successfully',
        data: wishlist
      });
    } catch (error) {
      console.error('Error getting user wishlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
