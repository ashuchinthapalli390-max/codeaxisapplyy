import "server-only";
import fs from "fs";
import path from "path";
import { ApplicationData } from "@/types/application";
import {
  TeamMember,
  WebsiteSettings,
  InternshipRound,
  FaqItem,
  QuestionBankItem,
  EmailTemplate,
  EmailLog,
  AdminAuditLog,
  AdminSession,
  SiteAsset,
  SiteModule,
  InterviewData,
  OfferData,
} from "@/types/admin";
import { generateReferenceId } from "@/lib/referenceId";

interface StoreData {
  applications: ApplicationData[];
  internshipRounds: InternshipRound[];
  modules?: SiteModule[];
  team: TeamMember[];
  settings: WebsiteSettings;
  faqs: FaqItem[];
  questions: QuestionBankItem[];
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
  auditLogs: AdminAuditLog[];
  sessions: AdminSession[];
  siteAssets: SiteAsset[];
  interviews: InterviewData[];
  offers: OfferData[];
  nextApplicationSequence: number;
}

const DEFAULT_INTERNSHIP_ROUND: InternshipRound = {
  id: "round-2026-sep",
  title: "CodeXa Developer Internship 2026",
  batch_code: "2026-SEP",
  status: "AUTO",
  opens_at: "2026-09-01T09:00:00+05:30",
  closes_at: "2026-09-07T23:59:59+05:30",
  next_opens_at: "2026-09-15T09:00:00+05:30",
  timezone: "Asia/Kolkata",
  is_active: true,
  created_at: "2026-09-01T09:00:00.000Z",
  updated_at: "2026-09-01T09:00:00.000Z",
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  applicationStatus: "AUTO",
  batchCode: "2026-SEP",
  openDate: "2026-09-01",
  openTime: "09:00",
  closeDate: "2026-09-07",
  closeTime: "23:59",
  nextOpenDate: "2026-09-15",
  nextOpenTime: "09:00",
  timezone: "Asia/Kolkata",
  heroHeading: "BUILD. LEARN. DEBUG. SHIP.",
  heroSubtitle: "DEVELOPER INTERNSHIP 2026",
  heroDescription:
    "A practical developer recruitment experience and internship built for students and aspiring engineers who want to build real-world software, master AI-assisted workflows, and ship production applications.",
  agencyName: "CodeXa Agency",
  agencyDescription:
    "Building Technology. Building Developers. We build full-stack web platforms, AI solutions, developer tools, and automation systems.",
  agencyUrl: "https://www.codxa-agency.online",
  whatsappSupportNumber: "+91 88979 01413",
  founderEmail: "ashuchinthapalli3900@gmail.com",
  whatsappOnboardingLink: "https://chat.whatsapp.com/CodeXaInternship2026Private",
  discordOnboardingLink: "https://discord.gg/codexa-dev-private",
  sessionDurationDays: 30,
};

const DEFAULT_MODULES: SiteModule[] = [
  {
    id: "module-01",
    module_number: 1,
    module_code: "MOD-01",
    title: "Engineering Foundations & AI Workflows",
    subtitle: "Module 01 // Foundations",
    description: "Modern developer environment setup, Git version control, branch management, GitHub collaboration, and structured prompt engineering workflows.",
    week_label: "Weeks 1–2",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-01-foundations-vibe-coding.png",
    topics: [
      "Git repository workflows, branch management, and GitHub PR reviews",
      "VS Code & AI developer assistant workflow optimization",
      "TypeScript & modern React component patterns",
      "Prompt engineering for architectural clarity and bug diagnosis",
    ],
    display_order: 1,
    is_visible: true,
  },
  {
    id: "module-02",
    module_number: 2,
    module_code: "MOD-02",
    title: "Full-Stack Web Engineering",
    subtitle: "Module 02 // Full-Stack Core",
    description: "Next.js App Router architecture, Server Components, API routes, client state management, responsive UI design, and form handling.",
    week_label: "Weeks 3–4",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-02-fullstack-web-engineering.png",
    topics: [
      "Next.js App Router architecture, Server Components & Actions",
      "REST API route handlers & scalable serverless model",
      "Client state management and high-performance reactive UI",
      "Error handling, input validation, and security sanitization",
    ],
    display_order: 2,
    is_visible: true,
  },
  {
    id: "module-03",
    module_number: 3,
    module_code: "MOD-03",
    title: "Database Systems, Security & Auth",
    subtitle: "Module 03 // Data & Security",
    description: "PostgreSQL schema design, Supabase database integration, authentication flows, secure session management, and API protection.",
    week_label: "Weeks 5–6",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-03-database-security.png",
    topics: [
      "PostgreSQL & Supabase schema design and indexing",
      "Relational queries, connection pooling, and data integrity",
      "HttpOnly cookie persistent authentication & session security",
      "Rate limiting, CSRF protection, and endpoint hardening",
    ],
    display_order: 3,
    is_visible: true,
  },
  {
    id: "module-04",
    module_number: 4,
    module_code: "MOD-04",
    title: "AI Integration & Automation",
    subtitle: "Module 04 // AI Engineering",
    description: "Building production LLM features, agentic pipelines, OpenAI/Anthropic/Gemini APIs, vector search, and structured output orchestration.",
    week_label: "Weeks 7–8",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-04-ai-engineering-apis.png",
    topics: [
      "Multi-model LLM API integration (Claude, GPT, Gemini)",
      "Structured JSON schema outputs and function calling",
      "RAG architecture, embeddings, and context window management",
      "Automated testing of AI components and error resilience",
    ],
    display_order: 4,
    is_visible: true,
  },
  {
    id: "module-05",
    module_number: 5,
    module_code: "MOD-05",
    title: "Production Architecture & Performance",
    subtitle: "Module 05 // Architecture",
    description: "Caching strategies, serverless optimization, edge rendering, bundle size reduction, SEO excellence, and performance monitoring.",
    week_label: "Weeks 9–10",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-05-performance-seo-core-web-vitals.png",
    topics: [
      "Edge rendering, ISR, and multi-layer caching architectures",
      "Core Web Vitals tuning and JavaScript payload reduction",
      "Automated SEO optimization and structured metadata",
      "Production telemetry, error monitoring, and alerting",
    ],
    display_order: 5,
    is_visible: true,
  },
  {
    id: "module-06",
    module_number: 6,
    module_code: "MOD-06",
    title: "Agency Client Capstone Project",
    subtitle: "Module 06 // Capstone & Ship",
    description: "Collaborative real-world client build with live deployments, code reviews, automated CI/CD pipelines, and portfolio verification.",
    week_label: "Weeks 11–12",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-06-capstone-production-ship.png",
    topics: [
      "Team-based agency client platform construction",
      "CI/CD deployment pipelines on Vercel and cloud platforms",
      "Peer pull request reviews and production readiness audits",
      "Public project launch, portfolio verification, and certificate",
    ],
    display_order: 6,
    is_visible: true,
  },
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "team-01",
    name: "CH. Arshad",
    displayName: "CH. Arshad",
    codename: "SOUTH DEVELOPER",
    designation: "Founder & Technical Director",
    secondaryDesignation: "Full-Stack Architect & AI Systems",
    roleType: "Founder",
    department: "Engineering Architecture & Core Platform",
    tagline: "Building resilient production systems, high-velocity developer tools, and engineering leadership.",
    bio: "Founder of CodeXa Agency. Directs full-stack architecture, AI engineering pipelines, and core engineering standards across the agency.",
    shortBio: "Founder & Technical Director driving CodeXa Agency architecture, production systems, and developer mentorship.",
    fullBio: "CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. He oversees system architecture, Next.js full-stack pipelines, AI agent workflows, and core technical direction. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.",
    professionalSummary: "Extensive background in scalable system architecture, full-stack web platforms, and engineering team leadership.",
    quote: "Build with purpose, architect for resilience, and always ship production-grade code.",
    photoUrl: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    skills: ["System Architecture", "Next.js & React", "AI Engineering", "Database Systems", "Developer Tooling"],
    location: "Hyderabad, India",
    preferredContact: "WhatsApp",
    showPhone: false,
    showEmail: false,
    showWhatsapp: false,
    showSocials: true,
    showContact: false,
    isFeatured: true,
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: "team-02",
    name: "B. Sanjay",
    displayName: "B. Sanjay",
    codename: "Spideyy !!",
    designation: "Co-Founder & Platform Lead",
    secondaryDesignation: "Developer Platform & Distributed Workflows",
    roleType: "Co-Founder",
    department: "Platform Engineering & Student Operations",
    tagline: "Empowering developers to bridge theory and live production deployment.",
    bio: "Co-Founder of CodeXa Agency. Directs developer platform workflows, candidate onboarding, and team coordination.",
    shortBio: "Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.",
    fullBio: "B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.",
    professionalSummary: "Experienced in developer tooling, workflow automation, and student engineering acceleration.",
    quote: "Great software is built by teams who care about every single line of code.",
    photoUrl: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    skills: ["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"],
    location: "Hyderabad, India",
    preferredContact: "WhatsApp",
    showPhone: false,
    showEmail: false,
    showWhatsapp: false,
    showSocials: true,
    showContact: false,
    isFeatured: true,
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: "team-03",
    name: "Kishore",
    displayName: "Kishore",
    codename: "",
    designation: "Chief Executive Officer",
    secondaryDesignation: "Strategic Operations & Organizational Growth",
    roleType: "CEO",
    department: "Executive Leadership & Strategic Execution",
    tagline: "Accelerating technical talent and scaling innovative agency solutions.",
    bio: "Chief Executive Officer at CodeXa Agency. Drives organizational execution, strategic partnerships, and operations.",
    shortBio: "CEO at CodeXa Agency driving strategic operations, partnerships, and developer program scalability.",
    fullBio: "Kishore serves as Chief Executive Officer of CodeXa Agency, driving operational strategy, talent partnerships, and scaling internship cohorts into production-ready software talent.",
    professionalSummary: "Leadership in tech operations, talent enablement, and enterprise growth strategies.",
    quote: "Execution turns ambitious vision into undeniable reality.",
    photoUrl: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    skills: ["Strategic Leadership", "Tech Operations", "Partnerships", "Product Delivery", "Growth"],
    location: "Hyderabad, India",
    preferredContact: "Email",
    showPhone: false,
    showEmail: false,
    showWhatsapp: false,
    showSocials: true,
    showContact: false,
    isFeatured: true,
    isVisible: true,
    displayOrder: 3,
  },
  {
    id: "team-04",
    name: "G. Bhanu Prasad",
    displayName: "G. Bhanu Prasad",
    codename: "Hakai",
    designation: "Chief Executive Officer",
    secondaryDesignation: "Technology Strategy & Engineering Growth",
    roleType: "CEO",
    department: "Executive Leadership & Technology Direction",
    tagline: "Engineering transformative technology solutions and cultivating exceptional developers.",
    bio: "Chief Executive Officer at CodeXa Agency. Leads technology direction, talent recruitment pipelines, and industry collaboration.",
    shortBio: "CEO at CodeXa Agency leading technology strategy, developer acceleration, and industry alliances.",
    fullBio: "G. Bhanu Prasad (Hakai) serves as Chief Executive Officer at CodeXa Agency, spearheading tech direction, advanced technical screening, and engineering capability programs.",
    professionalSummary: "Track record in technology strategy, modern recruitment pipelines, and developer advancement.",
    quote: "Master the fundamentals, embrace modern tools, and always keep shipping.",
    photoUrl: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    skills: ["Executive Leadership", "Technology Strategy", "Recruitment Pipelines", "Full-Stack Dev", "Talent Mentorship"],
    location: "Hyderabad, India",
    preferredContact: "Email",
    showPhone: false,
    showEmail: false,
    showWhatsapp: false,
    showSocials: true,
    showContact: false,
    isFeatured: true,
    isVisible: true,
    displayOrder: 4,
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-01",
    question: "Is prior coding experience compulsory to apply?",
    answer:
      "No! Prior technical experience is completely optional. Beginners with genuine dedication, honest responses, and a willingness to learn are given full opportunity.",
    category: "General",
    displayOrder: 1,
  },
  {
    id: "faq-02",
    question: "Can first-year students and non-CSE students apply?",
    answer:
      "Yes. Students from all branches (CSE, ECE, Mechanical, Civil, IT, BCA, MCA, etc.) and all academic years are eligible.",
    category: "Eligibility",
    displayOrder: 2,
  },
  {
    id: "faq-03",
    question: "Is a high-end laptop or dedicated GPU mandatory?",
    answer:
      "No. Any basic laptop capable of running VS Code, Git, and a modern web browser is sufficient. Hardware specs do not penalize your evaluation score.",
    category: "General",
    displayOrder: 3,
  },
  {
    id: "faq-04",
    question: "What if I select 'I Don't Know' in the technical awareness round?",
    answer:
      "Selecting 'I Don't Know' simply skips technical questions for that language without any negative penalty. Honesty and genuineness are highly rewarded.",
    category: "Technical",
    displayOrder: 4,
  },
];

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "template-application-received",
    templateType: "ApplicationReceived",
    subject: "CodeXa Developer Internship — Application Confirmed [{{referenceId}}]",
    heading: "Application Received Confirmation",
    body: "Thank you for applying! Your application reference ID is {{referenceId}}. We are reviewing your responses and will notify you soon.",
  },
  {
    id: "template-selected",
    templateType: "Selected",
    subject: "Congratulations! You are Selected for CodeXa Developer Internship [{{referenceId}}]",
    heading: "Selection & Onboarding Invitation",
    body: "Congratulations! You have been officially selected for the CodeXa Developer Internship. Please join our private developer onboarding channels.",
  },
];

