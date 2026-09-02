"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Shield, Terminal } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function Footer() {
  return (
    <footer className="border-t border-red-950/60 bg-[#02040a] relative overflow-hidden text-left z-10">
      
      {/* Background Horizon Motion Layer */}
      <div className="absolute inset-0 -z-10 opacity-15 pointer-events-none overflow-hidden">
        <img
          src="/assets/gif-assests/d8bf146f4bc2b4e3a28cb8c71e81cc28.gif"
          alt="Footer Horizon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/90 to-transparent" />
      </div>

      {/* Spider-tech accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-red-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Agency Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-black/80 border border-red-500/40 flex items-center justify-center p-0.5 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <img src="/logo.jpeg" alt="CodeXa Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <div className="text-base font-black tracking-widest font-mono text-white">CODEXA AGENCY</div>
                <div className="text-[10px] font-mono text-red-400">BUILDING TECHNOLOGY. BUILDING DEVELOPERS.</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-sm">
              CodeXa is a modern digital agency and developer accelerator. We build high-performance software, AI agent systems, automation pipelines, and host an 8-round screening internship for ambitious builders.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playButtonClick}
                className="w-9 h-9 rounded-xl border border-red-500/20 bg-red-950/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 transition-all"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:ashuchinthapalli3900@gmail.com"
                onClick={playButtonClick}
                className="w-9 h-9 rounded-xl border border-red-500/20 bg-red-950/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 transition-all"
                title="Founder Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/918897901413"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playButtonClick}
                className="w-9 h-9 rounded-xl border border-red-500/20 bg-red-950/20 flex items-center justify-center text-slate-400 hover:text-white hover:border-red-500/50 transition-all"
                title="Founder WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Internship Links */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-widest text-red-400">INTERNSHIP</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/internship" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Overview & Curriculum
                </Link>
              </li>
              <li>
                <Link href="/apply" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Application Portal
                </Link>
              </li>
              <li>
                <Link href="/apply/rules" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Screening Rules & Integrity
                </Link>
              </li>
              <li>
                <Link href="/status" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Track Application Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Agency & Company */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-widest text-red-400">COMPANY</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://www.codxa-agency.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playButtonClick}
                  className="hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Agency Website</span>
                  <ArrowUpRight className="w-3 h-3 text-red-400" />
                </a>
              </li>
              <li>
                <Link href="/about" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  About CodeXa
                </Link>
              </li>
              <li>
                <Link href="/#leadership" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Leadership Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policy */}
          <div className="space-y-3 font-mono">
            <div className="text-xs font-bold uppercase tracking-widest text-red-400">LEGAL & POLICIES</div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/privacy" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/internship-policy" onClick={playButtonClick} className="hover:text-red-400 transition-colors">
                  Commitment Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-red-950/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CodeXa Agency. All rights reserved. Designed for elite developers.
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM OPERATIONAL
            </span>
            <span>|</span>
            <span>BUILD V2.0-RED</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
