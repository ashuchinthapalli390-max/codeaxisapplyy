import "server-only";
import fs from "fs";
import path from "path";
import { ApplicationData } from "@/types/application";
import {
  TeamMember,
  WebsiteSettings,
  InternshipRound,
  VoiceGuideCacheEntry,
  FaqItem,
  QuestionBankItem,
  EmailTemplate,
  EmailLog,
  AdminAuditLog,
  AdminSession,
  SiteAsset,
  SiteModule,
} from "@/types/admin";

export const DEFAULT_TELUGU_NARRATION =
  "హాయ్... CodeXa Apply కి స్వాగతం. Developer Internship application ప్రారంభించే ముందు, కొన్ని ముఖ్యమైన విషయాలు తెలుసుకుందాం. ఈ application లో మొత్తం ఎనిమిది rounds ఉంటాయి. ప్రతి round లో మీ వివరాలను నిజాయితీగా మరియు సరైన విధంగా నమోదు చేయండి. Application answer fields లో Copy, Cut మరియు Paste అనుమతించబడవు. అయితే GitHub, LinkedIn, Portfolio, Project Link వంటి URL మరియు Link fields లో Copy మరియు Paste ఉపయోగించవచ్చు. Restricted fields లో మొదటి నాలుగు clipboard attempts కి warnings వస్తాయి. ఆ warnings ఉన్నప్పటికీ మీ application ని submit చేయవచ్చు. ఐదవ restricted clipboard attempt జరిగితే, మీ current application progress reset అవుతుంది. Application సమయంలో tab మార్చడం లేదా page focus బయటకు వెళ్లడం review signal గా record కావచ్చు. అది automatic rejection కాదు. మరొక ముఖ్యమైన విషయం... Technical knowledge compulsory కాదు. C, Python, Java లేదా HTML తెలియకపోయినా సమస్య లేదు. మీ actual skill level ఏదైతే ఉందో, దానినే నిజాయితీగా select చేయండి. మీరు application complete చేస్తున్నప్పుడు, మీ progress automatically save అవుతుంది. అందుకే తొందరపడకుండా, ప్రతి question ని జాగ్రత్తగా చదివి, మీ own answers ఇవ్వండి. CodeXa Developer Internship application కి all the best. మీ journey ఇక్కడ నుంచే మొదలవుతుంది.";

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
  voiceGuideCache: VoiceGuideCacheEntry[];
  nextApplicationSequence: number;
}

const DEFAULT_INTERNSHIP_ROUND: InternshipRound = {
  id: "round-2026-aug",
  title: "CodeXa Developer Internship 2026",
  batch_code: "2026-AUG",
  status: "AUTO",
  opens_at: "2026-08-20T09:00:00+05:30",
  closes_at: "2026-09-07T23:59:59+05:30",
  next_opens_at: "2026-09-15T09:00:00+05:30",
  timezone: "Asia/Kolkata",
  is_active: true,
  created_at: "2026-08-20T09:00:00.000Z",
  updated_at: "2026-08-20T09:00:00.000Z",
};

