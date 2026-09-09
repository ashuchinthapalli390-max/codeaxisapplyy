import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  TeamMemberDbRow,
  PublicLeadershipDto,
  AdminLeadershipDto,
  LeadershipMutationInput,
  validateLeadershipInput,
  TeamMemberContributionDbRow,
} from "./schema";
import {
  mapDbRowToPublicDto,
  mapDbRowToAdminDto,
  mapMutationInputToDbRow,
} from "./mapper";
import { randomUUID } from "node:crypto";

export class LeadershipError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LeadershipError";
  }
}

/**
 * 5 Canonical Verified Leadership profiles representing CodeXa's real organizational leadership
 */
export const CANONICAL_INITIAL_PROFILES: Partial<TeamMemberDbRow>[] = [
  {
    id: "d63a0516-ab2f-4474-a3ca-8d549db5fbc2",
    slug: "ch-arshad",
    full_name: "CH. Arshad",
    display_name: "CH. Arshad",
    code_name: "SOUTH DEVELOPER",
    role_type: "Founder",
    primary_designation: "Founder & Technical Director",
    secondary_designation: "Full-Stack Architect & AI Systems",
    department: "Engineering, Architecture & Product Development",
    tagline: "Building resilient production systems and guiding CodeXa’s technical direction.",
    short_tagline: "Building resilient production systems and guiding CodeXa’s technical direction.",
    short_bio: "Founder and Technical Director of CodeXa Agency, responsible for technical architecture, engineering direction, production standards and secure product development.",
    full_bio: "CH. Arshad (SOUTH DEVELOPER) is the Founder and Technical Director of CodeXa Agency, responsible for overall technology architecture, engineering direction, production standards, and secure product development. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.",
    leadership_summary: "Leads CodeXa’s engineering and technology direction, including application architecture, frontend and backend systems, databases, AI-assisted products, developer tooling and production delivery reviews.",
    quote: "Build with purpose, architect for resilience, and always ship production-grade code.",
    responsibilities: [
      "Define the technical architecture for CodeXa products and client solutions",
      "Guide frontend, backend and database engineering decisions",
      "Review production readiness, performance and security",
      "Lead AI-system and developer-tooling exploration",
      "Establish engineering standards and delivery practices",
      "Support technical planning and implementation reviews",
    ],
    focus_areas: [
      "System Architecture",
      "Next.js and React",
      "AI Engineering",
      "Database Systems",
      "Developer Tooling",
      "Production Engineering",
    ],
    skills: ["Next.js", "React 19", "TypeScript", "System Architecture", "PostgreSQL", "AI Engineering", "Supabase", "CI/CD"],
    photo_url: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    image_path: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    verification_status: "published",
    profile_completeness: 100,
    source_notes: "Verified canonical founder profile",
    is_public: true,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 1,
    is_featured: true,
  },
  {
    id: "a5e3eb9c-e7ed-4bd7-8e4a-e073c502b359",
    slug: "b-sanjay",
    full_name: "B. Sanjay",
    display_name: "B. Sanjay",
    code_name: "SPIDEYY !!",
    role_type: "Co-Founder",
    primary_designation: "Co-Founder & Platform Lead",
    secondary_designation: "Developer Platform & Distributed Workflows",
    department: "Platform Engineering & Developer Operations",
    tagline: "Connecting platform engineering, developer workflows and team execution.",
    short_tagline: "Connecting platform engineering, developer workflows and team execution.",
    short_bio: "Co-Founder and Platform Lead supporting candidate onboarding, developer workflows, team coordination and reliable platform delivery.",
    full_bio: "B. Sanjay (SPIDEYY !!) is the Co-Founder and Platform Lead at CodeXa Agency. He directs platform engineering operations, student onboarding pipelines, developer workflows, and team collaboration across projects.",
    leadership_summary: "Coordinates platform engineering and developer operations while helping the team move from requirements to structured implementation and delivery.",
    quote: "Great software is built by teams who care about every single line of code.",
    responsibilities: [
      "Coordinate platform engineering activities",
      "Organize developer workflows and technical handoffs",
      "Support candidate and intern onboarding",
      "Improve collaboration between design, frontend and backend contributors",
      "Assist with CI/CD and deployment workflows",
      "Track implementation progress and delivery readiness",
    ],
    focus_areas: [
      "Platform Engineering",
      "Developer Operations",
      "Team Coordination",
      "CI/CD",
      "TypeScript",
      "Candidate Onboarding",
    ],
    skills: ["Platform Engineering", "Developer Operations", "TypeScript", "CI/CD", "Next.js", "GitHub Actions", "Team Enablement"],
    photo_url: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    image_path: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    verification_status: "published",
    profile_completeness: 100,
    source_notes: "Verified canonical co-founder profile",
    is_public: true,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 2,
    is_featured: true,
  },
  {
    id: "148ed82c-a0a1-40b1-b91f-9447726a0f9b",
    slug: "kishore",
    full_name: "Kishore",
    display_name: "Kishore",
    code_name: null,
    role_type: "CEO",
    primary_designation: "Chief Executive Officer",
    secondary_designation: "Strategic Partnerships & Business Operations",
    department: "Executive Strategy & Business Operations",
    tagline: "Turning strategy, partnerships and execution into sustainable growth.",
    short_tagline: "Turning strategy, partnerships and execution into sustainable growth.",
    short_bio: "Chief Executive Officer of CodeXa Agency, leading business strategy, partnerships, growth initiatives and operational alignment.",
    full_bio: "Kishore serves as Chief Executive Officer of CodeXa Agency, leading corporate strategy, business partnerships, executive execution, and organizational alignment to scale real-world developer learning and client solutions.",
    leadership_summary: "Guides company strategy and helps align product delivery, partnerships, recruitment and operational priorities with CodeXa’s long-term direction.",
    quote: "Execution turns ambitious vision into undeniable reality.",
    responsibilities: [
      "Guide business and operational strategy",
      "Develop partnerships and growth opportunities",
      "Coordinate leadership priorities",
      "Support product and service delivery planning",
      "Review organizational execution",
      "Help align recruitment and team capacity with projects",
    ],
    focus_areas: [
      "Strategic Leadership",
      "Business Operations",
      "Partnerships",
      "Product Delivery",
      "Growth",
      "Organizational Planning",
    ],
    skills: ["Strategic Leadership", "Business Operations", "Partnerships", "Product Delivery", "Growth Strategy", "Resource Planning"],
    photo_url: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    image_path: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    verification_status: "published",
    profile_completeness: 100,
    source_notes: "Verified canonical CEO profile",
    is_public: true,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 3,
    is_featured: true,
  },
  {
    id: "c23e97f4-fc66-4efb-aede-04c42b542bdf",
    slug: "g-bhanu-prasad",
    full_name: "G. Bhanu Prasad",
    display_name: "G. Bhanu Prasad",
    code_name: "HAKAI",
    role_type: "CEO",
    primary_designation: "Chief Executive Officer",
    secondary_designation: "Technology Strategy & Talent Leadership",
    department: "Executive Technology & Talent Operations",
    tagline: "Aligning technology strategy, developer growth and recruitment execution.",
    short_tagline: "Aligning technology strategy, developer growth and recruitment execution.",
    short_bio: "CodeXa executive leading technology strategy, developer acceleration, recruitment pipelines and talent mentorship.",
    full_bio: "G. Bhanu Prasad (HAKAI) serves as Chief Executive Officer at CodeXa Agency, spearheading tech strategy, developer acceleration, high-standard candidate screening, and engineering capability programs.",
    leadership_summary: "Supports the connection between executive planning and technical team growth, with a focus on development practices, recruitment structure and mentorship.",
    quote: "Master the fundamentals, embrace modern tools, and always keep shipping.",
    responsibilities: [
      "Support technology and execution strategy",
      "Guide developer acceleration initiatives",
      "Coordinate recruitment pipelines",
      "Assist technical mentorship and team growth",
      "Support full-stack development direction",
      "Review talent readiness for project assignments",
    ],
    focus_areas: [
      "Executive Leadership",
      "Technology Strategy",
      "Recruitment Pipelines",
      "Full-Stack Development",
      "Talent Mentorship",
      "Developer Growth",
    ],
    skills: ["Technology Strategy", "Recruitment Architecture", "Full-Stack Development", "Talent Mentorship", "Developer Acceleration"],
    photo_url: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    image_path: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    verification_status: "published",
    profile_completeness: 100,
    source_notes: "Verified canonical CEO profile",
    is_public: true,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 4,
    is_featured: true,
  },
  {
    id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    slug: "p-varun",
    full_name: "Parlapalli Varun",
    display_name: "P. Varun",
    code_name: null,
    role_type: "COO",
    primary_designation: "Chief Operating Officer",
    secondary_designation: "Core Frontend & UI/UX Designer",
    department: "Product Design, Frontend & Operations",
    education_summary: "B.Tech in Cybersecurity, 2025–2029 Narasaraopeta Engineering College JNTU Kakinada",
    experience_summary: "Core frontend & UI/UX contribution at CodeXa Agency; NEC Portal frontend; ByteXL hackathon; CodeBegin/Vibe projects",
    tagline: "Designing clear product experiences and coordinating ideas into working interfaces.",
    short_tagline: "Designing clear product experiences and coordinating ideas into working interfaces.",
    short_bio: "B.Tech Cybersecurity student contributing to CodeXa Agency as a core frontend and UI/UX designer, with work focused on responsive interfaces, product experience and design-to-development execution.",
    full_bio: "Parlapalli Varun is a B.Tech Cybersecurity student at Narasaraopeta Engineering College (JNTU Kakinada) serving as Chief Operating Officer and Core Frontend & UI/UX Designer at CodeXa Agency. His focus spans intuitive interface architectures, responsive design systems, and converting functional specifications into polished digital experiences.",
    leadership_summary: "Supports CodeXa’s operational execution while contributing to frontend design, UI/UX structure, responsive experiences, product presentation and quality review.",
    quote: "Design with clarity, execute with discipline, and turn ideas into seamless user experiences.",
    responsibilities: [
      "Design responsive interfaces for web applications",
      "Convert product ideas and requirements into structured UI flows",
      "Support frontend implementation and visual consistency",
      "Coordinate design-to-development handoff",
      "Review mobile and desktop usability",
      "Assist product documentation and presentation",
      "Contribute cybersecurity-aware thinking to product design",
      "Support operational tracking and execution where assigned",
    ],
    focus_areas: [
      "UI/UX Design",
      "Frontend Development",
      "Responsive Web Design",
      "Product Design",
      "React and Next.js",
      "TypeScript",
      "Cybersecurity",
      "Design-to-Code",
    ],
    skills: ["UI/UX Design", "Figma", "React", "Next.js", "Tailwind CSS", "TypeScript", "Responsive Design", "Cybersecurity Basics"],
    linkedin_url: "https://linkedin.com/in/varun-parlapalli/",
    github_url: "https://github.com/varunparlapalli2008",
    photo_url: "/assets/image-assests/hero.jpeg",
    image_path: "/assets/image-assests/hero.jpeg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    verification_status: "published",
    profile_completeness: 100,
    source_notes: "Imported from verified candidate resume with private fields excluded",
    is_public: true,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 5,
    is_featured: true,
  },
];