const DEFAULT_SITE_ASSETS: SiteAsset[] = [
  {
    id: "asset-01",
    assetKey: "hero-motion",
    name: "Hero Grid Motion Layer",
    assetType: "gif",
    assetUrl: "/assets/gif-assests/3d614f522fb7bcc40915d9a9b7a8ea17.gif",
    section: "Hero",
    altText: "Hero Grid Motion Layer",
    isActive: true,
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
];

let memoryCache: StoreData | null = null;

function ensureStore(): StoreData {
  if (memoryCache) return memoryCache;

  memoryCache = {
    applications: [],
    internshipRounds: [{ ...DEFAULT_INTERNSHIP_ROUND }],
    modules: [...DEFAULT_MODULES],
    team: [...DEFAULT_TEAM],
    settings: { ...DEFAULT_SETTINGS },
    faqs: [...DEFAULT_FAQS],
    questions: [],
    emailTemplates: [...DEFAULT_EMAIL_TEMPLATES],
    emailLogs: [],
    auditLogs: [],
    sessions: [],
    siteAssets: [...DEFAULT_SITE_ASSETS],
    interviews: [],
    offers: [],
    nextApplicationSequence: 101,
  };

  return memoryCache;
}

export function isTestSubmission(app: Partial<ApplicationData>): boolean {
  if (app.is_test) return true;
  const email = (app.email || "").toLowerCase().trim();
  const name = (app.full_name || "").toLowerCase().trim();
  const ref = (app.reference_id || "").toLowerCase().trim();

  const testPatterns = [
    "test",
    "dummy",
    "fake",
    "example.com",
    "sample",
    "demo",
    "sai.krishna.",
    "john.doe",
    "asdf",
    "qwerty",
    "cax-test-",
  ];

  return testPatterns.some((p) => email.includes(p) || name.includes(p) || ref.includes(p));
}

function mapDbRowToApplication(row: any): ApplicationData {
  const raw = row.raw_submission || {};
  return {
    ...raw,
    id: row.id,
    reference_id: row.reference_id,
    full_name: row.full_name || raw.full_name || "",
    date_of_birth: row.date_of_birth || raw.date_of_birth || "",
    email: row.email || raw.email || "",
    phone_number: row.phone_number || raw.phone_number || "",
    whatsapp_number: row.whatsapp_number ?? raw.whatsapp_number,
    city: row.city || raw.city || "",
    state: row.state || raw.state || "",
    country: row.country || raw.country || "India",
    preferred_name: row.preferred_name ?? raw.preferred_name,
    discord_username: row.discord_username ?? raw.discord_username,
    instagram_handle: row.instagram_handle ?? raw.instagram_handle,
    preferred_language: row.preferred_language || raw.preferred_language || "English",
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : raw.hobbies || [],

    college_name: row.college_name || raw.college_name || "",
    university_name: row.university_name || raw.university_name || "",
    course: row.course || raw.course || row.degree || "",
    branch: row.branch || raw.branch || "",
    academic_year: row.academic_year || raw.academic_year || "",
    semester: row.semester || raw.semester || "",
    roll_number: row.roll_number || raw.roll_number || "",
    graduation_year: row.graduation_year || row.expected_graduation || raw.graduation_year || "",
    expected_graduation: row.expected_graduation || row.graduation_year || raw.expected_graduation || "",
    cgpa: row.cgpa ?? raw.cgpa,
    percentage: row.percentage ?? raw.percentage,
    cgpa_percentage: row.cgpa_percentage ?? raw.cgpa_percentage,
    certifications: row.certifications ?? raw.certifications,
    achievements: row.achievements ?? raw.achievements,
    backlogs: row.backlogs ?? raw.backlogs,

    coding_start_timeline: row.coding_start_timeline || raw.coding_start_timeline || "",
    has_built_projects: row.has_built_projects || raw.has_built_projects || "",
    hackathon_experience: row.hackathon_experience ?? raw.hackathon_experience,
    internship_experience: row.internship_experience ?? raw.internship_experience,
    freelancing_experience: row.freelancing_experience ?? raw.freelancing_experience,
    open_source_experience: row.open_source_experience ?? raw.open_source_experience,
    team_project_experience: row.team_project_experience ?? raw.team_project_experience,
    developer_links: Array.isArray(row.developer_links) ? row.developer_links : raw.developer_links || [],
    projects: Array.isArray(row.projects) ? row.projects : raw.projects || [],
    github_profile: row.github_profile ?? raw.github_profile,
    linkedin_profile: row.linkedin_profile ?? raw.linkedin_profile,
    portfolio_website: row.portfolio_website ?? raw.portfolio_website,
    resume_url: row.resume_url ?? raw.resume_url,
    resume_file_name: row.resume_file_name ?? raw.resume_file_name,
    resume_file_size: row.resume_file_size ?? raw.resume_file_size,

    daily_availability: row.daily_availability || raw.daily_availability || "",
    available_days: Array.isArray(row.available_days) ? row.available_days : raw.available_days || [],
    preferred_timing: Array.isArray(row.preferred_timing) ? row.preferred_timing : raw.preferred_timing || [],
    can_attend_meetings: row.can_attend_meetings || raw.can_attend_meetings || "",
    can_meet_deadlines: row.can_meet_deadlines || raw.can_meet_deadlines || "",
    can_communicate_if_unavailable: row.can_communicate_if_unavailable || raw.can_communicate_if_unavailable || "",
    academic_constraints: row.academic_constraints ?? raw.academic_constraints,
    exam_periods: row.exam_periods ?? raw.exam_periods,
    laptop_status: row.laptop_status || raw.laptop_status || "",
    operating_system: row.operating_system || raw.operating_system || "",
    ram_capacity: row.ram_capacity || raw.ram_capacity || "",
    internet_stability: row.internet_stability || raw.internet_stability || "",
    can_run_dev_tools: row.can_run_dev_tools || raw.can_run_dev_tools || "",
    processor: row.processor ?? raw.processor,
    gpu: row.gpu ?? raw.gpu,
    storage_type: row.storage_type ?? raw.storage_type,
    laptop_model: row.laptop_model ?? raw.laptop_model,

    c_level: row.c_level || raw.c_level || "I Don't Know",
    c_answers: row.c_answers || raw.c_answers || {},
    python_level: row.python_level || raw.python_level || "I Don't Know",
    python_answers: row.python_answers || raw.python_answers || {},
    java_level: row.java_level || raw.java_level || "I Don't Know",
    java_answers: row.java_answers || raw.java_answers || {},
    html_level: row.html_level || raw.html_level || "I Don't Know",
    html_answers: row.html_answers || raw.html_answers || {},
    vibe_coding_level: row.vibe_coding_level || raw.vibe_coding_level || "Never Used",
    vibe_coding_answers: row.vibe_coding_answers || raw.vibe_coding_answers || {},

    mindset_answers: row.mindset_answers || raw.mindset_answers || {},

    interview_q1_why_codexa: row.interview_q1_why_codexa || raw.interview_q1_why_codexa || "",
    interview_q2_why_select: row.interview_q2_why_select || raw.interview_q2_why_select || "",
    interview_q3_expectations: row.interview_q3_expectations || raw.interview_q3_expectations || "",
    interview_q4_strongest_skills: row.interview_q4_strongest_skills || raw.interview_q4_strongest_skills || "",
    interview_q5_weakest_area: row.interview_q5_weakest_area || raw.interview_q5_weakest_area || "",
    interview_q6_describe_project: row.interview_q6_describe_project || raw.interview_q6_describe_project || "",
    interview_q7_difficult_problem: row.interview_q7_difficult_problem || raw.interview_q7_difficult_problem || "",
    interview_q8_ai_coding_usage: row.interview_q8_ai_coding_usage || raw.interview_q8_ai_coding_usage || "",
    interview_q9_college_balance: row.interview_q9_college_balance || raw.interview_q9_college_balance || "",
    interview_q10_future_goal: row.interview_q10_future_goal || raw.interview_q10_future_goal || "",

    commitment_accurate_info: row.commitment_accurate_info ?? raw.commitment_accurate_info ?? true,
    commitment_independent_work: row.commitment_independent_work ?? raw.commitment_independent_work ?? true,
    commitment_responsible_communication: row.commitment_responsible_communication ?? raw.commitment_responsible_communication ?? true,
    commitment_team_rules: row.commitment_team_rules ?? raw.commitment_team_rules ?? true,
    commitment_confidentiality: row.commitment_confidentiality ?? raw.commitment_confidentiality ?? true,
    commitment_assigned_duties: row.commitment_assigned_duties ?? raw.commitment_assigned_duties ?? true,
    commitment_no_guaranteed_employment: row.commitment_no_guaranteed_employment ?? raw.commitment_no_guaranteed_employment ?? true,
    commitment_accept_policies: row.commitment_accept_policies ?? raw.commitment_accept_policies ?? true,

    copy_paste_warnings_count: row.copy_paste_warnings_count ?? raw.copy_paste_warnings_count ?? 0,
    tab_switch_count: row.tab_switch_count ?? raw.tab_switch_count ?? 0,

    genuineness_integrity_score: Number(row.genuineness_integrity_score ?? raw.genuineness_integrity_score ?? 0),
    commitment_continuity_score: Number(row.commitment_continuity_score ?? raw.commitment_continuity_score ?? 0),
    mindset_habits_score: Number(row.mindset_habits_score ?? raw.mindset_habits_score ?? 0),
    technical_knowledge_score: Number(row.technical_knowledge_score ?? raw.technical_knowledge_score ?? 0),
    learning_potential_score: Number(row.learning_potential_score ?? raw.learning_potential_score ?? 0),
    interview_communication_score: Number(row.interview_communication_score ?? raw.interview_communication_score ?? 0),
    total_score: Number(row.total_score ?? raw.total_score ?? 0),
    score_band: row.score_band || raw.score_band || "Standard Candidate",
    commitment_signal: row.commitment_signal || raw.commitment_signal || "Moderate",
    skill_authenticity: row.skill_authenticity || raw.skill_authenticity || {},

    status: row.status || raw.status || "Submitted",
    admin_notes: Array.isArray(row.admin_notes) ? row.admin_notes : raw.admin_notes || [],
    admin_tags: Array.isArray(row.admin_tags) ? row.admin_tags : raw.admin_tags || [],
    is_deleted: Boolean(row.is_deleted),
    deleted_at: row.deleted_at,
    deletion_reason: row.deletion_reason || undefined,
    is_test: Boolean(row.is_test || (raw.email && isTestSubmission(raw))),
    created_at: row.created_at || raw.created_at,
    updated_at: row.updated_at || raw.updated_at,
  };
}

// ----------------- INTERNSHIP ROUNDS (SINGLE SOURCE OF TRUTH) -----------------

export async function getActiveInternshipRound(): Promise<InternshipRound> {
  // 1. Query Supabase as the canonical source
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("internship_rounds")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return {
          id: String(data.id),
          title: data.title || "CodeXa Developer Internship 2026",
          batch_code: data.batch_code || "2026-SEP",
          status: (data.status || "AUTO") as any,
          opens_at: data.opens_at,
          closes_at: data.closes_at,
          next_opens_at: data.next_opens_at,
          timezone: data.timezone || "Asia/Kolkata",
          is_active: Boolean(data.is_active),
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    }
  } catch (err) {
    console.warn("[Supabase getActiveInternshipRound Warning]:", err);
  }

  // 2. Safe Fallback
  const store = ensureStore();
  const active = store.internshipRounds.find((r) => r.is_active);
  return active || DEFAULT_INTERNSHIP_ROUND;
}

