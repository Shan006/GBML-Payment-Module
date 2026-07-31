import hre from "hardhat";
import { ContractsService } from '../src/contracts/contracts.service.js';
import { CreateContractDto } from '../src/contracts/dto/create-contract.dto.js';
import { config } from '../src/config/env.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log("🚀 Deploying JVD Router contract...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    try {
        // Deploy JVD Router
        console.log("\n📝 Deploying JvdEgcrRouter contract...");
        const JvdRouter = await hre.ethers.getContractFactory("JvdEgcrRouter");
        const router = await JvdRouter.deploy();
        await router.waitForDeployment();
        
        const routerAddress = await router.getAddress();
        console.log("✅ JVD Router deployed to:", routerAddress);

        // Get the deployment transaction hash
        const deploymentTx = router.deploymentTransaction();
        console.log("📋 Transaction hash:", deploymentTx.hash);

        // Register in database
        console.log("\n💾 Registering JVD Router in database...");
        const contractsService = new ContractsService();
        
        // Get the ABI from the artifact
        const artifact = await hre.artifacts.readArtifact("JvdEgcrRouter");
        
        const contractDto = new CreateContractDto({
            serviceId: 'JVD_ROUTER',
            contractName: 'JvdRouter',
            contractType: 'JVD_ROUTER',
            contractAddress: routerAddress,
            abi: artifact.abi
        });

        // Validate
        const validation = CreateContractDto.validate(contractDto);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Register
        await contractsService.createContract(contractDto);
        console.log("✅ JVD Router registered in database successfully!");

        // Verify
        const verification = await contractsService.getContractByServiceId('JVD_ROUTER');
        console.log("\n🔍 Verification successful:");
        console.log("   Service ID:", verification.serviceId);
        console.log("   Address:", verification.contractAddress);

        console.log("\n🎉 JVD Router deployment and registration complete!");
        console.log("\n⚠️  IMPORTANT: Update your environment variables if needed:");
        console.log(`   JVD_ROUTER_ADDRESS=${routerAddress}`);

    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error(error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });