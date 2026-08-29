"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, FileText, Lock, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { playButtonClick } from "@/lib/audio";
import { applicationRounds } from "@/config/card-assets";

export default function ApplyEntryPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Background Motion Layer */}
      <div className="fixed inset-0 -z-10 opacity-15 pointer-events-none overflow-hidden">
        <img
          src="/assets/gif-assests/d24f62aa1d4ab988fe9d65ed3ec9bc0f.gif"
          alt="Application Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#030712]/85" />
      </div>

      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left font-mono">
        
        {/* Header */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            CODEXA DEVELOPER RECRUITMENT
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            8 Rounds. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-red-400 glow-red">
              One Developer Profile.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Welcome to the official CodeXa recruitment screening portal. Complete the 8 structured rounds to submit your candidacy for the 2026 Developer Internship.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="red-glass rounded-2xl p-4 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <Clock className="w-4 h-4" />
              <span>~15-20 Minutes</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Streamlined multi-step form with instant autosave after each answer.
            </p>
          </div>

          <div className="red-glass rounded-2xl p-4 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Beginner Friendly</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No penalty for selecting &ldquo;I Don&apos;t Know&rdquo;. Honesty and mindset are valued highest.
            </p>
          </div>

          <div className="red-glass rounded-2xl p-4 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-500">
              <FileText className="w-4 h-4" />
              <span>Instant PDF Report</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Receive your official submission reference ID and downloadable application dossier.
            </p>
          </div>
        </div>

        {/* 8 Rounds List with Real Assets */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-5">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider border-b border-red-950/80 pb-3 flex items-center justify-between">
            <span>Screening Structure Overview</span>
            <span className="text-xs text-red-400 font-normal">8 Rounds Total</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {applicationRounds.map((r) => (
              <div
                key={r.round}
                className="tilt-card rounded-2xl overflow-hidden bg-black/70 border border-red-950/80 hover:border-red-500/50 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <Image
                    src={r.image}
                    alt={r.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <span className="absolute top-2 left-2 text-[10px] font-black text-white px-2 py-0.5 rounded bg-black/80 border border-red-500/40">
                    {r.roundCode}
                  </span>
                  {r.adaptive && (
                    <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      Adaptive
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-1.5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-red-400 font-bold uppercase block">{r.subtitle}</span>
                    <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors mt-0.5">
                      {r.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400">
            By proceeding, you will review the screening rules and integrity pledge.
          </div>
          <Link
            href="/apply/rules"
            onClick={playButtonClick}
            className="btn-red-sweep w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
          >
            <span>REVIEW RULES & START</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
