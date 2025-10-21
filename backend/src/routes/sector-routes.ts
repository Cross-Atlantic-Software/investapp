import { Router } from 'express';
import { SectorManagementController } from '../controllers/admin/sectorManagement';

const router = Router();

// Sector Management routes
router.get("/sectors", SectorManagementController.getAllSectors);
router.post("/sectors", SectorManagementController.createSector);
router.put("/sectors/:id", SectorManagementController.updateSector);
router.delete("/sectors/:id", SectorManagementController.deleteSector);

// Subsector Management routes
router.get("/sectors/:sectorId/subsectors", SectorManagementController.getSubsectorsBySectorId);
router.post("/subsectors", SectorManagementController.createSubsector);
router.put("/subsectors/:id", SectorManagementController.updateSubsector);
router.delete("/subsectors/:id", SectorManagementController.deleteSubsector);

export default router;
