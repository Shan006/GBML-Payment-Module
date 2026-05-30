import { SettlementsService } from './settlements.service.js';
import { CreateSettlementDto } from './dto/create-settlement.dto.js';

const settlementsService = new SettlementsService();

/**
 * Create a settlement transaction request
 * POST /settlements
 */
export async function create(req, res) {
  try {
    // 1. Validate request payload
    const { isValid, errors } = CreateSettlementDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // 2. Perform settlement transaction initiation
    const dto = new CreateSettlementDto(req.body);
    const result = await settlementsService.createSettlement(dto);

    // 3. Return 201 Created with immediate processing status
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error in create settlement controller:', err);
    return res.status(500).json({
      error: 'Failed to initiate settlement',
      message: err.message
    });
  }
}

/**
 * Retrieve settlement transaction status and details
 * GET /settlements/:id
 */
export async function getById(req, res) {
  const { id } = req.params;

  try {
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'id parameter is required' });
    }

    const settlement = await settlementsService.getSettlement(id);
    if (!settlement) {
      return res.status(404).json({ error: `No settlement found with ID: ${id}` });
    }

    // Return the complete object including all DB fields
    return res.json(settlement);
  } catch (err) {
    console.error(`Error fetching settlement by ID ${id}:`, err);
    return res.status(500).json({
      error: 'Failed to retrieve settlement status',
      message: err.message
    });
  }
}
