"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicationData } from "@/types/application";
import { generateAdminPDF, generateApplicantPDF } from "@/lib/pdf";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Database,
  Download,
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
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  User,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refId = (params?.id as string) || "";

  const [candidate, setCandidate] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [noteInput, setNoteInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCandidate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${encodeURIComponent(refId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCandidate(json.data);
      }
    } catch (err) {
      console.error("Error fetching candidate:", err);
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    playButtonClick();

    try {
      const res = await fetch(`/api/admin/applications/${refId}`, {
        method: "POST",
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
    "Personal",
    "Education",
    "Developer",
    "Projects",
    "Availability",
    "Hardware",
    "Technical",
    "Mindset",
    "Interview",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
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
          <button
            type="button"
            onClick={() => handleStatusChange("Selected")}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SELECT</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange("Shortlisted")}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SHORTLIST</span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusChange("Not Selected")}
            disabled={actionLoading}
            className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>REJECT</span>
          </button>

          <button
            type="button"
            onClick={() => generateAdminPDF(candidate)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ADMIN PDF</span>
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
          <div className="text-base font-black text-red-400 mt-1 uppercase">{candidate.status || "Submitted"}</div>
          <div className="text-[9px] text-slate-500">Batch 2026</div>
        </div>
      </div>

      {/* 14 Navigation Tabs */}
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
          </div>
        )}

        {/* TAB 2: PERSONAL */}
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

        {/* TAB 3: EDUCATION */}
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

        {/* TAB 4: DEVELOPER */}
        {activeTab === "Developer" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Developer Presence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Coding Timeline:</span> <div className="text-white mt-1 font-bold">{candidate.coding_start_timeline}</div></div>
              <div><span className="text-slate-500">Projects Built:</span> <div className="text-white mt-1">{candidate.has_built_projects}</div></div>
            </div>

            <div className="pt-3 space-y-2">
              <span className="text-slate-500">Profile Links:</span>
              <div className="space-y-1.5">
                {(candidate.developer_links || []).map((l, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/60 border border-red-950 flex items-center justify-between">
                    <span className="font-bold text-red-400">{l.platform}</span>
                    <a href={l.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white underline">
                      {l.url}
                    </a>
                  </div>
                ))}
                {(candidate.developer_links || []).length === 0 && (
                  <div className="text-slate-500">No profile links provided.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROJECTS */}
        {activeTab === "Projects" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Submitted Project Entries</h3>
            <div className="space-y-3">
              {(candidate.projects || []).map((p, idx) => (
                <div key={p.id || idx} className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold">{p.techStack}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{p.description}</p>
                  {p.whatYouLearned && <div className="text-[11px] text-slate-400 italic">Learned: {p.whatYouLearned}</div>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-red-400 text-[11px] hover:underline inline-block">GitHub Repository &rarr;</a>}
                </div>
              ))}
              {(candidate.projects || []).length === 0 && <div className="text-slate-500">No projects attached.</div>}
            </div>
          </div>
        )}

        {/* TAB 6: AVAILABILITY */}
        {activeTab === "Availability" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Availability & Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Daily Availability:</span> <div className="text-white font-bold mt-1">{candidate.daily_availability}</div></div>
              <div><span className="text-slate-500">Available Days:</span> <div className="text-white mt-1">{(candidate.available_days || []).join(", ")}</div></div>
              <div><span className="text-slate-500">Preferred Timings:</span> <div className="text-white mt-1">{(candidate.preferred_timing || []).join(", ")}</div></div>
              <div><span className="text-slate-500">Meeting Attendance:</span> <div className="text-white mt-1">{candidate.can_attend_meetings}</div></div>
              <div><span className="text-slate-500">Deadline Adherence:</span> <div className="text-white mt-1">{candidate.can_meet_deadlines}</div></div>
              <div><span className="text-slate-500">Communication Commitment:</span> <div className="text-white mt-1">{candidate.can_communicate_if_unavailable}</div></div>
            </div>
          </div>
        )}

        {/* TAB 7: HARDWARE */}
        {activeTab === "Hardware" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Hardware Readiness</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-slate-500">Device Status:</span> <div className="text-white font-bold mt-1">{candidate.laptop_status}</div></div>
              <div><span className="text-slate-500">Operating System:</span> <div className="text-white mt-1">{candidate.operating_system}</div></div>
              <div><span className="text-slate-500">RAM Capacity:</span> <div className="text-white mt-1">{candidate.ram_capacity}</div></div>
              <div><span className="text-slate-500">Internet Stability:</span> <div className="text-white mt-1">{candidate.internet_stability}</div></div>
              <div><span className="text-slate-500">Can Run Dev Tools:</span> <div className="text-white mt-1">{candidate.can_run_dev_tools}</div></div>
              <div><span className="text-slate-500">Processor / Model:</span> <div className="text-white mt-1">{candidate.processor || "N/A"} ({candidate.laptop_model || "N/A"})</div></div>
            </div>
          </div>
        )}

        {/* TAB 8: TECHNICAL */}
        {activeTab === "Technical" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Technical Awareness & Quiz</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-1">
                <div className="font-bold text-white flex justify-between">
                  <span>C Language</span>
                  <span className="text-red-400">{candidate.c_level}</span>
                </div>
                <div className="text-slate-400 text-[11px]">Answers: {JSON.stringify(candidate.c_answers || {})}</div>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-1">
                <div className="font-bold text-white flex justify-between">
                  <span>Python</span>
                  <span className="text-red-400">{candidate.python_level}</span>
                </div>
                <div className="text-slate-400 text-[11px]">Answers: {JSON.stringify(candidate.python_answers || {})}</div>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-1">
                <div className="font-bold text-white flex justify-between">
                  <span>Java</span>
                  <span className="text-red-400">{candidate.java_level}</span>
                </div>
                <div className="text-slate-400 text-[11px]">Answers: {JSON.stringify(candidate.java_answers || {})}</div>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-1">
                <div className="font-bold text-white flex justify-between">
                  <span>HTML & Web</span>
                  <span className="text-red-400">{candidate.html_level}</span>
                </div>
                <div className="text-slate-400 text-[11px]">Answers: {JSON.stringify(candidate.html_answers || {})}</div>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-red-950 space-y-1 sm:col-span-2">
                <div className="font-bold text-white flex justify-between">
                  <span>Vibe Coding & AI</span>
                  <span className="text-rose-400">{candidate.vibe_coding_level}</span>
                </div>
                <div className="text-slate-400 text-[11px]">Answers: {JSON.stringify(candidate.vibe_coding_answers || {})}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: MINDSET */}
        {activeTab === "Mindset" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Mindset Scenario Choices</h3>
            <div className="space-y-2">
              {Object.entries(candidate.mindset_answers || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-black/50 rounded-xl border border-red-950 flex items-center justify-between">
                  <span className="font-bold text-slate-300 uppercase">{key}</span>
                  <span className="px-3 py-1 bg-red-950 text-red-300 font-bold rounded-lg border border-red-900">
                    Option {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: INTERVIEW */}
        {activeTab === "Interview" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Thought-Process Written Essays</h3>
            <div className="space-y-4">
              {[
                { label: "1. Why join CodeXa?", text: candidate.interview_q1_why_codexa },
                { label: "2. Why should we select you?", text: candidate.interview_q2_why_select },
                { label: "3. Internship expectations", text: candidate.interview_q3_expectations },
                { label: "4. Strongest skills", text: candidate.interview_q4_strongest_skills },
                { label: "5. Weakest area", text: candidate.interview_q5_weakest_area },
                { label: "6. Project description", text: candidate.interview_q6_describe_project },
                { label: "7. Difficult problem solved", text: candidate.interview_q7_difficult_problem },
                { label: "8. AI coding workflow", text: candidate.interview_q8_ai_coding_usage },
                { label: "9. College balance strategy", text: candidate.interview_q9_college_balance },
                { label: "10. Future goal", text: candidate.interview_q10_future_goal },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-1.5">
                  <div className="font-bold text-red-400">{item.label}</div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{item.text || "No response"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: INTEGRITY */}
        {activeTab === "Integrity" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Anti-Cheat & Telemetry Log</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/60 rounded-2xl border border-red-950">
                <span className="text-slate-500 text-[10px]">COPY/PASTE WARNINGS:</span>
                <div className={`text-xl font-bold mt-1 ${candidate.copy_paste_warnings_count > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {candidate.copy_paste_warnings_count || 0} / 3
                </div>
              </div>
              <div className="p-4 bg-black/60 rounded-2xl border border-red-950">
                <span className="text-slate-500 text-[10px]">TAB SWITCH OCCURRENCES:</span>
                <div className="text-xl font-bold mt-1 text-white">{candidate.tab_switch_count || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: SCORING */}
        {activeTab === "Scoring" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">100-Point Score Matrix Breakdown</h3>
            <div className="space-y-2">
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Genuineness & Integrity (25 Max)</span>
                <span className="font-bold text-white">{candidate.genuineness_integrity_score || 25} / 25</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Commitment & Continuity (25 Max)</span>
                <span className="font-bold text-white">{candidate.commitment_continuity_score || 0} / 25</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Mindset & Work Habits (20 Max)</span>
                <span className="font-bold text-white">{candidate.mindset_habits_score || 0} / 20</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Technical Knowledge (15 Max)</span>
                <span className="font-bold text-white">{candidate.technical_knowledge_score || 0} / 15</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Learning Potential (10 Max)</span>
                <span className="font-bold text-white">{candidate.learning_potential_score || 0} / 10</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl flex justify-between">
                <span>Interview & Written Quality (10 Max)</span>
                <span className="font-bold text-white">{candidate.interview_communication_score || 0} / 10</span>
              </div>
              <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/40 flex justify-between text-sm font-black text-red-300">
                <span>TOTAL EVALUATION SCORE</span>
                <span>{candidate.total_score || 0} / 100</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 13: ADMIN NOTES */}
        {activeTab === "Admin Notes" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Internal Reviewer Notes</h3>
            
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Write private reviewer feedback or interview notes..."
                className="w-full bg-black/80 border border-red-950 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase text-[11px]"
              >
                APPEND NOTE
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {(candidate.admin_notes || []).map((note, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-red-950 text-slate-300">
                  {note}
                </div>
              ))}
              {(candidate.admin_notes || []).length === 0 && <div className="text-slate-500">No notes appended yet.</div>}
            </div>
          </div>
        )}

        {/* TAB 14: HISTORY */}
        {activeTab === "History" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase border-b border-red-950 pb-2">Application Timeline</h3>
            <div className="space-y-3">
              <div className="p-3 bg-black/50 rounded-xl border border-red-950 flex justify-between">
                <div>
                  <div className="font-bold text-white">Application Created</div>
                  <div className="text-[10px] text-slate-500">Initial submission to recruitment pipeline</div>
                </div>
                <div className="text-slate-400">{candidate.created_at ? new Date(candidate.created_at).toLocaleString() : "N/A"}</div>
              </div>
              <div className="p-3 bg-black/50 rounded-xl border border-red-950 flex justify-between">
                <div>
                  <div className="font-bold text-white">Last Status Update</div>
                  <div className="text-[10px] text-slate-500">Current state: {candidate.status}</div>
                </div>
                <div className="text-slate-400">{candidate.updated_at ? new Date(candidate.updated_at).toLocaleString() : "N/A"}</div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