export async function saveInternshipRound(roundData: Partial<InternshipRound>): Promise<InternshipRound> {
  const current = await getActiveInternshipRound();
  const nowIso = new Date().toISOString();

  const updated: InternshipRound = {
    ...current,
    ...roundData,
    id: current.id || roundData.id || `round-${Date.now()}`,
    title: roundData.title || current.title || "CodeXa Developer Internship 2026",
    batch_code: roundData.batch_code?.trim() || current.batch_code || "2026-SEP",
    status: (roundData.status || current.status || "AUTO") as any,
    opens_at: roundData.opens_at || current.opens_at,
    closes_at: roundData.closes_at || current.closes_at,
    next_opens_at: roundData.next_opens_at !== undefined ? roundData.next_opens_at : current.next_opens_at,
    timezone: roundData.timezone || current.timezone || "Asia/Kolkata",
    is_active: true,
    updated_at: nowIso,
  };

  // Synchronize directly with Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const dbPayload = {
        title: updated.title,
        batch_code: updated.batch_code,
        status: updated.status,
        opens_at: updated.opens_at,
        closes_at: updated.closes_at,
        next_opens_at: updated.next_opens_at || null,
        timezone: updated.timezone,
        is_active: true,
        updated_at: nowIso,
      };

      const { data: existingActive } = await supabase
        .from("internship_rounds")
        .select("id")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingActive?.id) {
        const { data: updatedDb, error: updateError } = await supabase
          .from("internship_rounds")
          .update(dbPayload)
          .eq("id", existingActive.id)
          .select()
          .single();

        if (updateError) {
          console.warn("[Supabase updateInternshipRound Warning]:", updateError.message);
        } else if (updatedDb) {
          updated.id = String(updatedDb.id);
          updated.updated_at = updatedDb.updated_at;
        }
      } else {
        const { data: insertedDb, error: insertError } = await supabase
          .from("internship_rounds")
          .insert(dbPayload)
          .select()
          .single();

        if (insertError) {
          console.warn("[Supabase insertInternshipRound Warning]:", insertError.message);
        } else if (insertedDb) {
          updated.id = String(insertedDb.id);
          updated.updated_at = insertedDb.updated_at;
        }
      }

      // Also persist batch code to site_settings raw_settings
      try {
        await supabase.from("site_settings").upsert(
          {
            id: "default",
            raw_settings: {
              batchCode: updated.batch_code,
              applicationStatus: updated.status,
              openDate: updated.opens_at?.split("T")[0] || "2026-09-01",
              closeDate: updated.closes_at?.split("T")[0] || "2026-09-07",
            },
            updated_at: nowIso,
          },
          { onConflict: "id" }
        );
      } catch (settingsSyncErr) {
        console.warn("[Supabase Settings Sync Notice]:", settingsSyncErr);
      }
    }
  } catch (err: any) {
    console.warn("[Supabase saveInternshipRound Exception]:", err?.message || err);
  }

  // Update in-memory cache
  const store = ensureStore();
  const idx = store.internshipRounds.findIndex((r) => r.id === updated.id || r.is_active);
  if (idx >= 0) {
    store.internshipRounds[idx] = updated;
  } else {
    store.internshipRounds.unshift(updated);
  }
  store.settings.batchCode = updated.batch_code;
  store.settings.applicationStatus = updated.status;

  return updated;
}

