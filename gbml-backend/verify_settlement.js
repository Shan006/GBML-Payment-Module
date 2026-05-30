import { supabase } from './src/config/supabase.js';
import { SettlementsRepository } from './src/settlements/settlements.repository.js';
import { RouterService } from './src/settlements/router.service.js';
import { v4 as uuid } from 'uuid';

async function run() {
  console.log('=== JVD Router & Settlements Verification Started ===');

  const repo = new SettlementsRepository();
  const routerService = new RouterService();
  const testId = uuid();
  const testRecipient = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
  const testToken = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const testAmount = 500;

  try {
    // 1. Try to test JvdRouter auto-deployment check function
    console.log('Checking router deployment...');
    const routerAddress = await routerService.checkAndDeployRouter();
    if (routerAddress) {
      console.log(`✅ JvdRouter resolved at: ${routerAddress}`);
    } else {
      console.log('⚠️ JvdRouter check completed without address (this is normal if Hardhat node is offline)');
    }

    // 2. Try to insert record into settlements database table
    console.log('Inserting verification record in database...');
    const saved = await repo.save({
      id: testId,
      recipient: testRecipient,
      tokenAddress: testToken,
      amount: testAmount,
      txHash: null,
      status: 'PROCESSING'
    });

    console.log('✅ Successfully inserted record in settlements table!');
    console.log('   Saved details:', JSON.stringify(saved.toResponse(), null, 2));

    // 3. Verify querying database record by ID
    const fetched = await repo.findById(testId);
    if (fetched && fetched.status === 'PROCESSING') {
      console.log('✅ Successfully fetched record by ID!');
      console.log('   Fetched status:', fetched.status);
    } else {
      console.error('❌ Failed to fetch correct record by ID.');
    }

    // 4. Test updating status and tx hash
    const fakeHash = '0x' + 'a'.repeat(64);
    const updated = await repo.updateStatusAndHash(testId, 'SUCCESS', fakeHash);
    if (updated && updated.status === 'SUCCESS' && updated.txHash === fakeHash) {
      console.log('✅ Successfully updated record status and transaction hash!');
    } else {
      console.error('❌ Failed to update status/hash correctly.');
    }

    // Cleanup after test run
    console.log('Cleaning up verification record...');
    const { error: deleteErr } = await supabase
      .from('settlements')
      .delete()
      .eq('id', testId);

    if (deleteErr) {
      console.error('⚠️ Note: Cleanup failed:', deleteErr.message);
    } else {
      console.log('✅ Verification record cleaned up successfully.');
    }

  } catch (err) {
    console.error('❌ Verification failed:');
    console.error('   Error details:', err.message);
    console.log('\n⚠️ Please ensure you have run the migration in Supabase SQL editor:');
    console.log('   File path: migration_settlements.sql');
  }

  console.log('=== Verification Finished ===');
}

run().catch(console.error);
