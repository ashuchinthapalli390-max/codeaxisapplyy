-- =============================================================================
-- CODEXA APPLY — APPLICATION ISOLATION, SUBMISSION INTEGRITY & PRIVACY MIGRATION
-- Migration: 20260910000000_application_isolation_and_privacy.sql
-- =============================================================================

-- 1. Ensure required columns exist on public.applications
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS submission_token TEXT,
  ADD COLUMN IF NOT EXISTS email_normalized TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_test_record BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT NULL,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT NULL;

-- Backfill email_normalized and submission_token where missing
UPDATE public.applications
SET email_normalized = LOWER(TRIM(email))
WHERE email_normalized IS NULL OR email_normalized = '';

UPDATE public.applications
SET submission_token = gen_random_uuid()::text
WHERE submission_token IS NULL OR submission_token = '';

UPDATE public.applications
SET is_test_record = is_test
WHERE is_test_record IS NULL AND is_test IS NOT NULL;

-- 2. Ensure constraints and indexes on public.applications
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_submission_token 
  ON public.applications (submission_token) 
  WHERE submission_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_reference_id 
  ON public.applications (reference_id) 
  WHERE reference_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_email_normalized 
  ON public.applications (email_normalized);

CREATE INDEX IF NOT EXISTS idx_applications_round_id 
  ON public.applications (round_id);

CREATE INDEX IF NOT EXISTS idx_applications_is_deleted 
  ON public.applications (is_deleted);

CREATE INDEX IF NOT EXISTS idx_applications_is_test_record 
  ON public.applications (is_test_record);

-- One submission per email per round constraint (ignoring soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_email_round
  ON public.applications (email_normalized, round_id)
  WHERE deleted_at IS NULL AND is_deleted = false AND round_id IS NOT NULL;

-- 3. Canonical application_answers table (storing 8 rounds of answers referencing UUID)
CREATE TABLE IF NOT EXISTS public.application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_answers_app_id 
  ON public.application_answers (application_id);

CREATE INDEX IF NOT EXISTS idx_application_answers_round 
  ON public.application_answers (application_id, round_number);

-- 4. Canonical email_logs table for audit & retry tracking
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  provider_message_id TEXT NULL,
  idempotency_key TEXT UNIQUE NULL,
  status TEXT NOT NULL,
  error_message TEXT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_application_id 
  ON public.email_logs (application_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient 
  ON public.email_logs (recipient);

-- 5. Row-Level Security (RLS) & Privacy Protection
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Drop insecure public policies if any exist
DROP POLICY IF EXISTS "Public can view applications" ON public.applications;
DROP POLICY IF EXISTS "Public read applications" ON public.applications;
DROP POLICY IF EXISTS "Public can view answers" ON public.application_answers;
DROP POLICY IF EXISTS "Public can view email logs" ON public.email_logs;

-- Service role has full server-side access
CREATE POLICY "Service role full access on applications"
  ON public.applications FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on application_answers"
  ON public.application_answers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on email_logs"
  ON public.email_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Least-privilege grants: NO public/anon SELECT on sensitive tables
REVOKE ALL ON public.applications FROM anon, authenticated;
REVOKE ALL ON public.application_answers FROM anon, authenticated;
REVOKE ALL ON public.email_logs FROM anon, authenticated;

GRANT ALL ON public.applications TO service_role;
GRANT ALL ON public.application_answers TO service_role;
GRANT ALL ON public.email_logs TO service_role;
