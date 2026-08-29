"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import IntroAnimation from "@/components/IntroAnimation";
import CodeXaVoiceGuide from "@/components/voice/CodeXaVoiceGuide";
import { TeamMember, InternshipRound } from "@/types/admin";
import { learningModules, applicationRounds } from "@/config/card-assets";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  Crown,
  Database,
  ExternalLink,
  Flame,
  GitBranch,
  Globe,
  Laptop,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  Play,
  Rocket,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function HomePage() {
  const [introViewed, setIntroViewed] = useState(true);
  const [activeCodeTab, setActiveCodeTab] = useState<"developer" | "future" | "codexa">("developer");
  const [ideTypingCode, setIdeTypingCode] = useState("");
  const [ideTerminalOutput, setIdeTerminalOutput] = useState<string[]>([]);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [activeRoundIndex, setActiveRoundIndex] = useState<number>(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setTeamMembers(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Live Application & Internship Round Configuration
  const [appConfig, setAppConfig] = useState<{
    round: InternshipRound;
    settings: any;
  } | null>(null);

  // Dynamic countdown timer state derived from database timestamps
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    badgeText: "APPLICATION WINDOW CLOSING SOON",
    status: "OPEN" as "OPEN" | "OPENING_SOON" | "CLOSED",
    canApply: true,
  });

  // Fetch active application config from database
  const fetchAppConfig = () => {
    fetch("/api/applications/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setAppConfig(json.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAppConfig();
    const interval = setInterval(fetchAppConfig, 20000); // 20s live sync
    window.addEventListener("focus", fetchAppConfig);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", fetchAppConfig);
    };
  }, []);

  // Check if intro was already shown in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const viewed = sessionStorage.getItem("codexa_intro_viewed");
      if (!viewed) {
        setIntroViewed(false);
      }
    }
  }, []);

  // Real-time second-by-second countdown calculated strictly from database timestamps
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const round = appConfig?.round;

      const opensAtMs = round?.opens_at
        ? new Date(round.opens_at).getTime()
        : new Date("2026-08-20T09:00:00+05:30").getTime();
      const closesAtMs = round?.closes_at
        ? new Date(round.closes_at).getTime()
        : new Date("2026-09-07T23:59:59+05:30").getTime();
      const nextOpensAtMs = round?.next_opens_at ? new Date(round.next_opens_at).getTime() : null;

      // Status derivation
      const rawStatus = (round as any)?.raw_status || round?.status || "AUTO";

      let status: "OPEN" | "OPENING_SOON" | "CLOSED" = "OPEN";
      let targetMs = closesAtMs;
      let badgeText = "APPLICATION WINDOW CLOSING SOON";
      let canApply = true;

      if (rawStatus === "OPEN") {
        status = "OPEN";
        targetMs = closesAtMs;
        badgeText = "APPLICATION WINDOW CLOSING SOON";
        canApply = true;
      } else if (rawStatus === "OPENING_SOON") {
        status = "OPENING_SOON";
        targetMs = opensAtMs;
        badgeText = "APPLICATION WINDOW OPENS IN";
        canApply = false;
      } else if (rawStatus === "CLOSED") {
        status = "CLOSED";
        targetMs = nextOpensAtMs || closesAtMs;
        badgeText = nextOpensAtMs ? "NEXT APPLICATION WINDOW IN" : "APPLICATIONS CURRENTLY CLOSED";
        canApply = false;
      } else {
        // AUTO calculation based on timestamps
        if (opensAtMs > 0 && now < opensAtMs) {
          status = "OPENING_SOON";
          targetMs = opensAtMs;
          badgeText = "APPLICATION WINDOW OPENS IN";
          canApply = false;
        } else if (closesAtMs > 0 && now >= closesAtMs) {
          status = "CLOSED";
          targetMs = nextOpensAtMs || closesAtMs;
          badgeText = nextOpensAtMs ? "NEXT APPLICATION WINDOW IN" : "APPLICATIONS CURRENTLY CLOSED";
          canApply = false;
        } else {
          status = "OPEN";
          targetMs = closesAtMs;
          badgeText = "APPLICATION WINDOW CLOSING SOON";
          canApply = true;
        }
      }

      const diff = Math.max(0, targetMs - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        badgeText,
        status,
        canApply,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [appConfig]);

  // VS Code simulation code snippets
  const codeFiles = {
    developer: `// CODEXA RECRUITMENT SPEC v2.0
interface Candidate {
  mindset: "builder" | "curious";
  readiness: "serious";
  integrity: "high";
  dailyCommitment: number; // hours
}

const applicant: Candidate = {
  mindset: "builder",
  readiness: "serious",
  integrity: "high",
  dailyCommitment: 3
};

await codexa.evaluateCandidate(applicant);
console.log("✓ Screening pipeline cleared.");`,
    future: `// CAREER ACCELERATION
import { AI, FullStack, GitWorkflows } from "@codexa/core";

export async function buildMyFuture() {
  const stack = await FullStack.init({
    learningMode: "practical-projects",
    aiSteering: true,
    realDeployment: true
  });

  await stack.deployToProduction();
  return "Developer Ready.";
}`,
    codexa: `// CODEXA AGENCY ECOSYSTEM
const agency = new CodeXaAgency({
  mission: "Building Technology. Building Developers.",
  stack: ["Next.js", "AI Prompts", "MySQL", "APIs"],
  rounds: 8,
  mentorship: "Ashu, Deepak, Kishore"
});

agency.launchRecruitmentBatch("2026-AUG");`,
  };

  // Live VS Code typing animation in hero
  useEffect(() => {
    const fullCode = codeFiles[activeCodeTab];
    let idx = 0;
    setIdeTypingCode("");
    setIdeTerminalOutput([
      "> npm run future",
      "Loading candidate environment...",
      "Analyzing mindset parameters...",
      "Connecting to CodeXa Network...",
      "✓ Environment ready. Ready to build.",
    ]);

    const interval = setInterval(() => {
      idx += 3;
      setIdeTypingCode(fullCode.slice(0, idx));
      if (idx >= fullCode.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [activeCodeTab]);

  const whoCanApply = [
    "College students from any academic year or branch",
    "Complete beginners eager to learn practical coding",
    "Self-taught builders looking for structured project guidance",
    "Students with basic coding knowledge ready to build full-stack apps",
    "Aspiring engineers interested in AI-assisted Vibe Coding",
    "Developers seeking real agency teamwork experience",
  ];

  const techStack = [
    { name: "C Language", group: "Languages", icon: "⚙️", desc: "Core memory & foundational logic" },
    { name: "Python", group: "Languages", icon: "🐍", desc: "Scripting, AI tooling & backend APIs" },
    { name: "Java", group: "Languages", icon: "☕", desc: "Object-oriented structures & robust systems" },
    { name: "HTML / CSS", group: "Languages", icon: "🌐", desc: "Semantic structure & responsive layouts" },
    { name: "Vibe Coding", group: "Modern Dev", icon: "⚡", desc: "AI-assisted rapid software construction" },
    { name: "AI Prompting", group: "Modern Dev", icon: "🤖", desc: "Chain-of-thought & structured outputs" },
    { name: "Git & GitHub", group: "Modern Dev", icon: "🌿", desc: "Branching, commits & pull requests" },
    { name: "MySQL & Databases", group: "Modern Dev", icon: "🗄️", desc: "Persistent schemas & relational queries" },
  ];

  const faqs = [
    {
      q: "Is prior coding experience compulsory to apply?",
      a: "No! Prior technical experience is completely optional. Beginners with genuine dedication, honest responses, and a willingness to learn are given full opportunity.",
    },
    {
      q: "Can first-year students and non-CSE students apply?",
      a: "Yes. Students from all branches (CSE, ECE, Mechanical, Civil, IT, BCA, MCA, etc.) and all academic years are eligible.",
    },
    {
      q: "Is a high-end laptop or dedicated GPU mandatory?",
      a: "No. Any basic laptop capable of running VS Code, Git, and a modern web browser is sufficient. Hardware specs do not penalize your evaluation score.",
    },
    {
      q: "What if I select 'I Don't Know' in the technical awareness round?",
      a: "Selecting 'I Don't Know' simply skips technical questions for that language without any negative penalty. Honesty and genuineness are highly rewarded.",
    },
    {
      q: "How many rounds are in the screening process?",
      a: "There are 8 streamlined rounds: Personal, Education, Developer Profile, Availability & Hardware, Technical Awareness, Mindset Evaluation, Thought-Process Interview, and Review & Commitment.",
    },
    {
      q: "How much daily availability is expected during the internship?",
      a: "We recommend 2–4 hours per day. Flexible slots (Morning, Evening, Night) allow you to easily balance college coursework.",
    },
    {
      q: "How does the selection scoring formula work?",
      a: "Evaluation is out of 100 points: Genuineness & Integrity (25), Commitment & Continuity (25), Mindset & Work Habits (20), Technical Awareness (15), Learning Potential (10), and Written Communication (10).",
    },
    {
      q: "How do I check my application status after submitting?",
      a: "You can track your real-time status anytime on our Track Application page using your Reference ID and email address.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative selection:bg-red-600 selection:text-white">
      {/* Intro Animation (First visit only) */}
      {!introViewed && <IntroAnimation onComplete={() => setIntroViewed(true)} />}

      {/* Spider-tech Filament Background Canvas */}
      <CodingBackground />

      <Navbar />

      <main className="relative z-10 space-y-16 sm:space-y-24">
        
        {/* =========================================================================
            SECTION 1: HERO SECTION & CODING ANIMATION WITH FORGED ASSET
           ========================================================================= */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 overflow-hidden">
          
          {/* Background Motion GIF Layer with Dark Overlay & Red Vignette */}
          <div className="absolute inset-0 -z-20 opacity-15 pointer-events-none overflow-hidden rounded-3xl">
            <img
              src="/assets/gif-assests/3d614f522fb7bcc40915d9a9b7a8ea17.gif"
              alt="Hero Grid Background"
              className="w-full h-full object-cover filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent" />
          </div>

          {/* Radial Ambient Red Glow */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/10 filter blur-[100px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy & Application Window */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Live Status Badge */}
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full border border-red-500/40 bg-red-950/30 text-red-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>APPLICATIONS OPEN — BATCH 2026</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
                  CODEXA AGENCY
                </div>
                <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white leading-none">
                  BUILD. LEARN. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400 glow-red">
                    DEBUG. SHIP.
                  </span>
                </h1>
              </div>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed max-w-xl">
                A practical developer recruitment universe and internship built for students who want to master real-world software, AI-assisted coding, databases, and deployment through hands-on agency projects.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-lg">
                {countdown.canApply ? (
                  <Link
                    href="/apply"
                    onClick={playButtonClick}
                    className="btn-red-sweep flex-1 py-4 px-5 text-xs font-mono font-black uppercase tracking-widest bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white rounded-2xl border border-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all"
                  >
                    <span>APPLY NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex-1 py-4 px-5 text-xs font-mono font-black uppercase tracking-widest bg-red-950/40 text-red-300 rounded-2xl border border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>{countdown.status === "OPENING_SOON" ? "OPENS SOON" : "APPLICATIONS CLOSED"}</span>
                  </div>
                )}

                <Link
                  href="/internship"
                  onClick={playButtonClick}
                  className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-[#06060c] hover:bg-red-950/20 text-slate-300 hover:text-white rounded-2xl border border-red-950 hover:border-red-500/40 transition-all flex items-center justify-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-red-400" />
                  <span>CURRICULUM</span>
                </Link>

                <Link
                  href="/status"
                  onClick={playButtonClick}
                  className="py-4 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-black/60 hover:bg-red-950/30 text-slate-300 hover:text-white rounded-2xl border border-red-950 hover:border-red-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Terminal className="w-4 h-4 text-red-400" />
                  <span>TRACK</span>
                </Link>
              </div>

              {/* Date & Countdown Box */}
              <div className="red-glass rounded-2xl p-4 sm:p-5 border border-red-500/30 max-w-lg space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-red-400 border-b border-red-950/60 pb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    {countdown.badgeText}
                  </span>
                  <span className="text-slate-300 font-bold">
                    BATCH: {appConfig?.round?.batch_code || "2026-AUG"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="bg-black/60 rounded-xl p-2 border border-red-950">
                    <div className="text-lg sm:text-2xl font-black text-white">{String(countdown.days).padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 uppercase">DAYS</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-2 border border-red-950">
                    <div className="text-lg sm:text-2xl font-black text-white">{String(countdown.hours).padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 uppercase">HOURS</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-2 border border-red-950">
                    <div className="text-lg sm:text-2xl font-black text-white">{String(countdown.minutes).padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 uppercase">MINUTES</div>
                  </div>
                  <div className="bg-black/60 rounded-xl p-2 border border-red-950">
                    <div className="text-lg sm:text-2xl font-black text-red-400 animate-pulse">{String(countdown.seconds).padStart(2, "0")}</div>
                    <div className="text-[9px] text-slate-500 uppercase">SECONDS</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Forged Hanging Spider-Man & Simulated VS Code IDE */}
            <div className="lg:col-span-5 relative space-y-4">
              
              {/* Forged Hanging Spider-Man Art Component */}
              <div className="relative rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-b from-black via-[#06060c] to-[#030712] p-4 shadow-[0_0_35px_rgba(239,68,68,0.25)] group flex flex-col items-center">
                
                {/* Hanging Web Filament Line */}
                <div className="w-[1px] h-6 bg-gradient-to-b from-red-500/80 via-white to-red-400 -mt-4 mb-1 animate-pulse" />

                <div className="relative w-full h-56 sm:h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/image-assests/hero.jpeg"
                    alt="CodeXa Developer Universe"
                    className="h-full w-auto object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.5)] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                </div>

                <div className="w-full pt-2 flex items-center justify-between font-mono text-[10px] border-t border-red-950/70">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/40 font-bold backdrop-blur-md">
                    CODEXA-CORE-AI // V2.0 ACTIVE
                  </span>
                  <span className="text-slate-400">BATCH 2026 SCREENING</span>
                </div>
              </div>

              {/* VS Code Window */}
              <div className="red-glass rounded-2xl border border-red-500/40 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(239,68,68,0.15)] text-left font-mono">
                
                {/* VS Code Window Title Bar */}
                <div className="bg-[#080810] border-b border-red-950/70 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-red-400" />
                    <span>codexa-ide &mdash; recruit-v2</span>
                  </div>
                  <div className="text-[9px] text-red-400 font-bold">TS</div>
                </div>

                {/* Editor File Tabs */}
                <div className="bg-[#05050c] border-b border-red-950/50 flex items-center overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab("developer")}
                    className={`px-4 py-2 flex items-center gap-1.5 border-r border-red-950/60 cursor-pointer ${
                      activeCodeTab === "developer"
                        ? "bg-[#0b0b14] text-red-400 border-t-2 border-t-red-500 font-bold"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span>developer.ts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab("future")}
                    className={`px-4 py-2 flex items-center gap-1.5 border-r border-red-950/60 cursor-pointer ${
                      activeCodeTab === "future"
                        ? "bg-[#0b0b14] text-red-400 border-t-2 border-t-red-500 font-bold"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span>future.ts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab("codexa")}
                    className={`px-4 py-2 flex items-center gap-1.5 border-r border-red-950/60 cursor-pointer ${
                      activeCodeTab === "codexa"
                        ? "bg-[#0b0b14] text-red-400 border-t-2 border-t-red-500 font-bold"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span>codexa.ts</span>
                  </button>
                </div>

                {/* Code Body */}
                <div className="p-4 bg-[#070710]/95 min-h-[160px] text-[11px] leading-relaxed text-slate-200 overflow-x-auto font-mono">
                  <pre className="whitespace-pre-wrap">
                    <code>
                      {ideTypingCode}
                      <span className="w-2 h-4 bg-red-500 inline-block cursor-blink ml-0.5 align-middle" />
                    </code>
                  </pre>
                </div>

                {/* Simulated Terminal */}
                <div className="bg-[#030308] border-t border-red-950/80 p-3 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[9px] border-b border-red-950/40 pb-1 mb-1.5">
                    <span>TERMINAL &mdash; zsh</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  {ideTerminalOutput.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith("✓")
                          ? "text-emerald-400 font-bold"
                          : line.startsWith(">")
                          ? "text-red-400 font-bold"
                          : "text-slate-400"
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 2: INTERNSHIP OVERVIEW CARDS WITH FORGED MODULE ASSETS
           ========================================================================= */}
        <section id="process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
              PRACTICAL CURRICULUM BLUEPRINT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              Curriculum & Skill Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Designed to take you from foundational understanding to shipping production web tools with modern AI workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {learningModules.map((mod) => (
              <div
                key={mod.id}
                className="tilt-card red-glass rounded-3xl overflow-hidden border border-red-950/80 hover:border-red-500/60 flex flex-col justify-between group transition-all font-mono"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/80">
                  <Image
                    src={mod.image}
                    alt={mod.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14] via-[#0b0b14]/30 to-transparent" />
                  <span className="absolute top-3 left-3 text-[9px] px-2.5 py-0.5 rounded-full bg-black/80 text-red-300 font-bold border border-red-500/40 uppercase backdrop-blur-md">
                    {mod.moduleCode}
                  </span>
                  <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded bg-red-950/90 text-red-300 font-bold border border-red-500/40 uppercase">
                    {mod.duration}
                  </span>
                </div>

                <div className="p-5 space-y-2.5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">
                      {mod.subtitle}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{mod.description}</p>
                  </div>

                  <div className="pt-3 border-t border-red-950/60 text-[9px] font-bold text-red-400 tracking-wider uppercase flex items-center justify-between">
                    <span>{mod.duration}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: INTERNSHIP INFORMATION & WHO CAN APPLY
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Info Grid Left */}
            <div className="lg:col-span-6 red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
                  PROGRAM BLUEPRINT
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-mono text-white">
                  Developer Internship 2026 Specifications
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">PROGRAM</div>
                  <div className="font-bold text-white mt-1">Developer Internship</div>
                </div>
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">MODE</div>
                  <div className="font-bold text-emerald-400 mt-1">Online / Remote</div>
                </div>
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">SCREENING</div>
                  <div className="font-bold text-red-400 mt-1">8 Streamlined Rounds</div>
                </div>
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">LEARNING</div>
                  <div className="font-bold text-white mt-1">Hands-on Building</div>
                </div>
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">PROJECTS</div>
                  <div className="font-bold text-white mt-1">Practical Development</div>
                </div>
                <div className="bg-black/50 p-3.5 rounded-xl border border-red-950">
                  <div className="text-slate-500 text-[10px]">SELECTION</div>
                  <div className="font-bold text-rose-400 mt-1">Profile + Mindset + Potential</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-xs font-mono text-slate-300 leading-relaxed">
                Commitment, genuine curiosity, honesty, and continuous communication matter much more than past credentials.
              </div>
            </div>

            {/* Who Can Apply Right */}
            <div className="lg:col-span-6 red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
                  ELIGIBILITY & INCLUSION
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-mono text-white">
                  Who Can Apply?
                </h3>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {whoCanApply.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-2 font-mono">
                <div className="text-xs font-bold text-red-400">Important Note:</div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  &ldquo;Existing coding knowledge is useful, but it is not compulsory. Genuine interest, commitment, mindset, and willingness to learn are what define your success at CodeXa.&rdquo;
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* =========================================================================
            SECTION 4: AGENCY SPOTLIGHT WITH BACKGROUND MOTION ASSET
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="red-glass rounded-3xl p-8 sm:p-12 border border-red-500/40 relative overflow-hidden space-y-8">
            
            {/* Background Cyber GIF Motion Layer */}
            <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none overflow-hidden">
              <img
                src="/assets/gif-assests/6017829e0b3e2aaa5fa990adb0889fb0.gif"
                alt="Agency Grid Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
                  CODEXA AGENCY UNIVERSE
                </span>
                <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
                  Building Technology. <br />
                  Building Developers.
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-mono leading-relaxed max-w-2xl">
                  CodeXa Agency builds enterprise web platforms, custom AI automation agents, security-aware portals, and modern digital products. Through our internship program, we train the next wave of full-stack builders.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-2">
                  <div className="p-3 bg-black/60 rounded-xl border border-red-950">
                    <div className="text-red-400 font-bold">Web Software</div>
                    <div className="text-slate-500 text-[10px]">Next.js & Full-Stack</div>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-red-950">
                    <div className="text-red-400 font-bold">AI Solutions</div>
                    <div className="text-slate-500 text-[10px]">LLMs & Agents</div>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-red-950">
                    <div className="text-red-400 font-bold">Automation</div>
                    <div className="text-slate-500 text-[10px]">Bots & Pipelines</div>
                  </div>
                  <div className="p-3 bg-black/60 rounded-xl border border-red-950">
                    <div className="text-red-400 font-bold">Recruitment</div>
                    <div className="text-slate-500 text-[10px]">Developer Training</div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://www.codxa-agency.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playButtonClick}
                    className="btn-red-sweep inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/40 shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                  >
                    <span>VISIT CODEXA AGENCY</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Agency Visual Panel: Night City Web Swing & Holographic Pulse */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="rounded-2xl overflow-hidden border border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.25)] relative h-48 bg-black group">
                  <img
                    src="/assets/image-assests/ceb0a9e38c4590f8fb6f411f0f6aa2a5.jpg"
                    alt="Agency City Horizon"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-3 font-mono">
                    <span className="text-[10px] text-red-300 font-bold">DEVELOPER HORIZON // GLOBAL RECRUITMENT</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-red-500/30 bg-black/90 p-3 space-y-2 font-mono flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                    <img
                      src="/assets/gif-assests/f4e08e34471243e1027743a3cf01d4eb.gif"
                      alt="Tech Portal"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Live Agency Ecosystem</div>
                    <p className="text-[10px] text-slate-400">Direct mentorship & authentic client-grade codebases.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 5: VIBE CODING INTERACTIVE EXPERIENCE
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
              MODERN DEVELOPER METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              The Vibe Coding Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              IDEA &rarr; PROMPT &rarr; ARCHITECTURE &rarr; CODE &rarr; TEST &rarr; PRODUCT
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Prompt AI Interface */}
            <div className="lg:col-span-6 red-glass rounded-3xl p-6 border border-red-500/30 font-mono space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-red-950 pb-2 text-[10px] text-red-400">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-red-500" />
                  AI_STEERING_AGENT
                </span>
                <span className="text-emerald-400">COGNITIVE_ACTIVE</span>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase">Prompt Input:</div>
                <div className="p-3 bg-black border border-red-950 rounded-xl text-xs text-white">
                  &ldquo;Build a high-performance recruitment portal with Next.js, MySQL persistent storage, Resend automated emails, and 8 screening rounds.&rdquo;
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase">AI Execution Stream:</div>
                <div className="p-4 bg-red-950/20 border border-red-950 rounded-xl text-xs space-y-1.5 text-slate-300">
                  <div className="text-slate-400">Analyzing requirements...</div>
                  <div className="text-slate-400">Planning schema architecture...</div>
                  <div className="text-red-300">Creating modular UI components...</div>
                  <div className="text-red-300">Connecting MySQL connection pool...</div>
                  <div className="text-red-300">Adding SHA-256 session gatekeeper...</div>
                  <div className="text-emerald-400 font-bold">✓ Build successful. Ready for production.</div>
                </div>
              </div>
            </div>

            {/* Right Product Result Preview */}
            <div className="lg:col-span-6 red-glass rounded-3xl p-6 border border-red-500/30 font-mono space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-red-950 pb-2 text-[10px] text-slate-400">
                <span>LIVE_PRODUCT_PREVIEW</span>
                <span className="text-red-400 font-bold">HTTPS://CODEXA-APPLY.COM</span>
              </div>

              <div className="bg-black/80 rounded-2xl p-5 border border-red-950 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs font-bold text-white">CodeXa Portal V2</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-red-950 rounded-full w-3/4 animate-pulse" />
                  <div className="h-2 bg-red-950/60 rounded-full w-1/2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300">8 Rounds</div>
                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300">Autosave ✓</div>
                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300">PDF Engine</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                CodeXa trains interns to combine deep architectural comprehension with rapid AI velocity to ship complete digital software.
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 6: TECHNOLOGY STACK
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
              ENGINEERING MATRIX
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              Technologies & Tooling
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="tilt-card red-glass rounded-2xl p-4 sm:p-5 border border-red-950/80 hover:border-red-500/50 space-y-2.5 font-mono cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tech.icon}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-950">
                    {tech.group}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{tech.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: 8-ROUND RECRUITMENT PATHWAY WITH PREVIEWS
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
              STEP-BY-STEP RECRUITMENT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              8 Rounds. One Developer Profile.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Hover or click on any round below to understand the evaluation criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {applicationRounds.map((r, idx) => (
              <div
                key={r.round}
                onClick={() => setActiveRoundIndex(idx)}
                className={`rounded-2xl border font-mono overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col justify-between ${
                  activeRoundIndex === idx
                    ? "bg-red-950/40 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)] scale-[1.02]"
                    : "bg-[#05050c]/80 border-red-950/70 hover:border-red-500/40 text-slate-300"
                }`}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <Image
                    src={r.image}
                    alt={r.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center justify-between w-[calc(100%-16px)]">
                    <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-black/80 border border-red-500/40 font-mono">
                      {r.roundCode}
                    </span>
                    {r.adaptive && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                        Adaptive
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-red-400 font-bold uppercase block">{r.subtitle}</span>
                    <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors mt-0.5">
                      {r.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{r.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/apply/rules"
              onClick={playButtonClick}
              className="btn-red-sweep inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-2xl border border-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.4)]"
            >
              <span>PROCEED TO SCREENING RULES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: LEADERSHIP SPOTLIGHT (Ashu, Deepak, Kishore)
           ========================================================================= */}
        <section id="leadership" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left scroll-mt-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              CODEXA CORE LEADERSHIP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              Leadership & Mentorship
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              Meet the founders and directors guiding the CodeXa developer community and internship operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {((teamMembers && teamMembers.length > 0 ? teamMembers : [
              {
                id: "ashu-founder",
                name: "Ashu",
                designation: "Founder & Technical Director",
                roleType: "Founder" as const,
                photoUrl: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
                bio: "Founder of CodeXa Agency. Focuses on AI agent architecture, developer tools, hosting platforms, Discord automation, 3D animated web experiences, secure application portals, and recruitment systems.",
                quote: "I don't just write code, I build solutions that create impact.",
                roles: ["Founder", "Technical Direction", "Product Strategy"],
                skills: ["EDITH AI", "CODEXA IDE", "Claude Code API", "Ethical Hacking", "3D Web", "Full-Stack"],
                email: "ashuchinthapalli3900@gmail.com",
                whatsapp: "+91 88979 01413",
                showContact: true,
                isFeatured: true,
                isVisible: true,
                displayOrder: 1,
              },
              {
                id: "deepak-cofounder",
                name: "Deepak",
                designation: "Co-Founder & Operations Lead",
                roleType: "Co-Founder" as const,
                photoUrl: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
                bio: "Co-Founder of CodeXa Agency. Supports team coordination, applicant guidance, internship communication, community management, and student query resolution.",
                quote: "Connecting people, supporting progress, and keeping the journey smooth.",
                roles: ["Co-Founder", "Operations", "Student Support"],
                skills: ["Operations", "Team Sync", "Student Support", "Program Logistics", "Communication"],
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
                roleType: "CEO" as const,
                photoUrl: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
                bio: "CEO of CodeXa Agency. Drives business strategy, organizational partnerships, commercial scaling, growth initiatives, and project coordination.",
                quote: "Scaling execution, driving innovation, and accelerating developer careers.",
                roles: ["CEO", "Business Strategy", "Growth"],
                skills: ["Business Strategy", "Growth", "Client Projects", "Administration", "Strategic Scaling"],
                whatsapp: "+91 70758 00951",
                showContact: true,
                isFeatured: true,
                isVisible: true,
                displayOrder: 3,
              },
            ]))
              .filter((m) => m.isVisible !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((member) => (
                <div
                  key={member.id}
                  className="tilt-card red-glass rounded-3xl p-6 border border-red-500/40 space-y-5 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/30 font-mono font-bold uppercase">
                          {member.roleType}
                        </span>
                        <h3 className="text-xl font-black font-mono text-white group-hover:text-red-400 transition-colors">
                          {member.name}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400">{member.designation}</div>
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-red-500/50 p-1 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        <img
                          src={member.photoUrl || "/assets/image-assests/hero.jpeg"}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-4">
                      {member.bio}
                    </p>

                    {member.quote && (
                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-[11px] font-mono text-red-200 italic">
                        &ldquo;{member.quote}&rdquo;
                      </div>
                    )}

                    {member.skills && member.skills.length > 0 && (
                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="text-[10px] text-red-400 font-bold uppercase">Focus Areas:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {member.skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-red-950 text-[10px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-red-950 pt-4 flex items-center justify-between font-mono">
                    {member.whatsapp ? (
                      <a
                        href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={playButtonClick}
                        className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{member.whatsapp}</span>
                      </a>
                    ) : <div />}

                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        onClick={playButtonClick}
                        className="p-2 rounded-xl border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                        title={`Email ${member.name}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 9: FAQ ACCORDION
           ========================================================================= */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left scroll-mt-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-500 uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-mono text-white uppercase tracking-tight">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3 font-mono">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpenIndex === idx;
              return (
                <div
                  key={idx}
                  className="red-glass rounded-2xl border border-red-950 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:text-red-300 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span className="text-red-500 text-xs">Q{idx + 1}.</span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-red-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-red-950/60 pt-3 bg-black/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 10: FINAL LANDING CTA BANNER
           ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="red-glass rounded-3xl p-8 sm:p-14 border border-red-500/50 text-center relative overflow-hidden space-y-6">
            
            <div className="absolute inset-0 spider-grid opacity-50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/20 rounded-full filter blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold tracking-[0.25em] text-red-400 uppercase">
                LAUNCH YOUR DEVELOPER JOURNEY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight leading-tight">
                YOUR NEXT PROJECT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 glow-red">
                  CAN START HERE.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                Join ambitious students building real agency tools, AI systems, and database platforms.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4 pt-4 max-w-md mx-auto">
              <Link
                href="/apply"
                onClick={playButtonClick}
                className="btn-red-sweep py-4 px-8 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-2xl border border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2"
              >
                <span>START APPLICATION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/status"
                onClick={playButtonClick}
                className="py-4 px-6 bg-[#06060e] hover:bg-red-950/20 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl border border-red-950 hover:border-red-500/40 flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4 text-red-400" />
                <span>TRACK APPLICATION</span>
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* AI-Powered Natural Telugu Voice Guide Widget */}
      <CodeXaVoiceGuide scrollThreshold={350} />

      <Footer />
    </div>
  );
}
