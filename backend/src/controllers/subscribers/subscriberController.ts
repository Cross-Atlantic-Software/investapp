import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Subscriber from '../../Models/Subscriber';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export const createSubscriber = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscriber) {
      return res.status(HttpStatusCode.CONFLICT).json({
        success: false,
        message: 'Email already subscribed',
      });
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({
      email: email.toLowerCase(),
    });

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        id: subscriber.id,
        email: subscriber.email,
      },
    });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
    });
  }
};

export const getAllSubscribers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sort_by as string || 'createdAt';
    const sortOrder = req.query.sort_order as string || 'DESC';
    const offset = (page - 1) * limit;

    // Validate sort fields to prevent SQL injection
    const allowedSortFields = ['email', 'createdAt', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const { count, rows: subscribers } = await Subscriber.findAndCountAll({
      order: [[validSortBy, validSortOrder]],
      limit,
      offset,
    });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Subscribers retrieved successfully',
      data: {
        subscribers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch subscribers',
    });
  }
};

export const deleteSubscriber = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findByPk(id);
    if (!subscriber) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    await subscriber.destroy();

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Subscriber deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete subscriber',
    });
  }
};

export const getSubscriberStats = async (req: Request, res: Response) => {
  try {
    const totalSubscribers = await Subscriber.count();

    // Calculate 30-day percentage changes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalSubscribers30DaysAgo = await Subscriber.count({
      where: {
        createdAt: {
          [Op.lte]: thirtyDaysAgo
        }
      }
    });

    // Calculate percentage change (growth in last 30 days)
    const totalSubscribersChange = totalSubscribers30DaysAgo > 0 ? 
      ((totalSubscribers - totalSubscribers30DaysAgo) / totalSubscribers30DaysAgo * 100) : 
      (totalSubscribers > 0 ? 100 : 0);

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Subscriber stats retrieved successfully',
      data: {
        totalSubscribers,
        totalSubscribersChange: Math.round(totalSubscribersChange * 100) / 100
      },
    });
  } catch (error) {
    console.error('Error fetching subscriber stats:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch subscriber stats',
    });
  }
};
