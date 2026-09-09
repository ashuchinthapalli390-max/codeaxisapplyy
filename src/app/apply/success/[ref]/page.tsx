"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData } from "@/types/application";
import { generateApplicantPDF } from "@/lib/pdf";
import { playButtonClick, playSuccessSound } from "@/lib/audio";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Home,
  Mail,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

export default function ApplicationSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const refId = (params?.ref as string) || "CAX-2026-XXXXXX";

  const [copied, setCopied] = useState(false);
  const [appData, setAppData] = useState<ApplicationData | null>(null);

  useEffect(() => {
    playSuccessSound();

    // Read session-isolated submission receipt bound strictly to this reference ID
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`codexa_app_submission_${refId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.full_name || parsed.email)) {
            setAppData({ ...parsed, reference_id: refId });
          }
        }
      } catch {}
    }
  }, [refId]);

  const handleCopyRef = () => {
    playButtonClick();
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    playButtonClick();

    let targetData = appData;
    if (!targetData && typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`codexa_app_submission_${refId}`);
        if (cached) {
          targetData = JSON.parse(cached);
        }
      } catch {}
    }

    if (targetData && (targetData.full_name || targetData.email)) {
      generateApplicantPDF({ ...targetData, reference_id: refId });
    } else {
      // Direct access without current session state -> redirect to secure tracking portal
      router.push(`/status?ref=${encodeURIComponent(refId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Background Celebration Motion Layer */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none overflow-hidden">
        <img
          src="/assets/gif-assests/d74ed5d64d9c1d573a60020ec3c9a8c1.gif"
          alt="Submission Success"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#030712]/80" />
      </div>

      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center font-mono">
        
        {/* Glow check circle */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-red-950 to-black border-2 border-red-500/60 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] ring-pulse-red">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <div className="text-xs font-bold tracking-[0.25em] text-red-400 uppercase">
            APPLICATION SUBMITTED SUCCESSFULLY
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider">
            Welcome to the Review Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your candidate profile has been securely recorded in the CodeXa database and queued for human evaluation.
          </p>
        </div>

        {/* Reference ID Card */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/40 space-y-5 text-left">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Submission Reference:</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              STATUS: SUBMITTED
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-black text-white tracking-widest text-red-400 glow-red">
                {refId}
              </div>
              <div className="text-[11px] text-slate-400">
                Timestamp: {new Date().toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyRef}
              className="px-4 py-2.5 rounded-xl bg-black/60 border border-red-950 hover:border-red-500 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-red-400" />
              <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY REFERENCE ID"}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-red-950/70 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-white">Next Steps:</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              1. Download your official application PDF below for your records. <br />
              2. Keep your Reference ID safe to check real-time screening results on our Track Application portal. <br />
              3. If selected, you will receive an official email confirmation with private onboarding links.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button3D
            type="button"
            variant="primary"
            onClick={handleDownloadPDF}
            className="py-4 text-xs font-bold"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD PDF</span>
          </Button3D>

          <Button3D
            type="button"
            variant="secondary"
            onClick={() => {
              playButtonClick();
              router.push("/status");
            }}
            className="py-4 text-xs font-bold"
          >
            <Terminal className="w-4 h-4 text-red-400" />
            <span>TRACK STATUS</span>
          </Button3D>

          <Button3D
            type="button"
            variant="ghost"
            onClick={() => {
              playButtonClick();
              router.push("/");
            }}
            className="py-4 text-xs font-bold border border-red-950 hover:border-red-500/40"
          >
            <Home className="w-4 h-4" />
            <span>RETURN HOME</span>
          </Button3D>
        </div>

      </main>

      <Footer />
    </div>
  );
}
