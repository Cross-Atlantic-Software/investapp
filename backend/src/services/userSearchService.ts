import { Op, WhereOptions } from "sequelize";
import { db } from "../utils/database";

export interface SearchFilters {
  search?: string;
  role?: number;
  auth_provider?: string;
  status?: number;
  email_verified?: number;
  phone_verified?: number;
  date_from?: string;
  date_to?: string;
  last_active_from?: string;
  last_active_to?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface SearchResult {
  users: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class UserSearchService {
  /**
   * Build search conditions for user queries
   */
  private static buildSearchConditions(filters: SearchFilters): WhereOptions {
    const conditions: any = {};

    // Text search across multiple fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions[Op.or] = [
        { first_name: { [Op.like]: searchTerm } },
        { last_name: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        // Search in concatenated full name
        db.sequelize.where(
          db.sequelize.fn('CONCAT', 
            db.sequelize.col('first_name'), 
            ' ', 
            db.sequelize.col('last_name')
          ),
          { [Op.like]: searchTerm }
        )
      ];
    }

    // Role filter
    if (filters.role !== undefined) {
      conditions.role = filters.role;
    }

    // Auth provider filter
    if (filters.auth_provider) {
      conditions.auth_provider = filters.auth_provider;
    }

    // Status filter
    if (filters.status !== undefined) {
      conditions.status = filters.status;
    }

    // Email verification filter
    if (filters.email_verified !== undefined) {
      conditions.email_verified = filters.email_verified;
    }

    // Phone verification filter
    if (filters.phone_verified !== undefined) {
      conditions.phone_verified = filters.phone_verified;
    }

    // Date range filters
    if (filters.date_from || filters.date_to) {
      conditions.createdAt = {};
      if (filters.date_from) {
        conditions.createdAt[Op.gte] = new Date(filters.date_from);
      }
      if (filters.date_to) {
        conditions.createdAt[Op.lte] = new Date(filters.date_to);
      }
    }

    // Last active range filters
    if (filters.last_active_from || filters.last_active_to) {
      conditions.last_active = {};
      if (filters.last_active_from) {
        conditions.last_active[Op.gte] = new Date(filters.last_active_from);
      }
      if (filters.last_active_to) {
        conditions.last_active[Op.lte] = new Date(filters.last_active_to);
      }
    }

    return conditions;
  }

  /**
   * Build order clause for sorting
   */
  private static buildOrderClause(options: PaginationOptions): any[] {
    const sortBy = options.sort_by || 'createdAt';
    const sortOrder = options.sort_order || 'DESC';
    
    // Validate sort fields to prevent SQL injection
    const allowedSortFields = [
      'id', 'first_name', 'last_name', 'email', 'role', 
      'auth_provider', 'status', 'createdAt', 'updatedAt'
    ];
    
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    return [[validSortBy, sortOrder]];
  }

  /**
   * Search users with advanced filtering and pagination
   */
  static async searchUsers(
    filters: SearchFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<SearchResult> {
    try {
      const page = Math.max(1, pagination.page || 1);
      const limit = Math.min(100, Math.max(1, pagination.limit || 10)); // Cap at 100
      const offset = (page - 1) * limit;

      const whereConditions = this.buildSearchConditions(filters);
      const orderClause = this.buildOrderClause(pagination);

      const { count, rows: users } = await db.CmsUser.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: orderClause,
        attributes: { exclude: ['password'] }, // Exclude password from response
        distinct: true // Ensure accurate count with joins
      });

      const totalPages = Math.ceil(count / limit);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in UserSearchService.searchUsers:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get user statistics with filters
   */
  static async getUserStats(filters: SearchFilters = {}): Promise<any> {
    try {
      const whereConditions = this.buildSearchConditions(filters);

      const [
        totalUsers,
        verifiedUsers,
        activeUsers,
        usersByRole,
        usersByProvider
      ] = await Promise.all([
        db.CmsUser.count({ where: whereConditions }),
        db.CmsUser.count({ where: { ...whereConditions, email_verified: 1 } }),
        db.CmsUser.count({ where: { ...whereConditions, status: 1 } }),
        db.CmsUser.findAll({
          where: whereConditions,
          attributes: [
            'role',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
          ],
          group: ['role'],
          raw: true
        }),
        db.CmsUser.findAll({
          where: whereConditions,
          attributes: [
            'auth_provider',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
          ],
          group: ['auth_provider'],
          raw: true
        })
      ]);

      return {
        totalUsers,
        verifiedUsers,
        activeUsers,
        usersByRole,
        usersByProvider
      };
    } catch (error) {
      console.error('Error in UserSearchService.getUserStats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  /**
   * Update user's last active timestamp
   */
  static async updateLastActive(userId: number): Promise<void> {
    try {
      await db.CmsUser.update(
        { last_active: new Date() },
        { where: { id: userId } }
      );
    } catch (error) {
      console.error('Error updating last active for user:', userId, error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get available filter options (roles, auth providers, etc.)
   */
  static async getFilterOptions(): Promise<any> {
    try {
      const [roles, authProviders] = await Promise.all([
        db.CmsUser.findAll({
          attributes: ['role'],
          group: ['role'],
          raw: true
        }),
        db.CmsUser.findAll({
          attributes: ['auth_provider'],
          group: ['auth_provider'],
          raw: true
        })
      ]);

      return {
        roles: roles.map(r => r.role),
        authProviders: authProviders.map(p => p.auth_provider)
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      throw new Error('Failed to get filter options');
    }
  }
}
