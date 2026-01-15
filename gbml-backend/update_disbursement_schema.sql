-- SQL Script to update the disbursement_requests table

-- 1. Ensure the status constraint includes 'PROCESSING'
ALTER TABLE public.disbursement_requests 
DROP CONSTRAINT IF EXISTS disbursement_requests_status_check;

ALTER TABLE public.disbursement_requests 
ADD CONSTRAINT disbursement_requests_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'EXECUTED', 'REJECTED', 'FAILED'));

-- 2. Add column to track which Admin executed the request (since execute_by_api_key is for keys only)
ALTER TABLE public.disbursement_requests 
ADD COLUMN IF NOT EXISTS executed_by_id UUID REFERENCES auth.users(id);

-- 3. (Optional) Helpful view to see the status list 
-- SELECT id, status, blockchain_tx_hash FROM disbursement_requests ORDER BY created_at DESC LIMIT 5;
