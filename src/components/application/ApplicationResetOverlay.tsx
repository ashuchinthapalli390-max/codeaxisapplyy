"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertOctagon, CheckCircle2, RotateCcw, ShieldAlert } from "lucide-react";
import { clearApplicationDraft } from "@/lib/integrity";

interface Props {
  active: boolean;
}

export default function ApplicationResetOverlay({ active }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!active) return;

    // Immediately wipe all local drafts and cached sessions
    clearApplicationDraft();

    const t1 = setTimeout(() => setStep(2), 700);
    const t2 = setTimeout(() => setStep(3), 1500);
    const t3 = setTimeout(() => setStep(4), 2300);
    const t4 = setTimeout(() => {
      router.replace("/apply/rules?reset=integrity_limit");
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [active, router]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 font-mono">
      <div className="relative w-full max-w-lg rounded-3xl p-8 border-2 border-red-600 bg-[#090305] shadow-[0_0_80px_rgba(239,68,68,0.7)] text-center space-y-6">
        
        {/* Flashing Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse shadow-[0_0_30px_#ef4444]">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.2em]">
            5 / 5 &bull; INTEGRITY LIMIT REACHED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            APPLICATION RESET
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            The maximum number of restricted clipboard attempts has been reached. Current application answers have been wiped.
          </p>
        </div>

        {/* Sequential Step Progress */}
        <div className="p-4 rounded-2xl bg-black/80 border border-red-950/90 text-left space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Intercepted 5th restricted clipboard attempt</span>
          </div>

          <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${
            step >= 2 ? "text-slate-200 opacity-100" : "text-slate-600 opacity-40"
          }`}>
            {step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 animate-spin text-red-400 shrink-0" />
            )}
            <span>Clearing local draft & autosaved responses</span>
          </div>

          <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${
            step >= 3 ? "text-slate-200 opacity-100" : "text-slate-600 opacity-40"
          }`}>
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 animate-spin text-red-400 shrink-0" />
            )}
            <span>Wiping 8-round screening assessment state</span>
          </div>

          <div className={`flex items-center gap-2.5 transition-opacity duration-300 ${
            step >= 4 ? "text-red-400 font-bold opacity-100" : "text-slate-600 opacity-40"
          }`}>
            {step >= 4 ? (
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
            )}
            <span>Redirecting to Application Rules...</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Resetting session security token &bull; Please wait
        </div>

      </div>
    </div>
  );
}
