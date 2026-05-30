import { supabase } from './src/config/supabase.js';
import { EnablementRepository } from './src/enablement/enablement.repository.js';
import { v4 as uuid } from 'uuid';

async function run() {
  console.log('=== Blockchain Enablement Verification Started ===');

  const repo = new EnablementRepository();
  const testId = uuid();
  const testServiceId = `verify_fund_${Math.floor(Math.random() * 1000)}`;
  const testAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  console.log(`Using Test serviceId: ${testServiceId}`);
  console.log(`Using Test address: ${testAddress}`);

  try {
    // 1. Try to save mapping in public.blockchain_modules table
    const result = await repo.save({
      id: testId,
      serviceId: testServiceId,
      moduleType: 'TREASURY',
      contractAddress: testAddress,
      blockchainEnabled: true
    });

    console.log('✅ Successfully inserted record into blockchain_modules table!');
    console.log('   Saved Record details:', JSON.stringify(result.toResponse(), null, 2));

    // 2. Fetch record from DB to verify
    const fetched = await repo.findByAddress(testAddress);
    if (fetched && fetched.serviceId === testServiceId) {
      console.log('✅ Successfully retrieved record by contract address!');
    } else {
      console.error('❌ Retrieved record does not match the inserted record.');
    }

    // 3. Fetch record by service ID and type to verify listing
    const listed = await repo.findByServiceIdAndType(testServiceId, 'TREASURY');
    if (listed && listed.length > 0 && listed[0].contractAddress === testAddress.toLowerCase()) {
      console.log('✅ Successfully retrieved record list by service ID and module type!');
    } else {
      console.error('❌ Failed to retrieve correct records by service ID.');
    }

    // Cleanup after test run
    console.log('Cleaning up verification record...');
    const { error: deleteErr } = await supabase
      .from('blockchain_modules')
      .delete()
      .eq('id', testId);

    if (deleteErr) {
      console.error('⚠️ Note: Cleanup failed (not fatal):', deleteErr.message);
    } else {
      console.log('✅ Verification record cleaned up successfully.');
    }

  } catch (err) {
    console.error('❌ Verification failed:');
    console.error('   Error details:', err.message);
    console.log('\n⚠️ Please ensure you have run the migration in Supabase SQL editor:');
    console.log('   File path: migration_blockchain_modules.sql');
  }

  console.log('=== Verification Finished ===');
}

run().catch(console.error);
