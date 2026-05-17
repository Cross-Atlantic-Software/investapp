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

      // Get users with pagination
      const users = await this.userModel.findAll({
        where: whereClause,
        attributes: [
          'id', 'first_name', 'last_name', 'email', 'phone', 
          'role', 'status', 'auth_provider', 'email_verified', 
          'phone_verified', 'country_code', 'createdAt', 'updatedAt'
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
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

      // Get users by role
      const usersByRole = await this.userModel.findAll({
        attributes: [
          'role',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['role'],
        raw: true
      });

      res.status(200).json({
        success: true,
        message: "Site user statistics fetched successfully",
        data: {
          totalUsers,
          verifiedUsers,
          googleUsers,
          emailUsers,
          activeUsers,
          usersByRole
        }
      });
    } catch (error: any) {
      console.error("Get site user stats error:", error);
      return (res as any).error(error.message || 'Internal server error', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  };
}
