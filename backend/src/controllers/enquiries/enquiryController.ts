import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Enquiry from '../../Models/Enquiry';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Create new enquiry
    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      company,
      subject,
      message,
      status: 'new'
    });

    return res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to submit enquiry'
    });
  }
};

export const getAllEnquiries = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (status && ['new', 'read', 'replied', 'closed'].includes(status)) {
      whereClause.status = status;
    }

    // Get enquiries with pagination
    const { count, rows: enquiries } = await Enquiry.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Enquiries retrieved successfully',
      data: {
        enquiries,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch enquiries'
    });
  }
};

export const getEnquiryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByPk(id);

    if (!enquiry) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Enquiry retrieved successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch enquiry'
    });
  }
};

export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(HttpStatusCode.BAD_REQUEST).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const enquiry = await Enquiry.findByPk(id);

    if (!enquiry) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    await enquiry.update({ status });

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update enquiry status'
    });
  }
};

export const deleteEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByPk(id);

    if (!enquiry) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    await enquiry.destroy();

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};

export const getEnquiryStats = async (req: Request, res: Response) => {
  try {
    const totalEnquiries = await Enquiry.count();
    const newEnquiries = await Enquiry.count({ where: { status: 'new' } });
    const readEnquiries = await Enquiry.count({ where: { status: 'read' } });
    const repliedEnquiries = await Enquiry.count({ where: { status: 'replied' } });
    const closedEnquiries = await Enquiry.count({ where: { status: 'closed' } });

    // Calculate 30-day percentage changes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalEnquiries30DaysAgo = await Enquiry.count({
      where: {
        createdAt: {
          [Op.lte]: thirtyDaysAgo
        }
      }
    });

    // Calculate percentage change (growth in last 30 days)
    const totalEnquiriesChange = totalEnquiries30DaysAgo > 0 ? 
      ((totalEnquiries - totalEnquiries30DaysAgo) / totalEnquiries30DaysAgo * 100) : 
      (totalEnquiries > 0 ? 100 : 0);

    return res.status(HttpStatusCode.OK).json({
      success: true,
      message: 'Enquiry stats retrieved successfully',
      data: {
        total: totalEnquiries,
        new: newEnquiries,
        read: readEnquiries,
        replied: repliedEnquiries,
        closed: closedEnquiries,
        totalChange: Math.round(totalEnquiriesChange * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching enquiry stats:', error);
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch enquiry stats'
    });
  }
};
