-- =============================================================================
-- Migration: 20260909120000_canonical_leadership_and_soft_delete.sql
-- Description: Canonical schema for Leadership CMS, Storage & Application Soft Delete
-- =============================================================================

-- 1. CANONICAL TEAM MEMBERS TABLE & COLUMNS
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS code_name TEXT,
  ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'Core Team',
  ADD COLUMN IF NOT EXISTS primary_designation TEXT,
  ADD COLUMN IF NOT EXISTS secondary_designation TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS short_tagline TEXT,
  ADD COLUMN IF NOT EXISTS short_bio TEXT,
  ADD COLUMN IF NOT EXISTS full_bio TEXT,
  ADD COLUMN IF NOT EXISTS quote TEXT,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS image_bucket TEXT DEFAULT 'leadership',
  ADD COLUMN IF NOT EXISTS image_path TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS crop_x NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS crop_y NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS crop_scale NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_crop_x NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_crop_y NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_zoom NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Unique slug constraint where slug is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_slug ON public.team_members (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members (status);
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order ON public.team_members (sort_order ASC);

-- 2. UPSERT THE 4 CANONICAL ACTIVE LEADERSHIP PROFILES
INSERT INTO public.team_members (
  id,
  slug,
  name,
  full_name,
  display_name,
  code_name,
  codename,
  role,
  primary_designation,
  secondary_designation,
  role_type,
  department,
  tagline,
  short_bio,
  full_bio,
  quote,
  focus_areas,
  image_path,
  photo_url,
  crop_x,
  crop_y,
  crop_scale,
  email,
  whatsapp_url,
  external_url,
  status,
  sort_order,
  is_active,
  is_archived,
  details,
  updated_at
) VALUES
(
  'team-01',
  'ch-arshad',
  'CH. Arshad',
  'CH. Arshad',
  'CH. Arshad',
  'SOUTH DEVELOPER',
  'SOUTH DEVELOPER',
  'Founder & Technical Director',
  'Founder & Technical Director',
  'Full-Stack Architect & AI Systems',
  'Founder',
  'Engineering Architecture & Core Platform',
  'Building resilient production systems, high-velocity developer tools, and engineering leadership.',
  'Founder & Technical Director driving CodeXa Agency architecture, production systems, and developer mentorship.',
  'CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. He oversees system architecture, Next.js full-stack pipelines, AI agent workflows, and core technical direction. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.',
  'Build with purpose, architect for resilience, and always ship production-grade code.',
  '["System Architecture", "Next.js & React", "AI Engineering", "Database Systems", "Developer Tooling"]'::jsonb,
  '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
  '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
  50,
  25,
  1.05,
  'ch.arshad.codexa@gmail.com',
  '',
  'https://www.codxa-agency.online',
  'active',
  1,
  true,
  false,
  '{
    "displayName": "CH. Arshad",
    "designation": "Founder & Technical Director",
    "secondaryDesignation": "Full-Stack Architect & AI Systems",
    "roleType": "Founder",
    "department": "Engineering Architecture & Core Platform",
    "tagline": "Building resilient production systems, high-velocity developer tools, and engineering leadership.",
    "codename": "SOUTH DEVELOPER",
    "shortBio": "Founder & Technical Director driving CodeXa Agency architecture, production systems, and developer mentorship.",
    "fullBio": "CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. He oversees system architecture, Next.js full-stack pipelines, AI agent workflows, and core technical direction. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.",
    "professionalSummary": "Extensive background in scalable system architecture, full-stack web platforms, and engineering team leadership.",
    "quote": "Build with purpose, architect for resilience, and always ship production-grade code.",
    "photoUrl": "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 25,
    "profileScale": 1.05,
    "skills": ["System Architecture", "Next.js & React", "AI Engineering", "Database Systems", "Developer Tooling"],
    "location": "Hyderabad, India",
    "preferredContact": "WhatsApp",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "showContact": false,
    "isFeatured": true,
    "isVisible": true,
    "displayOrder": 1
  }'::jsonb,
  NOW()
),
(
  'team-02',
  'b-sanjay',
  'B. Sanjay',
  'B. Sanjay',
  'B. Sanjay',
  'Spideyy !!',
  'Spideyy !!',
  'Co-Founder & Platform Lead',
  'Co-Founder & Platform Lead',
  'Developer Platform & Distributed Workflows',
  'Co-Founder',
  'Platform Engineering & Student Operations',
  'Empowering developers to bridge theory and live production deployment.',
  'Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.',
  'B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.',
  'Great software is built by teams who care about every single line of code.',
  '["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"]'::jsonb,
  '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
  '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
  50,
  20,
  1.0,
  'boddukurisanjay@gmail.com',
  '7075920852',
  '',
  'active',
  2,
  true,
  false,
  '{
    "displayName": "B. Sanjay",
    "designation": "Co-Founder & Platform Lead",
    "secondaryDesignation": "Developer Platform & Distributed Workflows",
    "roleType": "Co-Founder",
    "department": "Platform Engineering & Student Operations",
    "tagline": "Empowering developers to bridge theory and live production deployment.",
    "codename": "Spideyy !!",
    "shortBio": "Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.",
    "fullBio": "B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.",
    "professionalSummary": "Experienced in developer tooling, workflow automation, and student engineering acceleration.",
    "quote": "Great software is built by teams who care about every single line of code.",
    "photoUrl": "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"],
    "location": "Hyderabad, India",
    "preferredContact": "WhatsApp",
    "phone": "7075920852",
    "email": "boddukurisanjay@gmail.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "showContact": false,
    "isFeatured": true,
    "isVisible": true,
    "displayOrder": 2
  }'::jsonb,
  NOW()
),
(
  'team-03',
  'kishore',
  'Kishore',
  'Kishore',
  'Kishore',
  '',
  '',
  'Chief Executive Officer',
  'Chief Executive Officer',
  'Strategic Operations & Organizational Growth',
  'CEO',
  'Executive Leadership & Strategic Execution',
  'Accelerating technical talent and scaling innovative agency solutions.',
  'CEO at CodeXa Agency driving strategic operations, partnerships, and developer program scalability.',
  'Kishore serves as Chief Executive Officer of CodeXa Agency, driving operational strategy, talent partnerships, and scaling internship cohorts into production-ready software talent.',
  'Execution turns ambitious vision into undeniable reality.',
  '["Strategic Leadership", "Tech Operations", "Partnerships", "Product Delivery", "Growth"]'::jsonb,
  '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
  '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
  50,
  20,
  1.0,
  '',
  '',
  '',
  'active',
  3,
  true,
  false,
  '{
    "displayName": "Kishore",
    "designation": "Chief Executive Officer",
    "secondaryDesignation": "Strategic Operations & Organizational Growth",
    "roleType": "CEO",
    "department": "Executive Leadership & Strategic Execution",
    "tagline": "Accelerating technical talent and scaling innovative agency solutions.",
    "codename": "",
    "shortBio": "CEO at CodeXa Agency driving strategic operations, partnerships, and developer program scalability.",
    "fullBio": "Kishore serves as Chief Executive Officer of CodeXa Agency, driving operational strategy, talent partnerships, and scaling internship cohorts into production-ready software talent.",
    "professionalSummary": "Leadership in tech operations, talent enablement, and enterprise growth strategies.",
    "quote": "Execution turns ambitious vision into undeniable reality.",
    "photoUrl": "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Strategic Leadership", "Tech Operations", "Partnerships", "Product Delivery", "Growth"],
    "location": "Hyderabad, India",
    "preferredContact": "Email",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "showContact": false,
    "isFeatured": true,
    "isVisible": true,
    "displayOrder": 3
  }'::jsonb,
  NOW()
),
(
  'team-04',
  'g-bhanu-prasad',
  'G. Bhanu Prasad',
  'G. Bhanu Prasad',
  'G. Bhanu Prasad',
  'Hakai',
  'Hakai',
  'Chief Executive Officer',
  'Chief Executive Officer',
  'Technology Strategy & Engineering Growth',
  'CEO',
  'Executive Leadership & Technology Direction',
  'Engineering transformative technology solutions and cultivating exceptional developers.',
  'CEO at CodeXa Agency leading technology strategy, developer acceleration, and industry alliances.',
  'G. Bhanu Prasad (Hakai) serves as Chief Executive Officer at CodeXa Agency, spearheading tech direction, advanced technical screening, and engineering capability programs.',
  'Master the fundamentals, embrace modern tools, and always keep shipping.',
  '["Executive Leadership", "Technology Strategy", "Recruitment Pipelines", "Full-Stack Dev", "Talent Mentorship"]'::jsonb,
  '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg',
  '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg',
  50,
  20,
  1.0,
  'bhanugorantla18@gmail.com',
  '',
  '',
  'active',
  4,
  true,
  false,
  '{
    "displayName": "G. Bhanu Prasad",
    "designation": "Chief Executive Officer",
    "secondaryDesignation": "Technology Strategy & Engineering Growth",
    "roleType": "CEO",
    "department": "Executive Leadership & Technology Direction",
    "tagline": "Engineering transformative technology solutions and cultivating exceptional developers.",
    "codename": "Hakai",
    "shortBio": "CEO at CodeXa Agency leading technology strategy, developer acceleration, and industry alliances.",
    "fullBio": "G. Bhanu Prasad (Hakai) serves as Chief Executive Officer at CodeXa Agency, spearheading tech direction, advanced technical screening, and engineering capability programs.",
    "professionalSummary": "Track record in technology strategy, modern recruitment pipelines, and developer advancement.",
    "quote": "Master the fundamentals, embrace modern tools, and always keep shipping.",
    "photoUrl": "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Executive Leadership", "Technology Strategy", "Recruitment Pipelines", "Full-Stack Dev", "Talent Mentorship"],
    "location": "Hyderabad, India",
    "preferredContact": "Email",
    "phone": "8135533212",
    "email": "bhanugorantla18@gmail.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "showContact": false,
    "isFeatured": true,
    "isVisible": true,
    "displayOrder": 4
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  codename = EXCLUDED.codename,
  role = EXCLUDED.role,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  role_type = EXCLUDED.role_type,
  department = EXCLUDED.department,
  tagline = EXCLUDED.tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  quote = EXCLUDED.quote,
  focus_areas = EXCLUDED.focus_areas,
  image_path = EXCLUDED.image_path,
  photo_url = EXCLUDED.photo_url,
  crop_x = EXCLUDED.crop_x,
  crop_y = EXCLUDED.crop_y,
  crop_scale = EXCLUDED.crop_scale,
  email = COALESCE(NULLIF(EXCLUDED.email, ''), public.team_members.email),
  whatsapp_url = COALESCE(NULLIF(EXCLUDED.whatsapp_url, ''), public.team_members.whatsapp_url),
  external_url = COALESCE(NULLIF(EXCLUDED.external_url, ''), public.team_members.external_url),
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  is_archived = EXCLUDED.is_archived,
  details = EXCLUDED.details,
  updated_at = NOW();

