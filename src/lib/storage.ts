import "server-only";
import fs from "fs";
import path from "path";
import { ApplicationData } from "@/types/application";
import {
  TeamMember,
  WebsiteSettings,
  FaqItem,
  QuestionBankItem,
  EmailTemplate,
  EmailLog,
  AdminAuditLog,
  AdminSession,
  SiteAsset,
} from "@/types/admin";

interface StoreData {
  applications: ApplicationData[];
  team: TeamMember[];
  settings: WebsiteSettings;
  faqs: FaqItem[];
  questions: QuestionBankItem[];
  emailTemplates: EmailTemplate[];
  emailLogs: EmailLog[];
  auditLogs: AdminAuditLog[];
  sessions: AdminSession[];
  siteAssets: SiteAsset[];
}

const DEFAULT_SETTINGS: WebsiteSettings = {
  applicationStatus: "OPEN",
  openDate: "2026-08-22",
  closeDate: "2026-08-31",
  nextOpenDate: "2026-09-15",
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
};

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
    subject: "CodeXa Internship Application Received — {{reference_id}}",
    heading: "Application Successfully Received",
    body: "Hello {{name}},\n\nThank you for applying for the CodeXa Developer Internship 2026. Your application (Reference ID: {{reference_id}}) has successfully entered our review pipeline.\n\nOur team is currently reviewing your profile, mindset assessment, and technical responses. You can check your application status at any time via our tracking portal.",
    ctaText: "Track Your Application",
    ctaLink: "https://codexa-apply.com/status",
    footerText: "CodeXa Agency — Learn. Build. Debug. Ship.",
  },
  {
    id: "tmpl-selected",
    templateType: "Selected",
    subject: "Congratulations — Welcome to CodeXa Developer Internship!",
    heading: "Welcome to CodeXa Agency",
    body: "Dear {{name}},\n\nCongratulations! We are thrilled to inform you that your application ({{reference_id}}) has been SELECTED for the CodeXa Developer Internship 2026.\n\nYour profile demonstrated exceptional dedication, high learning potential, and a builder mindset. Please join our private developer onboarding channels using the links below to complete your setup.",
    ctaText: "Join Private Developer WhatsApp",
    ctaLink: "{{whatsapp_onboarding}}",
    footerText: "Confidential — Strictly for selected CodeXa developers.",
    includeOnboardingLinks: true,
  },
  {
    id: "tmpl-shortlisted",
    templateType: "Shortlisted",
    subject: "CodeXa Application Update — You are Shortlisted ({{reference_id}})",
    heading: "Profile Shortlisted for Next Phase",
    body: "Hello {{name}},\n\nGreat news! Your application ({{reference_id}}) has been SHORTLISTED by our leadership team. We are finalizing project assignments and will share the final confirmation soon.",
    ctaText: "View Application Status",
    ctaLink: "https://codexa-apply.com/status",
    footerText: "CodeXa Agency Recruitment Team",
  },
  {
    id: "tmpl-rejected",
    templateType: "Rejected",
    subject: "CodeXa Application Status Update — {{reference_id}}",
    heading: "Application Update",
    body: "Hello {{name}},\n\nThank you for your interest and effort in completing the CodeXa recruitment process ({{reference_id}}). While we are unable to offer you a seat for this batch due to high volume, we truly appreciated your responses.\n\nWe encourage you to keep building, practice on GitHub, and apply in our next recruitment window.",
    footerText: "CodeXa Agency — Keep Building.",
  },
];

