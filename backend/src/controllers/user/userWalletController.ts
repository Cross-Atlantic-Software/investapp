import { Request, Response } from "express";
import { db } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { UserWallet } from "../../Models/UserWallet";

export class UserWalletController {
  private walletModel = db.UserWallet;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get current user's wallet
  static async getUserWallet(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // Get user ID from JWT token
      const userId = (req as any).user?.user_id;
      
      if (!userId) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Find or create wallet for user
      let wallet = await db.UserWallet.findOne({
        where: { user_id: parseInt(userId as string) }
      });

      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = await db.UserWallet.create({
          user_id: parseInt(userId as string),
          available_balance: 0,
          pending_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        });
      }

      res.json({
        success: true,
        data: wallet
      });
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch user wallet'
      });
    }
  }

  // Deposit money to user's wallet
  static async depositToWallet(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // Get user ID from JWT token
      const userId = (req as any).user?.user_id;
      
      if (!userId) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // SECURITY: this endpoint credited a client-supplied amount directly to the wallet with
      // no payment gateway, proof of payment, or approval — i.e. any authenticated user could
      // mint unlimited balance ("money printer") and cash it out via withdraw. Disabled until a
      // verified payment provider (server-verified amount + signature/webhook) is integrated.
      return res.status(403).json({
        success: false,
        message: 'Deposits are temporarily unavailable. Funds must be added through a verified payment provider.'
      });
    } catch (error: any) {
      console.error('Error depositing to wallet:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to deposit to wallet'
      });
    }
  }

  // Withdraw money from user's wallet
  static async withdrawFromWallet(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      // Get user ID from JWT token
      const userId = (req as any).user?.user_id;
      
      if (!userId) {
        return res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // SECURITY: withdrawals pay out wallet balance that, given the disabled deposit path,
      // could only have originated from an untrusted source. Disabled until payouts run through
      // an admin-approved, gateway-backed flow.
      return res.status(403).json({
        success: false,
        message: 'Withdrawals are temporarily unavailable. Please contact support.'
      });
    } catch (error: any) {
      console.error('Error withdrawing from wallet:', error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to withdraw from wallet'
      });
    }
  }

  // Initialize wallet for user (called when user first signs up or makes first transaction)
  static async initializeWallet(userId: number) {
    try {
      await db.sequelizePromise;
      
      const existingWallet = await db.UserWallet.findOne({
        where: { user_id: userId }
      });

      if (!existingWallet) {
        await db.UserWallet.create({
          user_id: userId,
          available_balance: 0,
          pending_balance: 0,
          total_deposited: 0,
          total_withdrawn: 0
        });
        console.log(`✅ Wallet initialized for user ${userId}`);
      }

      return existingWallet || await db.UserWallet.findOne({ where: { user_id: userId } });
    } catch (error) {
      console.error('Error initializing wallet:', error);
      throw error;
    }
  }

  // Update wallet balance (internal method, called by other services)
  static async updateBalance(
    userId: number, 
    amount: number, 
    type: 'deposit' | 'withdrawal' | 'transaction' | 'settlement',
    transactionId?: number
  ) {
    try {
      await db.sequelizePromise;
      
      const wallet = await db.UserWallet.findOne({
        where: { user_id: userId }
      });

      if (!wallet) {
        // Initialize wallet if it doesn't exist
        await UserWalletController.initializeWallet(userId);
        return await db.UserWallet.findOne({ where: { user_id: userId } });
      }

      const updateData: any = {
        last_updated: new Date()
      };

      switch (type) {
        case 'deposit':
          updateData.available_balance = Number(wallet.available_balance) + Number(amount);
          updateData.total_deposited = Number(wallet.total_deposited) + Number(amount);
          break;
        
        case 'withdrawal':
          if (Number(wallet.available_balance) < Number(amount)) {
            throw new Error('Insufficient balance');
          }
          updateData.available_balance = Number(wallet.available_balance) - Number(amount);
          updateData.total_withdrawn = Number(wallet.total_withdrawn) + Number(amount);
          break;
        
        case 'transaction':
          // Move from available to pending when transaction is created
          if (Number(wallet.available_balance) < Number(amount)) {
            throw new Error('Insufficient balance for transaction');
          }
          updateData.available_balance = Number(wallet.available_balance) - Number(amount);
          updateData.pending_balance = Number(wallet.pending_balance) + Number(amount);
          break;
        
        case 'settlement':
          // Move from pending back to available when transaction is rejected or canceled
          if (Number(wallet.pending_balance) < Number(amount)) {
            throw new Error('Invalid settlement amount');
          }
          updateData.pending_balance = Number(wallet.pending_balance) - Number(amount);
          updateData.available_balance = Number(wallet.available_balance) + Number(amount);
          break;
      }

      await wallet.update(updateData);
      
      return await db.UserWallet.findOne({ where: { user_id: userId } });
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }
}

