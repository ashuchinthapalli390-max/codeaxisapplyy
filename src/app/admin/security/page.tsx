"use client";

import React from "react";
import { ShieldAlert, Key, Lock, ShieldCheck } from "lucide-react";

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          SECURITY & ACCESS HARDENING
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Security Controls & Keys
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="red-glass rounded-2xl p-6 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-red-400" />
            <span>Master Access Key Authentication</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Admin access is guarded by cryptographically hashed single-key verification with 5-attempt rate-limiting and automatic 5-minute IP lockouts.
          </p>
          <div className="p-3 bg-black/60 rounded-xl border border-red-950 text-[11px] text-emerald-400 font-bold">
            Status: Rate-Limiter Daemon Active (5 attempts threshold)
          </div>
        </div>

        <div className="red-glass rounded-2xl p-6 border border-red-500/30 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Anti-Cheat & Paste Interceptors</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            The candidate application monitors clipboard injection and focus changes. 3 paste violations trigger an irreversible form reset to preserve applicant honesty.
          </p>
          <div className="p-3 bg-black/60 rounded-xl border border-red-950 text-[11px] text-red-300 font-bold">
            Status: Paste Interceptor v2.0 Armed
          </div>
        </div>
      </div>
    </div>
  );
}