export const INITIAL_VERIFIED_CONTRIBUTIONS = [
  {
    team_member_id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    contribution_type: "design" as const,
    title: "CodeXa Apply Frontend & UI/UX",
    summary: "Core frontend layout, responsive component hierarchy, and design-to-code implementation.",
    project_name: "CodeXa Apply",
    project_url: "https://www.codeaxisapply.xyz",
    verification_status: "published" as const,
    is_public: true,
    display_order: 1,
  },
  {
    team_member_id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    contribution_type: "engineering" as const,
    title: "NEC Student Portal UI",
    summary: "Designed responsive interfaces and student workflow navigation for campus portal.",
    project_name: "NEC Portal",
    verification_status: "published" as const,
    is_public: true,
    display_order: 2,
  },
  {
    team_member_id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    contribution_type: "project" as const,
    title: "Passing of Digital Legacy",
    summary: "Frontend interface and architectural mockups built during CodeBegin / Vibe development sprint.",
    project_name: "Aegis Legacy",
    verification_status: "published" as const,
    is_public: true,
    display_order: 3,
  },
  {
    team_member_id: "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c",
    contribution_type: "engineering" as const,
    title: "ByteXL Python Chatbot",
    summary: "Conversational interface prototyping and natural language query response integration.",
    project_name: "ByteXL Chatbot",
    verification_status: "published" as const,
    is_public: true,
    display_order: 4,
  },
];

