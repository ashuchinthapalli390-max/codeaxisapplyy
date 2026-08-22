"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Checkbox from "@/components/ui/Checkbox";
import Button3D from "@/components/ui/Button3D";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Copy, Eye, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function RulesPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleBegin = () => {
    if (!agreed) return;
    playButtonClick();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("codexa_rules_accepted", "true");
    }
    router.push("/apply/form");
  };

  const rulesList = [
    {
      icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
      title: "Fill Information Genuinely",
      desc: "Provide authentic personal, educational, and developer profile links. Genuine intent is our primary selection criterion.",
    },
    {
      icon: <Copy className="w-4 h-4 text-rose-400" />,
      title: "Copy/Paste Interceptor & Integrity Protection",
      desc: "Do not copy/paste external generated responses into the assessment. Warning 1 & Warning 2 will trigger alerts, and a 3rd paste attempt will reset the entire application.",
    },
    {
      icon: <Eye className="w-4 h-4 text-red-500" />,
      title: "Tab Switch Monitoring",
      desc: "Unnecessary browser tab switches are recorded as review telemetry for human evaluators. Please remain on the application portal.",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-rose-500" />,
      title: "Technical Knowledge Is Not Compulsory",
      desc: "If you don't know a language (C, Python, Java, etc.), simply select 'I Don't Know'. You will not receive tricky questions and will NOT be penalized.",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      title: "Autosave & Draft Recovery",
      desc: "Your progress is saved locally after every interaction. If your connection drops, you can restore your draft seamlessly upon return.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Background Motion Layer */}
      <div className="fixed inset-0 -z-10 opacity-15 pointer-events-none overflow-hidden">
        <img
          src="/assets/gif-assests/d24f62aa1d4ab988fe9d65ed3ec9bc0f.gif"
          alt="Rules Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#030712]/85" />
      </div>

      <CodingBackground />
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left font-mono">
        
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/20 text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            SCREENING INTEGRITY POLICY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Application Rules & Guidelines
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please read these guidelines carefully before initiating your 8-round screening assessment.
          </p>
        </div>

        {/* Rules Card Box */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-5">
          <div className="space-y-4">
            {rulesList.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-black/60 border border-red-950/70 space-y-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/20">
                    {rule.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {rule.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-8">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-4 border-t border-red-950">
            <Checkbox
              id="rules-agree"
              checked={agreed}
              onChange={(e) => setAgreed((e.target as HTMLInputElement).checked)}
              label={
                <span className="text-xs text-white font-bold">
                  I have read, understood, and agree to abide by all CodeXa application rules, integrity monitoring, and screening policies.
                </span>
              }
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-500">
            Check the agreement above to unlock the 8-round wizard.
          </div>
          <Button3D
            type="button"
            variant="primary"
            disabled={!agreed}
            onClick={handleBegin}
            className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest rounded-2xl"
          >
            <span>BEGIN APPLICATION</span>
            <ArrowRight className="w-4 h-4" />
          </Button3D>
        </div>

      </main>

      <Footer />
    </div>
  );
}