const DEFAULT_SETTINGS: WebsiteSettings = {
  applicationStatus: "AUTO",
  batchCode: "2026-AUG",
  openDate: "2026-08-20",
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
  voiceGuide: {
    enabled: true,
    title: "CodeXa Voice Guide",
    teluguScript: DEFAULT_TELUGU_NARRATION,
    provider: "google",
    voiceName: "te-IN-Chirp3-HD-Aoede",
    speechSpeed: 0.95,
    scrollTriggerPx: 350,
    showOncePerSession: false,
    showTranscript: true,
    defaultVolume: 0.9,
  },
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
    title: "Production Deployment & Product Launch",
    subtitle: "Module 04 // Production Launch",
    description: "Vercel cloud deployment, domain configuration, CI/CD automated pipelines, performance optimization, SEO metadata, and product delivery.",
    week_label: "Weeks 7–8",
    duration: "2 Weeks",
    image_url: "/assets/cards/modules/module-04-production-deployment.png",
    topics: [
      "Production cloud deployment on Vercel and modern infrastructure",
      "CI/CD automated deployment pipelines & webhook integrations",
      "Lighthouse performance optimization, caching & SEO meta tags",
      "Live product launch, telemetry logging, and developer certification",
    ],
    display_order: 4,
    is_visible: true,
  },
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "ashu-founder",
    name: "Ashu",
    designation: "Founder & Technical Director",
    roleType: "Founder",
    photoUrl: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    bio: "Founder of CodeXa Agency. Focused on building AI-powered systems, developer tools, hosting platforms, Discord automation, 3D animated web experiences, secure application portals, and futuristic digital products. Leads technical direction, program architecture, and full-stack engineering.",
    quote: "I don't just write code, I build solutions that create impact.",
    roles: [
      "Founder",
      "Technical Direction",
      "Product Strategy",
      "AI & Full-Stack Development",
      "Architecture",
      "Internship Program Oversight",
    ],
    skills: [
      "EDITH AI Agent",
      "CODEXA IDE",
      "Claude Code Workflows",
      "Ethical Hacking Awareness",
      "Secure Portals",
      "3D Web Design",
      "Database Systems",
      "Serverless Deployment",
    ],
    email: "ashuchinthapalli3900@gmail.com",
    whatsapp: "+91 88979 01413",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    websiteUrl: "https://www.codxa-agency.online",
    showContact: true,
    isFeatured: true,
    isVisible: true,
    displayOrder: 1,
  },
  {
    id: "deepak-cofounder",
    name: "Deepak",
    designation: "Co-Founder & Operations Lead",
    roleType: "Co-Founder",
    photoUrl: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    bio: "Co-Founder of CodeXa Agency. Supports the agency through team coordination, community engagement, application guidance, internship communication, and student query resolution. Ensures seamless candidate workflows and program operations.",
    quote: "Connecting people, supporting progress, and keeping the journey smooth.",
    roles: [
      "Co-Founder",
      "Agency Operations",
      "Team Coordination",
      "Internship Coordination",
      "Program Support",
      "Internal Planning",
    ],
    skills: [
      "Team Coordination",
      "Operations Management",
      "Student Query Handling",
      "Community Building",
      "Process Optimization",
    ],
    whatsapp: "+91 94942 45412",
    showContact: true,
    isFeatured: true,
    isVisible: true,
    displayOrder: 2,
  },
  {
    id: "kishore-ceo",
    name: "Kishore",
    designation: "Chief Executive Officer (CEO)",
    roleType: "CEO",
    photoUrl: "/assets/image-assests/2306fc1d8f6ea04d1ddd4ebfafd003f2.jpg",
    bio: "CEO of CodeXa Agency. Drives business strategy, agency partnerships, growth initiatives, project coordination, and administration. Oversees operational scaling and commercial product roadmaps.",
    quote: "Scaling execution, driving innovation, and accelerating developer careers.",
    roles: [
      "CEO",
      "Business Strategy",
      "Agency Operations",
      "Growth & Partnerships",
      "Project Coordination",
      "Administration",
    ],
    skills: [
      "Business Strategy",
      "Growth Marketing",
      "Project Management",
      "Resource Planning",
      "Organizational Leadership",
    ],
    whatsapp: "+91 70758 00951",
    showContact: true,
    isFeatured: true,
    isVisible: true,
    displayOrder: 3,
  },
];

