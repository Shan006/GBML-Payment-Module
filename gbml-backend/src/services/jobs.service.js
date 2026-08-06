import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { treasurySigner } from '../blockchain/signer.js';
import { moduleBindingService } from '../enablement/module-binding.service.js';
import { complianceService } from '../enablement/compliance.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ARTIFACTS_DIR = join(__dirname, '../../artifacts/contracts');

function loadArtifact(contractName) {
  const artifactPath = join(ARTIFACTS_DIR, `${contractName}.sol`, `${contractName}.json`);
  return JSON.parse(readFileSync(artifactPath, 'utf-8'));
}

let escrowArtifact = null;
let reputationArtifact = null;

function getEscrowArtifact() {
  if (!escrowArtifact) escrowArtifact = loadArtifact('JobBoardEscrow');
  return escrowArtifact;
}

function getReputationArtifact() {
  if (!reputationArtifact) reputationArtifact = loadArtifact('ReputationLedger');
  return reputationArtifact;
}

export class JobsService {
  getModuleBindings(moduleId) {
    const bindings = moduleBindingService.getBindings(moduleId);
    if (!bindings) {
      throw new Error(`Module ${moduleId} not deployed or not found. Enable it first.`);
    }
    return bindings;
  }

  getContractByType(moduleId, contractType) {
    const bindings = this.getModuleBindings(moduleId);
    const contract = bindings.contracts.find(
      c => c.contractType?.toUpperCase() === contractType?.toUpperCase()
    );
    if (!contract) {
      throw new Error(`No ${contractType} contract found in module ${moduleId}`);
    }
    return contract;
  }

  getEscrowContract(moduleId) {
    const contract = this.getContractByType(moduleId, 'JOB_ESCROW');
    return new ethers.Contract(contract.contractAddress, getEscrowArtifact().abi, treasurySigner);
  }

  getReputationContract(moduleId) {
    const contract = this.getContractByType(moduleId, 'REPUTATION');
    return new ethers.Contract(contract.contractAddress, getReputationArtifact().abi, treasurySigner);
  }

  async createJob(moduleId, { employerAddress, budget, metadataUri }) {
    const escrow = this.getEscrowContract(moduleId);

    const tx = await escrow.createJob(budget, metadataUri);
    const receipt = await tx.wait();

    const jobCreatedLog = receipt.logs.find(log => {
      try {
        const parsed = escrow.interface.parseLog(log);
        return parsed?.name === 'JobCreated';
      } catch { return false; }
    });

    const jobId = jobCreatedLog
      ? jobCreatedLog.args[0].toString()
      : (await escrow.jobCount()).toString();

    return {
      jobId,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      employerAddress,
      budget: budget.toString(),
      metadataUri
    };
  }

  async assignJob(moduleId, jobId, freelancerAddress) {
    const escrow = this.getEscrowContract(moduleId);

    const job = await escrow.getJob(jobId);
    if (job.status !== 0) {
      throw new Error(`Job ${jobId} is not open. Current status: ${job.status}`);
    }

    const tx = await escrow.assignJob(jobId);
    const receipt = await tx.wait();

    return {
      jobId: jobId.toString(),
      freelancerAddress,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'ASSIGNED'
    };
  }

  async completeJob(moduleId, jobId, employerAddress) {
    const escrow = this.getEscrowContract(moduleId);

    const job = await escrow.getJob(jobId);
    if (job.status !== 1) {
      throw new Error(`Job ${jobId} is not assigned. Current status: ${job.status}`);
    }
    if (job.employer.toLowerCase() !== employerAddress.toLowerCase()) {
      throw new Error('Only the employer can mark a job as complete');
    }

    const tx = await escrow.completeJob(jobId);
    const receipt = await tx.wait();

    return {
      jobId: jobId.toString(),
      freelancerAddress: job.freelancer,
      amount: job.budget.toString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'COMPLETED'
    };
  }

  async cancelJob(moduleId, jobId, callerAddress) {
    const escrow = this.getEscrowContract(moduleId);

    const job = await escrow.getJob(jobId);
    if (job.status > 1) {
      throw new Error(`Job ${jobId} cannot be cancelled. Current status: ${job.status}`);
    }

    const tx = await escrow.cancelJob(jobId);
    const receipt = await tx.wait();

    return {
      jobId: jobId.toString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'CANCELLED'
    };
  }

