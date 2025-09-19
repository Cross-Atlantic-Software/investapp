import { Request, Response } from "express";
import { db } from "../../utils/database";
import { UserRole } from "../../utils/Roles";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

// Get all CMS users with pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || "";

    let whereClause: any = {};
    
    // Add search functionality
    if (search) {
      whereClause = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: users } = await db.CmsUser.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get CMS user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db.CmsUser.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Create new CMS user
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      phone,
      country_code
    } = req.body;

    // Admin-created users always have auth_provider as "Admin"
    const auth_provider = "Admin";

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Validate role is provided
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required for CMS users"
      });
    }

    // Check if user already exists
    const existingUser = await db.CmsUser.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new CMS user
    const newUser = await db.CmsUser.create({
      first_name,
      last_name,
      email,
      password,
      role,
      phone,
      country_code,
      auth_provider,
      status: 1,
      email_verified: 1 // Admin created users are considered verified
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update CMS user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      phone,
      country_code,
      status,
      email_verified,
      phone_verified
    } = req.body;

    const user = await db.CmsUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await db.CmsUser.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists"
        });
      }
    }

    // Update CMS user
    await user.update({
      first_name: first_name !== undefined ? first_name : user.first_name,
      last_name: last_name !== undefined ? last_name : user.last_name,
      email: email !== undefined ? email : user.email,
      password: password !== undefined ? password : user.password,
      role: role !== undefined ? role : user.role,
      phone: phone !== undefined ? phone : user.phone,
      country_code: country_code !== undefined ? country_code : user.country_code,
      status: status !== undefined ? status : user.status,
      email_verified: email_verified !== undefined ? email_verified : user.email_verified,
      phone_verified: phone_verified !== undefined ? phone_verified : user.phone_verified
    });

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete CMS user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db.CmsUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if trying to delete admin user
    if (user.role === UserRole.Admin || user.role === UserRole.SuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get CMS user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await db.CmsUser.count();
    const verifiedUsers = await db.CmsUser.count({ where: { email_verified: 1 } });
    const activeUsers = await db.CmsUser.count({ where: { status: 1 } });
    
    // Count users by role
    const usersByRole = await db.CmsUser.findAll({
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // Count users by auth provider
    const usersByProvider = await db.CmsUser.findAll({
      attributes: [
        'auth_provider',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['auth_provider'],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        activeUsers,
        usersByRole,
        usersByProvider
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
