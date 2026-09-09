"use client";

import React, { useState, useEffect, useRef } from "react";
import { TeamMember } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Button3D from "@/components/ui/Button3D";
import {
  X,
  Crop,
  RotateCcw,
  Save,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";

const ROLE_OPTIONS = [
  { value: "Founder", label: "Founder" },
  { value: "Co-Founder", label: "Co-Founder" },
  { value: "CEO", label: "Chief Executive Officer (CEO)" },
  { value: "CTO", label: "Chief Technology Officer (CTO)" },
  { value: "COO", label: "Chief Operating Officer (COO)" },
  { value: "Technical Lead", label: "Technical Lead" },
  { value: "Mentor", label: "Mentor" },
  { value: "Lead Developer", label: "Lead Developer" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Designer", label: "UI/UX Designer" },
  { value: "Core Team", label: "Core Team Member" },
];

const PRESET_SKILLS = [
  "Next.js",
  "React 19",
  "TypeScript",
  "Python",
  "AI Prompting",
  "Claude Code",
  "PostgreSQL",
  "Supabase",
  "Full-Stack",
  "Architecture",
  "Cybersecurity",
  "Tailwind CSS",
  "Serverless",
  "Git & CI/CD",
  "Operations",
  "Mentorship",
];

const PHOTO_PRESETS = [
  { name: "Founder CH. Arshad", url: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg" },
  { name: "Co-Founder B. Sanjay", url: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg" },
  { name: "CEO Kishore", url: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg" },
  { name: "CEO G. Bhanu Prasad", url: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg" },
  { name: "Hero Cyber", url: "/assets/image-assests/hero.jpeg" },
  { name: "CodeXa Logo", url: "/logo.jpeg" },
];

interface LeadershipEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  onSave: (updated: TeamMember) => Promise<boolean>;
  onOpenCropper: () => void;
  onPreview: (member: TeamMember) => void;
  triggerElement?: HTMLElement | null;
}

export default function LeadershipEditorModal({
  isOpen,
  onClose,
  member: initialMember,
  onSave,
  onOpenCropper,
  onPreview,
  triggerElement,
}: LeadershipEditorModalProps) {
  const [formData, setFormData] = useState<TeamMember>(initialMember);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "bio" | "contact" | "roles" | "skills" | "visibility">("basic");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgressMsg, setSaveProgressMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const initialMemberJsonRef = useRef<string>(JSON.stringify(initialMember));

  // Sync state when initial member changes
  useEffect(() => {
    setFormData(initialMember);
    initialMemberJsonRef.current = JSON.stringify(initialMember);
    setIsDirty(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMember]);

  // Track unsaved changes
  useEffect(() => {
    const currentJson = JSON.stringify(formData);
    setIsDirty(currentJson !== initialMemberJsonRef.current);
  }, [formData]);

  // Lock body scroll & focus initial field
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Initial focus to Full Name field
    const timer = setTimeout(() => {
      fullNameInputRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
      if (triggerElement && typeof triggerElement.focus === "function") {
        triggerElement.focus();
      }
    };
  }, [isOpen, triggerElement]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        attemptClose();
        return;
      }

      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty, isSaving]);

  if (!isOpen) return null;

  const attemptClose = () => {
    if (isSaving) return;
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes in this leadership profile. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      attemptClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formData.name?.trim() || !formData.designation?.trim()) {
      setErrorMessage("Full Name and Primary Role/Designation are required.");
      playWarningTone();
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSaveProgressMsg("Validating & saving to database...");
    playButtonClick();

    try {
      const ok = await onSave(formData);
      if (ok) {
        setIsDirty(false);
        setSaveProgressMsg(null);
        setSuccessMessage("Leadership profile saved successfully!");
        playSuccessSound();
      } else {
        setSaveProgressMsg(null);
      }
    } catch (err: any) {
      setSaveProgressMsg(null);
      setErrorMessage(err.message || "Failed to persist profile changes. Your data is preserved.");
      playWarningTone();
    } finally {
      setIsSaving(false);
    }
  };

  const addResponsibility = () => {
    if (!newResponsibility.trim()) return;
    playButtonClick();
    const current = formData.responsibilities || formData.roles || [];
    const updated = [...current, newResponsibility.trim()];
    setFormData({
      ...formData,
      responsibilities: updated,
      roles: updated,
    });
    setNewResponsibility("");
  };

  const removeResponsibility = (idx: number) => {
    playButtonClick();
    const current = formData.responsibilities || formData.roles || [];
    const updated = current.filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      responsibilities: updated,
      roles: updated,
    });
  };

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const current = formData.skills || formData.focus_areas || [];
    if (current.includes(trimmed)) return;
    playButtonClick();
    const updated = [...current, trimmed];
    setFormData({
      ...formData,
      skills: updated,
      focus_areas: updated,
    });
    setNewSkill("");
  };

  const removeSkill = (idx: number) => {
    playButtonClick();
    const current = formData.skills || formData.focus_areas || [];
    const updated = current.filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      skills: updated,
      focus_areas: updated,
    });
  };

  const resetCrop = () => {
    playButtonClick();
    setFormData({
      ...formData,
      profileObjectPositionX: 50,
      profileObjectPositionY: 50,
      profileScale: 1,
      crop_x: 50,
      crop_y: 50,
      crop_scale: 1,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" />

      {/* Main Dialog Box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leadership-editor-title"
        style={{
          width: "min(1100px, calc(100vw - 32px))",
          maxHeight: "min(900px, calc(100dvh - 32px))",
          height: "min(900px, calc(100dvh - 32px))",
        }}
        className="relative flex flex-col w-full bg-[#080810] border border-red-500/40 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(239,68,68,0.2)] text-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 z-30" />

        {/* STICKY MODAL HEADER */}
        <header className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-red-950/80 bg-[#080810]/95 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <h2
              id="leadership-editor-title"
              className="text-sm sm:text-base font-black uppercase font-mono tracking-wider text-white truncate"
            >
              Edit Profile: {formData.name || "New Leadership Member"}
            </h2>
            {isDirty && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50 shrink-0">
                <AlertTriangle className="w-3 h-3" />
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {isDirty && (
              <span className="sm:hidden text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-600">
                Edited
              </span>
            )}
            <button
              type="button"
              onClick={attemptClose}
              disabled={isSaving}
              aria-label="Close modal"
              className="p-2 min-w-[44px] min-h-[44px] rounded-xl border border-red-950 text-slate-400 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center disabled:opacity-40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* FORM CONTAINER (Single Scroll Region Owner) */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* SINGLE SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Media / Photo Studio (Sticky on large screens) */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-0">
                <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-4 text-center">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block font-mono">
                      Photo & Framing
                    </span>
                    <button
                      type="button"
                      onClick={resetCrop}
                      className="text-[9px] text-slate-400 hover:text-red-400 font-mono transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset Crop
                    </button>
                  </div>

                  {/* Main Preview Box */}
                  <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-3xl bg-black border-2 border-red-500/50 p-1 shadow-[0_0_25px_rgba(239,68,68,0.25)] overflow-hidden relative">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt={formData.name || "Leader Photo"}
                        style={{
                          objectPosition: `${formData.profileObjectPositionX ?? 50}% ${formData.profileObjectPositionY ?? 50}%`,
                          transform: `scale(${formData.profileScale ?? 1})`,
                        }}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-red-950/60 flex items-center justify-center text-3xl font-black text-white">
                        {formData.name ? formData.name.slice(0, 2).toUpperCase() : "CX"}
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        onOpenCropper();
                      }}
                      className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-red-600/30 hover:bg-red-600 border border-red-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>UPLOAD / CROP PHOTO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setFormData({
                          ...formData,
                          photoUrl: "/logo.jpeg",
                          profileStoragePath: "",
                        });
                      }}
                      className="w-full min-h-[38px] py-1.5 px-3 rounded-xl border border-red-950 hover:border-red-500 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      RESET TO DEFAULT AVATAR
                    </button>
                  </div>

                  {/* Positioning Sliders */}
                  <div className="space-y-3 pt-3 border-t border-red-950/80 text-left text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Center X ({formData.profileObjectPositionX ?? 50}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.profileObjectPositionX ?? 50}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profileObjectPositionX: parseInt(e.target.value, 10),
                            crop_x: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer min-h-[30px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Center Y ({formData.profileObjectPositionY ?? 50}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.profileObjectPositionY ?? 50}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profileObjectPositionY: parseInt(e.target.value, 10),
                            crop_y: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer min-h-[30px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Zoom Scale ({(formData.profileScale ?? 1).toFixed(2)}x)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="1.5"
                        step="0.05"
                        value={formData.profileScale ?? 1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            profileScale: parseFloat(e.target.value),
                            crop_scale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer min-h-[30px]"
                      />
                    </div>
                  </div>

                  {/* Preset Assets */}
                  <div className="space-y-2 pt-3 border-t border-red-950/80 text-left">
                    <span className="text-[10px] text-slate-500 block font-mono">Preset Assets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PHOTO_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            playButtonClick();
                            setFormData({ ...formData, photoUrl: preset.url });
                          }}
                          className="px-2 py-1 rounded-lg bg-black border border-red-950 text-[10px] text-slate-300 hover:text-white hover:border-red-500 cursor-pointer font-mono"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Tabbed Form Panels */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Horizontal Scrollable Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-red-950/80 no-scrollbar">
                  {[
                    { id: "basic", label: "Basic Info" },
                    { id: "bio", label: "Bio & Quotes" },
                    { id: "contact", label: "Contacts & Socials" },
                    { id: "roles", label: "Roles & Tasks" },
                    { id: "skills", label: "Focus & Skills" },
                    { id: "visibility", label: "Visibility & Order" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setActiveTab(tab.id as any);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center ${
                        activeTab === tab.id
                          ? "bg-red-950 border border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
                          : "text-slate-400 hover:text-white hover:bg-red-950/20 border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: BASIC INFO */}
                {activeTab === "basic" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Full Legal Name *
                        </label>
                        <input
                          ref={fullNameInputRef}
                          type="text"
                          required
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value, fullName: e.target.value })}
                          placeholder="e.g. CH. Arshad"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={formData.displayName || ""}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          placeholder="e.g. Arshad"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Primary Role / Designation *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.designation || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              designation: e.target.value,
                              primaryDesignation: e.target.value,
                            })
                          }
                          placeholder="e.g. Founder & Technical Architect"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Secondary Designation
                        </label>
                        <input
                          type="text"
                          value={formData.secondaryDesignation || ""}
                          onChange={(e) => setFormData({ ...formData, secondaryDesignation: e.target.value })}
                          placeholder="e.g. Head of Engineering"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Role Category
                        </label>
                        <select
                          value={formData.roleType || "Core Team"}
                          onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white focus:outline-none focus:border-red-500 font-mono cursor-pointer"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Department
                        </label>
                        <input
                          type="text"
                          value={formData.department || ""}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="e.g. Core Engineering & Systems"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Internal Codename
                        </label>
                        <input
                          type="text"
                          value={formData.codename || formData.code_name || ""}
                          onChange={(e) => setFormData({ ...formData, codename: e.target.value, code_name: e.target.value })}
                          placeholder="e.g. ARCH-01"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          URL Identifier / Slug
                        </label>
                        <input
                          type="text"
                          value={formData.slug || ""}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="e.g. arshad"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      {/* Tagline spans full width */}
                      <div className="col-span-full space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Tagline / Hero Motto
                        </label>
                        <input
                          type="text"
                          value={formData.tagline || ""}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                          placeholder="e.g. Architecting high-scale distributed systems and developer tooling."
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: BIO & QUOTES */}
                {activeTab === "bio" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-300 block">
                        Signature Leadership Quote
                      </label>
                      <input
                        type="text"
                        value={formData.quote || ""}
                        onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                        placeholder="e.g. Code is poetry executed at the speed of light."
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-300 block">
                        Short Summary / Bio (Card Display)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.shortBio || formData.bio || ""}
                        onChange={(e) => setFormData({ ...formData, shortBio: e.target.value, bio: e.target.value })}
                        placeholder="Concise 2-3 sentence overview visible on leadership cards..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono leading-relaxed resize-y"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-300 block">
                        Full Expanded Biography (Modal View)
                      </label>
                      <textarea
                        rows={5}
                        value={formData.fullBio || ""}
                        onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
                        placeholder="Comprehensive career trajectory, agency vision, leadership philosophy..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono leading-relaxed resize-y"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold text-slate-300 block">
                        Professional Background & Highlights
                      </label>
                      <textarea
                        rows={3}
                        value={formData.professionalSummary || ""}
                        onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })}
                        placeholder="Key technical milestones, frameworks engineered, publications..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono leading-relaxed resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: CONTACTS & SOCIALS */}
                {activeTab === "contact" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Official Contact Email
                        </label>
                        <input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="arshad@codeaxisapply.xyz"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Secondary Email
                        </label>
                        <input
                          type="email"
                          value={formData.secondaryEmail || ""}
                          onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
                          placeholder="personal@gmail.com"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Direct Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          WhatsApp URL / Number
                        </label>
                        <input
                          type="text"
                          value={formData.whatsapp_url || formData.whatsapp || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              whatsapp: e.target.value,
                              whatsapp_url: e.target.value,
                            })
                          }
                          placeholder="https://wa.me/919876543210"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Location / Base
                        </label>
                        <input
                          type="text"
                          value={formData.location || ""}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Hyderabad, India"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Preferred Contact Channel
                        </label>
                        <input
                          type="text"
                          value={formData.preferredContact || ""}
                          onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                          placeholder="Email or LinkedIn"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          value={formData.githubUrl || ""}
                          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={formData.linkedinUrl || ""}
                          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Portfolio / External Website
                        </label>
                        <input
                          type="url"
                          value={formData.external_url || formData.websiteUrl || formData.portfolioUrl || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              websiteUrl: e.target.value,
                              portfolioUrl: e.target.value,
                              external_url: e.target.value,
                            })
                          }
                          placeholder="https://ashu.dev"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold text-slate-300 block">
                          Twitter / X Profile URL
                        </label>
                        <input
                          type="url"
                          value={formData.twitterUrl || ""}
                          onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                          placeholder="https://x.com/..."
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ROLES & RESPONSIBILITIES */}
                {activeTab === "roles" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newResponsibility}
                        onChange={(e) => setNewResponsibility(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addResponsibility())}
                        placeholder="Add key leadership duty or initiative..."
                        className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={addResponsibility}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600 border border-red-500/50 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Role</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.responsibilities || formData.roles || []).map((resp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-red-950/60 text-xs font-mono text-slate-200"
                        >
                          <span className="break-words mr-2">● {resp}</span>
                          <button
                            type="button"
                            onClick={() => removeResponsibility(idx)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: SKILLS & FOCUS AREAS */}
                {activeTab === "skills" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                        placeholder="Add domain or technical expertise..."
                        className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill(newSkill)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600 border border-red-500/50 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill</span>
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 block font-mono">Click to Add Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SKILLS.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-2.5 py-1 rounded-lg bg-black/50 border border-red-950 text-[10px] text-slate-300 hover:border-red-500 hover:text-white cursor-pointer font-mono"
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Tags */}
                    <div className="pt-2 border-t border-red-950/60">
                      <div className="flex flex-wrap gap-2">
                        {(formData.skills || formData.focus_areas || []).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-950/50 border border-red-500/40 text-xs font-mono text-red-200"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(idx)}
                              className="text-red-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: VISIBILITY & ORDER */}
                {activeTab === "visibility" && (
                  <div className="space-y-5 animate-in fade-in duration-150 font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 block">
                          Profile Status
                        </label>
                        <select
                          value={formData.status || (formData.isArchived ? "archived" : formData.isVisible === false ? "hidden" : "active")}
                          onChange={(e) => {
                            const val = e.target.value as "active" | "hidden" | "archived";
                            setFormData({
                              ...formData,
                              status: val,
                              isVisible: val === "active",
                              isArchived: val === "archived",
                            });
                          }}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="active" className="bg-slate-900 text-emerald-300">Active / Published</option>
                          <option value="hidden" className="bg-slate-900 text-amber-300">Hidden from Public</option>
                          <option value="archived" className="bg-slate-900 text-slate-400">Archived</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300 block">
                          Display Order (Numeric Sort)
                        </label>
                        <input
                          type="number"
                          value={String(formData.sort_order ?? formData.displayOrder ?? 1)}
                          onChange={(e) => {
                            const num = parseInt(e.target.value, 10) || 1;
                            setFormData({
                              ...formData,
                              sort_order: num,
                              displayOrder: num,
                            });
                          }}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-black/60 border border-red-950/80 text-sm text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-red-950/80 space-y-3">
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                        Public Display Permissions
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={formData.showPhone !== false}
                            onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                            className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                          />
                          <span>Show Direct Call Button</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={formData.showWhatsapp !== false}
                            onChange={(e) => setFormData({ ...formData, showWhatsapp: e.target.checked })}
                            className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                          />
                          <span>Show WhatsApp Button</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={formData.showEmail !== false}
                            onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                            className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                          />
                          <span>Show Email Button</span>
                        </label>

                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={formData.showSocials !== false}
                            onChange={(e) => setFormData({ ...formData, showSocials: e.target.checked })}
                            className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                          />
                          <span>Show Socials (GitHub/LinkedIn)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* STICKY MODAL FOOTER */}
          <footer className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-red-950/80 bg-[#080810]/95 flex flex-wrap items-center justify-between gap-3 z-20">
            {/* Status / Error Message */}
            <div className="flex-1 min-w-[200px] text-xs font-mono">
              {errorMessage && (
                <div className="flex items-center gap-1.5 text-red-400">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="truncate">{errorMessage}</span>
                </div>
              )}
              {saveProgressMsg && (
                <div className="flex items-center gap-1.5 text-amber-300">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>{saveProgressMsg}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              {!errorMessage && !saveProgressMsg && !successMessage && (
                <span className="text-slate-500 text-[11px]">
                  {isDirty ? "● Unsaved changes pending" : "All changes up to date"}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={attemptClose}
                disabled={isSaving}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-red-950 text-slate-400 hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors disabled:opacity-40"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={() => {
                  playButtonClick();
                  onPreview(formData);
                }}
                disabled={isSaving}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-black/60 border border-red-950 hover:border-red-500 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PREVIEW CARD</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>SAVE CHANGES</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>

      </div>
    </div>
  );
}
