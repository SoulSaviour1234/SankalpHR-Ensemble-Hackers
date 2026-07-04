import { Router } from 'express';
import { checkIn, checkOut, getOwnAttendance, getAllAttendance } from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Check in (All authenticated)
router.post('/checkin', authenticateToken, checkIn);

// Check out (All authenticated)
router.post('/checkout', authenticateToken, checkOut);

// Get own monthly logs (All authenticated)
router.get('/my-logs', authenticateToken, getOwnAttendance);

// Get all employee logs for a day (Admin only)
router.get('/all-logs', authenticateToken, requireRole('admin'), getAllAttendance);

export default router;
