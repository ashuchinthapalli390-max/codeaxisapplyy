"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Cpu, Database, GitBranch, Globe, Rocket, ShieldCheck, Terminal, Users, Zap } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function InternshipPage() {
  const roadmapWeeks = [
    {
      phase: "Week 01 - 02",
      title: "Foundations & Vibe Coding Mastery",
      image: "/assets/image-assests/2455caf42d9db24ff7c635a591f45ccb.jpg",
      topics: [
        "Git repository workflows, branch management, and GitHub issues",
        "VS Code environment optimization & AI assistant setup",
        "TypeScript & modern React component patterns",
        "Prompt engineering for architectural clarity and bug diagnosis",
      ],
    },
    {
      phase: "Week 03 - 04",
      title: "Full-Stack APIs & Database Architecture",
      image: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
      topics: [
        "REST API route handlers & serverless execution model",
        "MySQL schema design, indexing, and connection pooling",
        "User authentication, sessions, and route protection",
        "Error handling, input validation, and security sanitization",
      ],
    },
    {
      phase: "Week 05 - 06",
      title: "Real Agency Project Construction",
      image: "/assets/image-assests/799b3d022c7ccb22066d08673b0ec685.jpg",
      topics: [
        "Building client-grade web applications from scratch",
        "Integrating third-party APIs (Resend, payments, webhooks)",
        "Responsive UI design with TailwindCSS & custom animations",
        "Team code reviews and pull request merges",
      ],
    },
    {
      phase: "Week 07 - 08",
      title: "Deployment, Optimization & Portfolio Review",
      image: "/assets/image-assests/9f15564ad2221f371987883d61241f4b.jpg",
      topics: [
        "Production deployment on Vercel and Netlify",
        "Lighthouse performance optimization & SEO meta tags",
        "Dossier compilation, project demos, and portfolio curation",
        "Internship completion certificate & permanent developer status",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
            <Code2 className="w-3.5 h-3.5" />
            COMPREHENSIVE PROGRAM DETAILS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
            CodeXa Developer Internship <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400 glow-red">
              Curriculum & Roadmap
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed max-w-3xl">
            A practical, hands-on 8-week engineering accelerator designed to turn dedicated learners into confident full-stack builders through genuine project delivery.
          </p>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="red-glass p-4 rounded-2xl border border-red-500/20 space-y-1">
            <div className="text-slate-500 text-[10px]">PROGRAM MODE</div>
            <div className="font-bold text-emerald-400">100% Online / Remote</div>
          </div>
          <div className="red-glass p-4 rounded-2xl border border-red-500/20 space-y-1">
            <div className="text-slate-500 text-[10px]">DURATION</div>
            <div className="font-bold text-white">8 Weeks Focused Track</div>
          </div>
          <div className="red-glass p-4 rounded-2xl border border-red-500/20 space-y-1">
            <div className="text-slate-500 text-[10px]">COMMITMENT</div>
            <div className="font-bold text-red-400">2–4 Hours / Day</div>
          </div>
          <div className="red-glass p-4 rounded-2xl border border-red-500/20 space-y-1">
            <div className="text-slate-500 text-[10px]">CERTIFICATION</div>
            <div className="font-bold text-rose-400">Verified Project Dossier</div>
          </div>
        </div>

        {/* 8-Week Roadmap */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-red-500 uppercase">
              SYLLABUS & EXECUTION
            </span>
            <h2 className="text-2xl font-black font-mono text-white">
              8-Week Milestone Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmapWeeks.map((week, idx) => (
              <div
                key={idx}
                className="red-glass rounded-3xl overflow-hidden border border-red-500/30 font-mono flex flex-col justify-between group hover:border-red-500/60 transition-all"
              >
                <div className="h-44 w-full overflow-hidden relative bg-black/80">
                  <img
                    src={week.image}
                    alt={week.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14] via-[#0b0b14]/50 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-red-300 border border-red-500/40 text-[10px] font-bold backdrop-blur-md">
                    {week.phase}
                  </div>
                  <span className="absolute top-3 right-3 text-xs font-black text-white px-2 py-0.5 rounded bg-red-950/90 border border-red-500/40">
                    PHASE 0{idx + 1}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {week.title}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-300">
                    {week.topics.map((t, tidx) => (
                      <div key={tidx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="red-glass rounded-3xl p-8 sm:p-10 border border-red-500/40 text-center space-y-5 font-mono">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Ready to Begin the 8-Round Screening?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            The application takes approximately 10–15 minutes with autosave protection at every step.
          </p>
          <div className="pt-2">
            <Link
              href="/apply/rules"
              onClick={playButtonClick}
              className="btn-red-sweep inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-red-400/40 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <span>APPLY NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
