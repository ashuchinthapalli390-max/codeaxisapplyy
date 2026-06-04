"use client";

import React from "react";

interface EntryScreenProps {
  onStartApplication: () => void;
  onAdminAccess: () => void;
}

export default function EntryScreen({ onStartApplication, onAdminAccess }: EntryScreenProps) {
  return (
    <div className="flex flex-col justify-center min-h-screen px-4 py-8">
      {/* Mobile container - strictly max-w-md */}
      <div className="w-full max-w-md mx-auto cyber-glass rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Top absolute system bar decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500" />
        
        {/* Subtle accent corner marks */}
        <div className="absolute top-3 left-4 text-[9px] font-mono text-cyan-500/40">ENTRY_STAGE</div>
        <div className="absolute top-3 right-4 text-[9px] font-mono text-cyan-500/40">SYS_OK</div>

        {/* Logo Section */}
        <div className="w-24 h-24 mb-6 mt-4 rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-2 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <img 
            src="/logo.jpeg" 
            alt="CodeAxis Logo" 
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Title & Badge */}
        <div className="mb-2">
          <span className="text-[10px] tracking-[0.2em] font-mono font-bold bg-cyan-950/60 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/25 uppercase shadow-[0_0_8px_rgba(6,182,212,0.1)]">
            Codexa Portal
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2 font-mono">
          CodeAxis Apply
        </h1>
        
        <h2 className="text-sm font-semibold text-cyan-400 mb-6 font-mono">
          Free Developer Internship Application
        </h2>

        {/* Description */}
        <p className="text-xs text-slate-350 leading-relaxed mb-8 px-2 font-mono">
          Apply for the free developer internship and start your journey with step-by-step learning, AI-assisted coding, and real project practice.
        </p>

        {/* Start Application Button */}
        <button
          onClick={onStartApplication}
          type="button"
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 hover:from-blue-700 hover:via-cyan-600 hover:to-cyan-500 text-slate-950 font-bold rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.55)] transition-all duration-300 transform active:scale-[0.98] mb-6 flex items-center justify-center space-x-2 text-sm font-mono tracking-wide cursor-pointer"
        >
          <span>START APPLICATION</span>
          <span className="text-base">&rarr;</span>
        </button>

        {/* Separator */}
        <div className="w-full flex items-center justify-center my-4">
          <div className="h-[1px] bg-cyan-950/50 flex-grow" />
          <span className="text-[10px] font-mono text-cyan-600/50 px-3">ADMIN PORTAL</span>
          <div className="h-[1px] bg-cyan-950/50 flex-grow" />
        </div>

        {/* Admin Access Button */}
        <button
          onClick={onAdminAccess}
          type="button"
          className="w-full py-3 px-4 bg-slate-950/40 hover:bg-slate-950/80 text-cyan-400/70 hover:text-cyan-300 font-mono text-[11px] rounded-xl border border-cyan-950/70 hover:border-cyan-500/40 transition-all duration-350 transform active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Login / Admin Access</span>
        </button>

        {/* Bottom design decoration */}
        <div className="mt-8 text-[9px] font-mono text-slate-650 opacity-40">
          CODEAXIS APPLICATION ENGINE &copy; 2026
        </div>
      </div>
    </div>
  );
}
