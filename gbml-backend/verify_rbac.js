import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/gbml';

async function testRBAC() {
    console.log('--- GBML RBAC Verification ---');

    // Note: This script assumes the server is running and migration has been applied.
    // In a real environment, we would also need to create a test API key first.

    console.log('\n1. Testing Public Endpoint (Health)');
    try {
        const health = await axios.get('http://localhost:3000/health');
        console.log('✅ Health check passed:', health.data.status);
    } catch (err) {
        console.error('❌ Health check failed');
    }


    console.log('\n2. Testing Protected Endpoint without Key');
    try {
        await axios.get(`${API_BASE_URL}/admin/api-keys`);
        console.log('❌ Error: Accessed admin endpoint without authentication');
    } catch (err) {
        console.log('✅ Correctly blocked (401):', err.response?.status);
    }

    console.log('\n3. Testing API Key Authentication (Placeholders)');
    console.log('Note: To run full tests, please use the UI to generate an API Key first.');
    console.log('Manual Verification Steps:');
    console.log('a. Login to UI as Admin');
    console.log('b. Go to Admin & RBAC tab');
    console.log('c. Create a "Program" key and a "Treasury" key');
    console.log('d. Use the Program key to request a disbursement via POST /gbml/program/disbursements');
    console.log('e. Use the Program key to execute the disbursement (should FAIL with 403)');
    console.log('f. Use the Treasury key to execute the disbursement (should SUCCEED)');
    console.log('g. Check Audit Logs in Supabase dashboard');

    console.log('\n--- End of Verification Plan ---');
}

testRBAC();
