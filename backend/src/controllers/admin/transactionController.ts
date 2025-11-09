import { Request, Response } from "express";
import { db } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { Transaction } from "../../Models/Transaction";
import { Op } from "sequelize";
import { UserWalletController } from "../user/userWalletController";
import { UserPortfolioController } from "./userPortfolioController";

export class TransactionController {
  private transactionModel = db.Transaction;

  private async ensureDbReady() {
    await db.sequelizePromise;
  }

  // Get all transactions with pagination and filters
  getAllTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        status = '', 
        transaction_type = '',
        sort_by = 'created_at', 
        sort_order = 'DESC' 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const order = [[sort_by as string, sort_order as string]] as any;

      const whereClause: any = {};
      
      if (search) {
        whereClause[Op.or] = [
          { transaction_id: { [Op.like]: `%${search}%` } },
          { '$user.email$': { [Op.like]: `%${search}%` } },
          { '$stock.company_name$': { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      if (transaction_type) {
        whereClause.transaction_type = transaction_type;
      }

      const { count, rows: transactions } = await this.transactionModel.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name']
          },
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name', 'logo']
          },
          {
            model: db.CmsUser,
            as: 'approvedBy',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          }
        ],
        order,
        limit: Number(limit),
        offset,
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Transactions fetched successfully",
        data: {
          transactions,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      console.error("Get all transactions error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Get transaction by ID
  getTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;

      const transaction = await this.transactionModel.findByPk(id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name']
          },
          {
            model: db.Product,
            as: 'stock',
            attributes: ['id', 'company_name', 'logo', 'price_per_share']
          },
          {
            model: db.BuyRequest,
            as: 'buyRequest',
            attributes: ['id', 'stock_name', 'quantity', 'price', 'total_amount']
          },
          {
            model: db.CmsUser,
            as: 'approvedBy',
            attributes: ['id', 'email', 'first_name', 'last_name'],
            required: false
          }
        ]
      });

