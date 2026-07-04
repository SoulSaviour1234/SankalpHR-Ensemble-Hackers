import { Router } from 'express';
import { signUpEmployee, signIn, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public signup for employee
router.post('/signup', upload.none(), signUpEmployee);

// Public signin
router.post('/signin', signIn);

// Private password change
router.post('/change-password', authenticateToken, changePassword);

export default router;
