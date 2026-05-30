import { v4 as uuid } from 'uuid';
import { SettlementsRepository } from './settlements.repository.js';
import { RouterService } from './router.service.js';

export class SettlementsService {
  constructor() {
    this.settlementsRepository = new SettlementsRepository();
    this.routerService = new RouterService();
  }

  /**
   * Create a settlement request, save in DB, and execute asynchronously on blockchain
   * @param {Object} dto - Validated CreateSettlementDto data
   * @returns {Promise<Object>} Immediate status response
   */
  async createSettlement(dto) {
    const { recipient, tokenAddress, amount } = dto;
    const settlementId = uuid();

    console.log(`[SettlementsService] Creating settlement ${settlementId} for recipient ${recipient}`);

    // 1. Persist initial settlement record (status: PROCESSING)
    const settlementData = {
      id: settlementId,
      recipient: recipient,
      tokenAddress: tokenAddress,
      amount: amount,
      txHash: null,
      status: 'PROCESSING'
    };

    const savedRecord = await this.settlementsRepository.save(settlementData);

    // 2. Execute blockchain transaction asynchronously in background
    // This allows the API to return the status immediately without waiting for confirmation
    this.processSettlementInBackground(settlementId, tokenAddress, recipient, amount).catch(err => {
      console.error(`[SettlementsService] Background settlement execution failed for ${settlementId}:`, err);
    });

    // 3. Return immediate response
    return {
      settlementId: savedRecord.id,
      status: savedRecord.status
    };
  }

  /**
   * Helper function executing blockchain settlement and updating the database row state
   */
  async processSettlementInBackground(id, token, recipient, amount) {
    try {
      // Execute the blockchain transaction
      const txHash = await this.routerService.settle(token, recipient, amount);
      
      // Update database record to SUCCESS
      await this.settlementsRepository.updateStatusAndHash(id, 'SUCCESS', txHash);
      console.log(`[SettlementsService] Settlement ${id} successfully confirmed on blockchain. Hash: ${txHash}`);
    } catch (err) {
      console.error(`[SettlementsService] Settlement ${id} failed on blockchain:`, err.message);
      
      // Update database record to FAILED
      try {
        await this.settlementsRepository.updateStatusAndHash(id, 'FAILED', null);
      } catch (dbErr) {
        console.error(`[SettlementsService] Failed to update failure status in database for ${id}:`, dbErr.message);
      }
    }
  }

  /**
   * Retrieve a settlement record by its ID
   * @param {string} id - Settlement ID
   * @returns {Promise<Object|null>} Mapped response object with all database fields
   */
  async getSettlement(id) {
    const settlement = await this.settlementsRepository.findById(id);
    if (!settlement) return null;
    return settlement.toResponse();
  }
}