  async raiseDispute(moduleId, jobId, reason) {
    const escrow = this.getEscrowContract(moduleId);

    const job = await escrow.getJob(jobId);
    if (job.status !== 1 && job.status !== 2) {
      throw new Error(`Job ${jobId} cannot be disputed. Current status: ${job.status}`);
    }

    const tx = await escrow.raiseDispute(jobId, reason);
    const receipt = await tx.wait();

    return {
      jobId: jobId.toString(),
      reason,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'DISPUTED'
    };
  }

  async resolveDispute(moduleId, jobId, winnerAddress) {
    const escrow = this.getEscrowContract(moduleId);

    const job = await escrow.getJob(jobId);
    if (job.status !== 3) {
      throw new Error(`Job ${jobId} is not disputed. Current status: ${job.status}`);
    }

    const tx = await escrow.resolveDispute(jobId, winnerAddress);
    const receipt = await tx.wait();

    return {
      jobId: jobId.toString(),
      winner: winnerAddress,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: 'RESOLVED'
    };
  }

  async getJob(moduleId, jobId) {
    const escrow = this.getEscrowContract(moduleId);
    const job = await escrow.getJob(jobId);

    const statusMap = ['OPEN', 'ASSIGNED', 'COMPLETED', 'DISPUTED', 'RESOLVED', 'CANCELLED'];

    return {
      jobId: job.id.toString(),
      employer: job.employer,
      freelancer: job.freelancer,
      budget: job.budget.toString(),
      status: statusMap[job.status] || 'UNKNOWN',
      metadataUri: job.metadataUri,
      createdAt: new Date(Number(job.createdAt) * 1000).toISOString(),
      winner: job.winner
    };
  }

  async getEscrowBalance(moduleId) {
    const escrow = this.getEscrowContract(moduleId);
    const balance = await escrow.getEscrowBalance();
    return balance.toString();
  }

  async rateUser(moduleId, targetAddress, score, review) {
    if (score < 1 || score > 5) {
      throw new Error('Score must be between 1 and 5');
    }

    const reputation = this.getReputationContract(moduleId);
    const tx = await reputation.rate(targetAddress, score, review);
    const receipt = await tx.wait();

    const rep = await reputation.getReputation(targetAddress);

    return {
      targetAddress,
      score,
      review,
      averageScore: rep.averageScore.toString(),
      totalRatings: rep.count.toString(),
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  async batchRateUsers(moduleId, ratings) {
    const reputation = this.getReputationContract(moduleId);

    const targets = ratings.map(r => r.targetAddress);
    const scores = ratings.map(r => r.score);
    const reviews = ratings.map(r => r.review || '');

    const tx = await reputation.batchRate(targets, scores, reviews);
    const receipt = await tx.wait();

    return {
      count: ratings.length,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  async getUserReputation(moduleId, targetAddress) {
    const reputation = this.getReputationContract(moduleId);
    const rep = await reputation.getReputation(targetAddress);

    return {
      targetAddress,
      totalScore: rep.totalScore.toString(),
      count: rep.count.toString(),
      averageScore: rep.averageScore.toString()
    };
  }

  async getRatingsHistory(moduleId, targetAddress, offset = 0, limit = 20) {
    const reputation = this.getReputationContract(moduleId);
    const ratings = await reputation.getRatingsPaginated(targetAddress, offset, limit);
    const totalCount = await reputation.getRatingsCount(targetAddress);

    return {
      targetAddress,
      ratings: ratings.map(r => ({
        score: r.score.toString(),
        review: r.review,
        timestamp: new Date(Number(r.timestamp) * 1000).toISOString(),
        rater: r.rater,
        target: r.target
      })),
      offset,
      limit,
      totalCount: totalCount.toString()
    };
  }

  async getModuleStats(moduleId) {
    const escrowContract = this.getContractByType(moduleId, 'JOB_ESCROW');
    const repContract = this.getContractByType(moduleId, 'REPUTATION');

    const escrow = this.getEscrowContract(moduleId);
    const reputation = this.getReputationContract(moduleId);

    const [jobCount, escrowBalance, totalRatings] = await Promise.all([
      escrow.jobCount(),
      escrow.getEscrowBalance(),
      reputation.totalRatings()
    ]);

    return {
      moduleId,
      totalJobs: jobCount.toString(),
      escrowBalance: escrowBalance.toString(),
      totalRatings: totalRatings.toString(),
      escrowAddress: escrowContract.contractAddress,
      reputationAddress: repContract.contractAddress
    };
  }
}