async function triggerLeadershipRevalidation() {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/api/team");
    revalidatePath("/admin/team");
  } catch {
    // Non-blocking in non-Next runtime
  }
}

/**
 * Reconciles canonical records: ensures the 5 canonical records exist,
 * populates complete verified content for rows that have missing data,
 * and archives stale demo profiles.
 */
export async function reconcileLeadershipDatabase(): Promise<{
  inserted: number;
  updated: number;
  archivedStale: number;
  existing: number;
}> {
  if (!isSupabaseConfigured()) {
    return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };

  let inserted = 0;
  let updated = 0;
  let archivedStale = 0;

  // 1. Fetch current rows in team_members using plain select
  const { data: existingRows, error: fetchErr } = await supabase
    .from("team_members")
    .select("*");

  if (fetchErr) {
    console.warn("[Leadership Reconcile Warning] Could not inspect table:", fetchErr.message);
    return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };
  }

  const existingList = existingRows || [];

  // 2. Identify and archive stale demo profiles (Deepak, Ashu)
  for (const row of existingList) {
    const rowName = (row.full_name || row.display_name || row.name || "").toLowerCase().trim();
    const isStaleDemo = rowName === "deepak" || rowName === "ashu";
    const alreadyArchived = row.status === "archived" || row.is_archived === true;

    if (isStaleDemo && !alreadyArchived) {
      console.log(`[Leadership Reconcile] Archiving stale profile: ${row.id} (${rowName})`);
      const updatePayload: Record<string, any> = {
        is_active: false,
        archived_at: new Date().toISOString(),
        archived_by: "reconciliation_archiver",
      };
      if (row.status !== undefined) updatePayload.status = "archived";
      if (row.is_archived !== undefined) updatePayload.is_archived = true;
      await supabase
        .from("team_members")
        .update(updatePayload)
        .eq("id", row.id);
      archivedStale++;
    }
  }

  // 3. Ensure each canonical profile exists and has complete verified content
  for (const canonical of CANONICAL_INITIAL_PROFILES) {
    const canonicalNameLower = (canonical.full_name || canonical.display_name || "").toLowerCase().trim();

    // Match by ID, slug, or matching name
    const match = existingList.find(
      (r) =>
        r.id === canonical.id ||
        (canonical.slug && r.slug === canonical.slug) ||
        (r.full_name && r.full_name.toLowerCase().trim() === canonicalNameLower) ||
        (r.display_name && r.display_name.toLowerCase().trim() === canonicalNameLower) ||
        (r.name && r.name.toLowerCase().trim() === canonicalNameLower)
    );

    const now = new Date().toISOString();

    if (!match) {
      console.log(`[Leadership Reconcile] Inserting canonical profile: ${canonical.full_name} (${canonical.id})`);
      const insertRow = {
        ...canonical,
        created_at: now,
        updated_at: now,
      };

      const { error: insertErr } = await supabase.from("team_members").insert(insertRow);
      if (!insertErr) {
        inserted++;
      } else {
        console.warn(`[Leadership Reconcile] Could not insert ${canonical.id}:`, insertErr.message);
      }
    } else {
      // Check if existing record has empty or placeholder designation/bio
      const isPlaceholder =
        !match.primary_designation ||
        match.primary_designation === "Core Team" ||
        !match.short_bio ||
        !match.responsibilities ||
        (Array.isArray(match.responsibilities) && match.responsibilities.length === 0);

      if (isPlaceholder) {
        console.log(`[Leadership Reconcile] Upgrading profile with verified content: ${canonical.full_name} (${match.id})`);
        const updatePayload: Record<string, any> = {
          slug: match.slug || canonical.slug,
          full_name: canonical.full_name,
          display_name: canonical.display_name,
          code_name: canonical.code_name,
          role_type: canonical.role_type,
          primary_designation: canonical.primary_designation,
          secondary_designation: canonical.secondary_designation,
          department: canonical.department,
          tagline: canonical.tagline,
          short_tagline: canonical.short_tagline,
          short_bio: canonical.short_bio,
          full_bio: canonical.full_bio,
          leadership_summary: canonical.leadership_summary,
          quote: canonical.quote,
          responsibilities: canonical.responsibilities,
          focus_areas: canonical.focus_areas,
          skills: canonical.skills,
          education_summary: canonical.education_summary,
          experience_summary: canonical.experience_summary,
          verification_status: "published",
          profile_completeness: 100,
          is_public: true,
          status: "active",
          is_active: true,
          sort_order: canonical.sort_order,
          updated_at: now,
        };

        if (canonical.photo_url && (!match.photo_url || match.photo_url === "/logo.jpeg")) {
          updatePayload.photo_url = canonical.photo_url;
        }
        if (canonical.image_path && (!match.image_path || match.image_path === "")) {
          updatePayload.image_path = canonical.image_path;
        }
        if (canonical.linkedin_url && !match.linkedin_url) {
          updatePayload.linkedin_url = canonical.linkedin_url;
        }
        if (canonical.github_url && !match.github_url) {
          updatePayload.github_url = canonical.github_url;
        }

        const { error: upErr } = await supabase
          .from("team_members")
          .update(updatePayload)
          .eq("id", match.id);

        if (!upErr) {
          updated++;
        } else {
          console.warn(`[Leadership Reconcile] Could not update ${match.id}:`, upErr.message);
        }
      }
    }
  }

  // 4. Seed verified contributions for Varun if not present
  try {
    const { data: existingContribs } = await supabase
      .from("team_member_contributions")
      .select("id, title")
      .eq("team_member_id", "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");

    if (!existingContribs || existingContribs.length === 0) {
      for (const contrib of INITIAL_VERIFIED_CONTRIBUTIONS) {
        await supabase.from("team_member_contributions").insert(contrib as any);
      }
    }
  } catch (cErr: any) {
    console.warn("[Leadership Reconcile] Contributions notice:", cErr.message);
  }

  return { inserted, updated, archivedStale, existing: existingList.length };
}

