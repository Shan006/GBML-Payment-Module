import { DisbursementService } from '../services/disbursement.service.js';

export const requestDisbursement = async (req, res) => {
    try {
        const identity = req.apiKeyIdentity || { id: req.user.id, tenantId: req.tenantId || 'default' };
        const { amount, tokenAddress, recipientAddress, reason } = req.body;
        const tenantId = req.apiKeyIdentity?.tenantId || req.body.tenantId || 'default';

        const request = await DisbursementService.requestDisbursement({
            tenantId,
            amount,
            tokenAddress,
            recipientAddress,
            reason
        }, identity);

        res.status(201).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const executeDisbursement = async (req, res) => {
    try {
        const identity = req.apiKeyIdentity || { id: req.user.id, tenantId: req.tenantId || 'default' };
        const { requestId } = req.params;

        const updatedRequest = await DisbursementService.executeDisbursement(requestId, identity);

        res.json({
            success: true,
            data: updatedRequest
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const listDisbursements = async (req, res) => {
    try {
        const tenantId = req.apiKeyIdentity?.tenantId || req.query.tenantId || 'default';
        const { status } = req.query;

        const requests = await DisbursementService.listRequests(tenantId, status);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
