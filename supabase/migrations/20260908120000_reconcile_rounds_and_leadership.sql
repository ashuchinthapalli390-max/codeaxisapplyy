-- =============================================================================
-- Migration: Reconcile Internship Rounds and Leadership Team Schema
-- File: supabase/migrations/20260908120000_reconcile_rounds_and_leadership.sql
-- Description:
--   1. Ensures internship_rounds has status_override, status, opens_at, closes_at.
--   2. Reconciles team_members canonical table with TEXT primary key, details JSONB,
--      sort_order, and RLS policies allowing public read of active members.
--   3. Seeds/reconciles the 4 canonical leaders with verified assets and contact settings.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INTERNSHIP ROUNDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.internship_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INT NOT NULL DEFAULT 1,
  batch_code TEXT NOT NULL UNIQUE DEFAULT 'BATCH-2026-COHORT-1',
  title TEXT NOT NULL DEFAULT 'CodeXa Developer Internship 2026',
  description TEXT NULL,
  opens_at TIMESTAMPTZ NOT NULL DEFAULT '2026-09-01 09:00:00+05:30',
  closes_at TIMESTAMPTZ NOT NULL DEFAULT '2026-09-20 23:59:59+05:30',
  next_opens_at TIMESTAMPTZ NULL,
  status_override TEXT NOT NULL DEFAULT 'AUTO',
  status TEXT NOT NULL DEFAULT 'AUTO',
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_applications INT NULL,
  current_applications_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure both status_override and status columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'internship_rounds' AND column_name = 'status_override'
  ) THEN
    ALTER TABLE public.internship_rounds ADD COLUMN status_override TEXT NOT NULL DEFAULT 'AUTO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'internship_rounds' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.internship_rounds ADD COLUMN status TEXT NOT NULL DEFAULT 'AUTO';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. TEAM MEMBERS (Leadership CMS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  codename TEXT NULL,
  short_bio TEXT NULL,
  photo_url TEXT NULL,
  photo_asset_id UUID NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure columns exist if table was previously created with fewer columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'details'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN details JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_rounds ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
DROP POLICY IF EXISTS "Service role full access on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Public can view active rounds" ON public.internship_rounds;
DROP POLICY IF EXISTS "Service role full access on rounds" ON public.internship_rounds;

-- Public policies
CREATE POLICY "Public can view active team members"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_archived = false);

CREATE POLICY "Service role full access on team_members"
  ON public.team_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view active rounds"
  ON public.internship_rounds
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role full access on rounds"
  ON public.internship_rounds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT ALL ON public.team_members TO service_role;
GRANT SELECT ON public.internship_rounds TO anon, authenticated;
GRANT ALL ON public.internship_rounds TO service_role;

