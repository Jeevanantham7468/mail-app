import express from 'express';
import {
  sendBulkMail,
  getMailHistory,
  getMailById,
  deleteMailLog,
  verifySmtp,
  getStats
} from '../controllers/mailController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/send', optionalAuth, sendBulkMail);
router.get('/history', optionalAuth, getMailHistory);
router.get('/history/:id', optionalAuth, getMailById);
router.delete('/history/:id', optionalAuth, deleteMailLog);
router.post('/verify-smtp', verifySmtp);
router.get('/stats', getStats);

export default router;
