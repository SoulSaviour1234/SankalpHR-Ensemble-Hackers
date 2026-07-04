import { Router } from 'express';
import {
  getTimeOffRequests,
  getTimeOffAllocations,
  createTimeOffRequest,
  approveOrRejectRequest,
} from '../controllers/timeOffController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Get requests list (role-filtered)
router.get('/requests', authenticateToken, getTimeOffRequests);

// Get allocation balances summary
router.get('/allocations', authenticateToken, getTimeOffAllocations);

// Submit new time-off request (supports optional certificate upload)
router.post('/requests', authenticateToken, upload.single('attachment'), createTimeOffRequest);

// Approve or reject request (Admin only)
router.put('/requests/:id/status', authenticateToken, requireRole('admin'), approveOrRejectRequest);

export default router;
