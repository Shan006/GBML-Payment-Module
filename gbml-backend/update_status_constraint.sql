-- SQL Script to update the status constraint for disbursement_requests

-- 1. Drop the existing constraint (if it exists under this common name)
ALTER TABLE public.disbursement_requests 
DROP CONSTRAINT IF EXISTS disbursement_requests_status_check;

-- 2. Add the updated constraint including 'PROCESSING'
ALTER TABLE public.disbursement_requests 
ADD CONSTRAINT disbursement_requests_status_check 
CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSING', 'EXECUTED', 'REJECTED', 'FAILED'));
