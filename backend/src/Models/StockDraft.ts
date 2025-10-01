import { db } from '../utils/database';

export interface StockDraft {
  id?: number;
  admin_user_id: string;
  draft_data: any; // JSON object containing form data
  current_step: number;
  created_at?: Date;
  updated_at?: Date;
  expires_at?: Date;
}

export class StockDraftModel {
  constructor() {
    // No need to store pool reference as db is already available
  }

  // Create a new draft
  async createDraft(draft: Omit<StockDraft, 'id' | 'created_at' | 'updated_at'>): Promise<StockDraft | null> {
    try {
      console.log('Creating draft with data:', draft);
      
      const query = `
        INSERT INTO stock_drafts (admin_user_id, draft_data, current_step, expires_at)
        VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
      `;
      
      await db.sequelize.query(query, {
        replacements: [
          draft.admin_user_id,
          typeof draft.draft_data === 'string' ? draft.draft_data : JSON.stringify(draft.draft_data),
          draft.current_step
        ]
      });

      console.log('Draft inserted successfully, fetching drafts for user:', draft.admin_user_id);

      // Get the most recent draft for this user (which should be the one we just created)
      const drafts = await this.getDraftsByUserId(draft.admin_user_id);
      console.log('Found drafts:', drafts.length);
      
      return drafts.length > 0 ? drafts[0] : null;
    } catch (error) {
      console.error('Error creating draft:', error);
      return null;
    }
  }

  // Get draft by ID
  async getDraftById(id: number): Promise<StockDraft | null> {
    try {
      const query = `
        SELECT id, admin_user_id, draft_data, current_step, created_at, updated_at, expires_at
        FROM stock_drafts 
        WHERE id = ? AND expires_at > NOW()
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [id]
      });
      
      if ((rows as any[]).length === 0) return null;
      
      const draft = (rows as any[])[0];
      draft.draft_data = typeof draft.draft_data === 'string' ? JSON.parse(draft.draft_data) : draft.draft_data;
      return draft;
    } catch (error) {
      console.error('Error getting draft by ID:', error);
      return null;
    }
  }

  // Get all drafts for a user
  async getDraftsByUserId(userId: string): Promise<StockDraft[]> {
    try {
      const query = `
        SELECT id, admin_user_id, draft_data, current_step, created_at, updated_at, expires_at
        FROM stock_drafts 
        WHERE admin_user_id = ? AND expires_at > NOW()
        ORDER BY updated_at DESC
      `;
      
      const [rows] = await db.sequelize.query(query, {
        replacements: [userId]
      });
      
      return (rows as any[]).map(draft => ({
        ...draft,
        draft_data: typeof draft.draft_data === 'string' ? JSON.parse(draft.draft_data) : draft.draft_data
      }));
    } catch (error) {
      console.error('Error getting drafts by user ID:', error);
      return []; // Return empty array on error
    }
  }

  // Update existing draft
  async updateDraft(id: number, draftData: any, currentStep: number): Promise<StockDraft | null> {
    const query = `
      UPDATE stock_drafts 
      SET draft_data = ?, current_step = ?, updated_at = NOW()
      WHERE id = ? AND expires_at > NOW()
    `;
    
    const [result] = await db.sequelize.query(query, {
      replacements: [
        typeof draftData === 'string' ? draftData : JSON.stringify(draftData),
        currentStep,
        id
      ]
    });

    if ((result as any).affectedRows === 0) return null;
    
    return this.getDraftById(id);
  }

  // Delete draft
  async deleteDraft(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM stock_drafts WHERE id = ?`;
      const [result] = await db.sequelize.query(query, {
        replacements: [id]
      });
      
      console.log('Delete result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result as any));
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }

  // Clean up expired drafts
  async cleanupExpiredDrafts(): Promise<number> {
    try {
      const query = `DELETE FROM stock_drafts WHERE expires_at < NOW()`;
      const [result] = await db.sequelize.query(query);
      return (result as any).affectedRows;
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error);
      return 0;
    }
  }

  // Get draft count for user
  async getDraftCountByUserId(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM stock_drafts 
      WHERE admin_user_id = ? AND expires_at > NOW()
    `;
    
    const [rows] = await db.sequelize.query(query, {
      replacements: [userId]
    });
    return (rows as any[])[0].count;
  }
}
