import { Router } from 'express';
import { profile, info } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/profile', authMiddleware, profile);
router.get('/info', info);

export default router;
