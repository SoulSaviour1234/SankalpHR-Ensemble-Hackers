import { Router } from 'express';
import { signUpCompany, signIn, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public signup for company admin
router.post('/signup', upload.single('logo'), signUpCompany);

// Public signin
router.post('/signin', signIn);

// Private password change
router.post('/change-password', authenticateToken, changePassword);

export default router;
