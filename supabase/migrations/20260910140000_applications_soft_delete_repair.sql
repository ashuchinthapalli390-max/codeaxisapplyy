-- =============================================================================
-- Migration: 20260910140000_applications_soft_delete_repair.sql
-- Description: Repair application soft-delete architecture and schema cache
-- =============================================================================

BEGIN;

-- 1. Ensure soft-delete columns exist on public.applications
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT;

-- 2. Create index on applications(deleted_at) for efficient active/trash querying
CREATE INDEX IF NOT EXISTS applications_deleted_at_idx
  ON public.applications (deleted_at);

-- 3. Ensure canonical team_members soft-delete and concurrency columns exist
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_delete_protected BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS team_members_deleted_at_idx
  ON public.team_members (deleted_at);

-- 4. Mark Founder, Co-Founder, and CEO profiles as delete-protected in database
UPDATE public.team_members
SET is_delete_protected = true
WHERE LOWER(TRIM(COALESCE(role_type, ''))) IN ('founder', 'co-founder', 'ceo')
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%founder%'
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%chief executive officer%'
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%ceo%';

COMMIT;

-- 5. Signal PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
