import { DeploymentService } from './deployment.service.js';
import { DeployContractDto } from './dto/deploy-contract.dto.js';

const deploymentService = new DeploymentService();

/**
 * Deploy a smart contract template and register it in the registry
 * POST /deploy
 */
export async function deploy(req, res) {
  try {
    // 1. Validate request payload
    const { isValid, errors } = DeployContractDto.validate(req.body);
    if (!isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // 2. Perform deployment and registration
    const dto = new DeployContractDto(req.body);
    const result = await deploymentService.deploy(dto);

    // 3. Return results with status 201 Created
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error in deployment controller:', err);
    return res.status(500).json({
      error: 'Failed to deploy contract',
      message: err.message
    });
  }
}
