"use client";

import React from "react";
import { Zap, ShieldCheck, AlertTriangle } from "lucide-react";

export default function AdminSkillsPage() {
  const sampleMatrix = [
    { claimed: "Expert", quizScore: "5/5 (100%)", consistency: "Consistent", status: "Verified", note: "High technical accuracy" },
    { claimed: "Average", quizScore: "3/4 (75%)", consistency: "Consistent", status: "Verified", note: "Aligned with self-assessment" },
    { claimed: "Expert", quizScore: "0/5 (0%)", consistency: "Needs Review", status: "Flagged", note: "Inflated skill claim detected" },
    { claimed: "Learner", quizScore: "2/2 (100%)", consistency: "Consistent", status: "Verified", note: "Strong learning baseline" },
    { claimed: "I Don't Know", quizScore: "Skipped", consistency: "Skipped", status: "Honest Baseline", note: "Zero penalty applied" },
  ];

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          AUTHENTICITY TELEMETRY
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Skill Claim & Consistency Matrix
        </h1>
      </div>

      <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
        <p className="text-xs text-slate-300 leading-relaxed">
          The skill authenticity algorithm evaluates candidate honesty by comparing self-claimed technical familiarity against verified adaptive quiz performance.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-red-950 text-slate-500 text-[10px]">
                <th className="py-2.5 px-3">CLAIMED LEVEL</th>
                <th className="py-2.5 px-3">ADAPTIVE QUIZ</th>
                <th className="py-2.5 px-3">CONSISTENCY</th>
                <th className="py-2.5 px-3">SYSTEM SIGNAL</th>
                <th className="py-2.5 px-3">REVIEWER NOTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/60">
              {sampleMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-red-950/15">
                  <td className="py-3 px-3 font-bold text-white">{row.claimed}</td>
                  <td className="py-3 px-3 text-slate-300">{row.quizScore}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        row.consistency === "Consistent"
                          ? "bg-emerald-950 text-emerald-400"
                          : row.consistency === "Needs Review"
                          ? "bg-amber-950 text-amber-400"
                          : "bg-black text-slate-400"
                      }`}
                    >
                      {row.consistency}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-red-400">{row.status}</td>
                  <td className="py-3 px-3 text-slate-400">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
