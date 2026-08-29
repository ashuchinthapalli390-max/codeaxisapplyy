"use client";

import React from "react";
import Image from "next/image";
import { Network, ShieldCheck, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { applicationRounds } from "@/config/card-assets";

export default function AdminRoundsPage() {
  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          SCREENING ARCHITECTURE & CANONICAL ASSETS
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Application Rounds Configuration (8 Rounds)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {applicationRounds.map((r) => (
          <div
            key={r.round}
            className="red-glass rounded-2xl overflow-hidden border border-red-500/30 flex flex-col justify-between group"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
              <Image
                src={r.image}
                alt={r.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute top-2 left-2 flex items-center justify-between w-[calc(100%-16px)]">
                <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-black/80 border border-red-500/40">
                  {r.roundCode}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {r.adaptive ? "Adaptive Active" : "Active"}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-red-400 font-bold uppercase block">{r.subtitle}</span>
                <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors mt-0.5">
                  {r.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{r.fields}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
