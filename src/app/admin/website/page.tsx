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
  Mic,
  Volume2,
  Play,
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

  // Audio Preview State
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [isRegeneratingVoice, setIsRegeneratingVoice] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  useEffect(() => {
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

  const handlePreviewVoice = async () => {
    playButtonClick();
    setIsPreviewingVoice(true);
    setVoiceNotice(null);

    try {
      const res = await fetch("/api/voice-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide: "application-rules" }),
      });

      if (!res.ok) {
        throw new Error("Voice API returned " + res.status);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = settings?.voiceGuide?.defaultVolume ?? 0.9;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsPreviewingVoice(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setIsPreviewingVoice(false);
        setVoiceNotice("Audio playback failed.");
      };
      await audio.play();
      setVoiceNotice("Playing AI Telugu voice preview...");
    } catch (err: any) {
      setIsPreviewingVoice(false);
      setVoiceNotice("Voice preview error: " + (err.message || "Failed to generate audio."));
    }
  };

  const handleRegenerateVoice = async () => {
    playButtonClick();
    setIsRegeneratingVoice(true);
    setVoiceNotice(null);

    try {
      const res = await fetch("/api/voice-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide: "application-rules", forceRegenerate: true }),
      });

      const json = await res.json();
      if (json.success || res.ok) {
        playSuccessSound();
        setVoiceNotice("AI Voice regenerated successfully with latest Telugu script!");
        setTimeout(() => setVoiceNotice(null), 5000);
      } else {
        setVoiceNotice("Regeneration notice: " + (json.error || "Completed."));
      }
    } catch (err: any) {
      setVoiceNotice("Regeneration error: " + err.message);
    } finally {
      setIsRegeneratingVoice(false);
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
      <div className="border-b border-red-950 pb-4">
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
              value={settings.batchCode || round?.batch_code || "2026-AUG"}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setSettings({ ...settings, batchCode: val });
                if (round) setRound({ ...round, batch_code: val });
              }}
              placeholder="e.g. 2026-AUG or 2026-SEP"
              required
            />

            <Select
              label="Application Window Status *"
              value={settings.applicationStatus || "AUTO"}
              onChange={(e) => {
                const val = e.target.value as any;
                setSettings({ ...settings, applicationStatus: val });
                if (round) setRound({ ...round, status: val });
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
                value={settings.openDate || "2026-08-20"}
                onChange={(e) => setSettings({ ...settings, openDate: e.target.value })}
                required
              />
              <Input
                label="Opening Time (24-Hour HH:MM) *"
                type="time"
                value={settings.openTime || "09:00"}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
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
                onChange={(e) => setSettings({ ...settings, closeDate: e.target.value })}
                required
              />
              <Input
                label="Closing Time (24-Hour HH:MM) *"
                type="time"
                value={settings.closeTime || "23:59"}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
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
                onChange={(e) => setSettings({ ...settings, nextOpenDate: e.target.value })}
                optional
              />
              <Input
                label="Next Opening Time (Optional)"
                type="time"
                value={settings.nextOpenTime || "09:00"}
                onChange={(e) => setSettings({ ...settings, nextOpenTime: e.target.value })}
                optional
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: AI TELUGU FEMALE VOICE GUIDE CMS
           ========================================================================= */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-red-950 pb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. AI-Powered Telugu Female Voice Guide
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voiceGuide?.enabled ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    voiceGuide: {
                      ...(settings.voiceGuide || {
                        title: "CodeXa Voice Guide",
                        teluguScript: "",
                        provider: "google",
                        voiceName: "te-IN-Chirp3-HD-Aoede",
                        speechSpeed: 0.95,
                        scrollTriggerPx: 350,
                        showOncePerSession: false,
                        showTranscript: true,
                        defaultVolume: 0.9,
                      }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded accent-red-600"
              />
              <span className="text-slate-300 font-bold">Voice Guide Enabled</span>
            </label>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Official Telugu Narration Script *"
              value={settings.voiceGuide?.teluguScript || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  voiceGuide: {
                    ...(settings.voiceGuide || {
                      enabled: true,
                      title: "CodeXa Voice Guide",
                      provider: "google",
                      voiceName: "te-IN-Chirp3-HD-Aoede",
                      speechSpeed: 0.95,
                      scrollTriggerPx: 350,
                      showOncePerSession: false,
                      showTranscript: true,
                      defaultVolume: 0.9,
                    }),
                    teluguScript: e.target.value,
                  },
                })
              }
              rows={6}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="TTS Provider"
                value={settings.voiceGuide?.provider || "google"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    voiceGuide: {
                      ...settings.voiceGuide!,
                      provider: e.target.value as any,
                    },
                  })
                }
                options={[
                  { value: "google", label: "Google Cloud Chirp 3 HD (Telugu Female)" },
                  { value: "elevenlabs", label: "ElevenLabs v3 (Telugu Multilingual)" },
                  { value: "azure", label: "Azure Speech (te-IN-ShrutiNeural)" },
                  { value: "browser", label: "Browser SpeechSynthesis (Fallback)" },
                ]}
              />

              <Input
                label="Voice Identifier / Model"
                value={settings.voiceGuide?.voiceName || "te-IN-Chirp3-HD-Aoede"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    voiceGuide: {
                      ...settings.voiceGuide!,
                      voiceName: e.target.value,
                    },
                  })
                }
              />

              <Input
                label="Scroll Trigger (Pixels)"
                type="number"
                value={String(settings.voiceGuide?.scrollTriggerPx || 350)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    voiceGuide: {
                      ...settings.voiceGuide!,
                      scrollTriggerPx: Number(e.target.value) || 350,
                    },
                  })
                }
              />
            </div>

            {/* Voice Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePreviewVoice}
                disabled={isPreviewingVoice}
                className="px-4 py-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500/40 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-red-400" />
                <span>{isPreviewingVoice ? "Playing Audio..." : "Preview AI Voice"}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateVoice}
                disabled={isRegeneratingVoice}
                className="px-4 py-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500/40 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>{isRegeneratingVoice ? "Regenerating..." : "Regenerate AI Voice"}</span>
              </button>
            </div>

            {voiceNotice && (
              <div className="p-3 bg-black/80 border border-red-500/40 rounded-xl text-xs text-red-300 font-bold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-red-400 shrink-0" />
                <span>{voiceNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: HERO SECTION HEADLINES & AGENCY LINKS
           ========================================================================= */}
        <div className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
          <div className="flex items-center gap-2 border-b border-red-950 pb-3">
            <Globe className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Hero Section Copy & Agency Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hero Main Heading *"
              value={settings.heroHeading}
              onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
              required
            />
            <Input
              label="Hero Subtitle *"
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Hero Description Copy *"
            value={settings.heroDescription}
            onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
            rows={3}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Input
              label="Agency Official URL *"
              value={settings.agencyUrl}
              onChange={(e) => setSettings({ ...settings, agencyUrl: e.target.value })}
              required
            />
            <Input
              label="Founder Contact Email *"
              value={settings.founderEmail}
              onChange={(e) => setSettings({ ...settings, founderEmail: e.target.value })}
              required
            />
            <Input
              label="WhatsApp Support Number *"
              value={settings.whatsappSupportNumber}
              onChange={(e) => setSettings({ ...settings, whatsappSupportNumber: e.target.value })}
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
