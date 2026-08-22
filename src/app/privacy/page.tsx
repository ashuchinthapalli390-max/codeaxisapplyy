"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left font-mono">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            <Shield className="w-3.5 h-3.5" />
            DATA PRIVACY & INTEGRITY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: August 22, 2026</p>
        </div>

        <div className="red-glass rounded-3xl p-8 border border-red-500/30 space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">1. Information We Collect</h2>
            <p>
              When you submit an application to CodeXa Apply, we collect personal contact details (name, email, phone, WhatsApp), academic information (college, branch, roll number), developer profile URLs, self-assessed technical awareness, scenario responses, and interview essays.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">2. How We Use Your Data</h2>
            <p>
              Your data is exclusively used for screening suitability, program communications, team assignments, and generating your official applicant confirmation PDF. We do not sell, rent, or distribute your private contact details to any third-party marketing services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">3. Integrity & Telemetry</h2>
            <p>
              During the application process, browser telemetry (such as tab focus switches and paste attempts) is monitored solely to ensure authentic responses. No private keystrokes or background applications are inspected.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-white uppercase text-red-400">4. Contact & Rectification</h2>
            <p>
              If you wish to update or withdraw your submitted application data, please contact the founder directly at <span className="text-white font-bold">ashuchinthapalli3900@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
