import { Request, Response } from "express";
import { db } from "../../utils/database";

export class UserProfileController {
  static async getCurrentUserProfile(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      console.log('🔐 UserProfile: Request received');
      console.log('🔐 UserProfile: req.user:', (req as any).user);
      console.log('🔐 UserProfile: req.user?.user_id:', (req as any).user?.user_id);
      
      const userId = (req as any).user?.user_id;

      if (!userId) {
        console.log('❌ UserProfile: No user ID found in request');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      console.log('✅ UserProfile: User ID found:', userId);

      const user = await db.User.findByPk(userId, {
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'country_code', 'email_verified', 'phone_verified', 
          'auth_provider', 'role', 'status', 'createdAt', 'updatedAt'
        ]
      });

      if (!user) {
        console.log('❌ UserProfile: User not found in database');
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log('✅ UserProfile: User found:', user.first_name, user.last_name);

      res.json({
        success: true,
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          country_code: user.country_code,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
          auth_provider: user.auth_provider,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ UserProfile: Error getting current user profile:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async updateCurrentUserProfile(req: Request, res: Response) {
    try {
      await db.sequelizePromise;
      
      console.log('🔐 UserProfile Update: Request received');
      console.log('🔐 UserProfile Update: req.user:', (req as any).user);
      console.log('🔐 UserProfile Update: req.body:', req.body);
      
      const userId = (req as any).user?.user_id;

      if (!userId) {
        console.log('❌ UserProfile Update: No user ID found in request');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { first_name, last_name, phone, country_code } = req.body;

      console.log('✅ UserProfile Update: User ID found:', userId);
      console.log('📝 UserProfile Update: Update data:', { first_name, last_name, phone, country_code });

      const user = await db.User.findByPk(userId);

      if (!user) {
        console.log('❌ UserProfile Update: User not found in database');
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update only the provided fields
      const updateData: any = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (phone !== undefined) updateData.phone = phone;
      if (country_code !== undefined) updateData.country_code = country_code;

      console.log('📝 UserProfile Update: Final update data:', updateData);

      await user.update(updateData);

      console.log('✅ UserProfile Update: Profile updated successfully');

      // Return updated user data
      const updatedUser = await db.User.findByPk(userId, {
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'country_code', 'email_verified', 'phone_verified', 
          'auth_provider', 'role', 'status', 'createdAt', 'updatedAt'
        ]
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser!.id,
          first_name: updatedUser!.first_name,
          last_name: updatedUser!.last_name,
          email: updatedUser!.email,
          phone: updatedUser!.phone,
          country_code: updatedUser!.country_code,
          email_verified: updatedUser!.email_verified,
          phone_verified: updatedUser!.phone_verified,
          auth_provider: updatedUser!.auth_provider,
          role: updatedUser!.role,
          status: updatedUser!.status,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ UserProfile Update: Error updating user profile:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
