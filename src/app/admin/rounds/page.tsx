"use client";

import React from "react";
import { Network, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function AdminRoundsPage() {
  const rounds = [
    { num: "01", name: "Personal Information", status: "Active", fields: "Full name, DOB, Email, Phone, WhatsApp, City, State, Country, Hobbies (non-scoring)" },
    { num: "02", name: "Academic Verification", status: "Active", fields: "College name, University, Course, Branch, Year, Semester, Roll Number, Graduation Year" },
    { num: "03", name: "Developer Profile", status: "Active", fields: "Coding start timeline, Project experience, Profile links, Dynamic Project Cards" },
    { num: "04", name: "Availability & Hardware", status: "Active", fields: "Daily hours, Days Mon-Sun, Timing slots, Laptop, OS, RAM, Internet, Device test" },
    { num: "05", name: "Technical Awareness", status: "Adaptive Active", fields: "5 Categories: C, Python, Java, HTML, Vibe Coding (0 to 5 adaptive Qs per level)" },
    { num: "06", name: "Mindset & Habits", status: "Active", fields: "10 Situational Scenario MCQs assessing ownership, teamwork, and ethics" },
    { num: "07", name: "Thought-Process Interview", status: "Active", fields: "10 Essay Questions with live character counter (min 20 / max 1200 chars)" },
    { num: "08", name: "Review & Commitment", status: "Active", fields: "Round summary, Direct EDIT jump links, Signed policy declarations" },
  ];

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          SCREENING ARCHITECTURE
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Application Rounds Configuration
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rounds.map((r) => (
          <div key={r.num} className="red-glass rounded-2xl p-5 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                <span className="text-red-400 mr-2">ROUND {r.num}:</span>
                {r.name}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                {r.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.fields}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
