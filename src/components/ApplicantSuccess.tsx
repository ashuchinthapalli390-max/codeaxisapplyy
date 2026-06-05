"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData } from "@/types/application";
import { generateReceiptPdf } from "@/lib/pdf";
import { Download, CheckCircle2, Home, Users } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

interface ApplicantSuccessProps {
  data: ApplicationData;
  onStartFresh: () => void;
}

export default function ApplicantSuccess({ data, onStartFresh }: ApplicantSuccessProps) {
  const referenceId = data.reference_id || "CAX-2026-000000";
  const [isLowPerf, setIsLowPerf] = useState(false);

  // Performance capability detector
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      if (isMobile || lowCores) {
        const timer = setTimeout(() => {
          setIsLowPerf(true);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    // Fire lightweight confetti on successful submit
    const duration = isLowPerf ? 1.5 * 1000 : 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: isLowPerf ? 15 : 25, spread: 360, ticks: isLowPerf ? 30 : 50, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = (isLowPerf ? 20 : 50) * (timeLeft / duration);
      // Confetti bursts from both sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 300);

    return () => clearInterval(interval);
  }, [isLowPerf]);

  const handleDownloadPdf = () => {
    playButtonClick();
    generateReceiptPdf(data);
  };

  return (
    <div className="flex flex-col justify-center min-h-screen px-4 py-8">
      {/* 3D Success Receipt Card */}
      <div className="w-full max-w-md mx-auto glass-container-3d p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        
        {/* Hologram/Laser top strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#bd00ff]" />
        <div className="absolute top-3.5 left-4 text-[9px] font-mono text-emerald-400/50">SYSTEM STATE: VERIFIED</div>
        <div className="absolute top-3.5 right-4 text-[9px] font-mono text-emerald-400/50">PERMANENT_SQL_OK</div>

        {/* Green/Cyan Energy Pulse Success Hologram */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 mt-6 shadow-[0_0_25px_rgba(16,185,129,0.2)] hologram-pulse">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-2 font-mono uppercase">
          Application Submitted Successfully!
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Your application details have been saved permanently.
        </p>

        {/* 3D Reference ID Showcase Badge */}
        <div className="w-full bg-slate-950/90 border border-cyan-950/80 rounded-2xl p-4.5 mb-6 font-mono relative overflow-hidden shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/35 to-transparent" />
          <div className="text-[9px] text-cyan-500/60 uppercase tracking-widest mb-1.5 font-bold">
            Reference Tracking ID
          </div>
          <div className="text-xl font-black text-white tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#bd00ff] filter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            {referenceId}
          </div>
        </div>

        <p className="text-[11px] text-slate-350 leading-relaxed font-mono mb-8 text-left border-l-2 border-cyan-500/35 pl-3.5">
          Your developer registration is confirmed. Generating receipt... Please download the verification PDF and join our group for subsequent review updates.
        </p>

        {/* Actions Stack */}
        <div className="w-full space-y-3.5">
          {/* 1. Download Application PDF */}
          <Button3D
            type="button"
            variant="primary"
            onClick={handleDownloadPdf}
            className="w-full py-4 flex items-center justify-center space-x-2.5 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span className="font-bold">DOWNLOAD APPLICATION PDF</span>
          </Button3D>

          <div className="flex gap-3">
            {/* 2. Back to Home */}
            <Button3D
              type="button"
              variant="secondary"
              onClick={() => {
                playButtonClick();
                onStartFresh();
              }}
              className="flex-1 py-3 flex items-center justify-center space-x-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>BACK TO HOME</span>
            </Button3D>

            {/* 3. Join Community */}
            <a
              href="https://chat.whatsapp.com/CodeXaCommunityInviteLink"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-[#0066ff]/20 hover:bg-[#0066ff]/35 border border-[#0066ff]/50 hover:border-cyan-400 text-white font-mono text-[10px] font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-[0_0_10px_rgba(0,102,255,0.15)]"
            >
              <Users className="w-3.5 h-3.5" />
              <span>JOIN COMMUNITY</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-[9px] font-mono text-slate-700 opacity-40">
          CODEAXIS DIGITAL AGENCY &copy; 2026 // DATABASE PERSISTENCE VERIFIED
        </div>
      </div>
    </div>
  );
}
