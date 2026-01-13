-- Final Migration to fix Emergency Pause unique constraint
-- 1. Convert any NULL target_id to 'ALL' to satisfy the constraint
UPDATE public.pause_states SET target_id = 'ALL' WHERE target_id IS NULL;

-- 2. Set default value for the column
ALTER TABLE public.pause_states ALTER COLUMN target_id SET DEFAULT 'ALL';

-- 3. Add the unique constraint (This is the critical fix for the 42P10 error)
ALTER TABLE public.pause_states 
ADD CONSTRAINT pause_states_scope_target_id_key UNIQUE (scope, target_id);
