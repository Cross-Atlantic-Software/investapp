import { Router } from 'express';
import { createSubscriber } from '../controllers/subscribers/subscriberController';

const router = Router();

// Public route (no authentication required)
router.post('/', createSubscriber); // Subscribe to newsletter

export default router;
