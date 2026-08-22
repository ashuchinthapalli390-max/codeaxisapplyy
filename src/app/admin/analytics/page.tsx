"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, CheckCircle2, Flame, ShieldAlert } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      });
  }, []);

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          COHORT RECRUITMENT METRICS
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Analytics & Funnel Insights
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="red-glass rounded-2xl p-4 border border-red-500/30 space-y-1">
          <span className="text-[10px] text-slate-500">APPLICATIONS CONVERSION</span>
          <div className="text-2xl font-black text-white">{data?.total || 0} Total</div>
          <div className="text-[10px] text-emerald-400">100% Funnel Completion</div>
        </div>

        <div className="red-glass rounded-2xl p-4 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-slate-500">ACCEPTANCE RATE</span>
          <div className="text-2xl font-black text-emerald-400">
            {data?.total ? Math.round((data.selected / data.total) * 100) : 0}%
          </div>
          <div className="text-[10px] text-slate-400">{data?.selected || 0} of {data?.total || 0} Selected</div>
        </div>

        <div className="red-glass rounded-2xl p-4 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-slate-500">STRONG COMMITMENT</span>
          <div className="text-2xl font-black text-rose-400">{data?.commitment?.strong || 0}</div>
          <div className="text-[10px] text-slate-400">3-4+ hours daily availability</div>
        </div>

        <div className="red-glass rounded-2xl p-4 border border-red-500/30 space-y-1">
          <span className="text-[10px] text-slate-500">SCORE BENCHMARK</span>
          <div className="text-2xl font-black text-white">{data?.avgScore || 0}<span className="text-xs text-slate-500">/100</span></div>
          <div className="text-[10px] text-slate-400">Max achieved: {data?.maxScore || 0}</div>
        </div>
      </div>
    </div>
  );
}
