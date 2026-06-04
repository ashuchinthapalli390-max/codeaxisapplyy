"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData } from "@/types/application";
import { generateReceiptPdf } from "@/lib/pdf";
import { Download, CheckCircle2 } from "lucide-react";

interface ApplicantSuccessProps {
  data: ApplicationData;
  onStartFresh: () => void;
}

export default function ApplicantSuccess({ data, onStartFresh }: ApplicantSuccessProps) {
  const referenceId = data.reference_id || "CAX-2026-000000";

  useEffect(() => {
    // Fire confetti on successful submit
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confetti bursts from both sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadPdf = () => {
    generateReceiptPdf(data);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto cyber-glass rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Top design trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />
        <div className="absolute top-3 left-4 text-[9px] font-mono text-emerald-400/40">STAGE: SUCCESS</div>
        <div className="absolute top-3 right-4 text-[9px] font-mono text-emerald-400/40">SAVED_TO_DB</div>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mb-6 mt-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 font-mono">
          Submission Successful
        </h2>
        <p className="text-[11px] text-slate-400 font-mono mb-6">
          Your application draft has been saved to the database.
        </p>

        {/* Reference ID Showcase */}
        <div className="w-full bg-slate-950/80 border border-cyan-950/80 rounded-2xl p-4 mb-6 font-mono">
          <div className="text-[9px] text-cyan-500/60 uppercase tracking-widest mb-1">
            Reference Tracking ID
          </div>
          <div className="text-lg font-bold text-white glow-cyan tracking-wider">
            {referenceId}
          </div>
        </div>

        <p className="text-[10px] text-slate-350 leading-relaxed font-mono mb-8 text-left border-l-2 border-cyan-500/30 pl-3">
          A receipt containing your details is compiled. Click below to download the verification PDF. Keep this receipt for reference.
        </p>

        {/* Download Button */}
        <Button3D
          type="button"
          variant="primary"
          onClick={handleDownloadPdf}
          className="w-full py-4 mb-4 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD RECEIPT PDF</span>
        </Button3D>

        {/* Start Fresh / Done Button */}
        <Button3D
          type="button"
          variant="secondary"
          onClick={onStartFresh}
          className="w-full py-3"
        >
          APPLY FRESH
        </Button3D>

        {/* Footer */}
        <div className="mt-8 text-[9px] font-mono text-slate-650 opacity-40">
          CODEAXIS VERIFICATION REGISTRY &copy; 2026
        </div>
      </div>
    </div>
  );
}
