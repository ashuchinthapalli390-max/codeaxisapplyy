"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Upload, Sparkles, CheckCircle2, Copy, ExternalLink, Filter, Layers, Film } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";
import Button3D from "@/components/ui/Button3D";

interface AssetRecord {
  id: string;
  name: string;
  category: "HERO" | "AGENCY" | "CODING" | "VIBE" | "LEADERSHIP" | "APPLICATION" | "SUCCESS" | "FOOTER" | "BRAND";
  path: string;
  type: "GIF Animation" | "JPEG Image" | "JPG Image";
  usedIn: string;
  dimensions: string;
}

export default function AdminAssetsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inventory: AssetRecord[] = [
    {
      id: "ast-logo",
      name: "CodeXa Official Brand Logo",
      category: "BRAND",
      path: "/assets/image-assests/logo.jpeg",
      type: "JPEG Image",
      usedIn: "Navbar, Favicon, PDF Header, Metadata",
      dimensions: "Square (1:1)",
    },
    {
      id: "ast-hero-fg",
      name: "Hero Foreground Tech Visual",
      category: "HERO",
      path: "/assets/image-assests/hero.jpeg",
      type: "JPEG Image",
      usedIn: "Landing Page Hero Visual, Default Fallback",
      dimensions: "Landscape (16:9)",
    },
    {
      id: "ast-hero-bg",
      name: "Hero Red Web Matrix",
      category: "HERO",
      path: "/assets/gif-assests/3d614f522fb7bcc40915d9a9b7a8ea17.gif",
      type: "GIF Animation",
      usedIn: "Landing Hero Background Motion Layer",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-agency-bg",
      name: "Agency Cyber Grid",
      category: "AGENCY",
      path: "/assets/gif-assests/6017829e0b3e2aaa5fa990adb0889fb0.gif",
      type: "GIF Animation",
      usedIn: "Agency Spotlight & Mission Atmosphere",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-coding-bg",
      name: "Coding Stream Motion",
      category: "CODING",
      path: "/assets/gif-assests/6de84346589395b4f74367e1ef002fa6.gif",
      type: "GIF Animation",
      usedIn: "Interactive VS Code Simulation Section",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-vibe-bg",
      name: "AI Prompt Stream Visual",
      category: "VIBE",
      path: "/assets/gif-assests/992e39771c0279718c88caa6e1663611.gif",
      type: "GIF Animation",
      usedIn: "Vibe Coding & AI Prompting Section",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-app-bg",
      name: "Application Screening Ambient",
      category: "APPLICATION",
      path: "/assets/gif-assests/d24f62aa1d4ab988fe9d65ed3ec9bc0f.gif",
      type: "GIF Animation",
      usedIn: "Application 8-Round Wizard Background",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-success-bg",
      name: "Success Confirmed Red Flash",
      category: "SUCCESS",
      path: "/assets/gif-assests/d74ed5d64d9c1d573a60020ec3c9a8c1.gif",
      type: "GIF Animation",
      usedIn: "Submission Success Screen Animation",
      dimensions: "Dynamic Flash",
    },
    {
      id: "ast-footer-bg",
      name: "Footer Dark Horizon",
      category: "FOOTER",
      path: "/assets/gif-assests/d8bf146f4bc2b4e3a28cb8c71e81cc28.gif",
      type: "GIF Animation",
      usedIn: "Footer Web Pattern & Brand Outro",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-gif-f4",
      name: "Tech Portal Pulse",
      category: "AGENCY",
      path: "/assets/gif-assests/f4e08e34471243e1027743a3cf01d4eb.gif",
      type: "GIF Animation",
      usedIn: "About Agency Narrative Card",
      dimensions: "Wide Animation",
    },
    {
      id: "ast-img-128",
      name: "Founder Ashu Profile Asset",
      category: "LEADERSHIP",
      path: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
      type: "JPG Image",
      usedIn: "Founder Profile Card & Admin CMS",
      dimensions: "Portrait / Square",
    },
    {
      id: "ast-img-229",
      name: "Co-Founder Deepak Profile Asset",
      category: "LEADERSHIP",
      path: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
      type: "JPG Image",
      usedIn: "Co-Founder Profile Card & Admin CMS",
      dimensions: "Portrait / Square",
    },
    {
      id: "ast-img-230",
      name: "CEO Kishore Profile Asset",
      category: "LEADERSHIP",
      path: "/assets/image-assests/2306fc1d8f6ea04d1ddd4ebfafd003f2.jpg",
      type: "JPG Image",
      usedIn: "CEO Profile Card & Admin CMS",
      dimensions: "Portrait / Square",
    },
    {
      id: "ast-img-245",
      name: "Curriculum Tech Banner",
      category: "CODING",
      path: "/assets/image-assests/2455caf42d9db24ff7c635a591f45ccb.jpg",
      type: "JPG Image",
      usedIn: "Internship Week 1-2 Card",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-4d7",
      name: "AI Systems Matrix",
      category: "VIBE",
      path: "/assets/image-assests/4d7b4119aad96174515b68d7f460a986.jpg",
      type: "JPG Image",
      usedIn: "Claude Code & Agentic Card",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-4e5",
      name: "Full-Stack Development Card",
      category: "CODING",
      path: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
      type: "JPG Image",
      usedIn: "Internship Week 3-4 Card",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-799",
      name: "Database Architecture",
      category: "CODING",
      path: "/assets/image-assests/799b3d022c7ccb22066d08673b0ec685.jpg",
      type: "JPG Image",
      usedIn: "Internship Week 5-6 Card",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-9f1",
      name: "Production Deployment",
      category: "CODING",
      path: "/assets/image-assests/9f15564ad2221f371987883d61241f4b.jpg",
      type: "JPG Image",
      usedIn: "Internship Week 7-8 Card",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-c75",
      name: "Developer Workspace Asset",
      category: "APPLICATION",
      path: "/assets/image-assests/c75cd2195cdd6bd78b98b1888ddbf739.jpg",
      type: "JPG Image",
      usedIn: "Round 3: Developer Presence",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-cd6",
      name: "Hardware Specs Asset",
      category: "APPLICATION",
      path: "/assets/image-assests/cd6b99faa3b32d7b80a2012050eb76e0.jpg",
      type: "JPG Image",
      usedIn: "Round 4: Availability & Hardware",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-ceb",
      name: "Mindset Philosophy Asset",
      category: "APPLICATION",
      path: "/assets/image-assests/ceb0a9e38c4590f8fb6f411f0f6aa2a5.jpg",
      type: "JPG Image",
      usedIn: "Round 6: Mindset Evaluation",
      dimensions: "Landscape",
    },
    {
      id: "ast-img-ed1",
      name: "Integrity & Commitment Banner",
      category: "APPLICATION",
      path: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
      type: "JPG Image",
      usedIn: "Round 8: Review & Commitment",
      dimensions: "Landscape",
    },
  ];

  const categories = ["ALL", "HERO", "AGENCY", "CODING", "VIBE", "LEADERSHIP", "APPLICATION", "SUCCESS", "FOOTER", "BRAND"];

  const filteredAssets = selectedFilter === "ALL"
    ? inventory
    : inventory.filter((a) => a.category === selectedFilter);

  const handleCopyPath = (id: string, path: string) => {
    playButtonClick();
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    playSuccessSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            RECURSIVE ASSET VAULT & USAGE MAP
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Asset Inventory ({inventory.length} Media Files)
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              playButtonClick();
              setSelectedFilter(cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === cat
                ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-black/60 border border-red-950 text-slate-400 hover:text-white hover:border-red-500/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="red-glass rounded-2xl p-4 border border-red-500/30 space-y-3 flex flex-col justify-between group hover:border-red-500/60 transition-all"
          >
            <div className="space-y-3">
              {/* Asset Preview Frame */}
              <div className="w-full h-40 bg-black/80 rounded-xl border border-red-950/80 overflow-hidden relative flex items-center justify-center p-1">
                <img
                  src={asset.path}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-black/80 text-red-300 font-bold border border-red-500/40 backdrop-blur-md uppercase">
                    {asset.category}
                  </span>
                  {asset.type.includes("GIF") && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-500/40 backdrop-blur-md flex items-center gap-0.5">
                      <Film className="w-2.5 h-2.5" />
                      GIF
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white leading-tight">{asset.name}</h4>
                <div className="text-[10px] text-slate-400">
                  Used In: <span className="text-red-300 font-semibold">{asset.usedIn}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {asset.type} &bull; {asset.dimensions}
                </div>
              </div>
            </div>

            {/* Path & Action Buttons */}
            <div className="pt-2 border-t border-red-950/60 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 truncate max-w-[170px]" title={asset.path}>
                {asset.path}
              </span>
              <button
                type="button"
                onClick={() => handleCopyPath(asset.id, asset.path)}
                className="px-2.5 py-1 rounded bg-black border border-red-950 hover:border-red-500 text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all flex-shrink-0"
              >
                {copiedId === asset.id ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPY PATH</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
