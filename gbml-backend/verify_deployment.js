import path from 'path';
import fs from 'fs';
import { ContractFactoryService } from './src/deployment/contract-factory.service.js';

// Setup environment mock if needed
process.env.JUVIDOE_RPC_URL = 'http://localhost:8545';
process.env.TREASURY_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function run() {
  console.log('=== Artifact Verification Started ===');
  
  const factoryService = new ContractFactoryService();
  
  // Test JRC20 loader (compiled version already exists)
  try {
    const artifact = await factoryService.loadArtifact('TOKEN');
    console.log('✅ TOKEN (JRC20) artifact loaded successfully!');
    console.log(`   Contract Name: ${artifact.contractName}`);
    console.log(`   ABI length: ${artifact.abi.length} items`);
    console.log(`   Bytecode prefix: ${artifact.bytecode.substring(0, 20)}...`);
  } catch (err) {
    console.error('❌ Failed to load TOKEN artifact:', err.message);
  }

  // Test NFT, TREASURY, ROUTER template existence
  const templates = [
    { type: 'NFT', file: 'JRC721.sol' },
    { type: 'TREASURY', file: 'Treasury.sol' },
    { type: 'ROUTER', file: 'Router.sol' }
  ];

  for (const t of templates) {
    const solPath = path.join(process.cwd(), 'contracts', t.file);
    if (fs.existsSync(solPath)) {
      console.log(`✅ Template source file '${t.file}' exists at contracts/`);
    } else {
      console.error(`❌ Template source file '${t.file}' does NOT exist at contracts/`);
    }

    try {
      await factoryService.loadArtifact(t.type);
      console.log(`✅ Compiled artifact for ${t.type} found and loaded.`);
    } catch (err) {
      console.log(`⚠️ Note: ${t.type} compiled artifact not loaded: ${err.message}`);
      console.log(`   (This is normal if 'npx hardhat compile' has not been run yet in the workspace)`);
    }
  }

  console.log('=== Verification Finished ===');
}

run().catch(console.error);
