import { Router } from 'express';
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiryStats,
} from '../controllers/enquiries/enquiryController';
import authenticateToken from '../utils/middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/', createEnquiry); // Submit enquiry from contact form

// Protected routes (admin only)
router.get('/stats', authenticateToken, getEnquiryStats); // Get enquiry statistics
router.get('/', authenticateToken, getAllEnquiries); // Get all enquiries with pagination
router.get('/:id', authenticateToken, getEnquiryById); // Get enquiry by ID
router.patch('/:id/status', authenticateToken, updateEnquiryStatus); // Update enquiry status
router.delete('/:id', authenticateToken, deleteEnquiry); // Delete enquiry

export default router;
