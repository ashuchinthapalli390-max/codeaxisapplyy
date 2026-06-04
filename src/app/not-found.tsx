"use client";

import React from "react";
import Link from "next/link";
import CodingBackground from "@/components/CodingBackground";

export default function NotFound() {
  return (
    <main className="min-h-screen text-slate-100 relative">
      {/* Background terminal animation */}
      <CodingBackground />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 font-mono text-center">
        <div className="max-w-md w-full cyber-glass rounded-3xl p-6 md:p-8 border border-cyan-500/20 shadow-[0_0_35px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col items-center">
          
          {/* Top accent line decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500" />
          
          <div className="w-16 h-16 mb-6 rounded-2xl border border-cyan-500/20 bg-slate-950/80 flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-2xl">404</span>
          </div>

          <div className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-3">
            &gt; NODE_NOT_FOUND
          </div>
          
          <p className="text-[11px] text-slate-400 leading-relaxed mb-8 max-w-xs">
            The requested sub-routing matrix or page endpoint could not be resolved by the server. Please verify your path URL or return to the main gate.
          </p>

          <Link
            href="/"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 hover:from-blue-700 hover:via-cyan-600 hover:to-cyan-500 text-slate-950 font-bold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 transform active:scale-[0.98] text-center text-xs"
          >
            RETURN TO ENTRY TERMINAL
          </Link>
        </div>
      </div>
    </main>
  );
}
