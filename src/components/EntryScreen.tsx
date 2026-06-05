"use client";

import React, { useEffect, useRef, useState } from "react";
import Button3D from "@/components/ui/Button3D";
import {
  ArrowUpRight,
  Bot,
  Code2,
  Crown,
  Cpu,
  Database,
  Globe,
  MessageCircle,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import { playButtonClick } from "@/lib/audio";

const FounderImage = () => {
  const [failed, setFailed] = useState(false);
  
  const content = failed ? (
    <div className="w-full h-full relative flex items-center justify-center bg-[#050811]/90 rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 via-transparent to-slate-950/20" />
      <svg className="w-14 h-14 text-cyan-400/80 relative z-10 animate-float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M5 4l3 3h8l3-3-2 8H7L5 4zM7 12h10M9 16h6" stroke="currentColor" fill="rgba(255, 215, 0, 0.1)" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-ping" />
      </svg>
      <span className="absolute bottom-2 text-[7px] font-mono text-cyan-400/50 uppercase tracking-widest font-bold">CORE_ACT</span>
    </div>
  ) : (
    <img 
      src="/images/founder-ashu.png" 
      alt="Founder Ashu" 
      onError={() => setFailed(true)} 
      className="w-full h-full object-cover rounded-2xl"
    />
  );

  return (
    <div className="relative group shrink-0 animate-float-slow">
      <div className="absolute inset-[-4px] rounded-[20px] bg-gradient-to-r from-[#00f0ff] via-[#ffd700] to-[#bd00ff] opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-cyan-400/40 bg-[#02040a]/90 p-1 flex items-center justify-center shadow-[0_0_24px_rgba(0,240,255,0.2)]">
        {content}
      </div>
    </div>
  );
};

const CoFounderImage = () => {
  const [failed, setFailed] = useState(false);
  
  const content = failed ? (
    <div className="w-full h-full relative flex items-center justify-center bg-[#050811]/90 rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-transparent to-slate-950/20" />
      <svg className="w-14 h-14 text-purple-400/80 relative z-10 animate-float-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M21 14v2a2 2 0 0 1-2 2h-1M3 14v2a2 2 0 0 0 2 2h1" stroke="currentColor" />
        <path d="M12 9v10M8 12h8" stroke="currentColor" />
        <circle cx="12" cy="12" r="3" fill="rgba(189, 0, 255, 0.2)" />
      </svg>
      <span className="absolute bottom-2 text-[7px] font-mono text-purple-400/50 uppercase tracking-widest font-bold">SUPPORT_ACT</span>
    </div>
  ) : (
    <img 
      src="/images/cofounder-deepak.png" 
      alt="Co-Founder Deepak" 
      onError={() => setFailed(true)} 
      className="w-full h-full object-cover rounded-2xl"
    />
  );

  return (
    <div className="relative group shrink-0 animate-float-slow">
      <div className="absolute inset-[-4px] rounded-[20px] bg-gradient-to-r from-[#bd00ff] via-[#0066ff] to-[#00f0ff] opacity-60 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border border-purple-400/40 bg-[#02040a]/90 p-1 flex items-center justify-center shadow-[0_0_24px_rgba(189,0,255,0.2)]">
        {content}
      </div>
    </div>
  );
};

interface EntryScreenProps {
  onStartApplication: () => void;
  onAdminAccess: () => void;
}

export default function EntryScreen({ onStartApplication, onAdminAccess }: EntryScreenProps) {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [aiPromptText] = useState("Explain Vibe Coding and AI Prompting...");
  const [promptState, setPromptState] = useState<"idle" | "typing" | "complete">("idle");
  const [aiResponseText, setAiResponseText] = useState("");
  const [isLowPerf, setIsLowPerf] = useState(false);
  const leadershipRef = useRef<HTMLElement | null>(null);

  // Performance capability detector
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      if (isMobile || lowCores) {
        setIsLowPerf(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Live mock terminal streams in cockpit
  useEffect(() => {
    const lines = [
      "DB_POOL_STATUS: CONNECTED",
      "SECURE_SSL: TRUE",
      "PORTAL_VERSION: v2.6.0-prod",
      "ACTIVE_CONNECTIONS: 24/100",
      "INCOMING_TRAFFIC: ROUTED_OK",
      "AI_MODULE_SCAN: COMPLETED",
      "READY_FOR_CANDIDATE: YES",
      "PORTAL_PROTECTION: ACTIVE",
      "CYBER_GRID_SYNC: OK",
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setTerminalLogs((prev) => [...prev.slice(-5), lines[idx]]);
      idx = (idx + 1) % lines.length;
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Live AI prompt typing animation
  useEffect(() => {
    if (promptState === "idle") {
      const timeout = setTimeout(() => {
        setPromptState("typing");
      }, 1500);
      return () => clearTimeout(timeout);
    }

    if (promptState === "typing") {
      const answer = "Vibe coding lets you focus on architecture while steering AI models to implement clean functionality. CodeXa trains you in this premium modern developer workflow.";
      let idx = 0;
      const interval = setInterval(() => {
        setAiResponseText(answer.slice(0, idx));
        idx++;
        if (idx > answer.length) {
          clearInterval(interval);
          setPromptState("complete");
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [promptState]);

  // Card cursor 3D hover effects (direct DOM styling for maximum 60fps performance)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLowPerf) return; // skip heavyweight styles on low-end / mobile
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateY = ((x - xc) / xc) * 12;
    const rotateX = ((yc - y) / yc) * 12;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    card.style.borderColor = `rgba(0, 240, 255, 0.45)`;
    card.style.boxShadow = `0 15px 35px rgba(189, 0, 255, 0.12), 0 0 25px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    card.style.borderColor = ``;
    card.style.boxShadow = ``;
  };

  const scrollToLeadership = () => {
    leadershipRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const stepCards = [
    {
      num: "01",
      title: "Learn Coding",
      desc: "Master basic logic, syntax, and full-stack architecture step-by-step.",
      icon: <Code2 className="w-5 h-5 text-[#00f0ff]" />,
    },
    {
      num: "02",
      title: "Use AI Tools",
      desc: "Learn to steer AI engines, edit codebases, and vibe code at high speeds.",
      icon: <Cpu className="w-5 h-5 text-[#bd00ff]" />,
    },
    {
      num: "03",
      title: "Build Projects",
      desc: "Construct landing pages, database APIs, and production websites.",
      icon: <Terminal className="w-5 h-5 text-[#0066ff]" />,
    },
    {
      num: "04",
      title: "Deploy Online",
      desc: "Host live web applications using modern Vercel / Netlify serverless pipelines.",
      icon: <Globe className="w-5 h-5 text-[#10b981]" />,
    },
    {
      num: "05",
      title: "Work With Team",
      desc: "Collaborate in Git repositories with peers under professional guidelines.",
      icon: <Users className="w-5 h-5 text-[#ffd700]" />,
    },
    {
      num: "06",
      title: "Grow With CodeXa",
      desc: "Acquire real experience, revenue shares, and permanent developer status.",
      icon: <Shield className="w-5 h-5 text-[#00f0ff]" />,
    },
  ];

  const founderHighlights = [
    "Developer of EDITH AI Agent",
    "Developer of CODEXA IDE",
    "Works with Claude Code API based development workflows",
    "Ethical hacking and security awareness experience",
    "Builds hosting websites and deployment systems",
    "Builds 3D animated websites",
    "Builds Discord bots and automation systems",
    "Builds AI-powered web tools",
    "Builds full-stack application portals",
    "Builds admin dashboards and database systems",
    "Builds secure application portals with admin panels",
    "Builds WhatsApp/community-based support systems",
    "Builds database-backed websites with permanent storage",
    "Builds premium futuristic 3D UI/UX websites",
    "Builds developer tools, automation systems, and deployment workflows",
  ];

  const founderBadges = [
    "EDITH AI",
    "CODEXA IDE",
    "Claude Code API Workflows",
    "Ethical Hacking Awareness",
    "Secure Web Systems",
    "Hosting Websites",
    "3D Web Design",
    "Discord Bots",
    "AI Automation",
    "Admin Dashboards",
    "Database Systems",
    "Deployment Workflows",
    "Full-Stack Development",
    "Developer Training",
  ];

  const coFounderHighlights = [
    "Application guidance support",
    "Internship coordination support",
    "Community support",
    "Student query handling",
    "Team communication support",
    "Update sharing and announcement support",
    "Applicant help and follow-up support",
    "Helps maintain smooth communication",
    "Supports CodeXa internship operations",
  ];

  return (
    <div className="min-h-screen bg-[#02040a] relative flex flex-col justify-between overflow-x-hidden pt-4 pb-12 px-4 select-none">

      {/* Perspective Grid Floor Decoration */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[280px] cyber-grid-floor pointer-events-none -z-10 opacity-70"
        style={{
          backgroundImage: isLowPerf
            ? "linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)"
            : undefined
        }}
      />

      {/* Decorative vertical light beams (disabled on low performance viewports) */}
      {!isLowPerf && (
        <>
          <div className="light-beam left-[8%] top-0" style={{ background: "linear-gradient(to bottom, transparent, var(--cyan-glow-bright), transparent)" }} />
          <div className="light-beam light-beam-red right-[12%] top-20" style={{ background: "linear-gradient(to bottom, transparent, var(--neon-purple), transparent)" }} />
        </>
      )}

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex-grow flex flex-col justify-center space-y-10 mt-4">

        {/* Cockpit Top Bar / Header */}
        <div className="w-full flex items-center justify-between border-b border-cyan-950/45 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl border border-cyan-500/25 flex items-center justify-center p-1 bg-slate-950/90 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-widest font-mono">CODEAXIS AGENCY</div>
              <div className="text-[10px] text-cyan-400 font-mono tracking-wider">SECURE DIGITAL INTERNSHIP PORTAL</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[10px] font-mono text-slate-500">
            <span>CORES: {typeof navigator !== "undefined" ? navigator.hardwareConcurrency || "N/A" : "N/A"}</span>
            <span className="text-slate-700">|</span>
            <span>PING: 14ms</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-400">DB_ONLINE</span>
          </div>
        </div>

        {/* Hero Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Title, Intro & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-950/50 to-purple-950/30 border border-cyan-500/30 px-3.5 py-1 rounded-full text-[10px] text-cyan-300 font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
              <span>Free Developer Internship Launch</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight font-mono tracking-tight">
              Futuristic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066ff] via-[#00f0ff] to-[#bd00ff] glow-cyan">
                Application Console
              </span> <br />
              CodeXa Portal
            </h1>

            <p className="text-xs md:text-sm text-slate-350 font-mono leading-relaxed max-w-xl">
              Start your developer journey with step-by-step learning, AI-assisted coding, GitHub, serverless deployments, and real agency project practice. Complete the 9-step wizard process below to verify your coding intent.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
              <Button3D
                type="button"
                variant="primary"
                onClick={() => {
                  playButtonClick();
                  onStartApplication();
                }}
                className="flex-1 min-h-14 py-4 text-xs font-bold uppercase tracking-widest rounded-2xl premium-button-depth main-action-primary"
              >
                <span>Start Application</span>
                <span className="text-sm font-bold">&rarr;</span>
              </Button3D>

              <Button3D
                type="button"
                variant="secondary"
                onClick={() => {
                  playButtonClick();
                  onAdminAccess();
                }}
                className="flex-1 min-h-14 py-4 text-[10px] uppercase tracking-widest rounded-2xl premium-button-depth main-action-admin"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Login / Admin Access</span>
              </Button3D>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  scrollToLeadership();
                }}
                className="flex-1 min-h-14 py-4 px-4 rounded-2xl border font-mono font-bold text-[10px] uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer premium-button-depth main-action-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Help</span>
              </button>
            </div>

            {/* Live Terminal stream on left column for technical feel */}
            <div className="cyber-glass rounded-xl p-3.5 border border-cyan-950/80 max-w-md bg-slate-950/30">
              <div className="flex justify-between items-center text-[9px] font-mono text-cyan-500/60 border-b border-cyan-950/40 pb-1.5 mb-2.5">
                <span>SYSTEM_DIAGNOSTICS_DAEMON</span>
                <span className="animate-pulse text-emerald-400">SECURE</span>
              </div>
              <div className="font-mono text-[10px] text-cyan-400/80 space-y-1">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-cyan-800 mr-2">&gt;</span>
                    <span className="font-semibold">{log}</span>
                  </div>
                ))}
                {terminalLogs.length === 0 && (
                  <div className="text-slate-650">Awaiting live telemetry streams...</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Cockpit Console */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative py-6">

            {/* Ambient Radial glow background */}
            <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-500/5 filter blur-[70px] pointer-events-none -z-10" />

            {/* Desktop Dashboard Grid (Stacks cleanly on smaller viewports) */}
            <div className="w-full max-w-md space-y-6">

              {/* Interactive block 1: Cube + Hologram */}
              <div className="grid grid-cols-12 gap-4">

                {/* 3D Rotating Cyber Cube */}
                <div className="col-span-5 cyber-glass rounded-2xl p-4 border border-cyan-950/80 flex flex-col items-center justify-center bg-slate-950/50 h-40">
                  <div className="text-[9px] text-cyan-500/50 font-mono mb-3 uppercase tracking-widest">3D CORE</div>
                  <div className="cyber-cube-container">
                    <div className="cyber-cube">
                      <div className="cube-face face-front bg-gradient-to-br from-slate-950 to-blue-950">CODE</div>
                      <div className="cube-face face-back bg-gradient-to-br from-slate-950 to-purple-950">AI</div>
                      <div className="cube-face face-right bg-gradient-to-br from-slate-950 to-cyan-950">DEV</div>
                      <div className="cube-face face-left bg-gradient-to-br from-slate-950 to-slate-900">TEAM</div>
                      <div className="cube-face face-top bg-gradient-to-br from-slate-950 to-indigo-950">GROW</div>
                      <div className="cube-face face-bottom bg-gradient-to-br from-slate-950 to-emerald-950">BUILD</div>
                    </div>
                  </div>
                </div>

                {/* GitHub Deployment Hologram */}
                <div className="col-span-7 cyber-glass rounded-2xl p-4 border border-cyan-950/80 bg-slate-950/50 h-40 text-left flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[8px] font-mono text-cyan-500/60 border-b border-cyan-950/40 pb-1">
                    <span>GIT_DEPLOY_STREAM</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-350 space-y-1 mt-2">
                    <div>repository: <span className="text-white">codexaxis/apply</span></div>
                    <div>pipeline: <span className="text-[#00f0ff]">production</span></div>
                    <div className="text-emerald-400 font-semibold">&gt; vercel deploy synced</div>
                    <div className="text-[9px] text-slate-600 truncate">SHA: CAX-8F9D7E</div>
                  </div>
                  <div className="text-[9px] text-[#bd00ff] font-semibold uppercase font-mono tracking-widest text-right mt-1 border-t border-cyan-950/20 pt-1">
                    PROTECTED
                  </div>
                </div>

              </div>

              {/* Interactive block 2: AI Prompt Card */}
              <div className="cyber-glass rounded-2xl p-4 border border-cyan-950/80 bg-slate-950/50 text-left space-y-3 relative overflow-hidden">

                {/* Header info */}
                <div className="flex justify-between items-center text-[9px] font-mono text-cyan-500/60 border-b border-cyan-950/40 pb-1">
                  <span>AI_COPILOT_STREAM</span>
                  <span className="text-purple-400 animate-pulse font-semibold">COGNITIVE</span>
                </div>

                {/* Prompt Text input mock */}
                <div className="bg-slate-950 border border-cyan-950/60 rounded-xl p-2.5 font-mono text-[10px] text-slate-200">
                  <span className="text-cyan-500 font-bold">&gt; </span>
                  <span>{aiPromptText}</span>
                </div>

                {/* Prompt Response mock */}
                <div className="font-mono text-[10px] text-cyan-300 leading-relaxed bg-cyan-950/10 border border-cyan-900/30 rounded-xl p-3 min-h-[56px] relative">
                  <span>{aiResponseText}</span>
                  {promptState === "typing" && <span className="w-1.5 h-3.5 bg-cyan-400 inline-block cursor-blink ml-1" />}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Divider */}
        <div className="w-full border-t border-cyan-950/30 my-8" />

        {/* Steps Grid Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] tracking-[0.25em] font-mono font-bold text-[#bd00ff] uppercase">
            LEARNING AND PROGRESS PATHWAY
          </span>
          <h2 className="text-xl font-extrabold text-white font-mono uppercase tracking-wide">
            Interactive Internship Modules
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Hover or tap cards below to experience 3D perspective translations. Complete these steps during the internship program.
          </p>
        </div>

        {/* 3D Step Cards Grid (Stacks on mobile, responsive grid on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stepCards.map((card) => (
            <div
              key={card.num}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="tilt-card cyber-glass rounded-2xl p-5 border border-cyan-950/80 bg-slate-950/30 text-left flex flex-col justify-between space-y-4 hover:bg-slate-950/50 cursor-pointer"
            >
              <div className="flex justify-between items-start tilt-card-inner">
                <span className="text-2xl font-black font-mono text-cyan-500/20">{card.num}</span>
                <div className="p-2.5 bg-slate-900/90 border border-cyan-950/40 rounded-xl shadow-inner">
                  {card.icon}
                </div>
              </div>

              <div className="space-y-1.5 tilt-card-inner">
                <h3 className="text-sm font-bold text-white font-mono">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center text-[9px] font-mono text-cyan-400 hover:text-cyan-300 font-bold tracking-widest tilt-card-inner">
                <span>VIEW MODULE DETAILS</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-70" />
              </div>
            </div>
          ))}
        </div>

        {/* Founder / Co-Founder 3D Leadership Section */}
        <section ref={leadershipRef} className="pt-4 scroll-mt-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.08)]">
              <Crown className="w-3.5 h-3.5 text-[#ffd700]" />
              CODEXA CORE
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white font-mono uppercase tracking-wide">
              CodeXa Leadership & Support
            </h2>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Meet the people behind CodeXa Agency&apos;s application, internship, and community support system.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="lg:col-span-7 leadership-card founder-card-3d rounded-3xl p-5 md:p-6 text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 founder-card-grid pointer-events-none opacity-40" />
              <div className="relative z-10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/35 bg-yellow-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-yellow-200">
                      <Crown className="w-3.5 h-3.5" />
                      Founder / Owner
                    </span>
                    <h3 className="text-lg md:text-2xl font-black text-white font-mono uppercase leading-tight">
                      Builder of AI Agents, IDE Systems, Security-Aware Web Platforms & Futuristic Digital Systems
                    </h3>
                    <h4 className="text-sm font-extrabold text-cyan-400 font-mono">Ashu</h4>
                  </div>
                  
                  {/* Founder Image Frame */}
                  <FounderImage />
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                  Ashu, the Founder of CodeXa Agency, is focused on building AI-powered systems, developer tools, hosting websites, Discord automation, 3D animated web experiences, secure application portals, and futuristic digital products. With experience in ethical hacking awareness, automation, full-stack development, AI coding workflows, and deployment systems, Ashu created CodeXa Agency to help students and beginners start their developer journey with real project practice, AI-assisted coding, and step-by-step guidance.
                </p>

                <div className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-[10px] text-yellow-200 font-mono italic">
                  &ldquo;I don’t just write code, I build solutions that create impact.&rdquo;
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="leadership-node">
                    <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    <span>Secure Portals</span>
                  </div>
                  <div className="leadership-node">
                    <Database className="w-4 h-4 text-[#ffd700]" />
                    <span>Permanent Data</span>
                  </div>
                  <div className="leadership-node">
                    <Rocket className="w-4 h-4 text-[#bd00ff]" />
                    <span>Deploy Systems</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-cyan-300">
                    <Terminal className="w-4 h-4" />
                    Founder Highlights
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {founderHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[11px] text-slate-300 font-mono leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {founderBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-cyan-500/20 bg-cyan-950/15 px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-t border-cyan-950/60 pt-4">
                  <div className="font-mono">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">Founder WhatsApp</div>
                    <div className="text-sm font-bold text-white">6303762110</div>
                  </div>
                  <a
                    href="https://wa.me/916303762110"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playButtonClick}
                    className="min-h-12 rounded-xl px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] premium-button-depth founder-contact-button flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Ashu</span>
                  </a>
                </div>
              </div>
            </div>

            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="lg:col-span-5 leadership-card cofounder-card-3d rounded-3xl p-5 md:p-6 text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 cofounder-card-grid pointer-events-none opacity-35" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-purple-200">
                      <Users className="w-3.5 h-3.5" />
                      Co-Founder
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white font-mono uppercase leading-tight">
                      Leadership, Support & Coordination
                    </h3>
                    <h4 className="text-sm font-extrabold text-purple-400 font-mono">Deepak</h4>
                  </div>
                  
                  {/* Co-Founder Image Frame */}
                  <CoFounderImage />
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                  Deepak, the Co-Founder of CodeXa Agency, supports the agency through team coordination, community support, application guidance, internship communication, and student query handling. Deepak helps maintain smooth communication between applicants, interns, and the CodeXa team.
                </p>

                <div className="p-3 border border-purple-500/20 bg-purple-500/5 rounded-xl text-[10px] text-purple-200 font-mono italic">
                  &ldquo;Connecting people, supporting progress, and keeping the journey smooth.&rdquo;
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-purple-200">
                    Co-Founder Support
                  </div>
                  <div className="space-y-2">
                    {coFounderHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-[11px] text-slate-300 font-mono leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(189,0,255,0.8)] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 px-4 py-3 text-[10px] font-mono text-slate-400 leading-relaxed">
                  Leadership support only. Application, internship, and community coordination are handled professionally through official CodeXa communication.
                </div>

                <div className="flex flex-col gap-3 border-t border-purple-950/60 pt-4">
                  <div className="font-mono">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-slate-500">Co-Founder WhatsApp</div>
                    <div className="text-sm font-bold text-white">9494245412</div>
                  </div>
                  <a
                    href="https://wa.me/919494245412"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playButtonClick}
                    className="min-h-12 rounded-xl px-5 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] premium-button-depth cofounder-contact-button flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Deepak</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-[10px] text-slate-500 font-mono leading-relaxed">
            For genuine application, internship, or project-related queries only.
          </p>
        </section>

      </div>

      {/* Footer copyright */}
      <div className="mt-12 text-center text-[9px] font-mono text-slate-650 opacity-40">
        CodeXa Agency - Learn. Build. Grow. // SYSTEM SECURED & VERIFIED
      </div>

    </div>
  );
}
