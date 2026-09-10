-- =============================================================================
-- Migration: 20260910150000_repair_leadership_summary_and_soft_delete.sql
-- Description: Ensure leadership_summary and soft-delete columns exist on
--              public.team_members, add backfill, indexes, role protection trigger,
--              and reload PostgREST schema cache.
-- =============================================================================

BEGIN;

-- 1. Ensure team_members columns exist
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS leadership_summary TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_delete_protected BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 2. Backfill leadership_summary from full_bio, short_bio, or bio if currently null
UPDATE public.team_members
SET leadership_summary = COALESCE(
  leadership_summary,
  full_bio,
  short_bio,
  bio
)
WHERE leadership_summary IS NULL;

-- 3. Create index on deleted_at for fast active/trash querying
CREATE INDEX IF NOT EXISTS team_members_deleted_at_idx
  ON public.team_members (deleted_at);

-- 4. Mark Founder, Co-Founder, and CEO profiles as delete-protected
UPDATE public.team_members
SET is_delete_protected = true
WHERE LOWER(TRIM(COALESCE(role_type, ''))) IN ('founder', 'co-founder', 'ceo')
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%founder%'
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%chief executive officer%'
   OR LOWER(TRIM(COALESCE(primary_designation, ''))) LIKE '%ceo%';

-- 5. Ensure COO Varun and all non-protected roles are explicitly NOT delete-protected
UPDATE public.team_members
SET is_delete_protected = false
WHERE id = 'e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c'
   OR slug = 'p-varun'
   OR LOWER(TRIM(COALESCE(role_type, ''))) = 'coo';

-- 6. Database-level trigger protecting Founder, Co-Founder, and CEO from deletion
CREATE OR REPLACE FUNCTION public.check_team_member_delete_protection()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_desig TEXT;
BEGIN
  v_role := LOWER(TRIM(COALESCE(NEW.role_type, OLD.role_type, '')));
  v_desig := LOWER(TRIM(COALESCE(NEW.primary_designation, OLD.primary_designation, '')));

  -- Determine if canonical role is protected (Founder, Co-Founder, CEO)
  IF (
    v_role = 'founder' OR v_role LIKE '%founder &%' OR v_role LIKE '%& founder%' OR
    v_role = 'co-founder' OR v_role = 'cofounder' OR v_role LIKE '%co-founder%' OR v_role LIKE '%cofounder%' OR
    v_role = 'ceo' OR v_role = 'chief executive officer' OR v_role LIKE '%chief executive officer%' OR
    v_desig = 'founder' OR v_desig LIKE '%founder &%' OR v_desig LIKE '%& founder%' OR
    v_desig = 'co-founder' OR v_desig = 'cofounder' OR v_desig LIKE '%co-founder%' OR v_desig LIKE '%cofounder%' OR
    v_desig = 'ceo' OR v_desig = 'chief executive officer' OR v_desig LIKE '%chief executive officer%'
  ) THEN
    -- Always enforce is_delete_protected = true for protected roles
    NEW.is_delete_protected := true;

    -- Reject deletion/archival for protected profiles
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      RAISE EXCEPTION 'PROTECTED_PROFILE: Founder, Co-Founder and CEO profiles cannot be deleted.';
    END IF;
    IF NEW.status = 'archived' AND (OLD.status IS DISTINCT FROM 'archived') THEN
      RAISE EXCEPTION 'PROTECTED_PROFILE: Founder, Co-Founder and CEO profiles cannot be archived.';
    END IF;
  ELSE
    -- Non-protected roles (COO, CTO, HR, Developer, etc.) must remain deletable
    IF NEW.is_delete_protected = true AND OLD.is_delete_protected IS NOT TRUE THEN
      NEW.is_delete_protected := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_member_delete_protection ON public.team_members;
CREATE TRIGGER trg_team_member_delete_protection
  BEFORE INSERT OR UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_team_member_delete_protection();

COMMIT;

-- 7. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
