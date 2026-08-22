"use client";

import React from "react";
import { CLIPBOARD_WARNINGS, MAX_CLIPBOARD_WARNINGS } from "@/lib/integrity";
import { AlertTriangle, Copy, ShieldAlert, X } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

interface Props {
  open: boolean;
  warningNum: number;
  onClose: () => void;
}

export default function ClipboardWarningModal({ open, warningNum, onClose }: Props) {
  if (!open || warningNum < 1 || warningNum >= MAX_CLIPBOARD_WARNINGS) {
    return null;
  }

  const info = CLIPBOARD_WARNINGS[warningNum] || CLIPBOARD_WARNINGS[1];
  const isFinal = warningNum === 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border ${
        isFinal ? "border-red-500 bg-[#0c0507] shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse" : "border-red-500/40 bg-[#080810] shadow-[0_0_30px_rgba(239,68,68,0.3)]"
      } text-left font-mono space-y-6`}>
        
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
            isFinal ? "border-red-500 bg-red-950/80 text-red-300" : "border-amber-500/40 bg-amber-950/30 text-amber-300"
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{info.badge}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Icon */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${
            isFinal ? "bg-red-950/60 border-red-500/60 text-red-400" : "bg-amber-950/40 border-amber-500/40 text-amber-400"
          }`}>
            {isFinal ? <AlertTriangle className="w-6 h-6 animate-bounce" /> : <Copy className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {info.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {info.message}
            </p>
          </div>
        </div>

        {/* Submessage box */}
        {info.submessage && (
          <div className="p-3.5 rounded-xl bg-black/60 border border-red-950/80 text-xs text-slate-400 leading-relaxed">
            {info.submessage}
          </div>
        )}

        {/* Warning Step Dots */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>INTEGRITY COUNTER</span>
            <span className="text-red-400 font-bold">{warningNum} / {MAX_CLIPBOARD_WARNINGS}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((step) => {
              const active = step <= warningNum;
              const is5th = step === 5;
              return (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all ${
                    active
                      ? isFinal
                        ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                        : "bg-amber-500"
                      : is5th
                      ? "bg-red-950/40 border border-red-900/50"
                      : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Acknowledge Button */}
        <Button3D
          type="button"
          variant="primary"
          onClick={onClose}
          className="w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-xl"
        >
          <span>I UNDERSTAND &bull; CONTINUE</span>
        </Button3D>

      </div>
    </div>
  );
}
