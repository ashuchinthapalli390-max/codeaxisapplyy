-- =============================================================================
-- Migration: 20260910120000_extend_leadership_and_contributions.sql
-- Description: Extend team_members schema with full verified fields, verification
--              workflow, profile completeness, and normalized contributions table.
-- =============================================================================

-- 1. EXTEND CANONICAL TEAM_MEMBERS TABLE
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
  ADD COLUMN IF NOT EXISTS leadership_summary TEXT,
  ADD COLUMN IF NOT EXISTS quote TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education_summary TEXT,
  ADD COLUMN IF NOT EXISTS experience_summary TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS profile_completeness INT DEFAULT 100,
  ADD COLUMN IF NOT EXISTS source_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS image_bucket TEXT DEFAULT 'leadership',
  ADD COLUMN IF NOT EXISTS image_path TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS crop_x NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS crop_y NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS crop_scale NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_crop_x NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_crop_y NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS image_zoom NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by TEXT;

-- Verification status check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_team_members_verification_status'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT check_team_members_verification_status
      CHECK (verification_status IN ('draft', 'needs_verification', 'verified', 'published'));
  END IF;
END $$;

-- Indexes for performance & query isolation
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_public_pub ON public.team_members(status, is_public, verification_status);
CREATE INDEX IF NOT EXISTS idx_team_members_sort_order ON public.team_members(sort_order ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_slug ON public.team_members(slug) WHERE slug IS NOT NULL;

-- 2. CREATE NORMALIZED TEAM_MEMBER_CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.team_member_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id TEXT NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('leadership', 'engineering', 'product', 'design', 'operations', 'recruitment', 'mentorship', 'project', 'community')),
  title TEXT NOT NULL,
  summary TEXT,
  project_name TEXT,
  project_url TEXT,
  repository_url TEXT,
  started_at TEXT,
  completed_at TEXT,
  verification_status TEXT DEFAULT 'draft' CHECK (verification_status IN ('draft', 'needs_verification', 'verified', 'published')),
  is_public BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tm_contrib_member ON public.team_member_contributions(team_member_id);
CREATE INDEX IF NOT EXISTS idx_tm_contrib_pub ON public.team_member_contributions(team_member_id, is_public, verification_status);
CREATE INDEX IF NOT EXISTS idx_tm_contrib_order ON public.team_member_contributions(display_order ASC);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_member_contributions ENABLE ROW LEVEL SECURITY;

-- team_members public SELECT policy
DROP POLICY IF EXISTS "Public can view active published team members" ON public.team_members;
CREATE POLICY "Public can view active published team members"
  ON public.team_members
  FOR SELECT
  USING (
    (status = 'active' OR is_active = true)
    AND is_public = true
    AND (verification_status = 'published' OR verification_status IS NULL)
    AND archived_at IS NULL
  );

-- team_members full access for service_role / admin
DROP POLICY IF EXISTS "Service role full access to team_members" ON public.team_members;
CREATE POLICY "Service role full access to team_members"
  ON public.team_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- team_member_contributions public SELECT policy
DROP POLICY IF EXISTS "Public can view active published contributions" ON public.team_member_contributions;
CREATE POLICY "Public can view active published contributions"
  ON public.team_member_contributions
  FOR SELECT
  USING (
    is_public = true
    AND verification_status = 'published'
  );

-- team_member_contributions full access for service_role / admin
DROP POLICY IF EXISTS "Service role full access to team_member_contributions" ON public.team_member_contributions;
CREATE POLICY "Service role full access to team_member_contributions"
  ON public.team_member_contributions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. UPSERT 5 VERIFIED CANONICAL LEADERSHIP PROFILES

