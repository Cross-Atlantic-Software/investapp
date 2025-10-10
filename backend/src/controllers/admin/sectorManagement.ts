import { Request, Response } from 'express';
import { db } from '../../utils/database';
import { Op } from 'sequelize';
import { HttpStatusCode } from '../../utils/httpStatusCode';

export class SectorManagementController {
  // Get all sectors
  static async getAllSectors(req: Request, res: Response) {
    try {
      const sectors = await db.Sector.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
        include: [{
          model: db.Subsector,
          as: 'subsectors',
          where: { is_active: true },
          required: false,
          order: [['name', 'ASC']]
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Sectors retrieved successfully',
        data: { sectors }
      });
    } catch (error) {
      console.error('Error fetching sectors:', error);
      return (res as any).error('Failed to fetch sectors', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all sectors for select dropdown
  static async getAllSectorsForSelect(req: Request, res: Response) {
    try {
      const sectors = await db.Sector.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
        attributes: ['id', 'name']
      });

      res.status(200).json({
        success: true,
        message: 'Sectors retrieved successfully',
        data: { sectors }
      });
    } catch (error) {
      console.error('Error fetching sectors for select:', error);
      return (res as any).error('Failed to fetch sectors for select', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get sector by ID
  static async getSectorById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sector = await db.Sector.findByPk(id, {
        include: [{
          model: db.Subsector,
          as: 'subsectors',
          where: { is_active: true },
          required: false,
          order: [['name', 'ASC']]
        }]
      });

      if (!sector) {
        return (res as any).error('Sector not found', HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: 'Sector retrieved successfully',
        data: sector
      });
    } catch (error) {
      console.error('Error fetching sector:', error);
      return (res as any).error('Failed to fetch sector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get sector stats
  static async getSectorStats(req: Request, res: Response) {
    try {
      const totalSectors = await db.Sector.count();
      const activeSectors = await db.Sector.count({ where: { is_active: true } });
      const inactiveSectors = totalSectors - activeSectors;

      const stats = {
        total: totalSectors,
        active: activeSectors,
        inactive: inactiveSectors
      };

      res.status(200).json({
        success: true,
        message: 'Sector stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error fetching sector stats:', error);
      return (res as any).error('Failed to fetch sector stats', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Create new sector
  static async createSector(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return (res as any).error('Sector name is required', HttpStatusCode.BAD_REQUEST);
      }

      // Check if sector already exists
      const existingSector = await db.Sector.findOne({
        where: { name: name.trim() }
      });

      if (existingSector) {
        return (res as any).error('Sector with this name already exists', HttpStatusCode.BAD_REQUEST);
      }

      const sector = await db.Sector.create({
        name: name.trim(),
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'Sector created successfully',
        data: sector
      });
    } catch (error) {
      console.error('Error creating sector:', error);
      return (res as any).error('Failed to create sector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Update sector
  static async updateSector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      if (!name || name.trim() === '') {
        return (res as any).error('Sector name is required', HttpStatusCode.BAD_REQUEST);
      }

      const sector = await db.Sector.findByPk(id);
      if (!sector) {
        return (res as any).error('Sector not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if another sector with same name exists
      const existingSector = await db.Sector.findOne({
        where: { 
          name: name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingSector) {
        return (res as any).error('Sector with this name already exists', HttpStatusCode.BAD_REQUEST);
      }

      await sector.update({
        name: name.trim(),
        is_active: is_active !== undefined ? is_active : sector.is_active
      });

      res.status(200).json({
        success: true,
        message: 'Sector updated successfully',
        data: sector
      });
    } catch (error) {
      console.error('Error updating sector:', error);
      return (res as any).error('Failed to update sector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete sector
  static async deleteSector(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sector = await db.Sector.findByPk(id);
      if (!sector) {
        return (res as any).error('Sector not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if sector is being used by any products
      const productsUsingSector = await db.Product.findAll({
        where: {
          sector_ids: {
            [Op.like]: `%${id}%`
          }
        }
      });

      if (productsUsingSector.length > 0) {
        return (res as any).error(`Cannot delete sector. It is being used by ${productsUsingSector.length} product(s)`, HttpStatusCode.BAD_REQUEST);
      }

      // Hard delete - permanently remove from database
      await sector.destroy();

      // Also hard delete all subsectors
      await db.Subsector.destroy({
        where: { sector_id: id }
      });

      res.status(200).json({
        success: true,
        message: 'Sector deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting sector:', error);
      return (res as any).error('Failed to delete sector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all subsectors for a sector
  static async getSubsectorsBySectorId(req: Request, res: Response) {
    try {
      const { sectorId } = req.params;

      const subsectors = await db.Subsector.findAll({
        where: { 
          sector_id: sectorId,
          is_active: true 
        },
        order: [['name', 'ASC']],
        include: [{
          model: db.Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Subsectors retrieved successfully',
        data: { subsectors }
      });
    } catch (error) {
      console.error('Error fetching subsectors:', error);
      return (res as any).error('Failed to fetch subsectors', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get subsector by ID
  static async getSubsectorById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subsector = await db.Subsector.findByPk(id, {
        include: [{
          model: db.Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }]
      });

      if (!subsector) {
        return (res as any).error('Subsector not found', HttpStatusCode.NOT_FOUND);
      }

      res.status(200).json({
        success: true,
        message: 'Subsector retrieved successfully',
        data: subsector
      });
    } catch (error) {
      console.error('Error fetching subsector:', error);
      return (res as any).error('Failed to fetch subsector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Get all subsectors (for frontend dropdown)
  static async getAllSubsectors(req: Request, res: Response) {
    try {
      const subsectors = await db.Subsector.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'sector_id'],
        include: [{
          model: db.Sector,
          as: 'sector',
          attributes: ['id', 'name']
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Subsectors retrieved successfully',
        data: { subsectors }
      });
    } catch (error) {
      console.error('Error fetching all subsectors:', error);
      return (res as any).error('Failed to fetch subsectors', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Create new subsector
  static async createSubsector(req: Request, res: Response) {
    try {
      const { sector_id, name } = req.body;

      if (!sector_id || !name || name.trim() === '') {
        return (res as any).error('Sector ID and subsector name are required', HttpStatusCode.BAD_REQUEST);
      }

      // Check if sector exists
      const sector = await db.Sector.findByPk(sector_id);
      if (!sector) {
        return (res as any).error('Sector not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if subsector already exists in this sector
      const existingSubsector = await db.Subsector.findOne({
        where: { 
          sector_id: sector_id,
          name: name.trim()
        }
      });

      if (existingSubsector) {
        return (res as any).error('Subsector with this name already exists in this sector', HttpStatusCode.BAD_REQUEST);
      }

      const subsector = await db.Subsector.create({
        sector_id: parseInt(sector_id),
        name: name.trim(),
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'Subsector created successfully',
        data: subsector
      });
    } catch (error) {
      console.error('Error creating subsector:', error);
      return (res as any).error('Failed to create subsector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Update subsector
  static async updateSubsector(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;

      if (!name || name.trim() === '') {
        return (res as any).error('Subsector name is required', HttpStatusCode.BAD_REQUEST);
      }

      const subsector = await db.Subsector.findByPk(id);
      if (!subsector) {
        return (res as any).error('Subsector not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if another subsector with same name exists in the same sector
      const existingSubsector = await db.Subsector.findOne({
        where: { 
          sector_id: subsector.sector_id,
          name: name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingSubsector) {
        return (res as any).error('Subsector with this name already exists in this sector', HttpStatusCode.BAD_REQUEST);
      }

      await subsector.update({
        name: name.trim(),
        is_active: is_active !== undefined ? is_active : subsector.is_active
      });

      res.status(200).json({
        success: true,
        message: 'Subsector updated successfully',
        data: subsector
      });
    } catch (error) {
      console.error('Error updating subsector:', error);
      return (res as any).error('Failed to update subsector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete subsector
  static async deleteSubsector(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subsector = await db.Subsector.findByPk(id);
      if (!subsector) {
        return (res as any).error('Subsector not found', HttpStatusCode.NOT_FOUND);
      }

      // Check if subsector is being used by any products
      const productsUsingSubsector = await db.Product.findAll({
        where: {
          subsector_ids: {
            [Op.like]: `%${id}%`
          }
        }
      });

      if (productsUsingSubsector.length > 0) {
        return (res as any).error(`Cannot delete subsector. It is being used by ${productsUsingSubsector.length} product(s)`, HttpStatusCode.BAD_REQUEST);
      }

      // Hard delete - permanently remove from database
      await subsector.destroy();

      res.status(200).json({
        success: true,
        message: 'Subsector deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subsector:', error);
      return (res as any).error('Failed to delete subsector', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
  }
}