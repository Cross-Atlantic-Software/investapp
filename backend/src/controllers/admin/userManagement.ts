import { Request, Response } from "express";
import { db } from "../../utils/database";
import { UserRole } from "../../utils/Roles";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { UserSearchService, SearchFilters, PaginationOptions } from "../../services/userSearchService";

// Get all CMS users with advanced search and pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Extract search filters from query parameters
    const filters: SearchFilters = {
      search: req.query.search as string,
      role: req.query.role ? parseInt(req.query.role as string) : undefined,
      auth_provider: req.query.auth_provider as string,
      status: req.query.status ? parseInt(req.query.status as string) : undefined,
      email_verified: req.query.email_verified ? parseInt(req.query.email_verified as string) : undefined,
      phone_verified: req.query.phone_verified ? parseInt(req.query.phone_verified as string) : undefined,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      last_active_from: req.query.last_active_from as string,
      last_active_to: req.query.last_active_to as string,
    };

    // Extract pagination options
    const pagination: PaginationOptions = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as 'ASC' | 'DESC',
    };

    // Use the search service to get users
    const result = await UserSearchService.searchUsers(filters, pagination);

    return res.status(200).json({
      success: true,
      data: result
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

    // Get the creator's role from the JWT token
    const creatorRole = (req.user as any)?.role;
    const creatorId = (req.user as any)?.user_id;
    
    console.log(`🔍 Creating CMS user - Creator ID: ${creatorId}, Creator Role: ${creatorRole}`);
    
    // Determine auth_provider based on creator's role
    let auth_provider = "Admin"; // Default fallback
    if (creatorRole === UserRole.SuperAdmin) {
      auth_provider = "SuperAdmin"; // SuperAdmin creates users with "SuperAdmin" auth_provider
    } else if (creatorRole === UserRole.Admin) {
      auth_provider = "Admin"; // Admin creates users with "Admin" auth_provider
    } else {
      console.log(`❌ Unauthorized user creation attempt - Role: ${creatorRole}`);
      return res.status(403).json({
        success: false,
        message: "Only Admin and SuperAdmin can create CMS users"
      });
    }
    
    console.log(`✅ Auth provider set to: ${auth_provider} for creator role: ${creatorRole}`);

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

    // Validate role assignment permissions
    if (creatorRole === UserRole.Admin && role === UserRole.SuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot create SuperAdmin users"
      });
    }

    if (creatorRole === UserRole.Admin && role === UserRole.Admin) {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot create other Admin users"
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

    console.log(`✅ CMS user created successfully - ID: ${newUser.id}, Email: ${email}, Auth Provider: ${auth_provider}, Role: ${role}`);

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

    // Get the updater's role from the JWT token
    const updaterRole = (req.user as any)?.role;
    const updaterId = (req.user as any)?.user_id;
    
    console.log(`🔍 Updating CMS user - Updater ID: ${updaterId}, Updater Role: ${updaterRole}`);

    const user = await db.CmsUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Validate role update permissions
    if (role !== undefined) {
      if (updaterRole === UserRole.Admin && role === UserRole.SuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Admin users cannot promote users to SuperAdmin"
        });
      }

      if (updaterRole === UserRole.Admin && role === UserRole.Admin) {
        return res.status(403).json({
          success: false,
          message: "Admin users cannot promote users to Admin"
        });
      }

      // Prevent users from promoting themselves to higher roles
      if (updaterRole === UserRole.Admin && role > updaterRole) {
        return res.status(403).json({
          success: false,
          message: "Cannot promote users to a higher role than your own"
        });
      }
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

    console.log(`✅ CMS user updated successfully - ID: ${id}, Email: ${user.email}, Role: ${user.role}`);

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

    // Get the current user's role from the JWT token
    const currentUserRole = (req.user as any)?.role;
    const currentUserId = (req.user as any)?.user_id;

    const user = await db.CmsUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent self-deletion
    if (user.id === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    // Role-based deletion restrictions
    if (user.role === UserRole.SuperAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete Super Admin users"
      });
    }

    // Only SuperAdmin can delete Admin users
    if (user.role === UserRole.Admin && currentUserRole !== UserRole.SuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only SuperAdmin can delete Admin users"
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

// Get CMS user statistics with optional filters
export const getUserStats = async (req: Request, res: Response) => {
  try {
    // Extract filters from query parameters
    const filters: SearchFilters = {
      search: req.query.search as string,
      role: req.query.role ? parseInt(req.query.role as string) : undefined,
      auth_provider: req.query.auth_provider as string,
      status: req.query.status ? parseInt(req.query.status as string) : undefined,
      email_verified: req.query.email_verified ? parseInt(req.query.email_verified as string) : undefined,
      phone_verified: req.query.phone_verified ? parseInt(req.query.phone_verified as string) : undefined,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      last_active_from: req.query.last_active_from as string,
      last_active_to: req.query.last_active_to as string,
    };

    const stats = await UserSearchService.getUserStats(filters);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get filter options for user search
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const options = await UserSearchService.getFilterOptions();
    
    return res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