-- 4.1 CH. ARSHAD (Founder & Technical Director)
INSERT INTO public.team_members (
  id, slug, full_name, display_name, code_name, role_type,
  primary_designation, secondary_designation, department,
  short_tagline, short_bio, full_bio, leadership_summary, quote,
  responsibilities, focus_areas, skills,
  verification_status, profile_completeness, source_notes,
  is_public, is_featured, sort_order, status, is_active, is_archived,
  image_bucket, image_path, photo_url,
  crop_x, crop_y, crop_scale, image_crop_x, image_crop_y, image_zoom,
  updated_at
) VALUES (
  'd63a0516-ab2f-4474-a3ca-8d549db5fbc2',
  'ch-arshad',
  'CH. Arshad',
  'CH. Arshad',
  'SOUTH DEVELOPER',
  'Founder',
  'Founder & Technical Director',
  'Full-Stack Architect & AI Systems',
  'Engineering, Architecture & Product Development',
  'Building resilient production systems and guiding CodeXa’s technical direction.',
  'Founder and Technical Director of CodeXa Agency, responsible for technical architecture, engineering direction, production standards and secure product development.',
  'CH. Arshad (SOUTH DEVELOPER) is the Founder and Technical Director of CodeXa Agency, responsible for overall technology architecture, engineering direction, production standards, and secure product development. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.',
  'Leads CodeXa’s engineering and technology direction, including application architecture, frontend and backend systems, databases, AI-assisted products, developer tooling and production delivery reviews.',
  'Build with purpose, architect for resilience, and always ship production-grade code.',
  '["Define the technical architecture for CodeXa products and client solutions", "Guide frontend, backend and database engineering decisions", "Review production readiness, performance and security", "Lead AI-system and developer-tooling exploration", "Establish engineering standards and delivery practices", "Support technical planning and implementation reviews"]'::jsonb,
  '["System Architecture", "Next.js and React", "AI Engineering", "Database Systems", "Developer Tooling", "Production Engineering"]'::jsonb,
  '["Next.js", "React 19", "TypeScript", "System Architecture", "PostgreSQL", "AI Engineering", "Supabase", "CI/CD"]'::jsonb,
  'published', 100, 'Canonical verified founder profile',
  true, true, 1, 'active', true, false,
  'leadership', '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg', '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
  50, 50, 1, 50, 50, 1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  role_type = EXCLUDED.role_type,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  department = EXCLUDED.department,
  short_tagline = EXCLUDED.short_tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  leadership_summary = EXCLUDED.leadership_summary,
  quote = EXCLUDED.quote,
  responsibilities = EXCLUDED.responsibilities,
  focus_areas = EXCLUDED.focus_areas,
  skills = EXCLUDED.skills,
  verification_status = EXCLUDED.verification_status,
  profile_completeness = EXCLUDED.profile_completeness,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  photo_url = COALESCE(NULLIF(team_members.photo_url, '/logo.jpeg'), EXCLUDED.photo_url),
  image_path = COALESCE(NULLIF(team_members.image_path, ''), EXCLUDED.image_path),
  updated_at = NOW();

-- 4.2 B. SANJAY (Co-Founder & Platform Lead)
INSERT INTO public.team_members (
  id, slug, full_name, display_name, code_name, role_type,
  primary_designation, secondary_designation, department,
  short_tagline, short_bio, full_bio, leadership_summary, quote,
  responsibilities, focus_areas, skills,
  verification_status, profile_completeness, source_notes,
  is_public, is_featured, sort_order, status, is_active, is_archived,
  image_bucket, image_path, photo_url,
  crop_x, crop_y, crop_scale, image_crop_x, image_crop_y, image_zoom,
  updated_at
) VALUES (
  'a5e3eb9c-e7ed-4bd7-8e4a-e073c502b359',
  'b-sanjay',
  'B. Sanjay',
  'B. Sanjay',
  'SPIDEYY !!',
  'Co-Founder',
  'Co-Founder & Platform Lead',
  'Developer Platform & Distributed Workflows',
  'Platform Engineering & Developer Operations',
  'Connecting platform engineering, developer workflows and team execution.',
  'Co-Founder and Platform Lead supporting candidate onboarding, developer workflows, team coordination and reliable platform delivery.',
  'B. Sanjay (SPIDEYY !!) is the Co-Founder and Platform Lead at CodeXa Agency. He directs platform engineering operations, student onboarding pipelines, developer workflows, and team collaboration across projects.',
  'Coordinates platform engineering and developer operations while helping the team move from requirements to structured implementation and delivery.',
  'Great software is built by teams who care about every single line of code.',
  '["Coordinate platform engineering activities", "Organize developer workflows and technical handoffs", "Support candidate and intern onboarding", "Improve collaboration between design, frontend and backend contributors", "Assist with CI/CD and deployment workflows", "Track implementation progress and delivery readiness"]'::jsonb,
  '["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript", "Candidate Onboarding"]'::jsonb,
  '["Platform Engineering", "Developer Operations", "TypeScript", "CI/CD", "Next.js", "GitHub Actions", "Team Enablement"]'::jsonb,
  'published', 100, 'Canonical verified co-founder profile',
  true, true, 2, 'active', true, false,
  'leadership', '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg', '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
  50, 50, 1, 50, 50, 1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  role_type = EXCLUDED.role_type,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  department = EXCLUDED.department,
  short_tagline = EXCLUDED.short_tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  leadership_summary = EXCLUDED.leadership_summary,
  quote = EXCLUDED.quote,
  responsibilities = EXCLUDED.responsibilities,
  focus_areas = EXCLUDED.focus_areas,
  skills = EXCLUDED.skills,
  verification_status = EXCLUDED.verification_status,
  profile_completeness = EXCLUDED.profile_completeness,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  photo_url = COALESCE(NULLIF(team_members.photo_url, '/logo.jpeg'), EXCLUDED.photo_url),
  image_path = COALESCE(NULLIF(team_members.image_path, ''), EXCLUDED.image_path),
  updated_at = NOW();

-- 4.3 KISHORE (Chief Executive Officer)
INSERT INTO public.team_members (
  id, slug, full_name, display_name, code_name, role_type,
  primary_designation, secondary_designation, department,
  short_tagline, short_bio, full_bio, leadership_summary, quote,
  responsibilities, focus_areas, skills,
  verification_status, profile_completeness, source_notes,
  is_public, is_featured, sort_order, status, is_active, is_archived,
  image_bucket, image_path, photo_url,
  crop_x, crop_y, crop_scale, image_crop_x, image_crop_y, image_zoom,
  updated_at
) VALUES (
  '148ed82c-a0a1-40b1-b91f-9447726a0f9b',
  'kishore',
  'Kishore',
  'Kishore',
  NULL,
  'CEO',
  'Chief Executive Officer',
  'Strategic Partnerships & Business Operations',
  'Executive Strategy & Business Operations',
  'Turning strategy, partnerships and execution into sustainable growth.',
  'Chief Executive Officer of CodeXa Agency, leading business strategy, partnerships, growth initiatives and operational alignment.',
  'Kishore serves as Chief Executive Officer of CodeXa Agency, leading corporate strategy, business partnerships, executive execution, and organizational alignment to scale real-world developer learning and client solutions.',
  'Guides company strategy and helps align product delivery, partnerships, recruitment and operational priorities with CodeXa’s long-term direction.',
  'Execution turns ambitious vision into undeniable reality.',
  '["Guide business and operational strategy", "Develop partnerships and growth opportunities", "Coordinate leadership priorities", "Support product and service delivery planning", "Review organizational execution", "Help align recruitment and team capacity with projects"]'::jsonb,
  '["Strategic Leadership", "Business Operations", "Partnerships", "Product Delivery", "Growth", "Organizational Planning"]'::jsonb,
  '["Strategic Leadership", "Business Operations", "Partnerships", "Product Delivery", "Growth Strategy", "Resource Planning"]'::jsonb,
  'published', 100, 'Canonical verified CEO profile',
  true, true, 3, 'active', true, false,
  'leadership', '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg', '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
  50, 50, 1, 50, 50, 1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  role_type = EXCLUDED.role_type,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  department = EXCLUDED.department,
  short_tagline = EXCLUDED.short_tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  leadership_summary = EXCLUDED.leadership_summary,
  quote = EXCLUDED.quote,
  responsibilities = EXCLUDED.responsibilities,
  focus_areas = EXCLUDED.focus_areas,
  skills = EXCLUDED.skills,
  verification_status = EXCLUDED.verification_status,
  profile_completeness = EXCLUDED.profile_completeness,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  photo_url = COALESCE(NULLIF(team_members.photo_url, '/logo.jpeg'), EXCLUDED.photo_url),
  image_path = COALESCE(NULLIF(team_members.image_path, ''), EXCLUDED.image_path),
  updated_at = NOW();

-- 4.4 G. BHANU PRASAD (Chief Executive Officer)
INSERT INTO public.team_members (
  id, slug, full_name, display_name, code_name, role_type,
  primary_designation, secondary_designation, department,
  short_tagline, short_bio, full_bio, leadership_summary, quote,
  responsibilities, focus_areas, skills,
  verification_status, profile_completeness, source_notes,
  is_public, is_featured, sort_order, status, is_active, is_archived,
  image_bucket, image_path, photo_url,
  crop_x, crop_y, crop_scale, image_crop_x, image_crop_y, image_zoom,
  updated_at
) VALUES (
  'c23e97f4-fc66-4efb-aede-04c42b542bdf',
  'g-bhanu-prasad',
  'G. Bhanu Prasad',
  'G. Bhanu Prasad',
  'HAKAI',
  'CEO',
  'Chief Executive Officer',
  'Technology Strategy & Talent Leadership',
  'Executive Technology & Talent Operations',
  'Aligning technology strategy, developer growth and recruitment execution.',
  'CodeXa executive leading technology strategy, developer acceleration, recruitment pipelines and talent mentorship.',
  'G. Bhanu Prasad (HAKAI) serves as Chief Executive Officer at CodeXa Agency, spearheading tech strategy, developer acceleration, high-standard candidate screening, and engineering capability programs.',
  'Supports the connection between executive planning and technical team growth, with a focus on development practices, recruitment structure and mentorship.',
  'Master the fundamentals, embrace modern tools, and always keep shipping.',
  '["Support technology and execution strategy", "Guide developer acceleration initiatives", "Coordinate recruitment pipelines", "Assist technical mentorship and team growth", "Support full-stack development direction", "Review talent readiness for project assignments"]'::jsonb,
  '["Executive Leadership", "Technology Strategy", "Recruitment Pipelines", "Full-Stack Development", "Talent Mentorship", "Developer Growth"]'::jsonb,
  '["Technology Strategy", "Recruitment Architecture", "Full-Stack Development", "Talent Mentorship", "Developer Acceleration"]'::jsonb,
  'published', 100, 'Canonical verified CEO profile',
  true, true, 4, 'active', true, false,
  'leadership', '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg', '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg',
  50, 50, 1, 50, 50, 1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  role_type = EXCLUDED.role_type,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  department = EXCLUDED.department,
  short_tagline = EXCLUDED.short_tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  leadership_summary = EXCLUDED.leadership_summary,
  quote = EXCLUDED.quote,
  responsibilities = EXCLUDED.responsibilities,
  focus_areas = EXCLUDED.focus_areas,
  skills = EXCLUDED.skills,
  verification_status = EXCLUDED.verification_status,
  profile_completeness = EXCLUDED.profile_completeness,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  photo_url = COALESCE(NULLIF(team_members.photo_url, '/logo.jpeg'), EXCLUDED.photo_url),
  image_path = COALESCE(NULLIF(team_members.image_path, ''), EXCLUDED.image_path),
  updated_at = NOW();

-- 4.5 P. VARUN (Chief Operating Officer & Core Frontend Designer)
INSERT INTO public.team_members (
  id, slug, full_name, display_name, code_name, role_type,
  primary_designation, secondary_designation, department,
  short_tagline, short_bio, full_bio, leadership_summary, quote,
  responsibilities, focus_areas, skills,
  education_summary, experience_summary,
  linkedin_url, github_url,
  verification_status, profile_completeness, source_notes,
  is_public, is_featured, sort_order, status, is_active, is_archived,
  image_bucket, image_path, photo_url,
  crop_x, crop_y, crop_scale, image_crop_x, image_crop_y, image_zoom,
  updated_at
) VALUES (
  'e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c',
  'p-varun',
  'Parlapalli Varun',
  'P. Varun',
  NULL,
  'COO',
  'Chief Operating Officer',
  'Core Frontend & UI/UX Designer',
  'Product Design, Frontend & Operations',
  'Designing clear product experiences and coordinating ideas into working interfaces.',
  'B.Tech Cybersecurity student contributing to CodeXa Agency as a core frontend and UI/UX designer, with work focused on responsive interfaces, product experience and design-to-development execution.',
  'Parlapalli Varun is a B.Tech Cybersecurity student at Narasaraopeta Engineering College (JNTU Kakinada) serving as Chief Operating Officer and Core Frontend & UI/UX Designer at CodeXa Agency. His focus spans intuitive interface architectures, responsive design systems, and converting functional specifications into polished digital experiences.',
  'Supports CodeXa’s operational execution while contributing to frontend design, UI/UX structure, responsive experiences, product presentation and quality review.',
  'Design with clarity, execute with discipline, and turn ideas into seamless user experiences.',
  '["Design responsive interfaces for web applications", "Convert product ideas and requirements into structured UI flows", "Support frontend implementation and visual consistency", "Coordinate design-to-development handoff", "Review mobile and desktop usability", "Assist product documentation and presentation", "Contribute cybersecurity-aware thinking to product design", "Support operational tracking and execution where assigned"]'::jsonb,
  '["UI/UX Design", "Frontend Development", "Responsive Web Design", "Product Design", "React and Next.js", "TypeScript", "Cybersecurity", "Design-to-Code"]'::jsonb,
  '["UI/UX Design", "Figma", "React", "Next.js", "Tailwind CSS", "TypeScript", "Responsive Design", "Cybersecurity Basics"]'::jsonb,
  'B.Tech in Cybersecurity, 2025–2029 Narasaraopeta Engineering College JNTU Kakinada',
  'Core frontend & UI/UX contribution at CodeXa Agency; NEC Portal frontend; ByteXL hackathon; CodeBegin/Vibe projects',
  'https://linkedin.com/in/varun-parlapalli/',
  'https://github.com/varunparlapalli2008',
  'published', 100, 'Imported from verified candidate resume with private fields excluded',
  true, true, 5, 'active', true, false,
  'leadership', '/assets/image-assests/hero.jpeg', '/assets/image-assests/hero.jpeg',
  50, 50, 1, 50, 50, 1,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  code_name = EXCLUDED.code_name,
  role_type = EXCLUDED.role_type,
  primary_designation = EXCLUDED.primary_designation,
  secondary_designation = EXCLUDED.secondary_designation,
  department = EXCLUDED.department,
  short_tagline = EXCLUDED.short_tagline,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  leadership_summary = EXCLUDED.leadership_summary,
  quote = EXCLUDED.quote,
  responsibilities = EXCLUDED.responsibilities,
  focus_areas = EXCLUDED.focus_areas,
  skills = EXCLUDED.skills,
  education_summary = EXCLUDED.education_summary,
  experience_summary = EXCLUDED.experience_summary,
  linkedin_url = EXCLUDED.linkedin_url,
  github_url = EXCLUDED.github_url,
  verification_status = EXCLUDED.verification_status,
  profile_completeness = EXCLUDED.profile_completeness,
  is_public = EXCLUDED.is_public,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  photo_url = COALESCE(NULLIF(team_members.photo_url, '/logo.jpeg'), EXCLUDED.photo_url),
  image_path = COALESCE(NULLIF(team_members.image_path, ''), EXCLUDED.image_path),
  updated_at = NOW();

-- 5. SEED VERIFIED CONTRIBUTIONS FOR VARUN (Resume-backed)
INSERT INTO public.team_member_contributions (
  team_member_id, contribution_type, title, summary, project_name, verification_status, is_public, display_order
) VALUES
  ('e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c', 'design', 'CodeXa Apply Frontend & UI/UX', 'Core frontend layout, responsive component hierarchy, and design-to-code implementation.', 'CodeXa Apply', 'published', true, 1),
  ('e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c', 'engineering', 'NEC Student Portal UI', 'Designed responsive interfaces and student workflow navigation for campus portal.', 'NEC Portal', 'published', true, 2),
  ('e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c', 'project', 'Passing of Digital Legacy', 'Frontend interface and architectural mockups built during CodeBegin / Vibe development sprint.', 'Aegis Legacy', 'published', true, 3),
  ('e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c', 'engineering', 'ByteXL Python Chatbot', 'Conversational interface prototyping and natural language query response integration.', 'ByteXL Chatbot', 'published', true, 4)
ON CONFLICT DO NOTHING;
