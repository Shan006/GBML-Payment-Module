import { ContractsService } from './contracts.service.js';
import { CreateContractDto } from './dto/create-contract.dto.js';

const contractsService = new ContractsService();

/**
 * Register a new deployed contract
 * POST /contracts  or  POST /gbml/contracts
 */
export async function register(req, res) {
  try {
    // Validate incoming payload
    const { isValid, errors } = CreateContractDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const dto = new CreateContractDto(req.body);
    const contract = await contractsService.createContract(dto);

    return res.status(201).json(contract);
  } catch (err) {
    // Handle duplicate address (unique constraint violation from Supabase/Postgres)
    if (err.code === '23505' || (err.message && err.message.includes('duplicate key'))) {
      return res.status(409).json({
        error: 'Conflict',
        message: `A contract with address '${req.body.contractAddress}' is already registered`
      });
    }

    console.error('Error registering contract:', err);
    return res.status(500).json({ error: 'Failed to register contract', message: err.message });
  }
}

/**
 * Get a contract by its blockchain address
 * GET /contracts/:address  or  GET /gbml/contracts/:address
 */
export async function getByAddress(req, res) {
  const { address } = req.params;

  try {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid contract address format' });
    }

    const contract = await contractsService.getContractByAddress(address);
    if (!contract) {
      return res.status(404).json({ error: `No contract found with address: ${address}` });
    }

    return res.json(contract);
  } catch (err) {
    console.error(`Error fetching contract by address ${address}:`, err);
    return res.status(500).json({ error: 'Failed to retrieve contract', message: err.message });
  }
}

/**
 * Get the latest contract registered for a given service ID
 * GET /contracts/service/:serviceId  or  GET /gbml/contracts/service/:serviceId
 */
export async function getByService(req, res) {
  const { serviceId } = req.params;

  try {
    if (!serviceId || serviceId.trim() === '') {
      return res.status(400).json({ error: 'serviceId parameter is required' });
    }

    const contract = await contractsService.getContractByServiceId(serviceId);
    if (!contract) {
      return res.status(404).json({ error: `No contract found for service: ${serviceId}` });
    }

    return res.json(contract);
  } catch (err) {
    console.error(`Error fetching contract by service ${serviceId}:`, err);
    return res.status(500).json({ error: 'Failed to retrieve contract', message: err.message });
  }
}

/**
 * List all registered contracts (admin only)
 * GET /contracts  or  GET /gbml/contracts
 */
export async function listAll(req, res) {
  try {
    const contracts = await contractsService.listContracts();
    return res.json(contracts);
  } catch (err) {
    console.error('Error listing contracts:', err);
    return res.status(500).json({ error: 'Failed to list contracts', message: err.message });
  }
}
