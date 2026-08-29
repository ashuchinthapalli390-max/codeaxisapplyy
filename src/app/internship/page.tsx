"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Code2, Cpu, Database, GitBranch, Globe, Rocket, ShieldCheck, Terminal, Users, Zap } from "lucide-react";
import { learningModules, LearningModuleCard } from "@/config/card-assets";
import { SiteModule } from "@/types/admin";
import { playButtonClick } from "@/lib/audio";

export default function InternshipPage() {
  const [modules, setModules] = useState<SiteModule[]>([]);

  useEffect(() => {
    fetch("/api/modules")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setModules(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const displayModules: LearningModuleCard[] = modules.length > 0
    ? modules.map((m) => ({
        id: m.module_number,
        moduleCode: m.module_code,
        title: m.title,
        subtitle: m.subtitle || `Module 0${m.module_number}`,
        description: m.description,
        duration: m.duration || "2 Weeks",
        skills: m.topics || [],
        image: m.image_url,
      }))
    : learningModules;
  const moduleTopicDetails: Record<number, string[]> = {
    1: [
      "Git repository workflows, branch management, and GitHub PR reviews",
      "VS Code & AI developer assistant workflow optimization",
      "TypeScript & modern React component patterns",
      "Prompt engineering for architectural clarity and bug diagnosis",
    ],
    2: [
      "Next.js App Router architecture, Server Components & Actions",
      "REST API route handlers & scalable serverless model",
      "Client state management and high-performance reactive UI",
      "Error handling, input validation, and security sanitization",
    ],
    3: [
      "PostgreSQL & Supabase schema design and indexing",
      "Relational queries, connection pooling, and data integrity",
      "HttpOnly cookie persistent authentication & session security",
      "Rate limiting, CSRF protection, and endpoint hardening",
    ],
    4: [
      "Production cloud deployment on Vercel and modern infrastructure",
      "CI/CD automated deployment pipelines & webhook integrations",
      "Lighthouse performance optimization, caching & SEO meta tags",
      "Live product launch, telemetry logging, and developer certification",
    ],
  };

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

        {/* 4 Learning Modules Cards */}
        <div className="space-y-8">
          <h2 className="text-xl sm:text-2xl font-black font-mono text-white uppercase border-b border-red-950 pb-3 flex items-center justify-between">
            <span>8-Week Sprint Roadmap</span>
            <span className="text-xs text-red-400 font-normal">4 Core Engineering Modules</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayModules.map((mod) => (
              <div
                key={mod.id}
                className="tilt-card red-glass rounded-3xl overflow-hidden border border-red-950/80 hover:border-red-500/50 flex flex-col justify-between font-mono group transition-all"
              >
                {/* Visual Banner */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <Image
                    src={mod.image}
                    alt={mod.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b14] via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 border border-red-500/40 text-[10px] font-bold text-white tracking-widest uppercase backdrop-blur-md">
                    {mod.moduleCode} &bull; {mod.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                      {mod.subtitle}
                    </span>
                    <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{mod.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-red-950/70">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Key Focus Areas:</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {(mod.skills && mod.skills.length > 0 ? mod.skills : (moduleTopicDetails[mod.id] || [])).map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="red-glass rounded-3xl p-8 border border-red-500/40 text-center font-mono space-y-4">
          <h3 className="text-2xl font-black text-white uppercase">
            Ready to Begin Your Developer Journey?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Applications for Batch 2026 are currently open. Complete the 8-round screening process to secure your placement.
          </p>
          <div className="pt-2">
            <Link
              href="/apply"
              onClick={playButtonClick}
              className="btn-red-sweep inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <span>START 8-ROUND APPLICATION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
