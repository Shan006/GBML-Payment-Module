import express from 'express';
import {
  createJob, assignJob, completeJob, cancelJob,
  raiseDispute, resolveDispute, getJob, getEscrowBalance,
  rateUser, batchRateUsers, getUserReputation, getRatingsHistory,
  getModuleStats
} from '../controllers/jobs.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/jobs/:moduleId/create', authenticate, authorize(['admin', 'TREASURY']), createJob);
router.post('/jobs/:moduleId/:jobId/assign', authenticate, assignJob);
router.post('/jobs/:moduleId/:jobId/complete', authenticate, authorize(['admin', 'TREASURY']), completeJob);
router.post('/jobs/:moduleId/:jobId/cancel', authenticate, authorize(['admin', 'TREASURY']), cancelJob);
router.post('/jobs/:moduleId/:jobId/dispute', authenticate, raiseDispute);
router.post('/jobs/:moduleId/:jobId/resolve', authenticate, authorize(['admin']), resolveDispute);

router.get('/jobs/:moduleId/:jobId', authenticate, getJob);
router.get('/jobs/:moduleId/stats', authenticate, getModuleStats);
router.get('/jobs/:moduleId/escrow-balance', authenticate, getEscrowBalance);

router.post('/reputation/:moduleId/rate', authenticate, rateUser);
router.post('/reputation/:moduleId/batch-rate', authenticate, authorize(['admin']), batchRateUsers);
router.get('/reputation/:moduleId/:address', authenticate, getUserReputation);
router.get('/reputation/:moduleId/:address/ratings', authenticate, getRatingsHistory);

export default router;