-- -----------------------------------------------------------------------------
-- 3. CANONICAL ROSTER UPSERT
-- -----------------------------------------------------------------------------
INSERT INTO public.team_members (
  id, name, role, codename, short_bio, photo_url, sort_order, is_active, is_archived, details, updated_at
) VALUES
(
  'team-01',
  'CH. Arshad',
  'Founder & Technical Director',
  'SOUTH DEVELOPER',
  'Founder of CodeXa Agency and Creator of the Developer Recruitment Universe. Oversees architecture, full-stack systems, and core recruitment tracks.',
  '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
  1,
  true,
  false,
  '{
    "displayName": "CH. Arshad",
    "designation": "Founder & Technical Director",
    "roleType": "Founder",
    "department": "Engineering & Leadership",
    "tagline": "Architecting resilient software and accelerating the next generation of engineers.",
    "codename": "SOUTH DEVELOPER",
    "bio": "Founder of CodeXa Agency and Creator of the Developer Recruitment Universe. Oversees architecture, full-stack systems, and core recruitment tracks.",
    "shortBio": "Founder of CodeXa Agency and Creator of the Developer Recruitment Universe. Oversees architecture, full-stack systems, and core recruitment tracks.",
    "fullBio": "CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. With a comprehensive background in full-stack architecture, systems design, and developer mentorship, he architected the 8-Round Screening Pipeline to replace trivial trivia interviews with production-grade evaluations.",
    "professionalSummary": "Extensive background in scalable system architecture, full-stack web platforms, and engineering team leadership.",
    "quote": "Real software isn''t memorized—it is designed, debugged, and shipped to live infrastructure.",
    "photoUrl": "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 25,
    "profileScale": 1.05,
    "skills": ["Full-Stack Architecture", "Next.js", "TypeScript", "Vibe Coding", "Database Systems", "Developer Mentorship"],
    "responsibilities": ["System Architecture & Cloud Engineering", "Recruitment Standards & Curriculum", "Agency Strategy & Technical Direction"],
    "email": "ch.arshad.codexa@gmail.com",
    "phone": "+91 99890 00000",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 1
  }'::jsonb,
  NOW()
),
(
  'team-02',
  'B. Sanjay',
  'Co-Founder & Platform Lead',
  'Spideyy !!',
  'Co-Founder of CodeXa Agency. Directs developer platform workflows, candidate onboarding, and team coordination.',
  '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
  2,
  true,
  false,
  '{
    "displayName": "B. Sanjay",
    "designation": "Co-Founder & Platform Lead",
    "roleType": "Co-Founder",
    "department": "Platform Operations & Coordination",
    "tagline": "Empowering engineering cohorts with modern tooling and ironclad team discipline.",
    "codename": "Spideyy !!",
    "bio": "Co-Founder of CodeXa Agency. Directs developer platform workflows, candidate onboarding, and team coordination.",
    "shortBio": "Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.",
    "fullBio": "B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.",
    "professionalSummary": "Specialist in platform operations, developer workflow optimization, and distributed team coordination.",
    "quote": "Great software is built by teams who care about every single line of code.",
    "photoUrl": "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"],
    "responsibilities": ["Platform Operations & Developer Tooling", "Cohort Onboarding & Progress Tracking", "Code Quality & Delivery Reviews"],
    "email": "boddukurisanjay@gmail.com",
    "phone": "7075920852",
    "whatsapp": "7075920852",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 2
  }'::jsonb,
  NOW()
),
(
  'team-03',
  'Kishore',
  'Chief Executive Officer',
  '',
  'Chief Executive Officer at CodeXa Agency. Directs executive operations, external enterprise collaborations, and strategic scaling.',
  '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
  3,
  true,
  false,
  '{
    "displayName": "Kishore",
    "designation": "Chief Executive Officer",
    "roleType": "CEO",
    "department": "Executive Leadership & Strategy",
    "tagline": "Scaling modern digital agency solutions and cultivating developer excellence.",
    "codename": "",
    "bio": "Chief Executive Officer at CodeXa Agency. Directs executive operations, external enterprise collaborations, and strategic scaling.",
    "shortBio": "CEO overseeing agency growth, client delivery governance, and strategic developer partnerships.",
    "fullBio": "Kishore serves as Chief Executive Officer at CodeXa Agency. He oversees executive growth, corporate governance, client partnerships, and large-scale developer cohort placement.",
    "professionalSummary": "Executive leadership background in software delivery governance, operational excellence, and enterprise expansion.",
    "quote": "Discipline and consistent execution turn ambitious concepts into world-class digital products.",
    "photoUrl": "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Executive Leadership", "Strategic Expansion", "Operations Governance", "Client Partnerships", "Product Strategy"],
    "responsibilities": ["Agency Operations & Corporate Governance", "Strategic Industry Partnerships", "Cohort Placement & Ecosystem Growth"],
    "email": "kishore.codexa@gmail.com",
    "phone": "+91 99000 00000",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 3
  }'::jsonb,
  NOW()
),
(
  'team-04',
  'G. Bhanu Prasad',
  'Chief Executive Officer',
  'Hakai',
  'Chief Executive Officer at CodeXa Agency. Spearheads enterprise technology strategy, developer operations, and product scaling.',
  '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg',
  4,
  true,
  false,
  '{
    "displayName": "G. Bhanu Prasad",
    "designation": "Chief Executive Officer",
    "roleType": "CEO",
    "department": "Executive Technology & Engineering",
    "tagline": "Transforming engineering potential into high-velocity product execution.",
    "codename": "Hakai",
    "bio": "Chief Executive Officer at CodeXa Agency. Spearheads enterprise technology strategy, developer operations, and product scaling.",
    "shortBio": "CEO directing enterprise technology strategy, technical leadership, and engineering delivery.",
    "fullBio": "G. Bhanu Prasad (Hakai) is Chief Executive Officer at CodeXa Agency. He leads executive technical strategy, agency infrastructure, client product engineering, and developer talent development.",
    "professionalSummary": "Engineering leadership specialist in modern web technologies, AI agent workflows, and product scaling.",
    "quote": "Speed without quality is fragile; quality with speed is unbeatable.",
    "photoUrl": "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Technology Strategy", "Full-Stack Development", "AI Integration", "Product Scaling", "Team Leadership"],
    "responsibilities": ["Executive Technical Direction", "Client Solution Engineering", "Engineering Talent Acceleration"],
    "email": "bhanugorantla18@gmail.com",
    "phone": "8135533212",
    "whatsapp": "8135533212",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 4
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  codename = EXCLUDED.codename,
  short_bio = EXCLUDED.short_bio,
  photo_url = EXCLUDED.photo_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  is_archived = EXCLUDED.is_archived,
  details = EXCLUDED.details,
  updated_at = NOW();
