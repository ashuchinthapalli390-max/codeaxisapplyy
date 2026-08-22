"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function InternshipPolicyPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left font-mono">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            PROGRAM COMMITMENT & INTEGRITY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Internship Policy</h1>
          <p className="text-xs text-slate-400">Official developer guidelines & conduct policy</p>
        </div>

        <div className="red-glass rounded-3xl p-8 border border-red-500/30 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">1. Daily Commitment & Availability</h2>
            <p>
              Selected interns are expected to allocate 2–4 hours per day to assigned learning modules, pull requests, and project tasks. If academic exams or unexpected personal events occur, prompt advance communication with team leads is mandatory.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">2. Responsible AI Usage</h2>
            <p>
              AI models (Claude, ChatGPT, Copilot) are powerful accelerators and are actively encouraged in our Vibe Coding workflow. However, developers must understand, test, and take complete ownership of every block of code they commit. Blindly copy-pasting unverified code is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">3. Team Collaboration & Mutual Respect</h2>
            <p>
              CodeXa values humility and teamwork. Teammates must support each other, review pull requests constructively, and maintain professional etiquette across Discord, WhatsApp, and GitHub.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">4. Certification Requirements</h2>
            <p>
              Internship certificates and performance endorsements are awarded based on satisfactory completion of milestone projects, active participation, and adherence to team guidelines.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