-- 3. ARCHIVE ANY STALE DUPLICATES CAREFULLY
UPDATE public.team_members
SET
  status = 'archived',
  is_active = false,
  is_archived = true,
  archived_at = COALESCE(archived_at, NOW()),
  archived_by = 'migration_reconcile',
  updated_at = NOW()
WHERE id NOT IN ('team-01', 'team-02', 'team-03', 'team-04')
  AND (
    status = 'active'
    OR is_active = true
    OR LOWER(TRIM(COALESCE(name, ''))) IN ('deepak', 'ashu')
    OR LOWER(TRIM(COALESCE(full_name, ''))) IN ('deepak', 'ashu')
    OR LOWER(TRIM(COALESCE(display_name, ''))) IN ('deepak', 'ashu')
    OR LOWER(TRIM(COALESCE(name, ''))) IN ('ch. arshad', 'b. sanjay', 'kishore', 'g. bhanu prasad')
    OR LOWER(COALESCE(codename, '')) IN ('south developer', 'spideyy !!', 'hakai')
  );

-- 4. CANONICAL APPLICATION SOFT DELETE COLUMNS
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD COLUMN IF NOT EXISTS delete_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_applications_deleted ON public.applications (is_deleted, deleted_at);
CREATE INDEX IF NOT EXISTS idx_applications_is_test ON public.applications (is_test);

-- 5. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
CREATE POLICY "Public can view active team members"
  ON public.team_members
  FOR SELECT
  TO anon, authenticated
  USING ((status = 'active' OR is_active = true) AND (archived_at IS NULL AND is_archived = false));

DROP POLICY IF EXISTS "Service role full access on team_members" ON public.team_members;
CREATE POLICY "Service role full access on team_members"
  ON public.team_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. STORAGE BUCKET INITIALIZATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('leadership', 'leadership', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies
DO $$
BEGIN
  -- Allow public read on leadership storage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access leadership'
  ) THEN
    CREATE POLICY "Public Access leadership" ON storage.objects FOR SELECT TO public USING (bucket_id = 'leadership');
  END IF;

  -- Allow service_role full management on leadership storage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service role leadership storage'
  ) THEN
    CREATE POLICY "Service role leadership storage" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'leadership') WITH CHECK (bucket_id = 'leadership');
  END IF;
END $$;
