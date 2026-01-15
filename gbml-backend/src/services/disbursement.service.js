import { supabase } from '../config/supabase.js';
import { sendPayment } from './router.service.js';
import { logAudit } from './audit.service.js';
import { isPaused } from './pause.service.js';

/**
 * Service to handle Program Disbursements
 */
export class DisbursementService {
    /**
     * Request a disbursement (PROGRAM role)
     * @param {Object} data - Request data
     * @param {Object} identity - Requester identity
     */
    static async requestDisbursement(data, identity) {
        const { tenantId, amount, tokenAddress, recipientAddress, reason } = data;

        // Check if system-wide or token-level pause is active
        if (await isPaused('GLOBAL') || await isPaused('TOKEN', tokenAddress)) {
            throw new Error('Disbursements are currently paused due to security/compliance.');
        }

        const { data: request, error } = await supabase
            .from('disbursement_requests')
            .insert([
                {
                    tenant_id: tenantId,
                    amount,
                    token_address: tokenAddress,
                    recipient_address: recipientAddress,
                    reason,
                    requested_by_api_key: identity.id,
                    status: 'PENDING'
                }
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create disbursement request: ${error.message}`);
        }

        await logAudit({
            action: 'DISBURSEMENT_REQUEST',
            resource: 'PROGRAM',
            payload: request,
            tenantId: tenantId
        }, identity);

        return request;
    }

    /**
     * Execute/Approve a disbursement (TREASURY role)
     * @param {string} requestId - The ID of the request
     * @param {Object} identity - Executor identity
     */
    static async executeDisbursement(requestId, identity) {
        // 1. Fetch request
        const { data: request, error: fetchError } = await supabase
            .from('disbursement_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) {
            throw new Error('Disbursement request not found');
        }

        if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
            throw new Error(`Cannot execute request in ${request.status} status`);
        }

        // 2. Check if paused
        if (await isPaused('GLOBAL') || await isPaused('TOKEN', request.token_address)) {
            throw new Error('Disbursements are currently paused.');
        }

        try {
            // 3. Execute on blockchain (using router service)
            // Note: tokenDecimals should be fetched from token metadata or passed
            // For now assuming 18 or passed in payload if needed. 
            // Let's assume we fetch it or it's standard for the token.

            // Update status to PROCESSING
            await supabase
                .from('disbursement_requests')
                .update({ status: 'APPROVED' }) // Using APPROVED as intermediate or just execute
                .eq('id', requestId);

            const receipt = await sendPayment(
                request.token_address,
                request.recipient_address,
                request.amount,
                18 // Defaulting to 18 for now, should be dynamic
            );

            // 4. Update request status
            const { data: updatedRequest, error: updateError } = await supabase
                .from('disbursement_requests')
                .update({
                    status: 'EXECUTED',
                    executed_by_api_key: identity.id,
                    blockchain_tx_hash: receipt.hash,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select()
                .single();

            await logAudit({
                action: 'DISBURSEMENT_EXECUTE',
                resource: 'TREASURY',
                payload: { requestId, txHash: receipt.hash },
                tenantId: request.tenant_id
            }, identity);

            return updatedRequest;
        } catch (error) {
            console.error('Disbursement execution failed:', error);

            await supabase
                .from('disbursement_requests')
                .update({
                    status: 'FAILED',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId);

            await logError({
                error: error.message,
                resource: 'TREASURY',
                context: { requestId, action: 'DISBURSEMENT_EXECUTE' },
                tenantId: request.tenant_id
            }, identity);

            throw error;
        }
    }

    /**
     * List disbursement requests
     */
    static async listRequests(tenantId, status) {
        let query = supabase
            .from('disbursement_requests')
            .select('*')
            .eq('tenant_id', tenantId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
}
