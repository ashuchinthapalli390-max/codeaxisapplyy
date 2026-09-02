"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicationData, ApplicationStatus } from "@/types/application";
import { InterviewData, OfferData } from "@/types/admin";
import { generateAdminPDF, generateOfferLetterPDF } from "@/lib/pdf";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Download,
  Eye,
  FileCheck,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  History,
  Laptop,
  Layers,
  Mail,
  MessageCircle,
  Plus,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  User,
  UserCheck,
  Users,
  Video,
  XCircle,
  Zap,
} from "lucide-react";

const ALL_STATUSES: ApplicationStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Additional Information Required",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Offer Sent",
  "Offer Viewed",
  "Offer Accepted",
  "Offer Declined",
  "Offer Expired",
  "Waitlisted",
  "Rejected",
  "Withdrawn",
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refId = (params?.id as string) || "";

  const [candidate, setCandidate] = useState<ApplicationData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [noteInput, setNoteInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_round: "Technical & Mindset Review",
    interview_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    start_time: "14:00",
    timezone: "Asia/Kolkata",
    duration_minutes: 30,
    platform: "Google Meet",
    meeting_link: "https://meet.google.com/new",
    interviewer_name: "Ashu Chinthapalli",
    instructions: "Please join with a quiet environment and have your GitHub repositories accessible.",
    admin_notes: "",
    send_email: true,
  });

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    internship_role: "Full-Stack Developer Intern",
    department: "Engineering & Product Development",
    batch_code: "2026-SEP",
    joining_date: "2026-09-15",
    duration: "12 Weeks",
    work_mode: "Remote" as "Remote" | "Hybrid" | "In-Office",
    work_location: "Online / Remote",
    working_hours: "Flexible / 3-4 Hours Daily",
    reporting_person: "Ashu Chinthapalli (Founder & CEO)",
    stipend_status: "Performance-Based Project Stipends & Completion Rewards",
    acceptance_deadline: "2026-09-10",
    authorized_person: "Ashu Chinthapalli",
    designation: "Founder & Chief Executive Officer",
    send_email: true,
  });

  const fetchCandidate = async () => {
    setLoading(true);
    try {
      const [resApp, resInt, resOff] = await Promise.all([
        fetch(`/api/admin/applications/${encodeURIComponent(refId)}`, { credentials: "include" }),
        fetch(`/api/admin/applications/${encodeURIComponent(refId)}/interview`, { credentials: "include" }),
        fetch(`/api/admin/applications/${encodeURIComponent(refId)}/offer`, { credentials: "include" }),
      ]);

      const [jsonApp, jsonInt, jsonOff] = await Promise.all([
        resApp.json(),
        resInt.json(),
        resOff.json(),
      ]);

      if (jsonApp.success && jsonApp.data) {
        setCandidate(jsonApp.data);
      }
      if (jsonInt.success && jsonInt.data) {
        setInterview(jsonInt.data);
      }
      if (jsonOff.success && jsonOff.data) {
        setOffer(jsonOff.data);
      }
    } catch (err) {
      console.error("Error fetching candidate details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refId) fetchCandidate();
  }, [refId]);

  const handleStatusChange = async (newStatus: string) => {
    playButtonClick();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${refId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setCandidate((prev) => (prev ? { ...prev, status: newStatus as any } : prev));
      }
    } catch {
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewForm.meeting_link.startsWith("http")) {
      alert("Please enter a valid HTTP/HTTPS meeting link.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${refId}/interview`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "schedule", ...interviewForm }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        playSuccessSound();
        setInterview(json.data);
        setCandidate((prev) => (prev ? { ...prev, status: "Interview Scheduled" } : prev));
        setShowInterviewModal(false);
        alert(`Interview scheduled successfully! ${json.email_sent ? "Invitation email dispatched." : ""}`);
      } else {
        alert(json.error || "Failed to schedule interview.");
      }
    } catch {
      alert("Error scheduling interview.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${refId}/offer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm),
      });
      const json = await res.json();
      if (json.success && json.data) {
        playSuccessSound();
        setOffer(json.data);
        setCandidate((prev) => (prev ? { ...prev, status: "Offer Sent" } : prev));
        setShowOfferModal(false);
        alert(`Official Offer Letter generated! ${json.email_sent ? "Congratulations email dispatched." : ""}`);
      } else {
        alert(json.error || "Failed to generate offer.");
      }
    } catch {
      alert("Error generating offer.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    playButtonClick();

    try {
      const res = await fetch(`/api/admin/applications/${refId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_note", note: noteInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setCandidate((prev) => {
          if (!prev) return prev;
          const currentNotes = prev.admin_notes || [];
          return {
            ...prev,
            admin_notes: [`[${new Date().toLocaleString()}] ${noteInput.trim()}`, ...currentNotes],
          };
        });
        setNoteInput("");
      }
    } catch {
      alert("Failed to append note.");
    }
  };

  const tabs = [
    "Overview",
    "Interview & Scheduling",
    "Offer Letter",
    "Personal",
    "Education",
    "Developer",
    "Projects",
    "Availability",
    "Hardware",
    "Technical",
    "Mindset",
    "Essays",
    "Integrity",
    "Scoring",
    "Admin Notes",
    "History",
  ];

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-sm text-slate-400">
        <Terminal className="w-8 h-8 text-red-400 animate-pulse mx-auto mb-3" />
        <div>DECRYPTING CANDIDATE DOSSIER...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="py-20 text-center font-mono space-y-4">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Candidate Record Not Found</h2>
        <Link href="/admin/applications" className="text-xs text-red-400 hover:underline">
          &larr; Return to Applications Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-mono">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/applications"
            onClick={playButtonClick}
            className="p-2 rounded-xl bg-black border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{candidate.full_name}</h1>
              <span className="text-xs text-red-400 font-bold">({candidate.reference_id})</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Submitted: {candidate.created_at ? new Date(candidate.created_at).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Dropdown */}
          <select
            value={candidate.status || "Submitted"}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded-xl bg-black/80 border border-red-900 text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Schedule Interview Quick Button */}
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setShowInterviewModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-900/40 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>SCHEDULE INTERVIEW</span>
          </button>

          {/* Approve & Offer Button */}
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setShowOfferModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>APPROVE & OFFER</span>
          </button>

          {/* Admin Dossier PDF */}
          <button
            type="button"
            onClick={() => generateAdminPDF(candidate)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOSSIER PDF</span>
          </button>
        </div>
      </div>

      {/* Candidate Overview Score Ribbon */}
      <div className="red-glass rounded-3xl p-5 sm:p-6 border border-red-500/30 grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
        <div>
          <div className="text-[10px] text-slate-500 uppercase">TOTAL SCORE</div>
          <div className="text-2xl font-black text-white mt-0.5">{candidate.total_score || 0}<span className="text-xs text-slate-500">/100</span></div>
          <div className="text-[9px] text-red-400 font-bold">{candidate.score_band}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase">COMMITMENT</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{candidate.commitment_signal || "N/A"}</div>
          <div className="text-[9px] text-slate-400">{candidate.daily_availability}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase">INTEGRITY</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{candidate.genuineness_integrity_score || 25}/25</div>
          <div className="text-[9px] text-slate-400">{candidate.copy_paste_warnings_count || 0} Paste Warns</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase">TECHNICAL</div>
          <div className="text-xl font-bold text-white mt-1">{candidate.technical_knowledge_score || 0}/15</div>
          <div className="text-[9px] text-slate-400">{candidate.skill_authenticity?.overall || "Evaluated"}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase">MINDSET</div>
          <div className="text-xl font-bold text-white mt-1">{candidate.mindset_habits_score || 0}/20</div>
          <div className="text-[9px] text-slate-400">10 Scenarios</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 uppercase">CURRENT STATUS</div>
          <div className="text-sm font-black text-red-400 mt-1 uppercase truncate">{candidate.status || "Submitted"}</div>
          <div className="text-[9px] text-slate-500">Batch 2026</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-red-950 pb-2 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              playButtonClick();
              setActiveTab(tab);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-red-950/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">
              Executive Evaluation Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-2">
                <span className="text-[10px] text-red-400 font-bold uppercase">Identity & Education</span>
                <div><span className="text-slate-500">Name:</span> <span className="text-white font-bold">{candidate.full_name}</span></div>
                <div><span className="text-slate-500">Email:</span> <span className="text-slate-200">{candidate.email}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="text-slate-200">{candidate.phone_number} (WA: {candidate.whatsapp_number || "Same"})</span></div>
                <div><span className="text-slate-500">College:</span> <span className="text-slate-200">{candidate.college_name}</span></div>
                <div><span className="text-slate-500">Course & Roll:</span> <span className="text-slate-200">{candidate.course} ({candidate.branch}), {candidate.roll_number}</span></div>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-2">
                <span className="text-[10px] text-red-400 font-bold uppercase">Screening Metrics</span>
                <div><span className="text-slate-500">Total Score:</span> <span className="text-emerald-400 font-bold">{candidate.total_score}/100</span></div>
                <div><span className="text-slate-500">Score Band:</span> <span className="text-white">{candidate.score_band}</span></div>
                <div><span className="text-slate-500">Commitment Signal:</span> <span className="text-white">{candidate.commitment_signal} ({candidate.daily_availability})</span></div>
                <div><span className="text-slate-500">Skill Consistency:</span> <span className="text-white">{candidate.skill_authenticity?.overall || "High"}</span></div>
                <div><span className="text-slate-500">Integrity Flags:</span> <span className="text-white">{candidate.copy_paste_warnings_count || 0} Paste attempts</span></div>
              </div>
            </div>

            {/* Resume Card (Section 18) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-900/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Candidate Resume</span>
                  {candidate.resume_url ? (
                    <div className="text-white font-bold flex items-center gap-2">
                      <span>{candidate.resume_file_name || "Resume_Document.pdf"}</span>
                      {candidate.resume_file_size && (
                        <span className="text-[10px] text-slate-400">
                          ({(candidate.resume_file_size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Resume not provided</span>
                  )}
                </div>
              </div>

              {candidate.resume_url && (
                <div className="flex items-center gap-2">
                  <a
                    href={candidate.resume_url}
                    download={candidate.resume_file_name || `${candidate.full_name}_Resume.pdf`}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERVIEW & SCHEDULING */}
        {activeTab === "Interview & Scheduling" && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                Interview Management
              </h3>
              <button
                type="button"
                onClick={() => setShowInterviewModal(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{interview ? "Reschedule Interview" : "Schedule Interview"}</span>
              </button>
            </div>

            {interview ? (
              <div className="p-5 rounded-2xl bg-black/60 border border-blue-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-950/60 pb-3">
                  <span className="text-xs font-bold text-white uppercase">{interview.interview_round}</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {interview.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-slate-500">Date & Time:</span> <div className="text-white font-bold mt-0.5">{interview.interview_date} at {interview.start_time} ({interview.timezone})</div></div>
                  <div><span className="text-slate-500">Platform:</span> <div className="text-white font-bold mt-0.5">{interview.platform}</div></div>
                  <div><span className="text-slate-500">Interviewer:</span> <div className="text-white mt-0.5">{interview.interviewer_name}</div></div>
                  <div><span className="text-slate-500">Duration:</span> <div className="text-white mt-0.5">{interview.duration_minutes} Minutes</div></div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Meeting Room URL:</span>
                    <div className="mt-1">
                      <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono">
                        {interview.meeting_link}
                      </a>
                    </div>
                  </div>
                  {interview.instructions && (
                    <div className="sm:col-span-2"><span className="text-slate-500">Candidate Instructions:</span> <div className="text-slate-300 mt-0.5">{interview.instructions}</div></div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-blue-950/60">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Interview Completed")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white font-bold text-[11px]"
                  >
                    Mark Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Under Review")}
                    className="px-3 py-1.5 rounded-lg bg-black/60 border border-red-950 text-slate-400 hover:text-white font-bold text-[11px]"
                  >
                    Cancel Interview
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-red-950 rounded-2xl space-y-3">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-slate-400">No interview scheduled yet for this applicant.</div>
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Schedule Virtual Discussion
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFFER LETTER */}
        {activeTab === "Offer Letter" && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Internship Appointment & Offer Management
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{offer ? "Regenerate Offer" : "Generate Offer Letter"}</span>
              </button>
            </div>

            {offer ? (
              <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-950/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-white uppercase">{offer.internship_role}</span>
                    <span className="text-[10px] text-slate-500 block">Version: {offer.version} &bull; Batch: {offer.batch_code}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    offer.status === "Offer Accepted"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500"
                      : offer.status === "Offer Declined"
                      ? "bg-red-950 text-red-300 border border-red-500"
                      : "bg-blue-950 text-blue-300 border border-blue-500"
                  }`}>
                    {offer.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="text-slate-500">Commencement Date:</span> <div className="text-white font-bold mt-0.5">{offer.joining_date}</div></div>
                  <div><span className="text-slate-500">Tenure / Duration:</span> <div className="text-white mt-0.5">{offer.duration}</div></div>
                  <div><span className="text-slate-500">Work Mode:</span> <div className="text-white mt-0.5">{offer.work_mode} ({offer.work_location || "Online"})</div></div>
                  <div><span className="text-slate-500">Compensation:</span> <div className="text-white mt-0.5">{offer.stipend_status}</div></div>
                  <div><span className="text-slate-500">Response Deadline:</span> <div className="text-rose-400 font-bold mt-0.5">{offer.acceptance_deadline}</div></div>
                  <div><span className="text-slate-500">Signatory:</span> <div className="text-white mt-0.5">{offer.authorized_person} ({offer.designation})</div></div>
                  {offer.responded_at && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Candidate Response Recorded:</span>
                      <div className="text-emerald-400 mt-0.5 font-bold">{new Date(offer.responded_at).toLocaleString("en-IN")}</div>
                    </div>
                  )}
                  {offer.decline_reason && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Decline Feedback:</span>
                      <div className="text-red-300 mt-0.5 italic">{offer.decline_reason}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-emerald-950/60">
                  <button
                    type="button"
                    onClick={() => generateOfferLetterPDF(offer)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600/30 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Offer PDF</span>
                  </button>
                  <a
                    href={`/offer/respond?token=${encodeURIComponent(offer.token)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-black/60 border border-red-950 hover:border-red-500 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Candidate Screen</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-red-950 rounded-2xl space-y-3">
                <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-slate-400">No official offer letter generated yet.</div>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Approve & Issue Offer Letter
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PERSONAL */}
        {activeTab === "Personal" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Full Name:</span> <div className="text-white font-bold mt-1">{candidate.full_name}</div></div>
              <div><span className="text-slate-500">Date of Birth:</span> <div className="text-white mt-1">{candidate.date_of_birth}</div></div>
              <div><span className="text-slate-500">Email:</span> <div className="text-white mt-1">{candidate.email}</div></div>
              <div><span className="text-slate-500">Phone / WhatsApp:</span> <div className="text-white mt-1">{candidate.phone_number} / {candidate.whatsapp_number || "N/A"}</div></div>
              <div><span className="text-slate-500">Location:</span> <div className="text-white mt-1">{candidate.city}, {candidate.state}, {candidate.country}</div></div>
              <div><span className="text-slate-500">Discord / Preferred Name:</span> <div className="text-white mt-1">{candidate.discord_username || "N/A"} / {candidate.preferred_name || "N/A"}</div></div>
            </div>
            {candidate.hobbies && candidate.hobbies.length > 0 && (
              <div className="pt-2">
                <span className="text-slate-500">Hobbies & Interests:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {candidate.hobbies.map((h) => (
                    <span key={h} className="px-2.5 py-1 rounded bg-black border border-red-950 text-slate-300 text-[11px]">{h}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EDUCATION */}
        {activeTab === "Education" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Academic Record</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">College / Institution:</span> <div className="text-white font-bold mt-1">{candidate.college_name}</div></div>
              <div><span className="text-slate-500">University / Board:</span> <div className="text-white mt-1">{candidate.university_name}</div></div>
              <div><span className="text-slate-500">Course & Branch:</span> <div className="text-white mt-1">{candidate.course} &mdash; {candidate.branch}</div></div>
              <div><span className="text-slate-500">Academic Year & Sem:</span> <div className="text-white mt-1">Year {candidate.academic_year}, Sem {candidate.semester}</div></div>
              <div><span className="text-slate-500">Roll / Registration PIN:</span> <div className="text-white mt-1 font-bold">{candidate.roll_number}</div></div>
              <div><span className="text-slate-500">Expected Graduation:</span> <div className="text-white mt-1">{candidate.expected_graduation}</div></div>
              <div><span className="text-slate-500">CGPA / Percentage:</span> <div className="text-white mt-1">{candidate.cgpa || "N/A"}</div></div>
              <div><span className="text-slate-500">Certifications:</span> <div className="text-white mt-1">{candidate.certifications || "None listed"}</div></div>
            </div>
          </div>
        )}

        {/* TAB 6: DEVELOPER */}
        {activeTab === "Developer" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Developer Presence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Coding Timeline:</span> <div className="text-white font-bold mt-1">{candidate.coding_start_timeline}</div></div>
              <div><span className="text-slate-500">Built Projects Experience:</span> <div className="text-white mt-1">{candidate.has_built_projects}</div></div>
              <div><span className="text-slate-500">Hackathon Experience:</span> <div className="text-white mt-1">{candidate.hackathon_experience}</div></div>
              <div><span className="text-slate-500">Internship Experience:</span> <div className="text-white mt-1">{candidate.internship_experience}</div></div>
            </div>
            
            <div className="pt-2">
              <span className="text-slate-500">Developer Links:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {(candidate.developer_links || []).map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-black border border-red-950 text-red-400 hover:text-white text-xs">
                    {l.platform}: {l.url}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PROJECTS */}
        {activeTab === "Projects" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Candidate Project Portfolio</h3>
            <div className="space-y-3">
              {(candidate.projects || []).map((p, i) => (
                <div key={i} className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300">{p.techStack}</span>
                  </div>
                  <p className="text-slate-300">{p.description}</p>
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-red-400 hover:underline text-[10px] block">GitHub: {p.githubUrl}</a>}
                </div>
              ))}
              {(candidate.projects || []).length === 0 && <div className="text-slate-500">No project showcase entries added.</div>}
            </div>
          </div>
        )}

        {/* TAB 8: AVAILABILITY */}
        {activeTab === "Availability" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Time Commitment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Daily Availability:</span> <div className="text-white font-bold mt-1">{candidate.daily_availability}</div></div>
              <div><span className="text-slate-500">Can Meet Deadlines:</span> <div className="text-white mt-1">{candidate.can_meet_deadlines}</div></div>
              <div><span className="text-slate-500">Can Attend Meetings:</span> <div className="text-white mt-1">{candidate.can_attend_meetings}</div></div>
              <div><span className="text-slate-500">Communicate If Away:</span> <div className="text-white mt-1">{candidate.can_communicate_if_unavailable}</div></div>
            </div>
          </div>
        )}

        {/* TAB 9: HARDWARE */}
        {activeTab === "Hardware" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Hardware Readiness</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Laptop Status:</span> <div className="text-white font-bold mt-1">{candidate.laptop_status}</div></div>
              <div><span className="text-slate-500">Operating System:</span> <div className="text-white mt-1">{candidate.operating_system}</div></div>
              <div><span className="text-slate-500">RAM Capacity:</span> <div className="text-white mt-1">{candidate.ram_capacity}</div></div>
              <div><span className="text-slate-500">Internet Stability:</span> <div className="text-white mt-1">{candidate.internet_stability}</div></div>
            </div>
          </div>
        )}

        {/* TAB 10: TECHNICAL */}
        {activeTab === "Technical" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Technical Competency Declarations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500 text-[10px]">C LANG</div><div className="font-bold text-white mt-1">{candidate.c_level}</div></div>
              <div className="p-3 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500 text-[10px]">PYTHON</div><div className="font-bold text-white mt-1">{candidate.python_level}</div></div>
              <div className="p-3 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500 text-[10px]">JAVA</div><div className="font-bold text-white mt-1">{candidate.java_level}</div></div>
              <div className="p-3 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500 text-[10px]">HTML/WEB</div><div className="font-bold text-white mt-1">{candidate.html_level}</div></div>
              <div className="p-3 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500 text-[10px]">VIBE CODING</div><div className="font-bold text-white mt-1">{candidate.vibe_coding_level}</div></div>
            </div>
          </div>
        )}

        {/* TAB 11: MINDSET */}
        {activeTab === "Mindset" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Work Habits & Situational Mindset</h3>
            <div className="space-y-2">
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Mindset Evaluation Score</span>
                <span className="font-bold text-white">{candidate.mindset_habits_score || 0} / 20</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: ESSAYS */}
        {activeTab === "Essays" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Candidate Written Essays</h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/60 rounded-xl space-y-1"><span className="text-red-400 font-bold">Q1: Why CodeXa</span><p className="text-slate-300">{candidate.interview_q1_why_codexa}</p></div>
              <div className="p-3 bg-black/60 rounded-xl space-y-1"><span className="text-red-400 font-bold">Q2: Why Select</span><p className="text-slate-300">{candidate.interview_q2_why_select}</p></div>
              <div className="p-3 bg-black/60 rounded-xl space-y-1"><span className="text-red-400 font-bold">Q3: Expectations</span><p className="text-slate-300">{candidate.interview_q3_expectations}</p></div>
              <div className="p-3 bg-black/60 rounded-xl space-y-1"><span className="text-red-400 font-bold">Q4: Strongest Skills</span><p className="text-slate-300">{candidate.interview_q4_strongest_skills}</p></div>
              <div className="p-3 bg-black/60 rounded-xl space-y-1"><span className="text-red-400 font-bold">Q5: Weakest Area</span><p className="text-slate-300">{candidate.interview_q5_weakest_area}</p></div>
            </div>
          </div>
        )}

        {/* TAB 13: INTEGRITY */}
        {activeTab === "Integrity" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Anti-Cheat & Telemetry Flags</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500">Restricted Paste Warnings</div><div className="text-xl font-bold text-white mt-1">{candidate.copy_paste_warnings_count || 0} / 5</div></div>
              <div className="p-4 bg-black/60 rounded-xl border border-red-950"><div className="text-slate-500">Tab Switch Count</div><div className="text-xl font-bold text-white mt-1">{candidate.tab_switch_count || 0}</div></div>
            </div>
          </div>
        )}

        {/* TAB 14: SCORING */}
        {activeTab === "Scoring" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">100-Point Score Matrix Breakdown</h3>
            <div className="space-y-2">
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Genuineness & Integrity (25 Max)</span><span className="font-bold text-white">{candidate.genuineness_integrity_score || 25} / 25</span></div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Commitment & Continuity (25 Max)</span><span className="font-bold text-white">{candidate.commitment_continuity_score || 0} / 25</span></div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Mindset & Work Habits (20 Max)</span><span className="font-bold text-white">{candidate.mindset_habits_score || 0} / 20</span></div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Technical Knowledge (15 Max)</span><span className="font-bold text-white">{candidate.technical_knowledge_score || 0} / 15</span></div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Learning Potential (10 Max)</span><span className="font-bold text-white">{candidate.learning_potential_score || 0} / 10</span></div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between"><span>Interview Communication (10 Max)</span><span className="font-bold text-white">{candidate.interview_communication_score || 0} / 10</span></div>
              <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/40 flex justify-between text-sm font-black text-red-300">
                <span>TOTAL EVALUATION SCORE</span>
                <span>{candidate.total_score || 0} / 100</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 15: ADMIN NOTES */}
        {activeTab === "Admin Notes" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Internal Reviewer Notes</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Write private reviewer feedback..."
                className="w-full bg-black/80 border border-red-950 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase text-[11px]">
                APPEND NOTE
              </button>
            </form>
            <div className="space-y-2 pt-2">
              {(candidate.admin_notes || []).map((note, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-red-950 text-slate-300">{note}</div>
              ))}
              {(candidate.admin_notes || []).length === 0 && <div className="text-slate-500">No notes appended yet.</div>}
            </div>
          </div>
        )}

        {/* TAB 16: HISTORY */}
        {activeTab === "History" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Application Timeline</h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/50 rounded-xl border border-red-950 flex justify-between">
                <div><div className="font-bold text-white">Application Created</div><div className="text-[10px] text-slate-500">Initial submission</div></div>
                <div className="text-slate-400">{candidate.created_at ? new Date(candidate.created_at).toLocaleString() : "N/A"}</div>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-red-950 flex justify-between">
                <div><div className="font-bold text-white">Current Status</div><div className="text-[10px] text-slate-500">{candidate.status}</div></div>
                <div className="text-slate-400">{candidate.updated_at ? new Date(candidate.updated_at).toLocaleString() : "N/A"}</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-3xl bg-[#0b0b14] border border-blue-500/40 p-6 space-y-4 shadow-[0_0_40px_rgba(59,130,246,0.25)]">
            <div className="flex items-center justify-between border-b border-blue-950 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Schedule Candidate Interview
              </h3>
              <button type="button" onClick={() => setShowInterviewModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Interview Date *</label>
                  <input
                    type="date"
                    value={interviewForm.interview_date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={interviewForm.start_time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, start_time: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Platform *</label>
                  <select
                    value={interviewForm.platform}
                    onChange={(e) => setInterviewForm({ ...interviewForm, platform: e.target.value })}
                    className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Other">Other Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={interviewForm.duration_minutes}
                    onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: Number(e.target.value) })}
                    className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Virtual Meeting Room URL *</label>
                <input
                  type="url"
                  value={interviewForm.meeting_link}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  required
                  className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Interviewer Name</label>
                <input
                  type="text"
                  value={interviewForm.interviewer_name}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewer_name: e.target.value })}
                  className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Candidate Instructions</label>
                <textarea
                  value={interviewForm.instructions}
                  onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                  rows={2}
                  className="w-full bg-black/70 border border-blue-950 rounded-xl p-2 text-white"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interviewForm.send_email}
                  onChange={(e) => setInterviewForm({ ...interviewForm, send_email: e.target.checked })}
                  className="accent-blue-600 rounded"
                />
                <span>Send invitation email to candidate ({candidate.email})</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-blue-950">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-black/50 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {actionLoading ? "Scheduling..." : "Confirm & Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE & OFFER LETTER MODAL */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full rounded-3xl bg-[#0b0b14] border border-emerald-500/40 p-6 space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.25)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Approve & Generate Offer Letter
              </h3>
              <button type="button" onClick={() => setShowOfferModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleGenerateOfferSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Internship Role *</label>
                  <input
                    type="text"
                    value={offerForm.internship_role}
                    onChange={(e) => setOfferForm({ ...offerForm, internship_role: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Batch Code *</label>
                  <input
                    type="text"
                    value={offerForm.batch_code}
                    onChange={(e) => setOfferForm({ ...offerForm, batch_code: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Commencement Date *</label>
                  <input
                    type="date"
                    value={offerForm.joining_date}
                    onChange={(e) => setOfferForm({ ...offerForm, joining_date: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Acceptance Deadline *</label>
                  <input
                    type="date"
                    value={offerForm.acceptance_deadline}
                    onChange={(e) => setOfferForm({ ...offerForm, acceptance_deadline: e.target.value })}
                    required
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Work Mode</label>
                  <select
                    value={offerForm.work_mode}
                    onChange={(e) => setOfferForm({ ...offerForm, work_mode: e.target.value as any })}
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="In-Office">In-Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={offerForm.duration}
                    onChange={(e) => setOfferForm({ ...offerForm, duration: e.target.value })}
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Stipend & Rewards Policy</label>
                <input
                  type="text"
                  value={offerForm.stipend_status}
                  onChange={(e) => setOfferForm({ ...offerForm, stipend_status: e.target.value })}
                  className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Authorized Signatory</label>
                  <input
                    type="text"
                    value={offerForm.authorized_person}
                    onChange={(e) => setOfferForm({ ...offerForm, authorized_person: e.target.value })}
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Signatory Designation</label>
                  <input
                    type="text"
                    value={offerForm.designation}
                    onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                    className="w-full bg-black/70 border border-emerald-950 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offerForm.send_email}
                  onChange={(e) => setOfferForm({ ...offerForm, send_email: e.target.checked })}
                  className="accent-emerald-600 rounded"
                />
                <span>Send Congratulations Offer Letter email to candidate ({candidate.email})</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl bg-black/50 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {actionLoading ? "Generating..." : "Issue Offer Letter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