      if (!transaction) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Transaction not found"
        });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Transaction fetched successfully",
        data: { transaction },
      });
    } catch (error: any) {
      console.error("Get transaction by ID error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Approve transaction
  approveTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const adminUserId = (req as any).user?.user_id; // Logged-in CMS user

      if (!adminUserId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Admin user not authenticated"
        });
        return;
      }

      const transaction = await this.transactionModel.findByPk(id);

      if (!transaction) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Transaction not found"
        });
        return;
      }

      if (transaction.status === 'completed') {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Transaction is already completed"
        });
        return;
      }

      if (transaction.status === 'rejected') {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Cannot approve a rejected transaction"
        });
        return;
      }

      // Reload transaction to ensure we have the latest fees/taxes (in case they were just updated)
      await transaction.reload();
      
      // Calculate net_amount if not already set (fees/taxes might have been added)
      const finalFees = transaction.fees || 0;
      const finalTaxes = transaction.taxes || 0;
      const netAmount = Number(transaction.total_amount) + Number(finalFees) + Number(finalTaxes);

      await transaction.update({
        status: 'completed',
        admin_approved_by: adminUserId,
        admin_approved_at: new Date(),
        execution_date: new Date(),
        net_amount: netAmount // Ensure net_amount is set
      });

      // Deduct net_amount from user's wallet when transaction is approved
      // First check if wallet has enough balance
      try {
        let wallet = await db.UserWallet.findOne({
          where: { user_id: transaction.user_id }
        });

        if (!wallet) {
          // Initialize wallet if it doesn't exist
          await UserWalletController.initializeWallet(transaction.user_id);
          wallet = await db.UserWallet.findOne({
            where: { user_id: transaction.user_id }
          });
        }

        if (!wallet) {
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to initialize or find user wallet'
          });
          return;
        }

        // Reload wallet to ensure we have the latest data
        await wallet.reload();

        // Allow negative balances - calculate new balance (can go negative)
        // Get current total_withdrawn value (ensure it's a number, default to 0 if null/undefined)
        const currentTotalWithdrawn = Number(wallet.total_withdrawn) || 0;
        const newTotalWithdrawn = currentTotalWithdrawn + netAmount;
        const currentAvailableBalance = Number(wallet.available_balance) || 0;
        const newAvailableBalance = currentAvailableBalance - netAmount; // Can be negative

        // Update wallet: deduct from available balance and increment total_withdrawn
        // Using direct update with explicit values to ensure both fields are updated
        await db.UserWallet.update(
          {
            available_balance: newAvailableBalance,
            total_withdrawn: newTotalWithdrawn,
            last_updated: new Date()
          },
          {
            where: { user_id: transaction.user_id }
          }
        );

        // Reload wallet to verify the update
        await wallet.reload();

        console.log(`Wallet debited for approved transaction ${id}: ₹${netAmount}`);
        console.log(`Wallet updated - Available Balance: ₹${wallet.available_balance} (can be negative), Total Withdrawn: ₹${wallet.total_withdrawn}`);
      } catch (walletError: any) {
        console.error('Error updating wallet on transaction approval:', walletError);
        // Revert the transaction status if wallet update fails
        await transaction.update({ status: 'pending' });
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: walletError.message || 'Failed to update wallet balance'
        });
        return;
      }

      // Refresh user portfolio to update total_investment
      try {
        await UserPortfolioController.refreshSingleUserPortfolio(transaction.user_id);
        console.log(`Portfolio refreshed for user ${transaction.user_id} after transaction approval`);
      } catch (portfolioError: any) {
        console.error('Error refreshing user portfolio on transaction approval:', portfolioError);
        // Don't fail the transaction if portfolio refresh fails, but log the error
      }

      const updatedTransaction = await this.transactionModel.findByPk(id, {
        include: [
          {
            model: db.CmsUser,
            as: 'approvedBy',
            attributes: ['id', 'email', 'first_name', 'last_name']
          }
        ]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Transaction approved successfully",
        data: { transaction: updatedTransaction },
      });
    } catch (error: any) {
      console.error("Approve transaction error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Reject transaction
  rejectTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { rejection_reason } = req.body;
      const adminUserId = (req as any).user?.user_id; // Logged-in CMS user

      if (!adminUserId) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({
          success: false,
          message: "Admin user not authenticated"
        });
        return;
      }

      if (!rejection_reason || rejection_reason.trim() === '') {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Rejection reason is required"
        });
        return;
      }

      const transaction = await this.transactionModel.findByPk(id);

      if (!transaction) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Transaction not found"
        });
        return;
      }

      // Store original status before any checks
      const originalStatus = transaction.status;
      
      if (transaction.status === 'completed') {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Cannot reject a completed transaction"
        });
        return;
      }

      // Calculate net_amount for potential refund (if transaction was completed before)
      // Note: This won't execute for completed transactions since we return early above,
      // but keeping for edge cases where status might change between checks
      const wasCompleted = originalStatus === 'completed';
      const finalFees = transaction.fees || 0;
      const finalTaxes = transaction.taxes || 0;
      const netAmount = Number(transaction.total_amount) + Number(finalFees) + Number(finalTaxes);

      await transaction.update({
        status: 'rejected',
        admin_approved_by: adminUserId,
        admin_approved_at: new Date(),
        rejection_reason: rejection_reason.trim()
      });

      // If transaction was completed (funds were deducted), refund to wallet
      // Since we only deduct on approval, pending transactions don't need refund
      if (wasCompleted) {
        try {
          const wallet = await db.UserWallet.findOne({
            where: { user_id: transaction.user_id }
          });

          if (wallet) {
            // Refund the net_amount back to available balance
            await wallet.update({
              available_balance: Number(wallet.available_balance) + netAmount,
              last_updated: new Date()
            });
            console.log(`Wallet refunded for rejected transaction ${id}: ₹${netAmount}`);
          }
        } catch (walletError) {
          console.error('Error refunding wallet on transaction rejection:', walletError);
          // Don't fail the rejection if wallet refund fails, but log it
        }
      }

      const updatedTransaction = await this.transactionModel.findByPk(id, {
        include: [
          {
            model: db.CmsUser,
            as: 'approvedBy',
            attributes: ['id', 'email', 'first_name', 'last_name']
          }
        ]
      });

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Transaction rejected successfully",
        data: { transaction: updatedTransaction },
      });
    } catch (error: any) {
      console.error("Reject transaction error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Update transaction (fees, taxes, notes)
  updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      const { id } = req.params;
      const { fees, taxes, notes, settlement_date } = req.body;

      const transaction = await this.transactionModel.findByPk(id);

      if (!transaction) {
        res.status(HttpStatusCode.NOT_FOUND).json({
          success: false,
          message: "Transaction not found"
        });
        return;
      }

      const updateData: any = {};

      if (fees !== undefined) {
        updateData.fees = fees;
      }

      if (taxes !== undefined) {
        updateData.taxes = taxes;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (settlement_date !== undefined) {
        updateData.settlement_date = settlement_date;
      }

      // Calculate net_amount if fees or taxes are updated
      // net_amount = total_amount + fees + taxes (what user actually pays)
      if (fees !== undefined || taxes !== undefined) {
        const finalFees = fees !== undefined ? fees : (transaction.fees || 0);
        const finalTaxes = taxes !== undefined ? taxes : (transaction.taxes || 0);
        updateData.net_amount = Number(transaction.total_amount) + Number(finalFees) + Number(finalTaxes);
      }

      await transaction.update(updateData);

      // If transaction is already completed, update wallet balance for the difference
      // This handles the case where fees/taxes are added after approval
      if (transaction.status === 'completed' && (fees !== undefined || taxes !== undefined)) {
        try {
          const updatedTx = await this.transactionModel.findByPk(id);
          if (updatedTx && updatedTx.net_amount) {
            const oldFees = transaction.fees || 0;
            const oldTaxes = transaction.taxes || 0;
            const oldNetAmount = Number(transaction.total_amount) + Number(oldFees) + Number(oldTaxes);
            const newNetAmount = Number(updatedTx.net_amount);
            const difference = newNetAmount - oldNetAmount;

            // If net_amount increased, deduct more from wallet
            // If net_amount decreased, add back to wallet
            if (difference !== 0) {
              const wallet = await db.UserWallet.findOne({
                where: { user_id: transaction.user_id }
              });

              if (wallet) {
                if (difference > 0) {
                  // Additional fees/taxes added - check balance and deduct
                  if (Number(wallet.available_balance) < difference) {
                    // Revert the transaction update
                    await transaction.reload();
                    await transaction.update({
                      fees: oldFees,
                      taxes: oldTaxes,
                      net_amount: oldNetAmount
                    });
                    res.status(HttpStatusCode.BAD_REQUEST).json({
                      success: false,
                      message: `Insufficient wallet balance to add fees/taxes. Available: ₹${wallet.available_balance}, Required: ₹${difference}`
                    });
                    return;
                  }
                  // Deduct additional amount
                  await wallet.update({
                    available_balance: Number(wallet.available_balance) - difference,
                    last_updated: new Date()
                  });
                  console.log(`Additional fees/taxes deducted from wallet for transaction ${id}: ₹${difference}`);
                } else {
                  // Fees/taxes reduced - refund the difference
                  await wallet.update({
                    available_balance: Number(wallet.available_balance) + Math.abs(difference),
                    last_updated: new Date()
                  });
                  console.log(`Reduced fees/taxes refunded to wallet for transaction ${id}: ₹${Math.abs(difference)}`);
                }
              }
            }
          }
        } catch (walletError: any) {
          console.error('Error updating wallet after fees/taxes change:', walletError);
          // Revert transaction update if wallet update fails
          try {
            await transaction.reload();
            const oldFees = transaction.fees || 0;
            const oldTaxes = transaction.taxes || 0;
            const oldNetAmount = Number(transaction.total_amount) + Number(oldFees) + Number(oldTaxes);
            await transaction.update({
              fees: oldFees,
              taxes: oldTaxes,
              net_amount: oldNetAmount
            });
          } catch (revertError) {
            console.error('Failed to revert transaction update:', revertError);
          }
          res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: walletError.message || 'Failed to update wallet balance'
          });
          return;
        }
      }

      const updatedTransaction = await this.transactionModel.findByPk(id);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Transaction updated successfully",
        data: { transaction: updatedTransaction },
      });
    } catch (error: any) {
      console.error("Update transaction error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };

  // Get transaction statistics (buy/sell requests from last 7 days)
  getTransactionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Count buy requests from last 7 days (these are the actual requests)
      const buyRequestsLast7Days = await db.BuyRequest.count({
        where: {
          created_at: {
            [Op.gte]: sevenDaysAgo
          }
        }
      });

      // Count sell transactions from last 7 days (sell requests come as transactions directly)
      const sellTransactionsLast7Days = await this.transactionModel.count({
        where: {
          transaction_type: 'sell',
          created_at: {
            [Op.gte]: sevenDaysAgo
          }
        }
      });

      // Total buy/sell requests from last 7 days
      const totalBuySellRequests = buyRequestsLast7Days + sellTransactionsLast7Days;

      // Count buy requests from 7 days ago (for percentage calculation)
      const buyRequests7DaysAgo = await db.BuyRequest.count({
        where: {
          created_at: {
            [Op.lte]: sevenDaysAgo
          }
        }
      });

      const sellTransactions7DaysAgo = await this.transactionModel.count({
        where: {
          transaction_type: 'sell',
          created_at: {
            [Op.lte]: sevenDaysAgo
          }
        }
      });

      const totalBuySellRequests7DaysAgo = buyRequests7DaysAgo + sellTransactions7DaysAgo;

      // Calculate percentage change (growth in last 7 days)
      const totalBuySellRequestsChange = totalBuySellRequests7DaysAgo > 0 ? 
        ((totalBuySellRequests - totalBuySellRequests7DaysAgo) / totalBuySellRequests7DaysAgo * 100) : 
        (totalBuySellRequests > 0 ? 100 : 0);

      res.status(HttpStatusCode.OK).json({
        success: true,
        data: {
          totalBuySellRequests,
          totalBuySellRequestsChange: Math.round(totalBuySellRequestsChange * 100) / 100,
          buyRequestsLast7Days,
          sellTransactionsLast7Days
        }
      });
    } catch (error: any) {
      console.error("Get transaction stats error:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  };
}

