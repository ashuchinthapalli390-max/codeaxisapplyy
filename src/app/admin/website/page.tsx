"use client";

import React, { useState, useEffect } from "react";
import { WebsiteSettings, FaqItem } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button3D from "@/components/ui/Button3D";
import Select from "@/components/ui/Select";
import { FileText, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

export default function AdminWebsitePage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/website")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      })
      .catch((err) => console.error("Website fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    playButtonClick();

    try {
      const res = await fetch("/api/admin/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert("Failed to save website settings.");
    }
  };

  if (loading || !settings) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading website CMS...</div>;
  }

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          CONTENT MANAGEMENT SYSTEM
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Landing Page & Date Controls
        </h1>
      </div>

      <form onSubmit={handleSave} className="red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
        
        {/* Application Dates & States */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-950 pb-2">
            1. Application Window Status & Timers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Application Window Status"
              value={settings.applicationStatus}
              onChange={(e) => setSettings({ ...settings, applicationStatus: e.target.value as any })}
              options={[
                { value: "OPEN", label: "OPEN (Apply enabled)" },
                { value: "OPENING_SOON", label: "OPENING_SOON (Countdown active)" },
                { value: "CLOSED", label: "CLOSED (Applications paused)" },
              ]}
              required
            />
            <Input
              label="Opening Date"
              type="date"
              value={settings.openDate}
              onChange={(e) => setSettings({ ...settings, openDate: e.target.value })}
              required
            />
            <Input
              label="Closing Date"
              type="date"
              value={settings.closeDate}
              onChange={(e) => setSettings({ ...settings, closeDate: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Hero Section Copy */}
        <div className="space-y-4 pt-4 border-t border-red-950">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-950 pb-2">
            2. Hero Section Headlines & Copy
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hero Main Heading"
              value={settings.heroHeading}
              onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
              required
            />
            <Input
              label="Hero Subtitle"
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              required
            />
          </div>
          <Textarea
            label="Hero Description Text"
            value={settings.heroDescription}
            onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
            required
          />
        </div>

        {/* Agency Links */}
        <div className="space-y-4 pt-4 border-t border-red-950">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-950 pb-2">
            3. Agency External Redirection & Contacts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Agency Official URL"
              value={settings.agencyUrl}
              onChange={(e) => setSettings({ ...settings, agencyUrl: e.target.value })}
              required
            />
            <Input
              label="Founder Email Contact"
              value={settings.founderEmail}
              onChange={(e) => setSettings({ ...settings, founderEmail: e.target.value })}
              required
            />
            <Input
              label="WhatsApp Support Number"
              value={settings.whatsappSupportNumber}
              onChange={(e) => setSettings({ ...settings, whatsappSupportNumber: e.target.value })}
              required
            />
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Website CMS configuration updated successfully!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button3D type="submit" variant="primary" className="py-3 px-8 text-xs font-bold">
            <Save className="w-4 h-4" />
            <span>SAVE CMS SETTINGS</span>
          </Button3D>
        </div>

      </form>
    </div>
  );
}