const DEFAULT_SITE_ASSETS: SiteAsset[] = [
  {
    id: "asset-hero-fg",
    assetKey: "hero_foreground",
    name: "Hero Foreground Tech Visual",
    assetUrl: "/assets/image-assests/hero.jpeg",
    assetType: "image",
    section: "Landing Hero",
    altText: "CodeXa Developer Tech Visual",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-hero-bg",
    assetKey: "hero_background",
    name: "Hero Red Web Matrix",
    assetUrl: "/assets/gif-assests/3d614f522fb7bcc40915d9a9b7a8ea17.gif",
    assetType: "gif",
    section: "Landing Hero",
    altText: "Hero Red Motion Grid",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-agency-bg",
    assetKey: "agency_background",
    name: "Agency Cyber Grid",
    assetUrl: "/assets/gif-assests/6017829e0b3e2aaa5fa990adb0889fb0.gif",
    assetType: "gif",
    section: "Agency Spotlight",
    altText: "Agency Tech Atmosphere",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-coding-bg",
    assetKey: "coding_background",
    name: "Coding Stream Motion",
    assetUrl: "/assets/gif-assests/6de84346589395b4f74367e1ef002fa6.gif",
    assetType: "gif",
    section: "Coding Experience",
    altText: "Terminal & Code Stream",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-vibe-bg",
    assetKey: "vibe_background",
    name: "AI Prompt Stream Visual",
    assetUrl: "/assets/gif-assests/992e39771c0279718c88caa6e1663611.gif",
    assetType: "gif",
    section: "Vibe Coding",
    altText: "AI Prompting Network",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-app-bg",
    assetKey: "application_background",
    name: "Application Screening Visual",
    assetUrl: "/assets/gif-assests/d24f62aa1d4ab988fe9d65ed3ec9bc0f.gif",
    assetType: "gif",
    section: "Application Portal",
    altText: "Subtle Ambient Grid",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-success-bg",
    assetKey: "success_background",
    name: "Success Confirmed Red Flash",
    assetUrl: "/assets/gif-assests/d74ed5d64d9c1d573a60020ec3c9a8c1.gif",
    assetType: "gif",
    section: "Success Screen",
    altText: "Application Submitted Flash",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "asset-footer-bg",
    assetKey: "footer_background",
    name: "Footer Dark Horizon",
    assetUrl: "/assets/gif-assests/d8bf146f4bc2b4e3a28cb8c71e81cc28.gif",
    assetType: "gif",
    section: "Footer",
    altText: "Footer Web Pattern",
    isActive: true,
    updatedAt: "2026-08-22T12:00:00.000Z",
  },
];

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Is coding knowledge compulsory to apply?",
    answer:
      "No! Existing coding knowledge is helpful, but completely optional. Beginners with genuine curiosity, high commitment, and an eagerness to learn are strongly encouraged to apply.",
    category: "Eligibility",
    displayOrder: 1,
  },
  {
    id: "faq-2",
    question: "Can first-year students and complete beginners apply?",
    answer:
      "Yes. Our screening evaluates your mindset, responsibility, learning speed, and genuineness rather than past corporate experience.",
    category: "Eligibility",
    displayOrder: 2,
  },
  {
    id: "faq-3",
    question: "Is a high-end laptop or GPU mandatory?",
    answer:
      "No. As long as you have or can arrange access to a basic laptop running VS Code, Git, and a web browser, you are fully equipped. Hardware specs do not penalize your score.",
    category: "Technical",
    displayOrder: 3,
  },
  {
    id: "faq-4",
    question: "How many rounds are there in the application?",
    answer:
      "There are 8 streamlined rounds: Personal Information, Education, Developer Profile, Availability & Hardware, Technical Awareness, Mindset Evaluation, Thought-Process Interview, and Review & Commitment.",
    category: "Selection",
    displayOrder: 4,
  },
  {
    id: "faq-5",
    question: "What if I select 'I Don't Know' in the Technical section?",
    answer:
      "Selecting 'I Don't Know' simply skips technical quiz questions for that language without any negative score penalty. Honesty is valued much higher than inflated claims.",
    category: "Technical",
    displayOrder: 5,
  },
  {
    id: "faq-6",
    question: "How much daily availability is expected?",
    answer:
      "We recommend 2–4 hours per day of focused building, with flexible time slots (Morning, Evening, or Night) so you can smoothly balance college coursework.",
    category: "Commitment",
    displayOrder: 6,
  },
  {
    id: "faq-7",
    question: "How will I know if my application is selected?",
    answer:
      "You can track your real-time status anytime on our Track Application page using your Reference ID. Selected applicants will also receive an official email with private WhatsApp and Discord onboarding links.",
    category: "Selection",
    displayOrder: 7,
  },
  {
    id: "faq-8",
    question: "Is the internship online / remote?",
    answer:
      "Yes, the internship is 100% remote with digital collaboration via Discord, GitHub, and live agency project reviews.",
    category: "General",
    displayOrder: 8,
  },
];

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tmpl-received",
    templateType: "ApplicationReceived",
    subject: "Application Received — CodeXa Developer Internship 2026",
    heading: "APPLICATION DOSSIER REGISTERED",
    body: "Thank you for completing the 8-round screening assessment for CodeXa Developer Internship 2026. Your responses, integrity telemetry, and profile have been successfully logged in our review pipeline.",
    ctaText: "Track Application Status",
    ctaLink: "https://www.codxa-agency.online/status",
    footerText: "Founder: Ashu • Co-Founder: Deepak • CEO: Kishore",
    includeOnboardingLinks: false,
  },
  {
    id: "tmpl-selected",
    templateType: "Selected",
    subject: "Congratulations — Welcome to CodeXa Developer Internship",
    heading: "OFFICIAL ADMISSION NOTICE // BATCH 2026",
    body: "We are thrilled to inform you that your application has cleared our technical and mindset review! You have been selected for the CodeXa Developer Internship (Batch 2026). Please join our private community channels immediately.",
    ctaText: "Join WhatsApp Developer Group",
    ctaLink: "https://chat.whatsapp.com/CodeXaInternship2026Private",
    footerText: "Founder: Ashu • Co-Founder: Deepak • CEO: Kishore",
    includeOnboardingLinks: true,
  },
  {
    id: "tmpl-shortlisted",
    templateType: "Shortlisted",
    subject: "Update: Your Application is Shortlisted — CodeXa Developer Internship",
    heading: "PROFILE SHORTLISTED // ADVANCED SCREENING",
    body: "Your profile has been shortlisted for final cohort allocation. Our technical mentors are currently balancing slot distribution. Expect final selection decisions shortly.",
    ctaText: "Track Status",
    ctaLink: "https://www.codxa-agency.online/status",
    footerText: "Founder: Ashu • Co-Founder: Deepak • CEO: Kishore",
    includeOnboardingLinks: false,
  },
];

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memoryCache: StoreData | null = null;

