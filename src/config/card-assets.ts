export interface LearningModuleCard {
  id: number;
  moduleCode: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  skills: string[];
  image: string;
}

export interface ApplicationRoundCard {
  round: number;
  roundCode: string;
  title: string;
  subtitle: string;
  description: string;
  fields: string;
  adaptive?: boolean;
  image: string;
}

export const learningModules: LearningModuleCard[] = [
  {
    id: 1,
    moduleCode: "MOD 01",
    title: "Foundations & Vibe Coding",
    subtitle: "AI-ASSISTED WORKFLOWS & GIT",
    description:
      "Master modern AI developer workflows, prompt scaffolding, terminal navigation, Git version control, and production development velocity.",
    duration: "Weeks 1–2",
    skills: ["AI Workflows", "Git & GitHub", "Cursor/Claude Workflows", "Modern TypeScript", "Developer Speed"],
    image: "/assets/cards/modules/module-01-foundations-vibe-coding.png",
  },
  {
    id: 2,
    moduleCode: "MOD 02",
    title: "Full-Stack Web Engineering",
    subtitle: "REACT, NEXT.JS & API ARCHITECTURE",
    description:
      "Build resilient, responsive web applications with Next.js App Router, React 19, Tailwind CSS, REST APIs, and state management.",
    duration: "Weeks 3–4",
    skills: ["Next.js App Router", "React 19", "Tailwind CSS", "API Routing", "Server Components"],
    image: "/assets/cards/modules/module-02-fullstack-web-engineering.png",
  },
  {
    id: 3,
    moduleCode: "MOD 03",
    title: "Databases & Security Architecture",
    subtitle: "SUPABASE, SQL & AUTH PIPELINES",
    description:
      "Architect PostgreSQL databases, write optimized SQL queries, implement secure HttpOnly cookie authentication, and protect endpoints.",
    duration: "Weeks 5–6",
    skills: ["PostgreSQL & Supabase", "Database Schema Design", "Secure Sessions", "Rate Limiting", "Access Control"],
    image: "/assets/cards/modules/module-03-database-security.png",
  },
  {
    id: 4,
    moduleCode: "MOD 04",
    title: "Production Deployment & Ship",
    subtitle: "CI/CD, VERIFICATION & LIVE LAUNCH",
    description:
      "Containerize, audit, test, and deploy production applications to cloud infrastructure with zero downtime and automated CI/CD pipelines.",
    duration: "Weeks 7–8",
    skills: ["Vercel/Cloud Deploy", "CI/CD Pipelines", "Telemetry & Logs", "Performance Optimization", "Live Shipping"],
    image: "/assets/cards/modules/module-04-production-deployment.png",
  },
];

export const applicationRounds: ApplicationRoundCard[] = [
  {
    round: 1,
    roundCode: "ROUND 01",
    title: "Personal Information",
    subtitle: "CANDIDATE IDENTITY & CONTACT",
    description:
      "Basic candidate identity verification including full name, date of birth, contact phone number, and location details.",
    fields: "Full name, DOB, Email, Phone, WhatsApp, City, State, Country, Hobbies",
    image: "/assets/cards/rounds/round-01-personal-information.png",
  },
  {
    round: 2,
    roundCode: "ROUND 02",
    title: "Education & Academics",
    subtitle: "INSTITUTION & DEGREE PROFILE",
    description:
      "Academic background, college enrollment, branch of study, semester status, and expected year of graduation.",
    fields: "College name, University, Course, Branch, Year, Semester, Roll Number, Graduation",
    image: "/assets/cards/rounds/round-02-education-academics.png",
  },
  {
    round: 3,
    roundCode: "ROUND 03",
    title: "Developer Profile & Projects",
    subtitle: "PORTFOLIO & CODING JOURNEY",
    description:
      "Showcase your coding journey, GitHub profile, portfolio link, live project demonstrations, and past developer initiatives.",
    fields: "Coding timeline, Project cards, GitHub, LinkedIn, Portfolio, Hackathons",
    image: "/assets/cards/rounds/round-03-developer-projects.png",
  },
  {
    round: 4,
    roundCode: "ROUND 04",
    title: "Availability & Hardware",
    subtitle: "TIME COMMITMENT & DEV ENVIRONMENT",
    description:
      "Daily time availability, weekly schedules, laptop hardware specifications, operating system, and dev tools compatibility.",
    fields: "Daily hours, Days Mon-Sun, Timing slots, Laptop, OS, RAM, Internet stability",
    image: "/assets/cards/rounds/round-04-availability-hardware.png",
  },
  {
    round: 5,
    roundCode: "ROUND 05",
    title: "Technical Awareness",
    subtitle: "ADAPTIVE SKILL ASSESSMENT",
    description:
      "Self-evaluated proficiency in C, Python, Java, HTML, and Vibe Coding with adaptive screening questions. 'I Don't Know' is fully valid.",
    fields: "C, Python, Java, HTML, Vibe Coding (0 to 5 adaptive Qs per level)",
    adaptive: true,
    image: "/assets/cards/rounds/round-05-technical-awareness.png",
  },
  {
    round: 6,
    roundCode: "ROUND 06",
    title: "Mindset & Work Habits",
    subtitle: "DECISION MAKING & OWNERSHIP",
    description:
      "10 situational scenario questions evaluating candidate ethics, teamwork, responsibility, time management, and learning agility.",
    fields: "10 Situational Scenario MCQs assessing ownership, ethics, and collaboration",
    image: "/assets/cards/rounds/round-06-mindset-work-habits.png",
  },
  {
    round: 7,
    roundCode: "ROUND 07",
    title: "Thought-Process Interview",
    subtitle: "WRITTEN REASONING & ASPIRATIONS",
    description:
      "10 reflective essay questions exploring why CodeXa, strongest skills, problem-solving experiences, and future career goals.",
    fields: "10 Short Essay Questions (min 20 / max 1200 characters each)",
    image: "/assets/cards/rounds/round-07-thought-process-interview.png",
  },
  {
    round: 8,
    roundCode: "ROUND 08",
    title: "Review & Commitment",
    subtitle: "DOSSIER VERIFICATION & SIGN-OFF",
    description:
      "Comprehensive review of all 8 screening sections, direct jump-to-edit capabilities, and formal acceptance of CodeXa internship terms.",
    fields: "Round summary, Jump-to-edit links, Signed integrity and policy declarations",
    image: "/assets/cards/rounds/round-08-review-commitment.png",
  },
];