export async function getInternshipRounds(): Promise<InternshipRound[]> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("internship_rounds")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && !error && data.length > 0) {
        return data.map((d: any) => ({
          id: String(d.id),
          title: d.title || "CodeXa Developer Internship 2026",
          batch_code: d.batch_code || "2026-SEP",
          status: (d.status || "AUTO") as any,
          opens_at: d.opens_at,
          closes_at: d.closes_at,
          next_opens_at: d.next_opens_at,
          timezone: d.timezone || "Asia/Kolkata",
          is_active: Boolean(d.is_active),
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));
      }
    }
  } catch (err) {
    console.warn("[getInternshipRounds Exception]:", err);
  }
  const store = ensureStore();
  return store.internshipRounds;
}

// ----------------- APPLICATION SUBMISSION & CRUD (SUPABASE-ONLY) -----------------

export async function saveApplication(data: ApplicationData): Promise<{ id: number | string; reference_id: string }> {
  const refId = data.reference_id?.trim() || generateReferenceId();

  const githubUrl = data.developer_links?.find((l) => l.platform === "GitHub")?.url;
  const linkedinUrl = data.developer_links?.find((l) => l.platform === "LinkedIn")?.url;
  const portfolioUrl = data.developer_links?.find((l) => l.platform === "Portfolio" || l.platform === "Website")?.url;

  const dbPayload = {
    reference_id: refId,
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    email: data.email,
    phone_number: data.phone_number,
    whatsapp_number: data.whatsapp_number,
    city: data.city,
    state: data.state,
    country: data.country || "India",
    preferred_name: data.preferred_name,
    discord_username: data.discord_username,
    instagram_handle: data.instagram_handle,
    preferred_language: data.preferred_language || "English",
    hobbies: data.hobbies || [],

    college_name: data.college_name,
    university_name: data.university_name,
    degree: data.course,
    course: data.course,
    branch: data.branch,
    academic_year: data.academic_year,
    semester: data.semester,
    roll_number: data.roll_number,
    graduation_year: data.expected_graduation,
    expected_graduation: data.expected_graduation,
    cgpa: data.cgpa,
    percentage: data.percentage,
    cgpa_percentage: data.cgpa || data.percentage,
    certifications: data.certifications,
    achievements: data.achievements,
    backlogs: data.backlogs,

    coding_start_timeline: data.coding_start_timeline,
    has_built_projects: data.has_built_projects,
    hackathon_experience: data.hackathon_experience || "None",
    internship_experience: data.internship_experience || "None",
    freelancing_experience: data.freelancing_experience || "None",
    open_source_experience: data.open_source_experience || "None",
    team_project_experience: data.team_project_experience || "None",
    developer_links: data.developer_links || [],
    projects: data.projects || [],
    github_profile: githubUrl,
    linkedin_profile: linkedinUrl,
    portfolio_website: portfolioUrl,
    resume_storage_path: (data as any).resume_storage_path || data.resume_url || null,
    resume_file_name: data.resume_file_name || null,
    resume_file_size: data.resume_file_size ? Number(data.resume_file_size) : null,
    resume_file_type: (data as any).resume_file_type || null,

    daily_availability: data.daily_availability,
    available_days: data.available_days || [],
    preferred_timing: data.preferred_timing || [],
    can_attend_meetings: data.can_attend_meetings,
    can_meet_deadlines: data.can_meet_deadlines,
    can_communicate_if_unavailable: data.can_communicate_if_unavailable,
    academic_constraints: data.academic_constraints,
    exam_periods: data.exam_periods,
    laptop_status: data.laptop_status,
    operating_system: data.operating_system,
    ram_capacity: data.ram_capacity,
    internet_stability: data.internet_stability,
    can_run_dev_tools: data.can_run_dev_tools,
    processor: data.processor,
    gpu: data.gpu,
    storage_type: data.storage_type,
    laptop_model: data.laptop_model,

    c_level: data.c_level,
    c_answers: data.c_answers || {},
    python_level: data.python_level,
    python_answers: data.python_answers || {},
    java_level: data.java_level,
    java_answers: data.java_answers || {},
    html_level: data.html_level,
    html_answers: data.html_answers || {},
    vibe_coding_level: data.vibe_coding_level,
    vibe_coding_answers: data.vibe_coding_answers || {},

    mindset_answers: data.mindset_answers || {},

    interview_q1_why_codexa: data.interview_q1_why_codexa,
    interview_q2_why_select: data.interview_q2_why_select,
    interview_q3_expectations: data.interview_q3_expectations,
    interview_q4_strongest_skills: data.interview_q4_strongest_skills,
    interview_q5_weakest_area: data.interview_q5_weakest_area,
    interview_q6_describe_project: data.interview_q6_describe_project,
    interview_q7_difficult_problem: data.interview_q7_difficult_problem,
    interview_q8_ai_coding_usage: data.interview_q8_ai_coding_usage,
    interview_q9_college_balance: data.interview_q9_college_balance,
    interview_q10_future_goal: data.interview_q10_future_goal,

    commitment_accurate_info: data.commitment_accurate_info ?? true,
    commitment_independent_work: data.commitment_independent_work ?? true,
    commitment_responsible_communication: data.commitment_responsible_communication ?? true,
    commitment_team_rules: data.commitment_team_rules ?? true,
    commitment_confidentiality: data.commitment_confidentiality ?? true,
    commitment_assigned_duties: data.commitment_assigned_duties ?? true,
    commitment_no_guaranteed_employment: data.commitment_no_guaranteed_employment ?? true,
    commitment_accept_policies: data.commitment_accept_policies ?? true,

    copy_paste_warnings_count: data.copy_paste_warnings_count || 0,
    tab_switch_count: data.tab_switch_count || 0,

    genuineness_integrity_score: data.genuineness_integrity_score || 0,
    commitment_continuity_score: data.commitment_continuity_score || 0,
    mindset_habits_score: data.mindset_habits_score || 0,
    technical_knowledge_score: data.technical_knowledge_score || 0,
    learning_potential_score: data.learning_potential_score || 0,
    interview_communication_score: data.interview_communication_score || 0,
    total_score: data.total_score || 0,
    score_band: data.score_band,
    commitment_signal: data.commitment_signal,
    skill_authenticity: data.skill_authenticity || {},

    status: data.status || "Submitted",
    is_test: Boolean(data.is_test ?? isTestSubmission(data)),
    raw_submission: data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Direct Supabase Insert
  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from("applications")
      .insert(dbPayload)
      .select("id, reference_id")
      .single();

    if (error) {
      console.error("[Supabase Application Insert Error]:", error);
      throw new Error(`Database error saving application: ${error.message}`);
    }

    return {
      id: inserted.id,
      reference_id: inserted.reference_id,
    };
  }

  // 2. In-memory Mock fallback if Supabase not configured in development
  const store = ensureStore();
  const nextId = store.applications.length + 1;
  const applicationRecord: ApplicationData = {
    ...data,
    id: nextId,
    reference_id: refId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.applications.unshift(applicationRecord);

  return { id: nextId, reference_id: refId };
}

export async function getApplicationByRef(refOrId: string): Promise<ApplicationData | null> {
  const query = refOrId.trim();

  // Try Supabase first
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const isNum = !isNaN(Number(query));
      let dbQuery = supabase.from("applications").select("*");
      if (isNum) {
        dbQuery = dbQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
      } else {
        dbQuery = dbQuery.ilike("reference_id", query);
      }

      const { data, error } = await dbQuery.maybeSingle();
      if (data && !error) {
        return mapDbRowToApplication(data);
      }
    }
  } catch (err) {
    console.warn("[getApplicationByRef Supabase Error]:", err);
  }

  // Fallback to memory
  const store = ensureStore();
  const lowQuery = query.toLowerCase();
  const found = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === lowQuery || String(a.id) === lowQuery
  );
  return found || null;
}