function ensureStore(): StoreData {
  if (memoryCache) return memoryCache;

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }

  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      memoryCache = JSON.parse(raw);
      if (!memoryCache!.internshipRounds || memoryCache!.internshipRounds.length === 0) {
        memoryCache!.internshipRounds = [{ ...DEFAULT_INTERNSHIP_ROUND }];
      }
      if (!memoryCache!.modules || memoryCache!.modules.length === 0) {
        memoryCache!.modules = [...DEFAULT_MODULES];
      }
      if (!memoryCache!.siteAssets || memoryCache!.siteAssets.length === 0) {
        memoryCache!.siteAssets = [...DEFAULT_SITE_ASSETS];
      }
      if (!memoryCache!.voiceGuideCache) {
        memoryCache!.voiceGuideCache = [];
      }
      if (!memoryCache!.settings.voiceGuide) {
        memoryCache!.settings.voiceGuide = { ...DEFAULT_SETTINGS.voiceGuide! };
      }
      if (!memoryCache!.nextApplicationSequence) {
        memoryCache!.nextApplicationSequence = 101;
      }
      return memoryCache!;
    } catch {
      // fallback
    }
  }

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
    voiceGuideCache: [],
    nextApplicationSequence: 101,
  };

  saveStoreSync(memoryCache);
  return memoryCache;
}

function saveStoreSync(data: StoreData) {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save file store:", err);
  }
}

// ----------------- INTERNSHIP ROUNDS (SINGLE SOURCE OF TRUTH) -----------------

export async function getActiveInternshipRound(): Promise<InternshipRound> {
  // 1. Query Supabase
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
          batch_code: data.batch_code || "2026-AUG",
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

  // 2. Fallback to local file store
  const store = ensureStore();
  const active = store.internshipRounds.find((r) => r.is_active);
  return active || store.internshipRounds[0] || DEFAULT_INTERNSHIP_ROUND;
}

export async function saveInternshipRound(roundData: Partial<InternshipRound>): Promise<InternshipRound> {
  const store = ensureStore();
  const current = await getActiveInternshipRound();
  const nowIso = new Date().toISOString();

  const updated: InternshipRound = {
    ...current,
    ...roundData,
    id: current.id || roundData.id || `round-${Date.now()}`,
    title: roundData.title || current.title || "CodeXa Developer Internship 2026",
    batch_code: roundData.batch_code?.trim() || current.batch_code || "2026-AUG",
    status: (roundData.status || current.status || "AUTO") as any,
    opens_at: roundData.opens_at || current.opens_at,
    closes_at: roundData.closes_at || current.closes_at,
    next_opens_at: roundData.next_opens_at !== undefined ? roundData.next_opens_at : current.next_opens_at,
    timezone: roundData.timezone || current.timezone || "Asia/Kolkata",
    is_active: true,
    updated_at: nowIso,
  };

  // Sync to local store
  const idx = store.internshipRounds.findIndex((r) => r.id === updated.id || r.is_active);
  if (idx >= 0) {
    store.internshipRounds[idx] = updated;
  } else {
    store.internshipRounds.unshift(updated);
  }

  // Sync batch and dates to settings as well
  store.settings.batchCode = updated.batch_code;
  store.settings.applicationStatus = updated.status;
  if (updated.opens_at) {
    store.settings.openDate = updated.opens_at.split("T")[0];
    const timeMatch = updated.opens_at.match(/T(\d{2}:\d{2})/);
    if (timeMatch) store.settings.openTime = timeMatch[1];
  }
  if (updated.closes_at) {
    store.settings.closeDate = updated.closes_at.split("T")[0];
    const timeMatch = updated.closes_at.match(/T(\d{2}:\d{2})/);
    if (timeMatch) store.settings.closeTime = timeMatch[1];
  }
  if (updated.next_opens_at) {
    store.settings.nextOpenDate = updated.next_opens_at.split("T")[0];
    const timeMatch = updated.next_opens_at.match(/T(\d{2}:\d{2})/);
    if (timeMatch) store.settings.nextOpenTime = timeMatch[1];
  }

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType: "SETTINGS_UPDATE",
    adminUser: "Master Admin",
    details: `Updated active internship round: ${updated.batch_code} (Status: ${updated.status}, Closes: ${updated.closes_at})`,
    createdAt: nowIso,
  });

  saveStoreSync(store);

  // Synchronize with Supabase if configured
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

        if (!updateError && updatedDb) {
          updated.id = String(updatedDb.id);
          updated.updated_at = updatedDb.updated_at;
          console.log("[SETTINGS:SAVE] database update success. Row ID:", updated.id, "Closes at:", updated.closes_at);
        } else if (updateError) {
          console.warn("[Supabase Round Update Warning]:", updateError.message);
        }
      } else {
        const { data: insertedDb, error: insertError } = await supabase
          .from("internship_rounds")
          .insert(dbPayload)
          .select()
          .single();

        if (!insertError && insertedDb) {
          updated.id = String(insertedDb.id);
          updated.updated_at = insertedDb.updated_at;
        }
      }
    }
  } catch (err) {
    console.warn("[Supabase saveInternshipRound Exception]:", err);
  }

  return updated;
}

