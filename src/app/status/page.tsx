"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Input from "@/components/ui/Input";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData } from "@/types/application";
import { generateApplicantPDF } from "@/lib/pdf";
import { playButtonClick, playWarningTone } from "@/lib/audio";
import {
  CheckCircle2,
  Clock,
  Download,
  HelpCircle,
  MessageCircle,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react";

export default function StatusTrackingPage() {
  const [refId, setRefId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApplicationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();

    if (!refId.trim() || !email.trim()) {
      setErrorMsg("Please enter both Reference ID and registered Email.");
      playWarningTone();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/applications/track?ref=${encodeURIComponent(refId.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const json = await res.json();

      if (json.success && json.data) {
        setResult(json.data);
      } else {
        setErrorMsg(json.error || "No matching application found. Please check your details.");
        playWarningTone();
      }
    } catch {
      setErrorMsg("Failed to query application status. Please check your internet connection.");
      playWarningTone();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    if (status === "Selected") return "text-emerald-400 bg-emerald-950/80 border-emerald-500";
    if (status === "Shortlisted") return "text-rose-400 bg-rose-950/80 border-rose-500";
    if (status === "Under Review") return "text-amber-400 bg-amber-950/80 border-amber-500";
    if (status === "Waitlisted") return "text-blue-400 bg-blue-950/80 border-blue-500";
    if (status === "Not Selected") return "text-slate-400 bg-slate-900 border-slate-700";
    return "text-red-400 bg-red-950/80 border-red-500";
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Background Code Stream Motion Layer */}
      <div className="fixed inset-0 -z-10 opacity-15 pointer-events-none overflow-hidden">
        <img
          src="/assets/gif-assests/6de84346589395b4f74367e1ef002fa6.gif"
          alt="Code Stream Background"
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
            <Terminal className="w-3.5 h-3.5" />
            CANDIDATE TRACKING CONSOLE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Track Application Status
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your unique Application Reference ID and registered email address to view your screening progress.
          </p>
        </div>

        {/* Search Form Card */}
        <form
          onSubmit={handleSearch}
          className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Application Reference ID"
              name="refId"
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              placeholder="e.g. CAX-2026-000101"
              required
            />
            <Input
              label="Registered Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. developer@example.com"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button3D
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="py-3 px-8 text-xs font-bold uppercase"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? "QUERYING DATABASE..." : "TRACK APPLICATION"}</span>
            </Button3D>
          </div>
        </form>

        {/* Results Card */}
        {result && (
          <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/40 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-950 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">CANDIDATE RECORD:</span>
                <h3 className="text-xl font-bold text-white">{result.full_name}</h3>
                <div className="text-xs text-red-400 font-bold">{result.reference_id}</div>
              </div>

              <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider ${getStatusColor(result.status)}`}>
                STATUS: {result.status || "Submitted"}
              </div>
            </div>

            {/* Visual Timeline Pipeline */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300">Screening Pipeline Stage:</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                
                {/* Step 1 */}
                <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/50 space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                  <div className="font-bold text-white text-[11px]">1. Submitted</div>
                  <div className="text-[9px] text-slate-500">Record Received</div>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    result.status !== "Submitted"
                      ? "bg-black/60 border-emerald-500/50"
                      : "bg-red-950/20 border-red-500/30 animate-pulse"
                  }`}
                >
                  <Clock className={`w-4 h-4 mx-auto ${result.status !== "Submitted" ? "text-emerald-400" : "text-red-400"}`} />
                  <div className="font-bold text-white text-[11px]">2. Reviewing</div>
                  <div className="text-[9px] text-slate-500">Profile Evaluation</div>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    result.status === "Selected"
                      ? "bg-emerald-950/40 border-emerald-500"
                      : result.status === "Shortlisted"
                      ? "bg-rose-950/40 border-rose-500"
                      : "bg-black/30 border-red-950/50"
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 mx-auto ${
                      result.status === "Selected"
                        ? "text-emerald-400"
                        : result.status === "Shortlisted"
                        ? "text-rose-400"
                        : "text-slate-600"
                    }`}
                  />
                  <div className="font-bold text-white text-[11px]">3. Decision</div>
                  <div className="text-[9px] text-slate-500">{result.status || "Pending"}</div>
                </div>

              </div>
            </div>

            {/* Candidate Details Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-black/50 p-4 rounded-2xl border border-red-950">
              <div>
                <span className="text-slate-500 text-[10px]">COLLEGE / UNIVERSITY:</span>
                <div className="text-slate-200 mt-0.5">{result.college_name}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">COURSE & BRANCH:</span>
                <div className="text-slate-200 mt-0.5">{result.course} ({result.branch})</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">SUBMISSION DATE:</span>
                <div className="text-slate-200 mt-0.5">
                  {result.created_at ? new Date(result.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">INTERNSHIP BATCH:</span>
                <div className="text-slate-200 mt-0.5">2026 Developer Batch</div>
              </div>
            </div>

            {/* Selected Guidance */}
            {result.status === "Selected" && (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 text-xs text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Congratulations! You have been selected for CodeXa Developer Internship.</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Please check your registered inbox ({result.email}) for your official selection email containing private WhatsApp and Discord developer onboarding invitations.
                </p>
              </div>
            )}

            {/* PDF Download Button */}
            <div className="flex justify-end pt-2">
              <Button3D
                type="button"
                variant="secondary"
                onClick={() => generateApplicantPDF(result)}
                className="py-3 px-6 text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD APPLICATION PDF</span>
              </Button3D>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
