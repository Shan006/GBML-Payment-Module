import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  console.log("Function triggered! Fetching environment variables...");

  const url = Deno.env.get('SUPABASE_URL') ?? "";
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
  const app2Url = Deno.env.get('APP2_URL') ?? "";
  const app2Key = Deno.env.get('APP2_SERVICE_ROLE_KEY') ?? "";

  const app1Admin = createClient(url, key);
  const app2Admin = createClient(app2Url, app2Key);

  try {
    console.log("Checking for pending items in queue...");
    const { data: queueItems, error: queueError } = await app1Admin
      .from('token_sync_queue')
      .select(`
        id,
        module_id,
        modules (token_address, token_config)
      `)
      .eq('status', 'pending')
      .limit(10); // Process small batches for testing

    if (queueError) {
      console.error("Queue fetch error:", queueError.message);
      return new Response(queueError.message, { status: 500 });
    }

    if (!queueItems || queueItems.length === 0) {
      console.log("No pending items found.");
      return new Response("Nothing to sync", { status: 200 });
    }

    console.log(`Found ${queueItems.length} items. Starting sync...`);

    for (const item of queueItems) {
      const module = item.modules;
      if (!module?.token_address) {
        console.log(`Skipping item ${item.id}: No token address.`);
        continue;
      }

      console.log(`Syncing address: ${module.token_address}`);
      
      const { error: pushError } = await app2Admin
        .from('tokens')
        .upsert({
          address: module.token_address,
          name: module.token_config?.name || 'Unknown',
          symbol: module.token_config?.symbol || 'TKN',
          decimals: module.token_config?.decimals || 18
        }, { onConflict: 'address' });

      if (pushError) {
        console.error(`App 2 Push Error for ${module.token_address}:`, pushError.message);
      }

      const newStatus = pushError ? 'failed' : 'synced';
      await app1Admin
        .from('token_sync_queue')
        .update({ status: newStatus })
        .eq('id', item.id);
    }

    return new Response(JSON.stringify({ status: "done" }), { status: 200 });
  } catch (err) {
    console.error("Critical Catch:", err.message);
    return new Response(err.message, { status: 500 });
  }
})