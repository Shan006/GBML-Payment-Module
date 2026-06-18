import { JobsService } from '../services/jobs.service.js';

const jobsService = new JobsService();

export async function createJob(req, res) {
  try {
    const { moduleId } = req.params;
    const { employerAddress, budget, metadataUri } = req.body;

    if (!employerAddress || !budget || !metadataUri) {
      return res.status(400).json({ error: 'employerAddress, budget, and metadataUri are required' });
    }

    const result = await jobsService.createJob(moduleId, { employerAddress, budget, metadataUri });
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error creating job:', err);
    return res.status(500).json({ error: 'Failed to create job', message: err.message });
  }
}

export async function assignJob(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const { freelancerAddress } = req.body;

    if (!freelancerAddress) {
      return res.status(400).json({ error: 'freelancerAddress is required' });
    }

    const result = await jobsService.assignJob(moduleId, jobId, freelancerAddress);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error assigning job:', err);
    const status = err.message.includes('not open') ? 409 : 500;
    return res.status(status).json({ error: 'Failed to assign job', message: err.message });
  }
}

export async function completeJob(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const { employerAddress } = req.body;

    if (!employerAddress) {
      return res.status(400).json({ error: 'employerAddress is required' });
    }

    const result = await jobsService.completeJob(moduleId, jobId, employerAddress);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error completing job:', err);
    const status = err.message.includes('not assigned') || err.message.includes('employer') ? 403 : 500;
    return res.status(status).json({ error: 'Failed to complete job', message: err.message });
  }
}

export async function cancelJob(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const { callerAddress } = req.body;

    if (!callerAddress) {
      return res.status(400).json({ error: 'callerAddress is required' });
    }

    const result = await jobsService.cancelJob(moduleId, jobId, callerAddress);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error cancelling job:', err);
    return res.status(500).json({ error: 'Failed to cancel job', message: err.message });
  }
}

export async function raiseDispute(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'reason is required for dispute' });
    }

    const result = await jobsService.raiseDispute(moduleId, jobId, reason);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error raising dispute:', err);
    return res.status(500).json({ error: 'Failed to raise dispute', message: err.message });
  }
}

export async function resolveDispute(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const { winnerAddress } = req.body;

    if (!winnerAddress) {
      return res.status(400).json({ error: 'winnerAddress is required' });
    }

    const result = await jobsService.resolveDispute(moduleId, jobId, winnerAddress);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error resolving dispute:', err);
    return res.status(500).json({ error: 'Failed to resolve dispute', message: err.message });
  }
}

export async function getJob(req, res) {
  try {
    const { moduleId, jobId } = req.params;
    const result = await jobsService.getJob(moduleId, jobId);
    return res.json({ success: true, job: result });
  } catch (err) {
    console.error('[JobsController] Error getting job:', err);
    return res.status(500).json({ error: 'Failed to get job', message: err.message });
  }
}

export async function getEscrowBalance(req, res) {
  try {
    const { moduleId } = req.params;
    const balance = await jobsService.getEscrowBalance(moduleId);
    return res.json({ success: true, moduleId, escrowBalance: balance });
  } catch (err) {
    console.error('[JobsController] Error getting escrow balance:', err);
    return res.status(500).json({ error: 'Failed to get escrow balance', message: err.message });
  }
}

export async function rateUser(req, res) {
  try {
    const { moduleId } = req.params;
    const { targetAddress, score, review } = req.body;

    if (!targetAddress || score === undefined) {
      return res.status(400).json({ error: 'targetAddress and score are required' });
    }

    const result = await jobsService.rateUser(moduleId, targetAddress, score, review || '');
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error rating user:', err);
    return res.status(500).json({ error: 'Failed to rate user', message: err.message });
  }
}

export async function batchRateUsers(req, res) {
  try {
    const { moduleId } = req.params;
    const { ratings } = req.body;

    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'ratings array is required and must not be empty' });
    }

    const result = await jobsService.batchRateUsers(moduleId, ratings);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error batch rating users:', err);
    return res.status(500).json({ error: 'Failed to batch rate users', message: err.message });
  }
}

export async function getUserReputation(req, res) {
  try {
    const { moduleId, address } = req.params;
    const result = await jobsService.getUserReputation(moduleId, address);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error getting user reputation:', err);
    return res.status(500).json({ error: 'Failed to get reputation', message: err.message });
  }
}

export async function getRatingsHistory(req, res) {
  try {
    const { moduleId, address } = req.params;
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const result = await jobsService.getRatingsHistory(moduleId, address, offset, limit);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error getting ratings history:', err);
    return res.status(500).json({ error: 'Failed to get ratings', message: err.message });
  }
}

export async function getModuleStats(req, res) {
  try {
    const { moduleId } = req.params;
    const result = await jobsService.getModuleStats(moduleId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[JobsController] Error getting module stats:', err);
    return res.status(500).json({ error: 'Failed to get module stats', message: err.message });
  }
}