export async function trackApplication(referenceId: string, email: string): Promise<ApplicationData | null> {
  const refClean = referenceId.trim();
  const emailClean = email.trim();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .ilike("reference_id", refClean)
        .ilike("email", emailClean)
        .eq("is_deleted", false)
        .maybeSingle();

      if (data && !error) {
        return mapDbRowToApplication(data);
      }
    }
  } catch (err) {
    console.warn("[trackApplication Supabase Error]:", err);
  }

  const store = ensureStore();
  const found = store.applications.find(
    (a) =>
      a.reference_id?.toLowerCase() === refClean.toLowerCase() &&
      a.email?.toLowerCase() === emailClean.toLowerCase() &&
      !a.is_deleted
  );
  return found || null;
}

export async function getApplications(filters?: {
  search?: string;
  status?: string;
  scoreBand?: string;
  commitment?: string;
  college?: string;
  limit?: number;
  offset?: number;
  view?: "active" | "trash" | "test";
}): Promise<{ applications: ApplicationData[]; total: number }> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();

    if (supabase) {
      let query = supabase.from("applications").select("*", { count: "exact" });

      if (filters?.view === "trash") {
        query = query.eq("is_deleted", true);
      } else if (filters?.view === "test") {
        query = query.eq("is_deleted", false).eq("is_test", true);
      } else {
        query = query.eq("is_deleted", false).eq("is_test", false);
      }

      if (filters?.search) {
        const q = filters.search.trim();
        query = query.or(
          `full_name.ilike.%${q}%,email.ilike.%${q}%,reference_id.ilike.%${q}%,phone_number.ilike.%${q}%,college_name.ilike.%${q}%,roll_number.ilike.%${q}%`
        );
      }

      if (filters?.status && filters.status !== "ALL") {
        query = query.eq("status", filters.status);
      }

      if (filters?.scoreBand && filters.scoreBand !== "ALL") {
        query = query.eq("score_band", filters.scoreBand);
      }

      if (filters?.commitment && filters.commitment !== "ALL") {
        query = query.eq("commitment_signal", filters.commitment);
      }

      if (filters?.college && filters.college !== "ALL") {
        query = query.eq("college_name", filters.college);
      }

      query = query.order("created_at", { ascending: false });

      const offset = filters?.offset || 0;
      const limit = filters?.limit || 100;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        return {
          applications: data.map(mapDbRowToApplication),
          total: count ?? data.length,
        };
      }
    }
  } catch (err) {
    console.warn("[getApplications Supabase Error]:", err);
  }

  // Fallback to memory
  const store = ensureStore();
  let list = store.applications;
  if (filters?.view === "trash") {
    list = list.filter((a) => a.is_deleted);
  } else if (filters?.view === "test") {
    list = list.filter((a) => !a.is_deleted && (a.is_test || isTestSubmission(a)));
  } else {
    list = list.filter((a) => !a.is_deleted && !a.is_test && !isTestSubmission(a));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.reference_id?.toLowerCase().includes(q) ||
        a.phone_number?.includes(q) ||
        a.college_name?.toLowerCase().includes(q) ||
        a.roll_number?.toLowerCase().includes(q)
    );
  }

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters?.scoreBand && filters.scoreBand !== "ALL") {
    list = list.filter((a) => a.score_band === filters.scoreBand);
  }

  if (filters?.commitment && filters.commitment !== "ALL") {
    list = list.filter((a) => a.commitment_signal === filters.commitment);
  }

  if (filters?.college && filters.college !== "ALL") {
    list = list.filter((a) => a.college_name === filters.college);
  }

  const total = list.length;
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 100;
  const paged = list.slice(offset, offset + limit);

  return { applications: paged, total };
}

export async function updateApplicationStatus(
  refOrId: string,
  newStatus: ApplicationData["status"],
  notes?: string,
  adminUser = "Master Admin"
): Promise<boolean> {
  const query = refOrId.trim();
  const now = new Date().toISOString();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const existing = await getApplicationByRef(query);
      const existingNotes = existing?.admin_notes || [];
      const updatedNotes = notes && notes.trim()
        ? [`[${new Date().toLocaleDateString()}] ${notes.trim()}`, ...existingNotes]
        : existingNotes;

      const isNum = !isNaN(Number(query));
      let updateQuery = supabase.from("applications").update({
        status: newStatus,
        admin_notes: updatedNotes,
        updated_at: now,
      });

      if (isNum) {
        updateQuery = updateQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
      } else {
        updateQuery = updateQuery.ilike("reference_id", query);
      }

      const { error } = await updateQuery;
      if (error) {
        console.error("[Supabase Status Update Error]:", error);
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn("[updateApplicationStatus Supabase Error]:", err);
  }

  const store = ensureStore();
  const lowQuery = query.toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === lowQuery || String(a.id) === lowQuery
  );

  if (!app) return false;
  app.status = newStatus;
  app.updated_at = now;
  if (notes && notes.trim()) {
    app.admin_notes = app.admin_notes || [];
    app.admin_notes.unshift(`[${new Date().toLocaleDateString()}] ${notes.trim()}`);
  }
  return true;
}

export async function addApplicationNote(refOrId: string, note: string): Promise<boolean> {
  const query = refOrId.trim();
  const now = new Date().toISOString();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const existing = await getApplicationByRef(query);
      if (existing) {
        const updatedNotes = [`[${new Date().toLocaleString()}] ${note.trim()}`, ...(existing.admin_notes || [])];
        const isNum = !isNaN(Number(query));
        let updateQuery = supabase.from("applications").update({
          admin_notes: updatedNotes,
          updated_at: now,
        });
        if (isNum) {
          updateQuery = updateQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
        } else {
          updateQuery = updateQuery.ilike("reference_id", query);
        }
        await updateQuery;
        return true;
      }
    }
  } catch (err) {
    console.warn("[addApplicationNote Supabase Warning]:", err);
  }

  const store = ensureStore();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query.toLowerCase() || String(a.id) === query
  );
  if (!app) return false;

  app.admin_notes = app.admin_notes || [];
  app.admin_notes.unshift(`[${new Date().toLocaleString()}] ${note.trim()}`);
  app.updated_at = now;
  return true;
}

export async function deleteApplication(refOrId: string, reason?: string): Promise<boolean> {
  const query = refOrId.trim();
  const now = new Date().toISOString();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const isNum = !isNaN(Number(query));
      let updateQuery = supabase.from("applications").update({
        is_deleted: true,
        deleted_at: now,
        deletion_reason: reason || "Admin soft delete",
      });
      if (isNum) {
        updateQuery = updateQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
      } else {
        updateQuery = updateQuery.ilike("reference_id", query);
      }
      await updateQuery;
      await addAuditLog("APPLICATION_DELETED", `Application ${query} moved to Trash. Reason: ${reason || "None specified"}`);
      return true;
    }
  } catch (err) {
    console.warn("[deleteApplication Supabase Warning]:", err);
  }

  const store = ensureStore();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query.toLowerCase() || String(a.id) === query
  );
  if (!app) return false;

  app.is_deleted = true;
  app.deleted_at = now;
  app.deletion_reason = reason || "Admin soft delete";
  await addAuditLog("APPLICATION_DELETED", `Application ${query} moved to Trash.`);
  return true;
}