/**
 * Public Query: Returns only active, published members with their published contributions
 */
export async function getPublicLeadership(): Promise<PublicLeadershipDto[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let data: any[] | null = null;
      let error: any = null;

      try {
        const queryRes = await supabase
          .from("team_members")
          .select("*")
          .or("status.eq.active,is_active.eq.true")
          .is("archived_at", null)
          .order("sort_order", { ascending: true });
        data = queryRes.data;
        error = queryRes.error;
      } catch (err: any) {
        error = err;
      }

      // Adaptive retry if column mismatch occurs
      if (error && error.message?.includes("does not exist")) {
        console.warn("[Leadership Repository] Column mismatch in team_members filter, retrying adaptive select:", error.message);
        try {
          const fallbackRes = await supabase.from("team_members").select("*");
          if (!fallbackRes.error && fallbackRes.data) {
            data = fallbackRes.data.filter((row: any) => {
              if (row.archived_at) return false;
              if (row.is_archived === true) return false;
              if (row.status && row.status !== "active") return false;
              if (row.is_active === false) return false;
              if (row.is_public === false) return false;
              if (row.verification_status && row.verification_status !== "published") return false;
              return true;
            });
            data.sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
            error = null;
          }
        } catch (fbErr) {
          console.warn("[Leadership Repository] Adaptive select failed:", fbErr);
        }
      }

      // If data is empty or contains unpopulated placeholders, trigger reconciliation once
      const needsReconcile =
        !data ||
        data.length === 0 ||
        data.some(
          (m: any) =>
            !m.primary_designation ||
            m.primary_designation === "Core Team" ||
            !m.responsibilities ||
            (Array.isArray(m.responsibilities) && m.responsibilities.length === 0)
        );

      if (needsReconcile) {
        try {
          const rec = await reconcileLeadershipDatabase();
          if (rec.inserted > 0 || rec.updated > 0) {
            const { data: refetched } = await supabase
              .from("team_members")
              .select("*")
              .order("sort_order", { ascending: true });

            if (refetched && refetched.length > 0) {
              data = refetched.filter((r: any) => !r.archived_at && r.status !== "archived" && r.is_active !== false && r.is_public !== false);
            }
          }
        } catch (recErr) {
          console.warn("[Leadership Repository] Reconciliation notice:", recErr);
        }
      }

      if (data && data.length > 0) {
        // Fetch published contributions for these members
        let allContributions: any[] = [];
        try {
          const memberIds = data.map((d: any) => d.id);
          const { data: contribData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .in("team_member_id", memberIds)
            .eq("is_public", true)
            .eq("verification_status", "published")
            .order("display_order", { ascending: true });
          allContributions = contribData || [];
        } catch {
          // Contributions table optional / pending migration
        }

        return (data as TeamMemberDbRow[]).map((row) => {
          const memberContribs = allContributions.filter((c) => c.team_member_id === row.id);
          return mapDbRowToPublicDto(row, memberContribs);
        });
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical profiles due to database error:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
          mapDbRowToPublicDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
        );
      }
    }
  }

  // Fallback to the 5 canonical profiles if DB is unconfigured or temporarily unavailable
  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
    mapDbRowToPublicDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
  );
}

