import { login, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { Router } from 'express';
const router = Router();
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
export default router;