export async function permanentDeleteApplication(refOrId: string): Promise<boolean> {
  const query = refOrId.trim();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const existing = await getApplicationByRef(query);
      const ref = existing?.reference_id || query;
      const appId = existing?.id;

      // 1. Delete associated interviews
      try {
        await supabase.from("interviews").delete().or(`reference_id.ilike.${ref}${appId ? `,application_id.eq.${appId}` : ""}`);
      } catch (err) {
        console.warn("[Cascade Delete Interviews Warning]:", err);
      }

      // 2. Delete associated offers
      try {
        await supabase.from("offers").delete().or(`reference_id.ilike.${ref}${appId ? `,application_id.eq.${appId}` : ""}`);
      } catch (err) {
        console.warn("[Cascade Delete Offers Warning]:", err);
      }

      // 3. Delete application row
      const isNum = !isNaN(Number(query));
      let deleteQuery = supabase.from("applications").delete();
      if (isNum) {
        deleteQuery = deleteQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
      } else {
        deleteQuery = deleteQuery.ilike("reference_id", query);
      }
      await deleteQuery;
      await addAuditLog("APPLICATION_PERMANENTLY_DELETED", `Application ${ref} permanently removed from system.`);
      return true;
    }
  } catch (err) {
    console.warn("[permanentDeleteApplication Supabase Error]:", err);
  }

  // Memory fallback
  const store = ensureStore();
  const idx = store.applications.findIndex(
    (a) => a.reference_id?.toLowerCase() === query.toLowerCase() || String(a.id) === query
  );
  if (idx !== -1) {
    const [removed] = store.applications.splice(idx, 1);
    store.interviews = store.interviews.filter((i) => i.reference_id !== removed.reference_id);
    store.offers = store.offers.filter((o) => o.reference_id !== removed.reference_id);
    await addAuditLog("APPLICATION_PERMANENTLY_DELETED", `Application ${removed.reference_id} permanently removed.`);
    return true;
  }
  return false;
}

export async function restoreApplication(refOrId: string): Promise<boolean> {
  const query = refOrId.trim();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const isNum = !isNaN(Number(query));
      let updateQuery = supabase.from("applications").update({
        is_deleted: false,
        deleted_at: null,
        deletion_reason: null,
      });
      if (isNum) {
        updateQuery = updateQuery.or(`reference_id.ilike.${query},id.eq.${query}`);
      } else {
        updateQuery = updateQuery.ilike("reference_id", query);
      }
      await updateQuery;
      await addAuditLog("APPLICATION_RESTORED", `Application ${query} restored from Trash.`);
      return true;
    }
  } catch (err) {
    console.warn("[restoreApplication Supabase Warning]:", err);
  }

  const store = ensureStore();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query.toLowerCase() || String(a.id) === query
  );
  if (!app) return false;

  app.is_deleted = false;
  app.deleted_at = undefined;
  app.deletion_reason = undefined;
  await addAuditLog("APPLICATION_RESTORED", `Application ${query} restored from Trash.`);
  return true;
}

// ----------------- TEAM & LEADERSHIP CMS -----------------

function mapDbRowToTeamMember(row: any): TeamMember {
  const responsibilities = Array.isArray(row.responsibilities)
    ? row.responsibilities
    : Array.isArray(row.roles)
    ? row.roles
    : [];
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name || row.name,
    designation: row.designation,
    secondaryDesignation: row.secondary_designation || "",
    roleType: row.role_type || "Core Team",
    department: row.department || "",
    tagline: row.tagline || "",
    bio: row.short_bio || row.bio || "",
    shortBio: row.short_bio || row.bio || "",
    fullBio: row.full_bio || "",
    professionalSummary: row.professional_summary || "",
    quote: row.quote || "",
    photoUrl: row.profile_image_url || "/assets/image-assests/ashu-chinthapalli.jpg",
    profileStoragePath: row.profile_storage_path || "",
    profileObjectPositionX: row.profile_object_position_x != null ? Number(row.profile_object_position_x) : 50,
    profileObjectPositionY: row.profile_object_position_y != null ? Number(row.profile_object_position_y) : 50,
    profileScale: row.profile_scale != null ? Number(row.profile_scale) : 1,
    backgroundAssetUrl: row.background_asset_url || "",
    backgroundType: row.background_type || "none",
    responsibilities,
    roles: responsibilities,
    skills: Array.isArray(row.skills) ? row.skills : [],
    email: row.email || "",
    secondaryEmail: row.secondary_email || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    location: row.location || "",
    preferredContact: row.preferred_contact || "",
    githubUrl: row.github_url || "",
    linkedinUrl: row.linkedin_url || "",
    instagramUrl: row.instagram_url || "",
    portfolioUrl: row.portfolio_url || "",
    websiteUrl: row.website_url || "",
    youtubeUrl: row.youtube_url || "",
    twitterUrl: row.twitter_url || "",
    discordUsername: row.discord_username || "",
    otherLinks: Array.isArray(row.other_links) ? row.other_links : [],
    showPhone: row.show_phone !== false,
    showEmail: row.show_email !== false,
    showWhatsapp: row.show_whatsapp !== false,
    showSocials: row.show_socials !== false,
    showContact: row.show_phone !== false || row.show_whatsapp !== false || row.show_email !== false,
    isFeatured: row.is_featured === true,
    isVisible: row.is_visible !== false,
    isArchived: row.is_archived === true,
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTeamMemberToDbRow(m: TeamMember): any {
  const resp = m.responsibilities || m.roles || [];
  return {
    id: m.id,
    name: m.name,
    display_name: m.displayName || m.name,
    designation: m.designation,
    secondary_designation: m.secondaryDesignation || null,
    role_type: m.roleType || "Core Team",
    department: m.department || null,
    tagline: m.tagline || null,
    short_bio: m.shortBio || m.bio || null,
    full_bio: m.fullBio || null,
    professional_summary: m.professionalSummary || null,
    quote: m.quote || null,
    email: m.email || null,
    secondary_email: m.secondaryEmail || null,
    phone: m.phone || null,
    whatsapp: m.whatsapp || null,
    location: m.location || null,
    preferred_contact: m.preferredContact || null,
    github_url: m.githubUrl || null,
    linkedin_url: m.linkedinUrl || null,
    instagram_url: m.instagramUrl || null,
    portfolio_url: m.portfolioUrl || null,
    website_url: m.websiteUrl || null,
    youtube_url: m.youtubeUrl || null,
    twitter_url: m.twitterUrl || null,
    discord_username: m.discordUsername || null,
    other_links: m.otherLinks || [],
    profile_image_url: m.photoUrl,
    profile_storage_path: m.profileStoragePath || null,
    profile_object_position_x: m.profileObjectPositionX ?? 50,
    profile_object_position_y: m.profileObjectPositionY ?? 50,
    profile_scale: m.profileScale ?? 1,
    background_asset_url: m.backgroundAssetUrl || null,
    background_type: m.backgroundType || "none",
    responsibilities: resp,
    skills: m.skills || [],
    display_order: m.displayOrder ?? 0,
    is_visible: m.isVisible !== false,
    is_featured: m.isFeatured === true,
    is_archived: m.isArchived === true,
    show_phone: m.showPhone !== false,
    show_email: m.showEmail !== false,
    show_whatsapp: m.showWhatsapp !== false,
    show_socials: m.showSocials !== false,
    updated_at: new Date().toISOString(),
  };
}

export async function getTeamMembers(includeArchived: boolean = false): Promise<TeamMember[]> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let query = supabase.from("team_profiles").select("*").order("display_order", { ascending: true });
      if (!includeArchived) {
        query = query.eq("is_archived", false);
      }
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(mapDbRowToTeamMember);
      }
    }
  } catch (err) {
    console.warn("[Supabase Team Fetch Warning]:", err);
  }

  const store = ensureStore();
  const list = (store.team || DEFAULT_TEAM).filter((m) => includeArchived || !m.isArchived);
  return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.from("team_profiles").select("*").eq("id", id).maybeSingle();
      if (data && !error) {
        return mapDbRowToTeamMember(data);
      }
    }
  } catch (err) {
    console.warn("[Supabase Team Member Fetch Warning]:", err);
  }

  const store = ensureStore();
  return (store.team || DEFAULT_TEAM).find((t) => t.id === id) || null;
}

export async function saveTeamMember(member: TeamMember): Promise<boolean> {
  const now = new Date().toISOString();
  const updatedMember: TeamMember = {
    ...member,
    updatedAt: now,
    createdAt: member.createdAt || now,
    responsibilities: member.responsibilities || member.roles || [],
    roles: member.responsibilities || member.roles || [],
  };

  const store = ensureStore();
  const idx = store.team.findIndex((t) => t.id === member.id);
  if (idx >= 0) {
    store.team[idx] = updatedMember;
  } else {
    store.team.push(updatedMember);
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const row = mapTeamMemberToDbRow(updatedMember);
      const { error } = await supabase.from("team_profiles").upsert(row, { onConflict: "id" });
      if (error) {
        console.warn("[Supabase Team Save Warning]:", error.message);
      }
    }
  } catch (err) {
    console.warn("[Supabase Team Save Exception]:", err);
  }

  return true;
}

export async function deleteTeamMember(id: string, softDelete: boolean = true): Promise<boolean> {
  const store = ensureStore();
  if (softDelete) {
    const member = store.team.find((t) => t.id === id);
    if (member) {
      member.isArchived = true;
      member.isVisible = false;
      member.updatedAt = new Date().toISOString();
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase.from("team_profiles").update({ is_archived: true, is_visible: false, updated_at: new Date().toISOString() }).eq("id", id);
        }
      } catch (err) {
        console.warn("[Supabase Team Archive Warning]:", err);
      }
    }
  } else {
    store.team = store.team.filter((t) => t.id !== id);
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from("team_profiles").delete().eq("id", id);
      }
    } catch (err) {
      console.warn("[Supabase Team Delete Warning]:", err);
    }
  }

  return true;
}