export async function getInternshipRounds(): Promise<InternshipRound[]> {
  const store = ensureStore();
  return store.internshipRounds;
}

// ----------------- APPLICATION SUBMISSION & CRUD -----------------

export async function saveApplication(data: ApplicationData): Promise<{ id: number; reference_id: string }> {
  const store = ensureStore();
  const year = new Date().getFullYear();

  // Collision-safe unique reference ID generation
  let seq = store.nextApplicationSequence || 101;
  let refId: string = data.reference_id || "";

  if (!refId) {
    let exists = true;
    while (exists) {
      const candidate = `CAX-${year}-${String(seq).padStart(6, "0")}`;
      const found = store.applications.some((a) => a.reference_id === candidate);
      if (!found) {
        refId = candidate;
        store.nextApplicationSequence = seq + 1;
        exists = false;
      } else {
        seq += 1;
      }
    }
  }

  const nextId = store.applications.length > 0 ? Math.max(...store.applications.map((a) => a.id || 0)) + 1 : 1;

  const application: ApplicationData = {
    ...data,
    id: nextId,
    reference_id: refId,
    status: data.status || "Submitted",
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingIdx = store.applications.findIndex((a) => a.reference_id === refId);
  if (existingIdx >= 0) {
    store.applications[existingIdx] = application;
  } else {
    store.applications.unshift(application);
  }

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType: "LOGIN",
    adminUser: "System",
    targetId: refId,
    details: `Application submitted by ${application.full_name} (${refId})`,
    createdAt: new Date().toISOString(),
  });

  store.emailLogs.unshift({
    id: `email-${Date.now()}`,
    referenceId: refId,
    recipientEmail: application.email,
    recipientName: application.full_name,
    templateType: "ApplicationReceived",
    status: "Delivered",
    sentAt: new Date().toISOString(),
  });

  saveStoreSync(store);

  // Synchronize with Supabase if configured
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const githubUrl = application.developer_links?.find((l) => l.platform === "GitHub")?.url;
      const linkedinUrl = application.developer_links?.find((l) => l.platform === "LinkedIn")?.url;
      const portfolioUrl = application.developer_links?.find((l) => l.platform === "Portfolio" || l.platform === "Website")?.url;

      const { error } = await supabase.from("applications").upsert(
        {
          reference_id: refId,
          full_name: application.full_name,
          date_of_birth: application.date_of_birth,
          email: application.email,
          phone_number: application.phone_number,
          whatsapp_number: application.whatsapp_number,
          city: application.city,
          state: application.state,
          country: application.country || "India",
          preferred_name: application.preferred_name,
          discord_username: application.discord_username,
          instagram_handle: application.instagram_handle,
          preferred_language: application.preferred_language || "English",
          hobbies: application.hobbies || [],

          college_name: application.college_name,
          university_name: application.university_name,
          degree: application.course,
          course: application.course,
          branch: application.branch,
          academic_year: application.academic_year,
          semester: application.semester,
          roll_number: application.roll_number,
          graduation_year: application.expected_graduation,
          expected_graduation: application.expected_graduation,
          cgpa: application.cgpa,
          percentage: application.percentage,
          cgpa_percentage: application.cgpa || application.percentage,
          certifications: application.certifications,
          achievements: application.achievements,
          backlogs: application.backlogs,

          coding_start_timeline: application.coding_start_timeline,
          has_built_projects: application.has_built_projects,
          hackathon_experience: application.hackathon_experience || "None",
          internship_experience: application.internship_experience || "None",
          freelancing_experience: application.freelancing_experience || "None",
          open_source_experience: application.open_source_experience || "None",
          team_project_experience: application.team_project_experience || "None",
          developer_links: application.developer_links || [],
          projects: application.projects || [],
          github_profile: githubUrl,
          linkedin_profile: linkedinUrl,
          portfolio_website: portfolioUrl,

          daily_availability: application.daily_availability,
          available_days: application.available_days || [],
          preferred_timing: application.preferred_timing || [],
          can_attend_meetings: application.can_attend_meetings,
          can_meet_deadlines: application.can_meet_deadlines,
          can_communicate_if_unavailable: application.can_communicate_if_unavailable,
          academic_constraints: application.academic_constraints,
          exam_periods: application.exam_periods,
          laptop_status: application.laptop_status,
          operating_system: application.operating_system,
          ram_capacity: application.ram_capacity,
          internet_stability: application.internet_stability,
          can_run_dev_tools: application.can_run_dev_tools,
          processor: application.processor,
          gpu: application.gpu,
          storage_type: application.storage_type,
          laptop_model: application.laptop_model,

          c_level: application.c_level,
          c_answers: application.c_answers || {},
          python_level: application.python_level,
          python_answers: application.python_answers || {},
          java_level: application.java_level,
          java_answers: application.java_answers || {},
          html_level: application.html_level,
          html_answers: application.html_answers || {},
          vibe_coding_level: application.vibe_coding_level,
          vibe_coding_answers: application.vibe_coding_answers || {},

          mindset_answers: application.mindset_answers || {},

          interview_q1_why_codexa: application.interview_q1_why_codexa,
          interview_q2_why_select: application.interview_q2_why_select,
          interview_q3_expectations: application.interview_q3_expectations,
          interview_q4_strongest_skills: application.interview_q4_strongest_skills,
          interview_q5_weakest_area: application.interview_q5_weakest_area,
          interview_q6_describe_project: application.interview_q6_describe_project,
          interview_q7_difficult_problem: application.interview_q7_difficult_problem,
          interview_q8_ai_coding_usage: application.interview_q8_ai_coding_usage,
          interview_q9_college_balance: application.interview_q9_college_balance,
          interview_q10_future_goal: application.interview_q10_future_goal,

          commitment_accurate_info: application.commitment_accurate_info,
          commitment_independent_work: application.commitment_independent_work,
          commitment_responsible_communication: application.commitment_responsible_communication,
          commitment_team_rules: application.commitment_team_rules,
          commitment_confidentiality: application.commitment_confidentiality,
          commitment_assigned_duties: application.commitment_assigned_duties,
          commitment_no_guaranteed_employment: application.commitment_no_guaranteed_employment,
          commitment_accept_policies: application.commitment_accept_policies,

          copy_paste_warnings_count: application.copy_paste_warnings_count || 0,
          tab_switch_count: application.tab_switch_count || 0,

          genuineness_integrity_score: application.genuineness_integrity_score || 0,
          commitment_continuity_score: application.commitment_continuity_score || 0,
          mindset_habits_score: application.mindset_habits_score || 0,
          technical_knowledge_score: application.technical_knowledge_score || 0,
          learning_potential_score: application.learning_potential_score || 0,
          interview_communication_score: application.interview_communication_score || 0,
          total_score: application.total_score || 0,
          score_band: application.score_band,
          commitment_signal: application.commitment_signal,
          skill_authenticity: application.skill_authenticity || {},

          status: application.status,
          raw_submission: application,
        },
        { onConflict: "reference_id" }
      );

      if (error) {
        console.warn("[Supabase Application Insert Warning]:", error.message);
      }
    }
  } catch (supabaseErr) {
    console.warn("[Supabase Sync Warning]:", supabaseErr);
  }

  return { id: nextId, reference_id: refId };
}

