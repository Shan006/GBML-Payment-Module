import { EnablementService } from './enablement.service.js';
import { EnableBlockchainDto } from './dto/enable-blockchain.dto.js';

const enablementService = new EnablementService();

/**
 * Enable blockchain for an existing service module
 * POST /enable-blockchain
 */
export async function enableBlockchain(req, res) {
  try {
    // 1. Validate request payload
    const { isValid, errors } = EnableBlockchainDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // 2. Perform blockchain enablement (deployment + database mapping save)
    const dto = new EnableBlockchainDto(req.body);
    const result = await enablementService.enableBlockchain(dto);

    // 3. Return response with 201 Created
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error in enablement controller:', err);
    return res.status(500).json({
      error: 'Failed to enable blockchain',
      message: err.message
    });
  }
}
