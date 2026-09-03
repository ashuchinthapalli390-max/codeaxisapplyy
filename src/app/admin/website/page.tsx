"use client";

import React, { useState, useEffect } from "react";
import { WebsiteSettings, InternshipRound } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button3D from "@/components/ui/Button3D";
import Select from "@/components/ui/Select";
import {
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Globe,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";

export default function AdminWebsitePage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [round, setRound] = useState<InternshipRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Only fetch if form is not dirty
    if (isDirty) return;

    fetch("/api/admin/website", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings(json.data);
          if (json.data.round) {
            setRound(json.data.round);
          }
        }
      })
      .catch((err) => {
        console.error("Website fetch error:", err);
        setSaveError("Failed to load CMS settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Prevent accidental page close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateSettings = (updates: Partial<WebsiteSettings>) => {
    if (!settings) return;
    setIsDirty(true);
    setSettings((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    playButtonClick();

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/admin/website", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, round }),
      });

      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setSaveSuccess(true);
        setIsDirty(false);
        if (json.data) {
          setSettings(json.data);
          if (json.data.round) setRound(json.data.round);
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        playWarningTone();
        setSaveError(json.error || "Failed to save website configuration.");
      }
    } catch {
      playWarningTone();
      setSaveError("Network error: Could not reach server to save settings.");
    } finally {
      setIsSaving(false);
    }
  };


  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 text-red-500 animate-spin" />
        <span>Loading CodeXa Content Management System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            CONTENT & RECRUITMENT TIMING CONTROLS
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Landing Page & Application Timers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Changes here update the single source of truth in Supabase and sync live to public countdowns.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Unsaved Changes</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        
        {/* =========================================================================
            SECTION 1: APPLICATION WINDOW TIMERS & DATES (SINGLE SOURCE OF TRUTH)
           ========================================================================= */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Internship Application Timing & Countdown
              </h2>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 font-bold">
              Timezone: Asia/Kolkata (+05:30)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch Code / Identifier *"
              value={settings.batchCode || round?.batch_code || "2026-SEP"}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                updateSettings({ batchCode: val });
                if (round) {
                  setIsDirty(true);
                  setRound({ ...round, batch_code: val });
                }
              }}
              placeholder="e.g. 2026-SEP or 2026-OCT"
              required
            />

            <Select
              label="Application Window Status *"
              value={settings.applicationStatus || "AUTO"}
              onChange={(e) => {
                const val = e.target.value as any;
                updateSettings({ applicationStatus: val });
                if (round) {
                  setIsDirty(true);
                  setRound({ ...round, status: val });
                }
              }}
              options={[
                { value: "AUTO", label: "AUTO (Calculated dynamically from Open/Close timestamps)" },
                { value: "OPEN", label: "FORCED OPEN (Apply button enabled)" },
                { value: "OPENING_SOON", label: "FORCED OPENING_SOON (Countdown active)" },
                { value: "CLOSED", label: "FORCED CLOSED (Applications paused)" },
              ]}
              required
            />
          </div>

          {/* Opening Date & Time */}
          <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-3">
            <div className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Application Opening Date & Time</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Opening Date *"
                type="date"
                value={settings.openDate || "2026-09-01"}
                onChange={(e) => updateSettings({ openDate: e.target.value })}
                required
              />
              <Input
                label="Opening Time (24-Hour HH:MM) *"
                type="time"
                value={settings.openTime || "09:00"}
                onChange={(e) => updateSettings({ openTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Closing Date & Time */}
          <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-3">
            <div className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Application Closing Date & Time (Countdown Target)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Closing Date *"
                type="date"
                value={settings.closeDate || "2026-09-07"}
                onChange={(e) => updateSettings({ closeDate: e.target.value })}
                required
              />
              <Input
                label="Closing Time (24-Hour HH:MM) *"
                type="time"
                value={settings.closeTime || "23:59"}
                onChange={(e) => updateSettings({ closeTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Next Opening Date & Time */}
          <div className="p-4 rounded-2xl bg-black/40 border border-red-950/60 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next Cohort Opening Window (Shown When Closed)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Next Opening Date (Optional)"
                type="date"
                value={settings.nextOpenDate || ""}
                onChange={(e) => updateSettings({ nextOpenDate: e.target.value })}
                optional
              />
              <Input
                label="Next Opening Time (Optional)"
                type="time"
                value={settings.nextOpenTime || "09:00"}
                onChange={(e) => updateSettings({ nextOpenTime: e.target.value })}
                optional
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: HERO SECTION HEADLINES & AGENCY LINKS
           ========================================================================= */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
          <div className="flex items-center gap-2 border-b border-red-950 pb-3">
            <Globe className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Hero Section Copy & Agency Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hero Main Heading *"
              value={settings.heroHeading}
              onChange={(e) => updateSettings({ heroHeading: e.target.value })}
              required
            />
            <Input
              label="Hero Subtitle *"
              value={settings.heroSubtitle}
              onChange={(e) => updateSettings({ heroSubtitle: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Hero Description Copy *"
            value={settings.heroDescription}
            onChange={(e) => updateSettings({ heroDescription: e.target.value })}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Agency Official URL *"
              value={settings.agencyUrl}
              onChange={(e) => updateSettings({ agencyUrl: e.target.value })}
              required
            />
            <Input
              label="Founder Contact Email *"
              value={settings.founderEmail}
              onChange={(e) => updateSettings({ founderEmail: e.target.value })}
              required
            />
            <Input
              label="WhatsApp Support Number *"
              value={settings.whatsappSupportNumber}
              onChange={(e) => updateSettings({ whatsappSupportNumber: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-white">Settings Saved & Revalidated</span>
              <span>The database has been updated and public countdown caches have been refreshed.</span>
            </div>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-red-950/70 border border-red-500 rounded-2xl text-xs text-red-300 font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="block text-white">Save Failed</span>
              <span>{saveError}</span>
            </div>
          </div>
        )}

        {/* Submit Save Button */}
        <div className="flex items-center justify-end pt-2">
          <Button3D
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="py-4 px-10 text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.7)]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "SAVING CONFIGURATION..." : "SAVE CMS CONFIGURATION"}</span>
          </Button3D>
        </div>

      </form>
    </div>
  );
}
