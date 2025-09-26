import { Request, Response } from "express";
import { Op } from "sequelize";
import db, { sequelizePromise } from "../../utils/database";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { UserRole } from "../../utils/Roles";

export class SiteUserManagementController {
  private userModel = db.User;

  // Ensure database is ready before operations
  private async ensureDbReady() {
    await sequelizePromise;
  }

  // Get all site users with pagination and search
  getAllSiteUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sort_by as string || 'createdAt';
      const sortOrder = req.query.sort_order as string || 'DESC';

      const offset = (page - 1) * limit;

      // Validate sort fields to prevent SQL injection
      const allowedSortFields = ['first_name', 'last_name', 'email', 'phone', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Build where clause for search
      const whereClause: any = {};
      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      // Get total count
      const totalCount = await this.userModel.count({ where: whereClause });

      // Get users with pagination and case-insensitive sorting for name fields
      const users = await this.userModel.findAll({
        where: whereClause,
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'role', 'status', 'auth_provider', 'email_verified', 
          'phone_verified', 'country_code', 'createdAt', 'updatedAt'
        ],
        order: validSortBy === 'first_name' || validSortBy === 'last_name' 
          ? [[db.sequelize.fn('LOWER', db.sequelize.col(validSortBy)), validSortOrder]]
          : [[validSortBy, validSortOrder]],
        limit,
        offset,
      });

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        message: "Site users fetched successfully",
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error: any) {
      console.error("Get all site users error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Get single site user by ID
  getSiteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;
      const user = await this.userModel.findByPk(id, {
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'role', 'status', 'auth_provider', 'email_verified', 
          'phone_verified', 'country_code', 'createdAt', 'updatedAt'
        ]
      });

      if (!user) {
        return (res as any).error("Site user not found", HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: "Site user fetched successfully",
        data: { user }
      });
    } catch (error: any) {
      console.error("Get site user by ID error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Update site user
  updateSiteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;
      const { first_name, last_name, phone, role, status, email_verified, phone_verified } = req.body;

      const user = await this.userModel.findByPk(id);
      if (!user) {
        return (res as any).error("Site user not found", HttpStatusCode.NOT_FOUND);
      }

      // Validate role if provided
      if (role && !Object.values(UserRole).includes(role)) {
        return (res as any).error("Invalid role", HttpStatusCode.BAD_REQUEST);
      }

      // Update user
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phone: phone || user.phone,
        role: role || user.role,
        status: status !== undefined ? status : user.status,
        email_verified: email_verified !== undefined ? email_verified : user.email_verified,
        phone_verified: phone_verified !== undefined ? phone_verified : user.phone_verified,
      });

      res.status(200).json({
        success: true,
        message: "Site user updated successfully",
        data: { user }
      });
    } catch (error: any) {
      console.error("Update site user error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Delete site user
  deleteSiteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();
      
      const { id } = req.params;

      const user = await this.userModel.findByPk(id);
      if (!user) {
        return (res as any).error("Site user not found", HttpStatusCode.NOT_FOUND);
      }

      await user.destroy();

      res.status(200).json({
        success: true,
        message: "Site user deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete site user error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };

  // Get site user statistics
  getSiteUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.ensureDbReady();

      const totalUsers = await this.userModel.count();
      const verifiedUsers = await this.userModel.count({ where: { email_verified: 1 } });
      const googleUsers = await this.userModel.count({ where: { auth_provider: 'Google' } });
      const emailUsers = await this.userModel.count({ where: { auth_provider: 'Email' } });
      const activeUsers = await this.userModel.count({ where: { status: 1 } });

      // Calculate 30-day percentage changes
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalUsers30DaysAgo = await this.userModel.count({
        where: {
          createdAt: {
            [Op.lte]: thirtyDaysAgo
          }
        }
      });

      const verifiedUsers30DaysAgo = await this.userModel.count({
        where: {
          email_verified: 1,
          createdAt: {
            [Op.lte]: thirtyDaysAgo
          }
        }
      });

      const activeUsers30DaysAgo = await this.userModel.count({
        where: {
          status: 1,
          createdAt: {
            [Op.lte]: thirtyDaysAgo
          }
        }
      });

      // Calculate percentage changes (growth in last 30 days)
      const totalUsersChange = totalUsers30DaysAgo > 0 ? 
        ((totalUsers - totalUsers30DaysAgo) / totalUsers30DaysAgo * 100) : 
        (totalUsers > 0 ? 100 : 0);
      
      const verifiedUsersChange = verifiedUsers30DaysAgo > 0 ? 
        ((verifiedUsers - verifiedUsers30DaysAgo) / verifiedUsers30DaysAgo * 100) : 
        (verifiedUsers > 0 ? 100 : 0);
      
      const activeUsersChange = activeUsers30DaysAgo > 0 ? 
        ((activeUsers - activeUsers30DaysAgo) / activeUsers30DaysAgo * 100) : 
        (activeUsers > 0 ? 100 : 0);

      // Get users by role
      const usersByRole = await this.userModel.findAll({
        attributes: [
          'role',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['role'],
        raw: true
      });

      // Check if period parameter is provided for new registrations
      const period = req.query.period as string;
      let newRegistrations24h = 0;
      
      if (period === '24h') {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        newRegistrations24h = await this.userModel.count({
          where: {
            createdAt: {
              [Op.gte]: twentyFourHoursAgo
            }
          }
        });
      }

      const responseData: any = {
        totalUsers,
        verifiedUsers,
        googleUsers,
        emailUsers,
        activeUsers,
        usersByRole,
        totalUsersChange: Math.round(totalUsersChange * 100) / 100,
        verifiedUsersChange: Math.round(verifiedUsersChange * 100) / 100,
        activeUsersChange: Math.round(activeUsersChange * 100) / 100
      };

      // Add new registrations data if period is specified
      if (period === '24h') {
        responseData.newRegistrations24h = newRegistrations24h;
      }

      res.status(200).json({
        success: true,
        message: "Site user statistics fetched successfully",
        data: responseData
      });
    } catch (error: any) {
      console.error("Get site user stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
