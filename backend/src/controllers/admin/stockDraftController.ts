import { Request, Response } from 'express';
import { StockDraftModel } from '../../Models/StockDraft';

const stockDraftModel = new StockDraftModel();

// Create or update a draft
export const saveDraft = async (req: Request, res: Response) => {
  try {
    const { draftData, currentStep } = req.body;
    const adminUserId = (req.user as any)?.user_id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!draftData || typeof currentStep !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid draft data or current step'
      });
    }

    // Check if user already has a draft
    const existingDrafts = await stockDraftModel.getDraftsByUserId(adminUserId);
    
    if (existingDrafts.length > 0) {
      // Update existing draft
      const updatedDraft = await stockDraftModel.updateDraft(
        existingDrafts[0].id!,
        draftData,
        currentStep
      );
      
      if (!updatedDraft) {
        return res.status(404).json({
          success: false,
          message: 'Draft not found or expired'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Draft updated successfully',
        data: updatedDraft
      });
    } else {
      // Create new draft
      const newDraft = await stockDraftModel.createDraft({
        admin_user_id: adminUserId,
        draft_data: draftData,
        current_step: currentStep
      });
      
      if (!newDraft) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create draft'
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Draft created successfully',
        data: newDraft
      });
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user's drafts
export const getDrafts = async (req: Request, res: Response) => {
  try {
    const adminUserId = (req.user as any)?.user_id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const drafts = await stockDraftModel.getDraftsByUserId(adminUserId);
    
    return res.status(200).json({
      success: true,
      message: 'Drafts retrieved successfully',
      data: {
        drafts,
        count: drafts.length
      }
    });
  } catch (error) {
    console.error('Error getting drafts:', error);
    return res.status(200).json({
      success: true,
      message: 'No drafts found',
      data: { drafts: [], count: 0 } // Return empty array instead of error
    });
  }
};

// Get specific draft by ID
export const getDraftById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = (req.user as any)?.user_id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const draft = await stockDraftModel.getDraftById(parseInt(id));
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or expired'
      });
    }

    // Check if draft belongs to the user
    if (draft.admin_user_id !== adminUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Draft retrieved successfully',
      data: draft
    });
  } catch (error) {
    console.error('Error getting draft:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get draft'
    });
  }
};

// Delete draft
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUserId = (req.user as any)?.user_id;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // First check if draft exists and belongs to user
    const draft = await stockDraftModel.getDraftById(parseInt(id));
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or expired'
      });
    }

    if (draft.admin_user_id !== adminUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const deleted = await stockDraftModel.deleteDraft(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete draft'
    });
  }
};

// Clean up expired drafts (admin only)
export const cleanupExpiredDrafts = async (req: Request, res: Response) => {
  try {
    const deletedCount = await stockDraftModel.cleanupExpiredDrafts();
    
    return res.status(200).json({
      success: true,
      message: 'Expired drafts cleaned up',
      data: {
        deletedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up drafts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cleanup drafts'
    });
  }
};