export async function restoreTeamMember(id: string): Promise<boolean> {
  const store = ensureStore();
  const member = (store.team || []).find((t) => t.id === id);
  if (member) {
    member.isArchived = false;
    member.isVisible = true;
    member.updatedAt = new Date().toISOString();
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("team_profiles").update({ is_archived: false, is_visible: true, updated_at: new Date().toISOString() }).eq("id", id);
    }
  } catch (err) {
    console.warn("[Supabase Team Restore Warning]:", err);
  }

  return true;
}

export async function duplicateTeamMember(id: string): Promise<TeamMember | null> {
  const original = await getTeamMemberById(id);
  if (!original) return null;

  const now = new Date().toISOString();
  const newMember: TeamMember = {
    ...original,
    id: `team-${Date.now()}`,
    name: `${original.name} (Copy)`,
    displayName: original.displayName ? `${original.displayName} (Copy)` : undefined,
    displayOrder: (original.displayOrder ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
  };

  await saveTeamMember(newMember);
  return newMember;
}

export async function reorderTeamMembers(orderedIds: string[]): Promise<boolean> {
  const store = ensureStore();
  orderedIds.forEach((id, index) => {
    const member = (store.team || []).find((t) => t.id === id);
    if (member) {
      member.displayOrder = index + 1;
      member.updatedAt = new Date().toISOString();
    }
  });

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from("team_profiles").update({ display_order: i + 1, updated_at: new Date().toISOString() }).eq("id", orderedIds[i]);
      }
    }
  } catch (err) {
    console.warn("[Supabase Team Reorder Warning]:", err);
  }

  return true;
}

// ----------------- SITE MODULES CMS -----------------

function mapDbRowToSiteModule(row: any): SiteModule {
  return {
    id: row.id,
    module_number: Number(row.module_number) || 1,
    module_code: row.module_code || `MOD-0${row.module_number || 1}`,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    week_label: row.week_label,
    duration: row.duration,
    image_url: row.image_url,
    topics: Array.isArray(row.topics) ? row.topics : [],
    display_order: Number(row.display_order) || 1,
    is_visible: row.is_visible !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getSiteModules(includeHidden: boolean = false): Promise<SiteModule[]> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let query = supabase
        .from("site_modules")
        .select("*")
        .order("display_order", { ascending: true });
      if (!includeHidden) {
        query = query.eq("is_visible", true);
      }
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(mapDbRowToSiteModule);
      }
    }
  } catch (err) {
    console.warn("[Supabase Modules Fetch Warning]:", err);
  }

  const store = ensureStore();
  const list = store.modules || DEFAULT_MODULES;
  return includeHidden ? list : list.filter((m) => m.is_visible);
}

export async function saveSiteModule(module: SiteModule): Promise<SiteModule> {
  const store = ensureStore();
  if (!store.modules) store.modules = [...DEFAULT_MODULES];

  const now = new Date().toISOString();
  const updatedModule: SiteModule = { ...module, updated_at: now };
  const idx = store.modules.findIndex((m) => m.id === module.id);
  if (idx >= 0) {
    store.modules[idx] = updatedModule;
  } else {
    store.modules.push(updatedModule);
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("site_modules").upsert(
        {
          id: module.id,
          module_number: module.module_number,
          module_code: module.module_code,
          title: module.title,
          subtitle: module.subtitle,
          description: module.description,
          week_label: module.week_label,
          duration: module.duration,
          image_url: module.image_url,
          topics: module.topics || [],
          display_order: module.display_order,
          is_visible: module.is_visible,
          updated_at: now,
        },
        { onConflict: "id" }
      );
    }
  } catch (err) {
    console.warn("[Supabase Module Save Warning]:", err);
  }

  return updatedModule;
}

// ----------------- GLOBAL WEBSITE SETTINGS CMS -----------------

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (data && !error) {
        return {
          ...DEFAULT_SETTINGS,
          heroHeading: data.hero_heading || DEFAULT_SETTINGS.heroHeading,
          heroSubtitle: data.hero_subtitle || DEFAULT_SETTINGS.heroSubtitle,
          heroDescription: data.hero_description || DEFAULT_SETTINGS.heroDescription,
          agencyName: data.agency_name || DEFAULT_SETTINGS.agencyName,
          agencyUrl: data.agency_url || DEFAULT_SETTINGS.agencyUrl,
          agencyDescription: data.agency_description || DEFAULT_SETTINGS.agencyDescription,
          whatsappSupportNumber: data.whatsapp_support_number || DEFAULT_SETTINGS.whatsappSupportNumber,
          founderEmail: data.founder_email || DEFAULT_SETTINGS.founderEmail,
          ...data.raw_settings,
        };
      }
    }
  } catch (err) {
    console.warn("[Supabase getWebsiteSettings Warning]:", err);
  }

  const store = ensureStore();
  return store.settings;
}

export async function saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<boolean> {
  const store = ensureStore();
  store.settings = { ...store.settings, ...settings };
  const now = new Date().toISOString();

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("site_settings").upsert(
        {
          id: "default",
          hero_heading: store.settings.heroHeading,
          hero_subtitle: store.settings.heroSubtitle,
          hero_description: store.settings.heroDescription,
          agency_name: store.settings.agencyName,
          agency_url: store.settings.agencyUrl,
          agency_description: store.settings.agencyDescription,
          whatsapp_support_number: store.settings.whatsappSupportNumber,
          founder_email: store.settings.founderEmail,
          raw_settings: store.settings,
          updated_at: now,
        },
        { onConflict: "id" }
      );
    }
  } catch (err) {
    console.warn("[Supabase saveWebsiteSettings Exception]:", err);
  }

  return true;
}

// ----------------- FAQS -----------------

export async function getFaqs(): Promise<FaqItem[]> {
  const store = ensureStore();
  return store.faqs.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveFaq(faq: FaqItem): Promise<boolean> {
  const store = ensureStore();
  const idx = store.faqs.findIndex((f) => f.id === faq.id);
  if (idx >= 0) {
    store.faqs[idx] = faq;
  } else {
    store.faqs.push(faq);
  }
  return true;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const store = ensureStore();
  store.faqs = store.faqs.filter((f) => f.id !== id);
  return true;
}

// ----------------- QUESTION BANK -----------------

export async function getQuestionBank(): Promise<QuestionBankItem[]> {
  const store = ensureStore();
  return store.questions;
}

export async function saveQuestion(q: QuestionBankItem): Promise<boolean> {
  const store = ensureStore();
  const idx = store.questions.findIndex((item) => item.id === q.id);
  if (idx >= 0) {
    store.questions[idx] = q;
  } else {
    store.questions.push(q);
  }
  return true;
}

// ----------------- EMAIL TEMPLATES & LOGS -----------------

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const store = ensureStore();
  return store.emailTemplates;
}

export async function saveEmailTemplate(template: EmailTemplate): Promise<boolean> {
  const store = ensureStore();
  const idx = store.emailTemplates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    store.emailTemplates[idx] = template;
  } else {
    store.emailTemplates.push(template);
  }
  return true;
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  const store = ensureStore();
  return store.emailLogs;
}

// ----------------- AUDIT & SESSIONS -----------------

export async function getAuditLogs(): Promise<AdminAuditLog[]> {
  const store = ensureStore();
  return store.auditLogs;
}

export async function addAuditLog(
  actionType: AdminAuditLog["actionType"],
  details: string,
  targetId?: string,
  adminUser = "Master Admin"
): Promise<boolean> {
  const store = ensureStore();
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType,
    adminUser,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
  return true;
}

export async function getAdminSessions(): Promise<AdminSession[]> {
  const store = ensureStore();
  return store.sessions;
}

export async function createAdminSession(session: AdminSession): Promise<boolean> {
  const store = ensureStore();
  store.sessions = store.sessions.filter((s) => s.token !== session.token);
  store.sessions.unshift(session);
  return true;
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  if (!token) return false;
  const store = ensureStore();
  const found = store.sessions.find((s) => s.token === token);
  if (found) {
    found.lastActive = new Date().toISOString();
    return true;
  }
  return false;
}

export async function revokeAdminSession(token: string): Promise<boolean> {
  const store = ensureStore();
  store.sessions = store.sessions.filter((s) => s.token !== token);
  return true;
}

export async function revokeAllOtherAdminSessions(currentToken: string): Promise<boolean> {
  const store = ensureStore();
  store.sessions = store.sessions.filter((s) => s.token === currentToken);
  return true;
}

export async function revokeAllAdminSessions(): Promise<boolean> {
  const store = ensureStore();
  store.sessions = [];
  return true;
}

// ----------------- SITE ASSETS CRUD -----------------

export async function getSiteAssets(): Promise<SiteAsset[]> {
  const store = ensureStore();
  return store.siteAssets || DEFAULT_SITE_ASSETS;
}