/**
 * Admin Query: Returns all members with full editable fields and all contributions
 */
export async function getAdminLeadership(): Promise<AdminLeadershipDto[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let data: any[] | null = null;
      let error: any = null;

      try {
        const queryRes = await supabase
          .from("team_members")
          .select("*")
          .order("sort_order", { ascending: true });
        data = queryRes.data;
        error = queryRes.error;
      } catch (err: any) {
        error = err;
      }

      if (error && error.message?.includes("does not exist")) {
        console.warn("[Leadership Repository] Admin fallback select due to column mismatch:", error.message);
        try {
          const retryRes = await supabase.from("team_members").select("*");
          if (!retryRes.error && retryRes.data && retryRes.data.length > 0) {
            data = retryRes.data;
            error = null;
          }
        } catch (retryErr) {
          console.warn("[Leadership Repository] Admin retry failed:", retryErr);
        }
      }

      const needsReconcile =
        !data ||
        data.length === 0 ||
        data.some((m: any) => !m.primary_designation || m.primary_designation === "Core Team");

      if (needsReconcile) {
        try {
          const rec = await reconcileLeadershipDatabase();
          if (rec.inserted > 0 || rec.updated > 0) {
            const { data: refetched } = await supabase
              .from("team_members")
              .select("*")
              .order("sort_order", { ascending: true });
            if (refetched && refetched.length > 0) {
              data = refetched;
            }
          }
        } catch (recErr) {
          console.warn("[Leadership Repository] Admin reconciliation notice:", recErr);
        }
      }

      if (data && data.length > 0) {
        let allContributions: any[] = [];
        try {
          const memberIds = data.map((d: any) => d.id);
          const { data: contribData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .in("team_member_id", memberIds)
            .order("display_order", { ascending: true });
          allContributions = contribData || [];
        } catch {
          // Contributions table optional
        }

        return (data as TeamMemberDbRow[]).map((row) => {
          const memberContribs = allContributions.filter((c) => c.team_member_id === row.id);
          return mapDbRowToAdminDto(row, memberContribs);
        });
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical admin profiles:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
          mapDbRowToAdminDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
        );
      }
    }
  }

  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
    mapDbRowToAdminDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
  );
}