export async function getApplicationByRef(refOrId: string): Promise<ApplicationData | null> {
  const store = ensureStore();
  const query = refOrId.trim().toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query || String(a.id) === query
  );
  return app || null;
}

export async function trackApplication(referenceId: string, email: string): Promise<ApplicationData | null> {
  const store = ensureStore();
  const refClean = referenceId.trim().toLowerCase();
  const emailClean = email.trim().toLowerCase();
  const app = store.applications.find(
    (a) =>
      a.reference_id?.toLowerCase() === refClean &&
      a.email?.toLowerCase() === emailClean &&
      !a.is_deleted
  );
  return app || null;
}

export async function getApplications(filters?: {
  search?: string;
  status?: string;
  scoreBand?: string;
  commitment?: string;
  college?: string;
  limit?: number;
  offset?: number;
}): Promise<{ applications: ApplicationData[]; total: number }> {
  const store = ensureStore();
  let list = store.applications.filter((a) => !a.is_deleted);

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
  const store = ensureStore();
  const query = refOrId.trim().toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query || String(a.id) === query
  );

  if (!app) return false;

  const oldStatus = app.status;
  app.status = newStatus;
  app.updated_at = new Date().toISOString();

  if (notes && notes.trim()) {
    app.admin_notes = app.admin_notes || [];
    app.admin_notes.unshift(`[${new Date().toLocaleDateString()}] ${notes.trim()}`);
  }

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType: "STATUS_UPDATE",
    adminUser,
    targetId: app.reference_id,
    details: `Updated status from ${oldStatus} to ${newStatus} for ${app.full_name}`,
    createdAt: new Date().toISOString(),
  });

  saveStoreSync(store);

  // Sync with Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase && app.reference_id) {
      await supabase
        .from("applications")
        .update({
          status: newStatus,
          admin_notes: app.admin_notes,
          updated_at: app.updated_at,
        })
        .eq("reference_id", app.reference_id);
    }
  } catch (err) {
    console.warn("[Supabase Status Update Warning]:", err);
  }

  return true;
}

