import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateProfileInfo,
  updatePrivateInfo,
  uploadAttachment,
} from '../controllers/employeeController';
import { getSalaryInfo, updateSalaryInfo, getPayrollSummary } from '../controllers/salaryController';
import { authenticateToken, requireRole, requireAdminOrSelf } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Create Employee (Admin only)
router.post('/', authenticateToken, requireRole('admin'), createEmployee);

// Get employee directory (All authenticated users)
router.get('/', authenticateToken, getEmployees);

// Get monthly payroll summary for all employees (Admin only)
router.get('/payroll/summary', authenticateToken, requireRole('admin'), getPayrollSummary);

// Get specific employee profile (Role and ownership gates handled inside)
router.get('/:id', authenticateToken, getEmployeeById);

// Update general profile tabs (Admin or Self)
router.put('/:id/profile', authenticateToken, requireAdminOrSelf(), updateProfileInfo);

// Update private info tab (Admin or Self - with admin-only field protections inside)
router.put('/:id/private-info', authenticateToken, requireAdminOrSelf(), updatePrivateInfo);

// Upload profile picture or resume (Admin or Self)
router.post('/:id/upload', authenticateToken, requireAdminOrSelf(), upload.single('file'), uploadAttachment);

// Salary Info routes (Admin or Self for GET, Admin only for PUT)
router.get('/:id/salary', authenticateToken, requireAdminOrSelf(), getSalaryInfo);
router.put('/:id/salary', authenticateToken, requireRole('admin'), updateSalaryInfo);

export default router;
