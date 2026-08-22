"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApplicationData } from "@/types/application";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  HelpCircle,
  Layers,
  Radio,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    total: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
    avgScore: number;
    maxScore: number;
    bands: { exceptional: number; strong: number; good: number; needsReview: number };
    commitment: { strong: number; moderate: number; needsReview: number };
  } | null>(null);

  const [recentApps, setRecentApps] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/applications?limit=6").then((r) => r.json()),
    ])
      .then(([analyticsRes, appsRes]) => {
        if (analyticsRes.success) setStats(analyticsRes.data);
        if (appsRes.success) setRecentApps(appsRes.data);
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-5">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            CODEXA RECRUITMENT NETWORK
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Admin Command Center
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/applications"
            onClick={playButtonClick}
            className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>VIEW ALL CANDIDATES</span>
          </Link>

          <Link
            href="/admin/exports"
            onClick={playButtonClick}
            className="px-4 py-2 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>EXPORT CSV</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Apps */}
        <div className="red-glass p-4 rounded-2xl border border-red-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>TOTAL APPS</span>
            <Users className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.total || 0}</div>
          <div className="text-[9px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>Active Pipeline</span>
          </div>
        </div>

        {/* Under Review */}
        <div className="red-glass p-4 rounded-2xl border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>UNDER REVIEW</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats?.underReview || 0}</div>
          <div className="text-[9px] text-slate-500">Awaiting Decision</div>
        </div>

        {/* Shortlisted */}
        <div className="red-glass p-4 rounded-2xl border border-rose-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>SHORTLISTED</span>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats?.shortlisted || 0}</div>
          <div className="text-[9px] text-rose-300/70">High Potential</div>
        </div>

        {/* Selected */}
        <div className="red-glass p-4 rounded-2xl border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>SELECTED</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats?.selected || 0}</div>
          <div className="text-[9px] text-emerald-400">Onboarded</div>
        </div>

        {/* Avg Score */}
        <div className="red-glass p-4 rounded-2xl border border-red-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>AVG SCORE</span>
            <BarChart3 className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats?.avgScore || 0}<span className="text-xs text-slate-500">/100</span></div>
          <div className="text-[9px] text-slate-500">Cohort Benchmark</div>
        </div>

        {/* Top Score */}
        <div className="red-glass p-4 rounded-2xl border border-red-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>TOP SCORE</span>
            <Flame className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-400">{stats?.maxScore || 0}<span className="text-xs text-slate-500">/100</span></div>
          <div className="text-[9px] text-slate-500">Highest Achieved</div>
        </div>

      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Bands Distribution */}
        <div className="lg:col-span-6 red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>Score Distribution Bands</span>
            </h3>
            <span className="text-[10px] text-slate-500">100-PT MODEL</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Exceptional Profile (85–100 pts)</span>
                <span className="font-bold text-emerald-400">{stats?.bands?.exceptional || 0}</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${stats?.total ? ((stats.bands.exceptional / stats.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Strong Candidate (75–84 pts)</span>
                <span className="font-bold text-rose-400">{stats?.bands?.strong || 0}</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${stats?.total ? ((stats.bands.strong / stats.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Good Potential (65–74 pts)</span>
                <span className="font-bold text-amber-400">{stats?.bands?.good || 0}</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${stats?.total ? ((stats.bands.good / stats.total) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Needs Human Review (&lt;65 pts)</span>
                <span className="font-bold text-slate-400">{stats?.bands?.needsReview || 0}</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${stats?.total ? ((stats.bands.needsReview / stats.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Commitment Signals */}
        <div className="lg:col-span-6 red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Commitment & Continuity Signal</span>
            </h3>
            <span className="text-[10px] text-slate-500">HOURS + CONSISTENCY</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-1">
              <div className="text-2xl font-black text-emerald-400">{stats?.commitment?.strong || 0}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">STRONG</div>
              <div className="text-[9px] text-slate-500">3-4+ hrs / day</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/40 space-y-1">
              <div className="text-2xl font-black text-amber-400">{stats?.commitment?.moderate || 0}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">MODERATE</div>
              <div className="text-[9px] text-slate-500">2-3 hrs / day</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/40 space-y-1">
              <div className="text-2xl font-black text-red-400">{stats?.commitment?.needsReview || 0}</div>
              <div className="text-[10px] text-slate-300 font-bold uppercase">REVIEW</div>
              <div className="text-[9px] text-slate-500">&lt;2 hrs / day</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-red-950 text-[10px] text-slate-400 leading-relaxed">
            Commitment signal measures student daily availability, attendance commitment, communication pledge, and college balance planning.
          </div>
        </div>

      </div>

      {/* Recent Applications Table */}
      <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-red-950 pb-3">
          <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-400" />
            <span>Recent Candidate Submissions</span>
          </h3>
          <Link
            href="/admin/applications"
            onClick={playButtonClick}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-red-950 text-slate-500 text-[10px]">
                <th className="py-2.5 px-3">REFERENCE</th>
                <th className="py-2.5 px-3">CANDIDATE NAME</th>
                <th className="py-2.5 px-3">COLLEGE / COURSE</th>
                <th className="py-2.5 px-3">SCORE</th>
                <th className="py-2.5 px-3">COMMITMENT</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/60">
              {recentApps.map((app) => (
                <tr key={app.reference_id} className="hover:bg-red-950/15 transition-colors">
                  <td className="py-3 px-3 font-bold text-red-400">{app.reference_id}</td>
                  <td className="py-3 px-3 font-bold text-white">{app.full_name}</td>
                  <td className="py-3 px-3 text-slate-300">{app.college_name} ({app.course})</td>
                  <td className="py-3 px-3 font-bold text-white">{app.total_score || 0}/100</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                        app.commitment_signal === "Strong"
                          ? "bg-emerald-950 text-emerald-400"
                          : app.commitment_signal === "Moderate"
                          ? "bg-amber-950 text-amber-400"
                          : "bg-red-950 text-red-400"
                      }`}
                    >
                      {app.commitment_signal || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] px-2.5 py-0.5 rounded font-bold ${
                        app.status === "Selected"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : app.status === "Shortlisted"
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-black text-slate-300 border border-red-950"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/applications/${app.reference_id}`}
                      onClick={playButtonClick}
                      className="px-3 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      <span>INSPECT</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
