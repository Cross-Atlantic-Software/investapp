import { Request, Response } from 'express';
import { Op } from 'sequelize';
import db from '../../utils/database';

export const getBuyRequestsCount = async (req: Request, res: Response) => {
  try {
    console.log('🔍 getBuyRequestsCount called with body:', req.body);
    
    const { search } = req.body;

    let whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { '$User.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$User.last_name$': { [Op.iLike]: `%${search}%` } },
        { '$User.email$': { [Op.iLike]: `%${search}%` } },
        { stock_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    console.log('🔍 Count where clause:', whereClause);
    console.log('🔍 db.BuyRequest available for count:', !!db.BuyRequest);

    const total = await db.BuyRequest.count();

    console.log('🔍 Total count:', total);

    res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('❌ Error getting buy requests count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get buy requests count'
    });
  }
};

export const getBuyRequestsData = async (req: Request, res: Response) => {
  try {
    console.log('🔍 getBuyRequestsData called with body:', req.body);
    
    const { search, sortBy = 'created_at', sortOrder = 'DESC', limit = 10, offset = 0 } = req.body;

    let whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { '$User.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$User.last_name$': { [Op.iLike]: `%${search}%` } },
        { '$User.email$': { [Op.iLike]: `%${search}%` } },
        { stock_name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    console.log('🔍 Where clause:', whereClause);
    console.log('🔍 db.BuyRequest available:', !!db.BuyRequest);
    console.log('🔍 db.User available:', !!db.User);

    // First try a simple query without associations
    const buyRequests = await db.BuyRequest.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('🔍 Simple query result:', buyRequests.length, 'records');
    
    // If we have data, try to get user info separately
    if (buyRequests.length > 0) {
      const userIds = buyRequests.map(br => br.user_id);
      const users = await db.User.findAll({
        where: { id: userIds },
        attributes: ['id', 'first_name', 'last_name', 'email']
      });
      
      console.log('🔍 Found users:', users.length);
      
      // Manually join the data
      const buyRequestsWithUsers = buyRequests.map(br => {
        const user = users.find(u => u.id === br.user_id);
        return {
          ...br.toJSON(),
          User: user || null
        };
      });
      
      console.log('🔍 Final result:', buyRequestsWithUsers.length);
      
      res.json({
        success: true,
        data: { buyRequests: buyRequestsWithUsers }
      });
      return;
    }

    console.log('🔍 Found buy requests:', buyRequests.length);

    res.json({
      success: true,
      data: { buyRequests }
    });
  } catch (error) {
    console.error('❌ Error getting buy requests data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get buy requests data'
    });
  }
};
