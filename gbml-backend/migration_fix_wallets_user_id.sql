-- Migration to fix wallets table user_id column from UUID to TEXT
-- to support module user IDs like "module:treasury-main"

-- Drop unique constraint first
ALTER TABLE public.wallets 
DROP CONSTRAINT IF EXISTS wallets_user_id_key;

-- Alter user_id column type from UUID to TEXT
ALTER TABLE public.wallets 
ALTER COLUMN user_id TYPE TEXT;

-- Re-add unique constraint on user_id
ALTER TABLE public.wallets 
ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);

