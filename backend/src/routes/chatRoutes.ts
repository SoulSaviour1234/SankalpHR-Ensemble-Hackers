import { Router } from 'express';
import { handleChat } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, handleChat);

export default router;