// Sample Initial Applicants for Admin Demonstrations
const SAMPLE_APPLICATIONS: ApplicationData[] = [
  {
    id: 1,
    reference_id: "CAX-2026-000101",
    full_name: "Arjun Kumar",
    date_of_birth: "2004-06-15",
    email: "arjun.kumar.dev@gmail.com",
    phone_number: "+91 98765 43210",
    whatsapp_number: "+91 98765 43210",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    discord_username: "arjun_builds#1234",
    hobbies: ["Coding", "AI", "Gaming", "Robotics"],
    college_name: "JNTU College of Engineering",
    university_name: "JNTUH",
    course: "B.Tech",
    branch: "Computer Science and Engineering",
    academic_year: "3",
    semester: "5",
    roll_number: "22071A0501",
    expected_graduation: "2026",
    cgpa: "8.6",
    coding_start_timeline: "1-2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    hackathon_experience: "Participated in 2 hackathons",
    internship_experience: "None, looking for first opportunity",
    freelancing_experience: "Built a website for a local business",
    open_source_experience: "Made minor documentation pull requests",
    team_project_experience: "Built college project with 3 teammates",
    developer_links: [
      { platform: "GitHub", url: "https://github.com/arjun-codes-26" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/arjunkumar-dev" },
      { platform: "Portfolio", url: "https://arjun-portfolio.vercel.app" },
    ],
    projects: [
      {
        id: "p1",
        name: "DevMatrix - AI Code Assistant",
        description: "Built a full-stack Next.js app that analyzes code errors and suggests fixes using LLMs.",
        techStack: "Next.js, TypeScript, Tailwind, OpenAI API",
        githubUrl: "https://github.com/arjun/devmatrix",
        liveUrl: "https://devmatrix.vercel.app",
        role: "Full-Stack Developer",
        projectType: "Individual",
        whatYouLearned: "Learned streaming API responses and managing server-side state in React.",
      },
    ],
    daily_availability: "3–4 hours",
    available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    preferred_timing: ["Evening", "Night"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",
    laptop_status: "Own Laptop",
    operating_system: "Windows",
    ram_capacity: "16 GB",
    internet_stability: "Stable",
    can_run_dev_tools: "Yes",
    c_level: "Basic",
    c_answers: { c_q1: "A", c_q2: "B" },
    python_level: "Average",
    python_answers: { python_q1: "B", python_q2: "C", python_q3: "A" },
    java_level: "Learner",
    java_answers: { java_q1: "B", java_q2: "B" },
    html_level: "Expert",
    html_answers: { html_q1: "C", html_q2: "C", html_q3: "B", html_q4: "A", html_q5: "D" },
    vibe_coding_level: "Advanced",
    vibe_coding_answers: { vibe_q1: "B", vibe_q2: "B" },
    mindset_answers: {
      mindset_q1: "B",
      mindset_q2: "B",
      mindset_q3: "B",
      mindset_q4: "B",
      mindset_q5: "A",
      mindset_q6: "B",
      mindset_q7: "B",
      mindset_q8: "B",
      mindset_q9: "A",
      mindset_q10: "B",
    },
    interview_q1_why_codexa:
      "I want to work in an intensive engineering environment where I can build production systems rather than just following dry tutorials. CodeXa's focus on AI coding and deployment matches my exact ambition.",
    interview_q2_why_select:
      "I bring genuine consistency, rapid self-learning, and zero hesitation to debug complex problems. I commit 3-4 hours every day without excuses.",
    interview_q3_expectations:
      "Hands-on experience with production databases, team Git workflows, deployment pipelines, and building agency-grade web apps.",
    interview_q4_strongest_skills: "Fast debugging, frontend UI polish, TypeScript, and AI prompt engineering.",
    interview_q5_weakest_area: "Advanced SQL query optimization and backend microservices architecture.",
    interview_q6_describe_project:
      "I developed a student attendance tracker with React and Node.js that handled 400+ student records with CSV exports.",
    interview_q7_difficult_problem:
      "When my database connections crashed during concurrent requests, I debugged connection pool limits and optimized queries.",
    interview_q8_ai_coding_usage:
      "I use AI to write boilerplate, brainstorm architectural patterns, and explain tricky errors, but I always review and test every line before pushing.",
    interview_q9_college_balance:
      "I dedicate early mornings and evenings (6 PM to 10 PM) exclusively to CodeXa project building.",
    interview_q10_future_goal: "Become a proficient Full-Stack AI Engineer building scalable SaaS applications.",
    commitment_accurate_info: true,
    commitment_independent_work: true,
    commitment_responsible_communication: true,
    commitment_team_rules: true,
    commitment_confidentiality: true,
    commitment_assigned_duties: true,
    commitment_no_guaranteed_employment: true,
    commitment_accept_policies: true,
    copy_paste_warnings_count: 0,
    tab_switch_count: 1,
    genuineness_integrity_score: 25,
    commitment_continuity_score: 25,
    mindset_habits_score: 20,
    technical_knowledge_score: 14,
    learning_potential_score: 10,
    interview_communication_score: 9.5,
    total_score: 88.5,
    score_band: "Exceptional Profile",
    commitment_signal: "Strong",
    skill_authenticity: {
      c: "Consistent",
      python: "Consistent",
      java: "Consistent",
      html: "Consistent",
      vibe_coding: "Consistent",
      overall: "High",
    },
    status: "Shortlisted",
    admin_notes: ["Exceptional profile, strong project samples, high consistency."],
    admin_tags: ["High Potential", "Full-Stack", "AI Ready"],
    created_at: "2026-08-22T10:14:00.000Z",
    updated_at: "2026-08-22T10:14:00.000Z",
  },
  {
    id: 2,
    reference_id: "CAX-2026-000102",
    full_name: "Pooja Reddy",
    date_of_birth: "2005-02-18",
    email: "pooja.reddy.it@gmail.com",
    phone_number: "+91 87654 32109",
    whatsapp_number: "+91 87654 32109",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    hobbies: ["Web Design", "Content creation", "Music", "Reading"],
    college_name: "RV College of Engineering",
    university_name: "VTU",
    course: "B.E.",
    branch: "Information Science",
    academic_year: "2",
    semester: "3",
    roll_number: "1RV23IS089",
    expected_graduation: "2027",
    cgpa: "9.1",
    coding_start_timeline: "6 months ago",
    has_built_projects: "Yes, learning projects",
    hackathon_experience: "None yet",
    internship_experience: "None",
    freelancing_experience: "None",
    open_source_experience: "None",
    team_project_experience: "College mini-project",
    developer_links: [
      { platform: "GitHub", url: "https://github.com/poojareddy" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/poojareddy-it" },
    ],
    projects: [
      {
        id: "p2",
        name: "EcoTrack",
        description: "A responsive website that tracks daily carbon footprints with visual charts.",
        techStack: "HTML5, CSS3, JavaScript, Chart.js",
        githubUrl: "https://github.com/pooja/ecotrack",
        role: "UI Designer & Developer",
        projectType: "Individual",
        whatYouLearned: "Mastered responsive layouts, CSS Flexbox/Grid, and charting libraries.",
      },
    ],
    daily_availability: "2–3 hours",
    available_days: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    preferred_timing: ["Evening", "Night"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",
    laptop_status: "Own Laptop",
    operating_system: "macOS",
    ram_capacity: "8 GB",
    internet_stability: "Stable",
    can_run_dev_tools: "Yes",
    c_level: "I Don't Know",
    c_answers: {},
    python_level: "Learner",
    python_answers: { python_q1: "B", python_q2: "C" },
    java_level: "I Don't Know",
    java_answers: {},
    html_level: "Average",
    html_answers: { html_q1: "C", html_q2: "C", html_q3: "B", html_q4: "A" },
    vibe_coding_level: "Basic",
    vibe_coding_answers: { vibe_q1: "B" },
    mindset_answers: {
      mindset_q1: "B",
      mindset_q2: "B",
      mindset_q3: "B",
      mindset_q4: "B",
      mindset_q5: "A",
      mindset_q6: "B",
      mindset_q7: "B",
      mindset_q8: "B",
      mindset_q9: "A",
      mindset_q10: "B",
    },
    interview_q1_why_codexa:
      "I love how CodeXa welcomes beginners who want to build real products instead of judging them only on heavy competitive programming. I want to learn frontend, APIs, and modern development.",
    interview_q2_why_select:
      "I am disciplined, honest about what I know, and eager to complete tasks on time.",
    interview_q3_expectations: "Mentorship on web architecture and real agency workflows.",
    interview_q4_strongest_skills: "UI design, HTML/CSS, dedication, and clear communication.",
    interview_q5_weakest_area: "Backend databases and complex algorithms.",
    interview_q6_describe_project: "Designed and coded EcoTrack, a clean carbon footprint dashboard.",
    interview_q7_difficult_problem: "Making CSS layouts fully responsive on mobile screen sizes.",
    interview_q8_ai_coding_usage: "I use AI to explain error messages and give suggestions for CSS properties.",
    interview_q9_college_balance: "I finish college work in the afternoon and build code in the evening.",
    interview_q10_future_goal: "Become a proficient Frontend & Product Developer.",
    commitment_accurate_info: true,
    commitment_independent_work: true,
    commitment_responsible_communication: true,
    commitment_team_rules: true,
    commitment_confidentiality: true,
    commitment_assigned_duties: true,
    commitment_no_guaranteed_employment: true,
    commitment_accept_policies: true,
    copy_paste_warnings_count: 0,
    tab_switch_count: 0,
    genuineness_integrity_score: 25,
    commitment_continuity_score: 24,
    mindset_habits_score: 20,
    technical_knowledge_score: 11,
    learning_potential_score: 10,
    interview_communication_score: 8.5,
    total_score: 78.5,
    score_band: "Strong Candidate",
    commitment_signal: "Strong",
    skill_authenticity: {
      c: "Skipped",
      python: "Consistent",
      java: "Skipped",
      html: "Consistent",
      vibe_coding: "Consistent",
      overall: "High",
    },
    status: "Under Review",
    admin_notes: ["Honest responses, good UI foundation, high growth potential."],
    admin_tags: ["Frontend", "Design Aware", "Fast Learner"],
    created_at: "2026-08-22T11:30:00.000Z",
    updated_at: "2026-08-22T11:30:00.000Z",
  },
];

// Persistent File-backed Store Manager
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
      if (!memoryCache!.siteAssets || memoryCache!.siteAssets.length === 0) {
        memoryCache!.siteAssets = [...DEFAULT_SITE_ASSETS];
      }
      return memoryCache!;
    } catch {
      // fallback
    }
  }

  memoryCache = {
    applications: [...SAMPLE_APPLICATIONS],
    team: [...DEFAULT_TEAM],
    settings: { ...DEFAULT_SETTINGS },
    faqs: [...DEFAULT_FAQS],
    questions: [],
    emailTemplates: [...DEFAULT_EMAIL_TEMPLATES],
    emailLogs: [
      {
        id: "log-1",
        referenceId: "CAX-2026-000101",
        recipientEmail: "arjun.kumar.dev@gmail.com",
        recipientName: "Arjun Kumar",
        templateType: "ApplicationReceived",
        status: "Delivered",
        sentAt: "2026-08-22T10:14:05.000Z",
      },
      {
        id: "log-2",
        referenceId: "CAX-2026-000102",
        recipientEmail: "pooja.reddy.it@gmail.com",
        recipientName: "Pooja Reddy",
        templateType: "ApplicationReceived",
        status: "Delivered",
        sentAt: "2026-08-22T11:30:04.000Z",
      },
    ],
    auditLogs: [
      {
        id: "audit-1",
        actionType: "LOGIN",
        adminUser: "Master Admin",
        details: "Admin logged in successfully from Windows Chrome",
        ipAddress: "127.0.0.1",
        createdAt: "2026-08-22T12:00:00.000Z",
      },
      {
        id: "audit-2",
        actionType: "STATUS_UPDATE",
        adminUser: "Master Admin",
        targetId: "CAX-2026-000101",
        details: "Changed status of Arjun Kumar to Shortlisted",
        createdAt: "2026-08-22T12:05:00.000Z",
      },
    ],
    sessions: [
      {
        id: "sess-1",
        token: "session_primary_admin",
        deviceInfo: "Windows 11 / Google Chrome 128",
        ipAddress: "127.0.0.1",
        lastActive: new Date().toISOString(),
        createdAt: "2026-08-22T12:00:00.000Z",
        isCurrent: true,
      },
    ],
    siteAssets: [...DEFAULT_SITE_ASSETS],
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

// ----------------- STORAGE API METHODS -----------------

export async function saveApplication(data: ApplicationData): Promise<{ id: number; reference_id: string }> {
  const store = ensureStore();
  const nextId = store.applications.length > 0 ? Math.max(...store.applications.map((a) => a.id || 0)) + 1 : 1;
  const year = new Date().getFullYear();
  const pad = String(nextId).padStart(6, "0");
  const refId = data.reference_id || `CAX-${year}-${pad}`;

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

  // Create audit log and email log
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

      const { error } = await supabase.from("applications").upsert({
        reference_id: refId,
        full_name: application.full_name,
        email: application.email,
        phone_number: application.phone_number,
        whatsapp_number: application.whatsapp_number,
        city: application.city,
        state: application.state,
        college_name: application.college_name,
        degree: application.course,
        branch: application.branch,
        graduation_year: application.expected_graduation,
        current_year_semester: `${application.academic_year || ""} ${application.semester || ""}`.trim(),
        cgpa_percentage: application.cgpa || application.percentage,
        github_profile: githubUrl,
        linkedin_profile: linkedinUrl,
        portfolio_website: portfolioUrl,
        total_score: application.total_score,
        score_band: application.score_band,
        status: application.status,
        raw_submission: application,
      }, { onConflict: "reference_id" });

      if (error) {
        console.warn("[Supabase Insert Warning]:", error.message);
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

  // Automated email trigger for Selected / Shortlisted / Not Selected
  if (newStatus === "Selected" || newStatus === "Shortlisted" || newStatus === "Not Selected") {
    store.emailLogs.unshift({
      id: `email-${Date.now()}`,
      referenceId: app.reference_id || "",
      recipientEmail: app.email,
      recipientName: app.full_name,
      templateType: newStatus,
      status: "Delivered",
      sentAt: new Date().toISOString(),
    });
  }

  saveStoreSync(store);
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

// ----------------- TEAM CMS -----------------

export async function getTeamMembers(): Promise<TeamMember[]> {
  const store = ensureStore();
  return store.team.sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function saveTeamMember(member: TeamMember): Promise<boolean> {
  const store = ensureStore();
  const idx = store.team.findIndex((t) => t.id === member.id);
  if (idx >= 0) {
    store.team[idx] = member;
  } else {
    store.team.push(member);
  }
  saveStoreSync(store);
  return true;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const store = ensureStore();
  store.team = store.team.filter((t) => t.id !== id);
  saveStoreSync(store);
  return true;
}

// ----------------- WEBSITE SETTINGS -----------------

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  const store = ensureStore();
  return store.settings;
}

export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<boolean> {
  const store = ensureStore();
  store.settings = { ...store.settings, ...settings };
  store.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    actionType: "SETTINGS_UPDATE",
    adminUser: "Master Admin",
    details: `Updated website CMS settings (Status: ${settings.applicationStatus})`,
    createdAt: new Date().toISOString(),
  });
  saveStoreSync(store);
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