export async function addApplicationNote(refOrId: string, note: string): Promise<boolean> {
  const store = ensureStore();
  const query = refOrId.trim().toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query || String(a.id) === query
  );
  if (!app) return false;

  app.admin_notes = app.admin_notes || [];
  app.admin_notes.unshift(`[${new Date().toLocaleString()}] ${note.trim()}`);
  app.updated_at = new Date().toISOString();

  saveStoreSync(store);
  return true;
}

export async function deleteApplication(refOrId: string): Promise<boolean> {
  const store = ensureStore();
  const query = refOrId.trim().toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query || String(a.id) === query
  );
  if (!app) return false;

  app.is_deleted = true;
  app.deleted_at = new Date().toISOString();
  saveStoreSync(store);
  return true;
}

export async function restoreApplication(refOrId: string): Promise<boolean> {
  const store = ensureStore();
  const query = refOrId.trim().toLowerCase();
  const app = store.applications.find(
    (a) => a.reference_id?.toLowerCase() === query || String(a.id) === query
  );
  if (!app) return false;

  app.is_deleted = false;
  app.deleted_at = undefined;
  saveStoreSync(store);
  return true;
}

// ----------------- VOICE GUIDE CACHE STORE -----------------

export async function getVoiceGuideCache(contentHash: string): Promise<VoiceGuideCacheEntry | null> {
  // Check Supabase first
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("voice_guides")
        .select("*")
        .eq("content_hash", contentHash)
        .maybeSingle();

      if (data && !error) {
        return data as VoiceGuideCacheEntry;
      }
    }
  } catch (err) {
    console.warn("[Supabase Voice Guide Cache Fetch Warning]:", err);
  }

  // Check local store
  const store = ensureStore();
  const found = (store.voiceGuideCache || []).find((v) => v.content_hash === contentHash);
  return found || null;
}

