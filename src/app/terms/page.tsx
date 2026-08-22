"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import { ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left font-mono">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            LEGAL TERMS OF SERVICE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: August 22, 2026</p>
        </div>

        <div className="red-glass rounded-3xl p-8 border border-red-500/30 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the CodeXa Apply website and recruitment portal, you agree to abide by these Terms of Service and all applicable guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">2. Accuracy of Application Data</h2>
            <p>
              Applicants certify that all information submitted is truthful, accurate, and represents their genuine capabilities. Misrepresentation of academic status or identity may result in immediate disqualification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">3. Program Nature</h2>
            <p>
              The CodeXa Developer Internship is an educational and skill-building accelerator. Selection into the internship does not constitute a formal guarantee of permanent employment.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">4. Intellectual Property</h2>
            <p>
              Proprietary codebase templates, internal tools, and client specifications shared during the internship remain the property of CodeXa Agency unless explicitly designated as open source.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
