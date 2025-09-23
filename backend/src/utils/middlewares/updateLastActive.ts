import { Request, Response, NextFunction } from "express";
import { UserSearchService } from "../../services/userSearchService";

/**
 * Middleware to update user's last active timestamp
 * This should be applied after authentication middleware
 */
export const updateLastActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (req.user && (req.user as any).user_id) {
      const userId = (req.user as any).user_id;
      
      // Update last active timestamp in the background
      // Don't await this to avoid slowing down the request
      UserSearchService.updateLastActive(userId).catch(error => {
        console.error('Error updating last active timestamp:', error);
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in updateLastActive middleware:', error);
    // Don't fail the request if this middleware fails
    next();
  }
};

export default updateLastActive;
