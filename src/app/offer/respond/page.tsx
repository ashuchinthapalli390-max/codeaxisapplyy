"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ShieldCheck,
  AlertCircle,
  FileText,
  ArrowRight,
  Briefcase,
  Calendar,
  Building,
  Sparkles,
} from "lucide-react";
import { generateOfferLetterPDF } from "@/lib/pdf";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

export default function OfferRespondPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialAction = searchParams.get("action");

  const [offer, setOffer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No offer verification token provided. Please use the link provided in your offer email.");
      setLoading(false);
      return;
    }

    fetch(`/api/offer/respond?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setOffer(json.data);
          if (json.data.status === "Offer Accepted") {
            setResponseSuccess("Offer Accepted");
          } else if (json.data.status === "Offer Declined") {
            setResponseSuccess("Offer Declined");
          }
        } else {
          setError(json.error || "Invalid or expired offer verification link.");
        }
      })
      .catch(() => {
        setError("Network error while verifying offer link. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleRespond = async (action: "accept" | "decline") => {
    playButtonClick();
    if (action === "accept" && !declarationAgreed) {
      alert("Please confirm the declaration checkbox before accepting the offer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/offer/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action,
          decline_reason: action === "decline" ? declineReason : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setResponseSuccess(action === "accept" ? "Offer Accepted" : "Offer Declined");
        setOffer((prev: any) => ({
          ...prev,
          status: action === "accept" ? "Offer Accepted" : "Offer Declined",
          responded_at: json.responded_at || new Date().toISOString(),
        }));
        setShowDeclineModal(false);
      } else {
        alert(json.error || "Failed to process your response.");
      }
    } catch {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4 font-mono">
        <Clock className="w-8 h-8 text-red-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Verifying secure offer credentials...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full rounded-3xl bg-[#0b0b14] border border-red-500/40 p-6 sm:p-8 text-center space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h1 className="text-base font-bold text-white uppercase">Offer Verification Notice</h1>
          <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-xs font-bold text-red-300 hover:bg-red-600 hover:text-white transition-all"
            >
              Return to CodeXa Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyResponded = offer.status === "Offer Accepted" || offer.status === "Offer Declined";

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-mono selection:bg-red-500 selection:text-white">
      <div className="max-w-xl w-full rounded-3xl bg-[#0b0b14] border border-red-500/30 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-950 pb-4">
          <div>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block">
              CODEXA AGENCY &bull; APPOINTMENT
            </span>
            <h1 className="text-lg font-black text-white mt-0.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              INTERNSHIP OFFER DECISION
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase block">Candidate Ref</span>
            <span className="text-xs font-bold text-white">{offer.reference_id}</span>
          </div>
        </div>

        {/* Recipient & Greetings */}
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-200">
            Dear <span className="text-white font-black">{offer.applicant_name}</span>,
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Following our evaluation, CodeXa Agency is proud to extend this formal offer of engagement for the Developer Internship program.
          </p>
        </div>

        {/* Offer Summary Matrix */}
        <div className="rounded-2xl bg-black/60 border border-red-950/80 p-4 space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Position / Role:</span>
            <span className="font-bold text-white text-right">{offer.internship_role}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Department:</span>
            <span className="text-slate-200 text-right">{offer.department}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Commencement Date:</span>
            <span className="font-bold text-emerald-400 text-right">{offer.joining_date}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Tenure / Duration:</span>
            <span className="text-slate-200 text-right">{offer.duration}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Work Mode:</span>
            <span className="text-slate-200 text-right">{offer.work_mode} ({offer.work_location || "Online"})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Daily Commitment:</span>
            <span className="text-slate-200 text-right">{offer.working_hours || "3-4 Hours Daily"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-red-950/50">
            <span className="text-slate-400">Compensation:</span>
            <span className="font-bold text-white text-right">{offer.stipend_status}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Response Deadline:</span>
            <span className="font-bold text-rose-400 text-right">{offer.acceptance_deadline}</span>
          </div>
        </div>

        {/* Download PDF Action */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="text-slate-300">Official CodeXa Offer Letter (PDF)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              generateOfferLetterPDF(offer);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Response Outcome States */}
        {offer.status === "Offer Accepted" ? (
          <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              OFFER OFFICIALLY ACCEPTED
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Thank you for accepting your offer to join the CodeXa Developer Internship! Our engineering team will reach out with onboarding materials before your commencement date ({offer.joining_date}).
            </p>
            {offer.responded_at && (
              <div className="text-[10px] text-slate-400">
                Recorded at: {new Date(offer.responded_at).toLocaleString("en-IN")}
              </div>
            )}
          </div>
        ) : offer.status === "Offer Declined" ? (
          <div className="p-5 rounded-2xl bg-black/80 border border-slate-700 text-center space-y-2">
            <XCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">
              OFFER DECLINED
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We appreciate your response. Your decision has been safely recorded in our recruitment system. We wish you the best in your career pursuits.
            </p>
          </div>
        ) : (
          /* Active Decision Action Form */
          <div className="space-y-4 pt-2">
            {/* Declaration Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-black/40 border border-red-950 text-xs cursor-pointer hover:border-red-500/40 transition-colors">
              <input
                type="checkbox"
                checked={declarationAgreed}
                onChange={(e) => setDeclarationAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-red-600 shrink-0"
              />
              <span className="text-slate-300 leading-snug">
                I confirm that I have reviewed the appointment details, project curriculum, and policies. I agree to dedicate the required hours and maintain code integrity.
              </span>
            </label>

            {/* Decision Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRespond("accept")}
                disabled={submitting || !declarationAgreed}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "Confirming..." : "Accept Offer"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  setShowDeclineModal(true);
                }}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline Offer</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-red-950/60">
          Official Single-Use Token Verification Service &bull; CodeXa Agency
        </div>

      </div>

      {/* Decline Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-[#0b0b14] border border-red-500/40 p-6 space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Confirm Offer Decline
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you wish to decline this offer? This decision will be permanently recorded for Batch {offer.batch_code}.
            </p>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Optional feedback / reason:</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., Accepted another opportunity, schedule clash, etc."
                rows={3}
                className="w-full bg-black/70 border border-red-950 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2 rounded-xl bg-black/50 text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRespond("decline")}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
