-- Manual SQL script to register JVD Router in the contracts table
-- Run this in your Supabase SQL Editor if you accidentally deleted the JVD Router entry

-- First, check if JVD Router already exists
SELECT * FROM public.contracts WHERE service_id = 'JVD_ROUTER';

-- If no results, insert the JVD Router contract
-- REPLACE THE CONTRACT ADDRESS WITH YOUR ACTUAL DEPLOYED JVD ROUTER ADDRESS

INSERT INTO public.contracts (
    id,
    service_id,
    contract_name,
    contract_type,
    contract_address,
    abi,
    created_at
) VALUES (
    gen_random_uuid(),
    'JVD_ROUTER',
    'JvdRouter',
    'JVD_ROUTER',
    'YOUR_DEPLOYED_JVD_ROUTER_ADDRESS_HERE', -- REPLACE THIS WITH YOUR ACTUAL ADDRESS!
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"RouteERC20","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"RouteERC721","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"RouteERC998","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"orderId","type":"string"}],"name":"SettlementExecuted","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"name":"route721","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"token","type":"address"}],"name":"route998","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"settle","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"orderId","type":"string"}],"name":"settleWithJvdEgcr","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]'::jsonb,
    NOW()
) ON CONFLICT (contract_address) DO NOTHING;

-- Verify the insertion
SELECT * FROM public.contracts WHERE service_id = 'JVD_ROUTER';

-- IMPORTANT: Replace 'YOUR_DEPLOYED_JVD_ROUTER_ADDRESS_HERE' with your actual contract address