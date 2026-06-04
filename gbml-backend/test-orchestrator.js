/**
 * Test script for GBML Blockchain Orchestrator
 * 
 * This script demonstrates the complete enablement flow:
 * 1. Enable blockchain for a FUND module
 * 2. Check module status
 * 3. List all enabled modules
 * 4. Get statistics
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

async function testOrchestrator() {
  console.log('🚀 Testing GBML Blockchain Orchestrator\n');

  try {
    // Test 1: Enable blockchain for a FUND module
    console.log('📝 Test 1: Enable blockchain for FUND module');
    const enableResponse = await client.post('/gbml/enable-blockchain', {
      moduleId: 'fund-001',
      moduleType: 'FUND'
    });
    console.log('✅ Enablement successful:');
    console.log(JSON.stringify(enableResponse.data, null, 2));
    console.log('');

    // Test 2: Try to enable the same module again (should return already enabled)
    console.log('📝 Test 2: Try to enable same module again');
    const enableAgainResponse = await client.post('/gbml/enable-blockchain', {
      moduleId: 'fund-001',
      moduleType: 'FUND'
    });
    console.log('✅ Response:');
    console.log(JSON.stringify(enableAgainResponse.data, null, 2));
    console.log('');

    // Test 3: Get module status
    console.log('📝 Test 3: Get module status');
    const statusResponse = await client.get('/gbml/blockchain-modules/fund-001');
    console.log('✅ Module status:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    // Test 4: Enable blockchain for a TREASURY module
    console.log('📝 Test 4: Enable blockchain for TREASURY module');
    const treasuryResponse = await client.post('/gbml/enable-blockchain', {
      moduleId: 'treasury-001',
      moduleType: 'TREASURY'
    });
    console.log('✅ Treasury enablement successful:');
    console.log(JSON.stringify(treasuryResponse.data, null, 2));
    console.log('');

    // Test 5: List all enabled modules
    console.log('📝 Test 5: List all enabled modules');
    const listResponse = await client.get('/gbml/blockchain-modules');
    console.log('✅ Enabled modules:');
    console.log(JSON.stringify(listResponse.data, null, 2));
    console.log('');

    // Test 6: Get statistics
    console.log('📝 Test 6: Get enablement statistics');
    const statsResponse = await client.get('/gbml/blockchain-modules/stats');
    console.log('✅ Statistics:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');

    // Test 7: Filter modules by type
    console.log('📝 Test 7: Filter modules by type (FUND)');
    const filterResponse = await client.get('/gbml/blockchain-modules?moduleType=FUND');
    console.log('✅ FUND modules:');
    console.log(JSON.stringify(filterResponse.data, null, 2));
    console.log('');

    // Test 8: Update module services
    console.log('📝 Test 8: Update module services');
    const updateResponse = await client.patch('/gbml/blockchain-modules/fund-001/services', {
      settlementEnabled: true,
      conversionEnabled: true
    });
    console.log('✅ Services updated:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run tests
testOrchestrator();
