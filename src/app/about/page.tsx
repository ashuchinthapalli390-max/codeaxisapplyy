"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, Code2, Crown, Database, Globe, Rocket, Shield, Terminal, Users, Zap } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase">
            <Globe className="w-3.5 h-3.5" />
            ABOUT CODEXA AGENCY
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
            Building Technology. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400 glow-red">
              Building Developers.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-mono leading-relaxed max-w-3xl">
            CodeXa Agency is a specialized software engineering studio and developer training accelerator. We construct modern web platforms, AI solutions, automation agents, and provide immersive project internships.
          </p>
        </div>

        {/* Agency Mission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="red-glass rounded-2xl p-6 border border-red-500/30 space-y-3 font-mono">
            <div className="p-2.5 w-fit rounded-xl bg-red-950/40 border border-red-500/30">
              <Rocket className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-white">Authentic Engineering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We do not believe in synthetic tutorials. Developers grow by diagnosing build failures, configuring databases, and shipping code to live URLs.
            </p>
          </div>

          <div className="red-glass rounded-2xl p-6 border border-red-500/30 space-y-3 font-mono">
            <div className="p-2.5 w-fit rounded-xl bg-red-950/40 border border-red-500/30">
              <Bot className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-white">AI-Powered Velocity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We train students in Vibe Coding — steering LLMs with robust architecture, verifying type-safe code, and building at 10x speed.
            </p>
          </div>

          <div className="red-glass rounded-2xl p-6 border border-red-500/30 space-y-3 font-mono">
            <div className="p-2.5 w-fit rounded-xl bg-red-950/40 border border-red-500/30">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-white">Mindset & Ethics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Honesty, team ownership, disciplined communication, and confidentiality form the bedrock of everything we build.
            </p>
          </div>
        </div>

        {/* Agency Deep Dive */}
        <div className="red-glass rounded-3xl p-8 sm:p-10 border border-red-500/30 space-y-6 font-mono relative overflow-hidden">
          
          {/* Background Cyber Layer */}
          <div className="absolute inset-0 -z-10 opacity-15 pointer-events-none overflow-hidden">
            <img
              src="/assets/gif-assests/6017829e0b3e2aaa5fa990adb0889fb0.gif"
              alt="Cyber Network"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
                The CodeXa Story & Ecosystem
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Founded by Ashu with operations co-led by Deepak and strategic leadership by Kishore, CodeXa was established to bridge the divide between classroom theory and real-world engineering.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Our production stack spans full-stack web architectures (Next.js 16, TypeScript, TailwindCSS), cloud relational databases, AI agent workflows (Vibe Coding, Claude Code integrations), and security-hardened recruitment systems.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="https://www.codxa-agency.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playButtonClick}
                  className="btn-red-sweep px-6 py-3.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.4)] inline-flex items-center gap-2"
                >
                  <span>VISIT OFFICIAL AGENCY SITE</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <Link
                  href="/apply"
                  onClick={playButtonClick}
                  className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-[#06060c] hover:bg-red-950/20 text-slate-300 hover:text-white border border-red-950 hover:border-red-500/40 inline-flex items-center gap-2"
                >
                  <span>APPLY FOR INTERNSHIP</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)] bg-black/90 p-3 space-y-3 font-mono">
                <div className="h-32 rounded-xl overflow-hidden relative">
                  <img
                    src="/assets/gif-assests/f4e08e34471243e1027743a3cf01d4eb.gif"
                    alt="Agency Pulse"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                    AGENCY_PORTAL
                  </div>
                </div>
                <div className="text-xs font-bold text-white">Global Development</div>
                <p className="text-[10px] text-slate-400">High-velocity software shipping for modern web clients.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