export async function saveVoiceGuideCache(entry: VoiceGuideCacheEntry): Promise<boolean> {
  const store = ensureStore();
  if (!store.voiceGuideCache) store.voiceGuideCache = [];

  const idx = store.voiceGuideCache.findIndex((v) => v.content_hash === entry.content_hash);
  if (idx >= 0) {
    store.voiceGuideCache[idx] = entry;
  } else {
    store.voiceGuideCache.push(entry);
  }
  saveStoreSync(store);

  // Sync to Supabase
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("voice_guides").upsert(
        {
          guide_key: entry.guide_key,
          content_hash: entry.content_hash,
          language: entry.language,
          provider: entry.provider,
          voice_name: entry.voice_name,
          script_text: entry.script_text,
          audio_base64: entry.audio_base64,
          audio_url: entry.audio_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "content_hash" }
      );
    }
  } catch (err) {
    console.warn("[Supabase Voice Guide Cache Save Warning]:", err);
  }

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
    photoUrl: row.profile_image_url || "/assets/image-assests/hero.jpeg",
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
  // 1. Try Supabase
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

  // 2. Local store fallback
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
  const store = ensureStore();
  if (!store.team) store.team = [...DEFAULT_TEAM];

  const now = new Date().toISOString();
  const updatedMember: TeamMember = {
    ...member,
    updatedAt: now,
    createdAt: member.createdAt || now,
    responsibilities: member.responsibilities || member.roles || [],
    roles: member.responsibilities || member.roles || [],
  };

  const idx = store.team.findIndex((t) => t.id === member.id);
  if (idx >= 0) {
    store.team[idx] = updatedMember;
  } else {
    store.team.push(updatedMember);
  }
  saveStoreSync(store);

  // Sync to Supabase
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
  if (!store.team) store.team = [...DEFAULT_TEAM];

  if (softDelete) {
    const member = store.team.find((t) => t.id === id);
    if (member) {
      member.isArchived = true;
      member.isVisible = false;
      member.updatedAt = new Date().toISOString();
      saveStoreSync(store);

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
    saveStoreSync(store);

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
    saveStoreSync(store);
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
  saveStoreSync(store);

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
    subtitle: row.subtitle || "",
    description: row.description || "",
    week_label: row.week_label || "",
    duration: row.duration || "",
    image_url: row.image_url || "/assets/cards/modules/module-01-foundations-vibe-coding.png",
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
      let query = supabase.from("site_modules").select("*").order("display_order", { ascending: true });
      if (!includeHidden) {
        query = query.eq("is_visible", true);
      }
      const { data, error } = await query;
      if (data && !error && data.length > 0) {
        return data.map(mapDbRowToSiteModule);
      }
    }
  } catch (err) {
    console.warn("[Supabase Site Modules Warning]:", err);
  }

  const store = ensureStore();
  const list = store.modules || DEFAULT_MODULES;
  return list
    .filter((m) => includeHidden || m.is_visible !== false)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function saveSiteModule(mod: SiteModule): Promise<SiteModule> {
  const store = ensureStore();
  if (!store.modules) store.modules = [...DEFAULT_MODULES];

  const now = new Date().toISOString();
  const updatedMod: SiteModule = {
    ...mod,
    updated_at: now,
    created_at: mod.created_at || now,
    topics: mod.topics || [],
  };

  const idx = store.modules.findIndex((m) => m.id === mod.id);
  if (idx >= 0) {
    store.modules[idx] = updatedMod;
  } else {
    store.modules.push(updatedMod);
  }
  saveStoreSync(store);

  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("site_modules").upsert(
        {
          id: updatedMod.id,
          module_number: updatedMod.module_number,
          module_code: updatedMod.module_code,
          title: updatedMod.title,
          subtitle: updatedMod.subtitle || null,
          description: updatedMod.description,
          week_label: updatedMod.week_label || null,
          duration: updatedMod.duration || null,
          image_url: updatedMod.image_url,
          topics: updatedMod.topics,
          display_order: updatedMod.display_order,
          is_visible: updatedMod.is_visible,
          updated_at: now,
        },
        { onConflict: "id" }
      );
    }
  } catch (err) {
    console.warn("[Supabase saveSiteModule Exception]:", err);
  }

  return updatedMod;
}

// ----------------- WEBSITE SETTINGS -----------------

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
      if (data && !error && data.raw_settings) {
        return {
          ...DEFAULT_SETTINGS,
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

  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType: "SETTINGS_UPDATE",
    adminUser: "Master Admin",
    details: `Updated website CMS settings (Status: ${store.settings.applicationStatus})`,
    createdAt: now,
  });
  saveStoreSync(store);

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
          voice_guide_enabled: store.settings.voiceGuide?.enabled ?? true,
          voice_guide_settings: store.settings.voiceGuide || {},
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
  saveStoreSync(store);
  return true;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const store = ensureStore();
  store.faqs = store.faqs.filter((f) => f.id !== id);
  saveStoreSync(store);
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
  saveStoreSync(store);
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
  saveStoreSync(store);
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
  saveStoreSync(store);
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
  saveStoreSync(store);
  return true;
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  if (!token) return false;
  const store = ensureStore();
  const found = store.sessions.find((s) => s.token === token);
  if (found) {
    found.lastActive = new Date().toISOString();
    saveStoreSync(store);
    return true;
  }
  return false;
}

export async function revokeAdminSession(token: string): Promise<boolean> {
  const store = ensureStore();
  store.sessions = store.sessions.filter((s) => s.token !== token);
  saveStoreSync(store);
  return true;
}

export async function revokeAllOtherAdminSessions(currentToken: string): Promise<boolean> {
  const store = ensureStore();
  store.sessions = store.sessions.filter((s) => s.token === currentToken);
  saveStoreSync(store);
  return true;
}

export async function revokeAllAdminSessions(): Promise<boolean> {
  const store = ensureStore();
  store.sessions = [];
  saveStoreSync(store);
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
  saveStoreSync(store);
  return true;
}

export async function deleteSiteAsset(id: string): Promise<boolean> {
  const store = ensureStore();
  if (!store.siteAssets) return false;
  store.siteAssets = store.siteAssets.filter((a) => a.id !== id);
  saveStoreSync(store);
  return true;
}