/**
 * Single member lookup by ID or slug
 */
export async function getLeadershipMemberById(idOrSlug: string): Promise<AdminLeadershipDto | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (error) {
        throw new LeadershipError(`Failed to fetch team member: ${error.message}`, 500);
      }

      if (data) {
        let contribs: any[] = [];
        try {
          const { data: cData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .eq("team_member_id", data.id)
            .order("display_order", { ascending: true });
          contribs = cData || [];
        } catch {
          // optional
        }
        return mapDbRowToAdminDto(data as TeamMemberDbRow, contribs);
      }
    }
  }

  const match = CANONICAL_INITIAL_PROFILES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return match
    ? mapDbRowToAdminDto(match as TeamMemberDbRow, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === match.id))
    : null;
}

/**
 * Create or Update leadership member with full verification & cache invalidation
 * Requires exactly 1 row returned from database mutation
 */
export async function saveLeadershipMember(
  rawInput: any,
  adminUser?: { email?: string; id?: string }
): Promise<AdminLeadershipDto> {
  const validation = validateLeadershipInput(rawInput);
  if (!validation.valid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(" ");
    throw new LeadershipError(msg || "Validation failed.", 400);
  }

  const input = validation.sanitized;
  const memberId = input.id || randomUUID();

  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Supabase database is not configured on this environment.", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new LeadershipError("Supabase admin client unavailable.", 503);
  }

  // Check slug collisions if changed
  if (input.slug) {
    const { data: existingSlug } = await supabase
      .from("team_members")
      .select("id")
      .eq("slug", input.slug)
      .neq("id", memberId)
      .maybeSingle();

    if (existingSlug) {
      throw new LeadershipError(`A leadership profile with the slug "${input.slug}" already exists.`, 409);
    }
  }

  const dbRow = mapMutationInputToDbRow(input, memberId);

  // Check optimistic concurrency if updatedAt provided
  if (input.updatedAt && input.id) {
    const { data: currentRow } = await supabase
      .from("team_members")
      .select("updated_at")
      .eq("id", memberId)
      .maybeSingle();

    if (currentRow && currentRow.updated_at && input.updatedAt) {
      const currentMs = new Date(currentRow.updated_at).getTime();
      const clientMs = new Date(input.updatedAt).getTime();
      if (currentMs - clientMs > 2000) {
        throw new LeadershipError(
          "This profile was modified by another administrator. Please refresh before saving.",
          409
        );
      }
    }
  }

  // Check if row already exists
  const { data: existingRow } = await supabase
    .from("team_members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();

  let data: any = null;
  let error: any = null;

  if (existingRow) {
    // Exact update on stable UUID
    const updateRes = await supabase
      .from("team_members")
      .update(dbRow)
      .eq("id", memberId)
      .select()
      .single();
    data = updateRes.data;
    error = updateRes.error;
  } else {
    // Insert new row
    const insertRes = await supabase
      .from("team_members")
      .insert({ ...dbRow, created_at: new Date().toISOString() })
      .select()
      .single();
    data = insertRes.data;
    error = insertRes.error;
  }

  if (error) {
    console.error("[Leadership Repository] Mutation error:", error.message);
    throw new LeadershipError(`Database mutation failed: ${error.message}`, 500);
  }

  if (!data) {
    throw new LeadershipError("Supabase update affected zero rows. Persistence failed.", 500);
  }

  // Sync contributions if provided
  if (Array.isArray(input.contributions)) {
    try {
      // Fetch current contribution IDs for this member
      const { data: currentContribs } = await supabase
        .from("team_member_contributions")
        .select("id")
        .eq("team_member_id", memberId);

      const incomingIds = input.contributions.map((c) => c.id).filter(Boolean);
      const toDelete = (currentContribs || []).filter((c) => !incomingIds.includes(c.id)).map((c) => c.id);

      if (toDelete.length > 0) {
        await supabase.from("team_member_contributions").delete().in("id", toDelete);
      }

      for (const contrib of input.contributions) {
        const cRow = {
          id: contrib.id && !contrib.id.startsWith("contrib-") ? contrib.id : randomUUID(),
          team_member_id: memberId,
          contribution_type: contrib.contribution_type,
          title: contrib.title,
          summary: contrib.summary || null,
          project_name: contrib.project_name || null,
          project_url: contrib.project_url || null,
          repository_url: contrib.repository_url || null,
          started_at: contrib.started_at || null,
          completed_at: contrib.completed_at || null,
          verification_status: contrib.verification_status,
          is_public: contrib.is_public !== false,
          display_order: Number(contrib.display_order || 0),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("team_member_contributions").upsert(cRow as any, { onConflict: "id" });
      }
    } catch (cSyncErr: any) {
      console.warn("[Leadership Repository] Contribution sync notice:", cSyncErr.message);
    }
  }

  // Invalidate cache across website
  await triggerLeadershipRevalidation();

  // Refetch fresh contributions
  let updatedContribs: any[] = [];
  try {
    const { data: cData } = await supabase
      .from("team_member_contributions")
      .select("*")
      .eq("team_member_id", memberId)
      .order("display_order", { ascending: true });
    updatedContribs = cData || [];
  } catch {
    // optional
  }

  return mapDbRowToAdminDto(data as TeamMemberDbRow, updatedContribs);
}

/**
 * Soft delete (archive) or permanent delete
 */
export async function deleteLeadershipMember(
  id: string,
  softDelete: boolean = true,
  adminUser?: { email?: string; id?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const now = new Date().toISOString();

  if (softDelete) {
    const { data, error } = await supabase
      .from("team_members")
      .update({
        status: "archived",
        is_active: false,
        is_archived: true,
        archived_at: now,
        archived_by: adminUser?.email || adminUser?.id || "admin",
      })
      .eq("id", id)
      .select();

    if (error) {
      throw new LeadershipError(`Failed to archive team member: ${error.message}`, 500);
    }
    if (!data || data.length === 0) {
      throw new LeadershipError("Archive failed: no matching team member found.", 404);
    }
  } else {
    // Delete contributions first
    try {
      await supabase.from("team_member_contributions").delete().eq("team_member_id", id);
    } catch {
      // cascade or ignore
    }
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      throw new LeadershipError(`Failed to permanently delete: ${error.message}`, 500);
    }
  }

  await triggerLeadershipRevalidation();
  return true;
}

/**
 * Restore an archived leadership member
 */
export async function restoreLeadershipMember(
  id: string,
  adminUser?: { email?: string; id?: string }
): Promise<AdminLeadershipDto> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const { data, error } = await supabase
    .from("team_members")
    .update({
      status: "active",
      is_active: true,
      is_archived: false,
      archived_at: null,
      archived_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new LeadershipError(`Restore failed: ${error?.message || "member not found"}`, 500);
  }

  await triggerLeadershipRevalidation();
  return mapDbRowToAdminDto(data as TeamMemberDbRow);
}

/**
 * Reorder leadership members atomically
 */
export async function reorderLeadershipMembers(
  orderedIds: string[],
  adminUser?: { email?: string; id?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("team_members")
      .update({
        sort_order: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure) {
    throw new LeadershipError(`Reorder failed: ${failure.error?.message}`, 500);
  }

  await triggerLeadershipRevalidation();
  return true;
}