export async function saveSiteAsset(asset: SiteAsset): Promise<boolean> {
  const store = ensureStore();
  if (!store.siteAssets) store.siteAssets = [...DEFAULT_SITE_ASSETS];
  const idx = store.siteAssets.findIndex((a) => a.id === asset.id || a.assetKey === asset.assetKey);
  if (idx >= 0) {
    store.siteAssets[idx] = { ...asset, updatedAt: new Date().toISOString() };
  } else {
    store.siteAssets.push({ ...asset, updatedAt: new Date().toISOString() });
  }
  return true;
}

export async function deleteSiteAsset(id: string): Promise<boolean> {
  const store = ensureStore();
  if (!store.siteAssets) return false;
  store.siteAssets = store.siteAssets.filter((a) => a.id !== id);
  return true;
}

// ----------------- INTERVIEWS CRUD -----------------

export async function saveInterview(interview: InterviewData): Promise<InterviewData> {
  const store = ensureStore();
  if (!store.interviews) store.interviews = [];

  const now = new Date().toISOString();
  const id = interview.id || `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const updatedInterview: InterviewData = {
    ...interview,
    id,
    updated_at: now,
    created_at: interview.created_at || now,
  };

  const idx = store.interviews.findIndex((i) => i.reference_id === interview.reference_id);
  if (idx >= 0) {
    store.interviews[idx] = updatedInterview;
  } else {
    store.interviews.push(updatedInterview);
  }

  // Sync to Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("interviews").upsert(
        {
          id: updatedInterview.id,
          reference_id: updatedInterview.reference_id,
          applicant_name: updatedInterview.applicant_name,
          applicant_email: updatedInterview.applicant_email,
          interview_round: updatedInterview.interview_round,
          interview_date: updatedInterview.interview_date,
          start_time: updatedInterview.start_time,
          timezone: updatedInterview.timezone || "Asia/Kolkata",
          duration_minutes: updatedInterview.duration_minutes || 30,
          platform: updatedInterview.platform,
          meeting_link: updatedInterview.meeting_link,
          interviewer_name: updatedInterview.interviewer_name,
          instructions: updatedInterview.instructions || null,
          admin_notes: updatedInterview.admin_notes || null,
          status: updatedInterview.status,
          invitation_sent: updatedInterview.invitation_sent,
          updated_at: now,
        },
        { onConflict: "reference_id" }
      );

      // Auto update candidate application status if scheduled
      if (updatedInterview.status === "Scheduled" || updatedInterview.status === "Rescheduled") {
        await supabase
          .from("applications")
          .update({ status: "Interview Scheduled", updated_at: now })
          .eq("reference_id", updatedInterview.reference_id);
      }
    }
  } catch (err) {
    console.warn("[Supabase saveInterview Warning]:", err);
  }

  return updatedInterview;
}

export async function getInterviewByRef(referenceId: string): Promise<InterviewData | null> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("interviews")
        .select("*")
        .eq("reference_id", referenceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return data as InterviewData;
      }
    }
  } catch (err) {
    console.warn("[Supabase getInterviewByRef Warning]:", err);
  }

  const store = ensureStore();
  const found = (store.interviews || []).find((i) => i.reference_id === referenceId);
  return found || null;
}

export async function updateInterviewStatus(
  referenceId: string,
  status: InterviewData["status"],
  notes?: string
): Promise<boolean> {
  const store = ensureStore();
  const interview = (store.interviews || []).find((i) => i.reference_id === referenceId);
  const now = new Date().toISOString();
  if (interview) {
    interview.status = status;
    if (notes) interview.admin_notes = notes;
    interview.updated_at = now;
  }

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const updatePayload: any = { status, updated_at: now };
      if (notes) updatePayload.admin_notes = notes;
      await supabase.from("interviews").update(updatePayload).eq("reference_id", referenceId);

      // Update application status
      let appStatus: any = undefined;
      if (status === "Completed") appStatus = "Interview Completed";
      else if (status === "Cancelled") appStatus = "Under Review";

      if (appStatus) {
        await supabase.from("applications").update({ status: appStatus, updated_at: now }).eq("reference_id", referenceId);
      }
    }
  } catch (err) {
    console.warn("[Supabase updateInterviewStatus Warning]:", err);
  }

  return true;
}

// ----------------- OFFERS CRUD -----------------

export async function saveOffer(offer: OfferData): Promise<OfferData> {
  const store = ensureStore();
  if (!store.offers) store.offers = [];

  const now = new Date().toISOString();
  const id = offer.id || `ofr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const updatedOffer: OfferData = {
    ...offer,
    id,
    updated_at: now,
    created_at: offer.created_at || now,
  };

  const idx = store.offers.findIndex((o) => o.reference_id === offer.reference_id);
  if (idx >= 0) {
    store.offers[idx] = updatedOffer;
  } else {
    store.offers.push(updatedOffer);
  }

  // Sync to Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("offers").upsert(
        {
          id: updatedOffer.id,
          reference_id: updatedOffer.reference_id,
          applicant_name: updatedOffer.applicant_name,
          applicant_email: updatedOffer.applicant_email,
          internship_role: updatedOffer.internship_role,
          department: updatedOffer.department,
          batch_code: updatedOffer.batch_code,
          joining_date: updatedOffer.joining_date,
          duration: updatedOffer.duration,
          work_mode: updatedOffer.work_mode,
          work_location: updatedOffer.work_location || "Online / Remote",
          working_hours: updatedOffer.working_hours || "Flexible / 3-4 Hours Daily",
          reporting_person: updatedOffer.reporting_person,
          stipend_status: updatedOffer.stipend_status,
          acceptance_deadline: updatedOffer.acceptance_deadline,
          terms_and_conditions: updatedOffer.terms_and_conditions || null,
          authorized_person: updatedOffer.authorized_person,
          designation: updatedOffer.designation,
          token: updatedOffer.token,
          status: updatedOffer.status,
          version: updatedOffer.version || 1,
          pdf_url: updatedOffer.pdf_url || null,
          updated_at: now,
        },
        { onConflict: "token" }
      );

      // Auto update candidate status to Offer Sent
      await supabase
        .from("applications")
        .update({ status: "Offer Sent", updated_at: now })
        .eq("reference_id", updatedOffer.reference_id);
    }
  } catch (err) {
    console.warn("[Supabase saveOffer Warning]:", err);
  }

  return updatedOffer;
}

export async function getOfferByRef(referenceId: string): Promise<OfferData | null> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("reference_id", referenceId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        return data as OfferData;
      }
    }
  } catch (err) {
    console.warn("[Supabase getOfferByRef Warning]:", err);
  }

  const store = ensureStore();
  const found = (store.offers || []).find((o) => o.reference_id === referenceId);
  return found || null;
}

export async function getOfferByToken(token: string): Promise<OfferData | null> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("token", token)
        .maybeSingle();

      if (data && !error) {
        return data as OfferData;
      }
    }
  } catch (err) {
    console.warn("[Supabase getOfferByToken Warning]:", err);
  }

  const store = ensureStore();
  const found = (store.offers || []).find((o) => o.token === token);
  return found || null;
}

export async function respondToOffer(
  token: string,
  response: "Offer Accepted" | "Offer Declined",
  reason?: string
): Promise<{ success: boolean; error?: string; offer?: OfferData }> {
  const offer = await getOfferByToken(token);
  if (!offer) {
    return { success: false, error: "Invalid or expired offer token." };
  }

  if (offer.status === "Offer Accepted") {
    return { success: false, error: "This offer has already been accepted.", offer };
  }

  if (offer.status === "Offer Declined") {
    return { success: false, error: "This offer has already been declined.", offer };
  }

  const now = new Date().toISOString();
  offer.status = response;
  offer.responded_at = now;
  if (reason) offer.decline_reason = reason;
  offer.updated_at = now;

  // Update memory store
  const store = ensureStore();
  const idx = (store.offers || []).findIndex((o) => o.token === token);
  if (idx >= 0) {
    store.offers[idx] = offer;
  }

  // Update Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("offers")
        .update({
          status: response,
          decline_reason: reason || null,
          responded_at: now,
          updated_at: now,
        })
        .eq("token", token);

      // Update application status
      await supabase
        .from("applications")
        .update({ status: response, updated_at: now })
        .eq("reference_id", offer.reference_id);
    }
  } catch (err) {
    console.warn("[Supabase respondToOffer Warning]:", err);
  }

  return { success: true, offer };
}

// ----------------- AUDIT LOGS -----------------

export async function logAdminAction(
  actionType: string,
  targetId?: string,
  details?: string,
  adminUser: string = "Admin"
): Promise<void> {
  const store = ensureStore();
  if (!store.auditLogs) store.auditLogs = [];
  const logItem: AdminAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actionType,
    adminUser,
    targetId,
    details: details || "",
    createdAt: new Date().toISOString(),
  };
  store.auditLogs.unshift(logItem);
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const store = ensureStore();
  return store.auditLogs || [];
}

