"use client";

import React, { useState, useEffect } from "react";
import { TeamMember } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Button3D from "@/components/ui/Button3D";
import Modal from "@/components/ui/Modal";
import ImageCropperModal from "@/components/admin/ImageCropperModal";
import LeadershipDetailModal from "@/components/team/LeadershipDetailModal";
import LeadershipEditorModal from "@/components/admin/LeadershipEditorModal";
import {
  Users,
  Crown,
  Edit2,
  Plus,
  Trash2,
  Mail,
  MessageCircle,
  Phone,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Crop,
  RotateCcw,
  Copy,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  Archive,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldAlert,
  Globe,
  Briefcase,
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

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "HIDDEN" | "ARCHIVED">("ALL");

  // Editing state
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "bio" | "contact" | "roles" | "skills" | "visibility">("basic");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [previewMember, setPreviewMember] = useState<TeamMember | null>(null);

  // Form helpers
  const [newResponsibility, setNewResponsibility] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team?archived=true", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        setTeam(json.data);
      }
    } catch (err) {
      console.error("Fetch team error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const [activeTriggerEl, setActiveTriggerEl] = useState<HTMLElement | null>(null);

  const handleOpenEdit = (member: TeamMember, e?: React.MouseEvent) => {
    playButtonClick();
    if (e && e.currentTarget) {
      setActiveTriggerEl(e.currentTarget as HTMLElement);
    }
    setEditingMember({
      ...member,
      responsibilities: member.responsibilities ? [...member.responsibilities] : (member.roles ? [...member.roles] : []),
      skills: member.skills ? [...member.skills] : (member.focus_areas ? [...member.focus_areas] : []),
      otherLinks: member.otherLinks ? [...member.otherLinks] : [],
      profileObjectPositionX: member.profileObjectPositionX ?? member.crop_x ?? 50,
      profileObjectPositionY: member.profileObjectPositionY ?? member.crop_y ?? 50,
      profileScale: member.profileScale ?? member.crop_scale ?? 1,
    });
    setIsEditModalOpen(true);
  };

  const handleAddNewMember = (e?: React.MouseEvent) => {
    playButtonClick();
    if (e && e.currentTarget) {
      setActiveTriggerEl(e.currentTarget as HTMLElement);
    }
    const newId = `member-${Date.now()}`;
    const newRecord: TeamMember = {
      id: newId,
      name: "",
      fullName: "",
      displayName: "",
      designation: "",
      primaryDesignation: "",
      secondaryDesignation: "",
      roleType: "Core Team",
      department: "Engineering",
      tagline: "",
      bio: "",
      shortBio: "",
      fullBio: "",
      professionalSummary: "",
      quote: "",
      photoUrl: "/assets/image-assests/hero.jpeg",
      profileObjectPositionX: 50,
      profileObjectPositionY: 50,
      profileScale: 1,
      crop_x: 50,
      crop_y: 50,
      crop_scale: 1,
      responsibilities: ["Technical Development", "Team Collaboration"],
      roles: ["Technical Development", "Team Collaboration"],
      skills: ["Full-Stack", "Next.js", "AI Prompting"],
      focus_areas: ["Full-Stack", "Next.js", "AI Prompting"],
      email: "",
      secondaryEmail: "",
      phone: "",
      whatsapp: "",
      whatsapp_url: "",
      location: "India",
      preferredContact: "WhatsApp",
      githubUrl: "",
      linkedinUrl: "",
      instagramUrl: "",
      portfolioUrl: "",
      websiteUrl: "",
      external_url: "",
      youtubeUrl: "",
      twitterUrl: "",
      discordUsername: "",
      otherLinks: [],
      showPhone: true,
      showEmail: true,
      showWhatsapp: true,
      showSocials: true,
      showContact: true,
      isFeatured: false,
      isVisible: true,
      isArchived: false,
      status: "active",
      displayOrder: team.length + 1,
      sort_order: team.length + 1,
    };
    setEditingMember(newRecord);
    setIsEditModalOpen(true);
  };

  const handleSaveMemberAsync = async (updatedMember: TeamMember): Promise<boolean> => {
    const res = await fetch("/api/admin/team", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMember),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Server rejected profile update.");
    }

    const savedMember: TeamMember = json.data || updatedMember;

    // Immediately update local admin state
    setTeam((prev) => {
      const idx = prev.findIndex((m) => m.id === savedMember.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedMember;
        return copy;
      }
      return [...prev, savedMember];
    });

    setEditingMember(savedMember);
    setTimeout(() => {
      setIsEditModalOpen(false);
      fetchTeam();
    }, 800);

    return true;
  };

  const handleCroppedPhotoSave = async (blob: Blob, previewUrl: string) => {
    if (!editingMember) return;

    // Immediately update local preview in form
    setEditingMember((prev) => (prev ? { ...prev, photoUrl: previewUrl } : null));

    // Upload blob to server endpoint
    const formData = new FormData();
    formData.append("file", blob, `photo-${Date.now()}.webp`);
    formData.append("positionX", String(editingMember.profileObjectPositionX ?? 50));
    formData.append("positionY", String(editingMember.profileObjectPositionY ?? 50));
    formData.append("scale", String(editingMember.profileScale ?? 1));

    try {
      const res = await fetch(`/api/admin/team/${editingMember.id}/photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingMember((prev) =>
          prev
            ? {
                ...prev,
                photoUrl: json.url,
                image_path: json.storagePath,
                profileStoragePath: json.storagePath,
              }
            : null
        );
        setTeam((prev) =>
          prev.map((m) =>
            m.id === editingMember.id
              ? { ...m, photoUrl: json.url, image_path: json.storagePath, profileStoragePath: json.storagePath }
              : m
          )
        );
        playSuccessSound();
      }
    } catch (err) {
      console.warn("Upload background sync error:", err);
    }
  };

  const handleToggleVisibility = async (member: TeamMember) => {
    playButtonClick();
    const updated = { ...member, isVisible: !member.isVisible };
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        playSuccessSound();
        fetchTeam();
      }
    } catch {
      alert("Failed to toggle visibility.");
    }
  };

  const handleDuplicate = async (id: string) => {
    playButtonClick();
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      if (res.ok) {
        playSuccessSound();
        fetchTeam();
      }
    } catch {
      alert("Failed to duplicate profile.");
    }
  };

  const handleArchiveDelete = async (id: string, hardDelete: boolean = false) => {
    const promptMsg = hardDelete
      ? "Permanently delete this leadership profile? This cannot be undone."
      : "Archive this leadership profile? It will be hidden from the website but can be restored anytime.";
    if (!confirm(promptMsg)) return;

    playButtonClick();
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, hardDelete }),
      });
      if (res.ok) {
        playSuccessSound();
        setIsEditModalOpen(false);
        fetchTeam();
      }
    } catch {
      alert("Failed to delete/archive member.");
    }
  };

  const handleRestore = async (id: string) => {
    playButtonClick();
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id }),
      });
      if (res.ok) {
        playSuccessSound();
        fetchTeam();
      }
    } catch {
      alert("Failed to restore member.");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= team.length) return;

    playButtonClick();
    const reordered = [...team];
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    const orderedIds = reordered.map((m) => m.id);
    setTeam(reordered);

    try {
      await fetch("/api/admin/team", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
      playSuccessSound();
    } catch {
      fetchTeam();
    }
  };

  // Dynamic responsibilities helpers
  const handleAddResponsibility = () => {
    if (!newResponsibility.trim() || !editingMember) return;
    playButtonClick();
    setEditingMember({
      ...editingMember,
      responsibilities: [...(editingMember.responsibilities || []), newResponsibility.trim()],
    });
    setNewResponsibility("");
  };

  const handleRemoveResponsibility = (idx: number) => {
    if (!editingMember) return;
    playButtonClick();
    const updated = [...(editingMember.responsibilities || [])];
    updated.splice(idx, 1);
    setEditingMember({ ...editingMember, responsibilities: updated });
  };

  // Dynamic skills helpers
  const handleAddSkill = (skillText?: string) => {
    const skillToAdd = skillText || newSkill;
    if (!skillToAdd.trim() || !editingMember) return;
    if ((editingMember.skills || []).includes(skillToAdd.trim())) return;
    playButtonClick();
    setEditingMember({
      ...editingMember,
      skills: [...(editingMember.skills || []), skillToAdd.trim()],
    });
    if (!skillText) setNewSkill("");
  };

  const handleRemoveSkill = (skillText: string) => {
    if (!editingMember) return;
    playButtonClick();
    setEditingMember({
      ...editingMember,
      skills: (editingMember.skills || []).filter((s) => s !== skillText),
    });
  };

  // Filtered members list
  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.roleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.skills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "ACTIVE") return !member.isArchived && member.isVisible !== false;
    if (activeFilter === "HIDDEN") return !member.isArchived && member.isVisible === false;
    if (activeFilter === "ARCHIVED") return member.isArchived === true;
    return activeFilter === "ALL" ? !member.isArchived : true;
  });

  return (
    <div className="space-y-6 text-left font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-yellow-400" />
            CODEXA LEADERSHIP & TEAM DIRECTORY
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Team & Leadership Management ({team.length} Profiles)
          </h1>
        </div>

        <button
          type="button"
          onClick={(e) => handleAddNewMember(e)}
          className="btn-red-sweep px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD TEAM MEMBER</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/60 rounded-2xl border border-red-950">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, skill..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070712] border border-red-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "ACTIVE", "HIDDEN", "ARCHIVED"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                playButtonClick();
                setActiveFilter(filter);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-red-950 border border-red-500/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  : "border border-red-950/60 text-slate-500 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-red-500 mb-2" />
          <span>LOADING LEADERSHIP DIRECTORY...</span>
        </div>
      ) : filteredTeam.length === 0 ? (
        <div className="p-12 text-center rounded-3xl red-glass border border-red-950 space-y-3">
          <Users className="w-8 h-8 mx-auto text-red-500/40" />
          <p className="text-sm font-bold text-slate-300">No Team Profiles Found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? "Try refining your search filter." : "Click '+ Add Team Member' to create the first profile."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member, index) => (
            <div
              key={member.id}
              className={`tilt-card red-glass rounded-3xl p-6 border flex flex-col justify-between group transition-all ${
                member.isArchived
                  ? "border-slate-800 opacity-60 bg-black/40"
                  : member.isVisible === false
                  ? "border-amber-900/50 bg-amber-950/10"
                  : "border-red-500/30 hover:border-red-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              }`}
            >
              <div className="space-y-4">
                
                {/* Card Top Row: Role, Order, Visibility */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 font-bold border border-red-900 uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-400" />
                      <span>{member.roleType}</span>
                    </span>
                    
                    {member.isArchived ? (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-bold border border-slate-700">
                        ARCHIVED
                      </span>
                    ) : member.isVisible === false ? (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                        HIDDEN
                      </span>
                    ) : (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                        LIVE
                      </span>
                    )}

                    <span className="text-[9px] px-2 py-0.5 rounded bg-black/60 text-slate-400 border border-red-950 font-mono">
                      #{member.displayOrder || index + 1}
                    </span>
                  </div>

                  {/* Move Up / Down Reordering */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, "up")}
                      className="p-1 rounded-lg bg-black/60 border border-red-950 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredTeam.length - 1}
                      onClick={() => handleMoveOrder(index, "down")}
                      className="p-1 rounded-lg bg-black/60 border border-red-950 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Profile Photo + Names */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-black border-2 border-red-500/40 p-0.5 shrink-0 overflow-hidden relative shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        style={{
                          objectPosition: `${member.profileObjectPositionX ?? 50}% ${member.profileObjectPositionY ?? 50}%`,
                          transform: `scale(${member.profileScale ?? 1})`,
                        }}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-red-950/60 flex items-center justify-center text-lg font-black text-white">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    <h3 className="text-base font-black text-white truncate group-hover:text-red-400 transition-colors">
                      {member.displayName || member.name}
                    </h3>
                    <div className="text-xs font-bold text-red-400 truncate">{member.designation}</div>
                    {member.department && (
                      <div className="text-[10px] text-slate-400 truncate">{member.department}</div>
                    )}
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {member.shortBio || member.bio}
                </p>

                {/* Contact Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] pt-1">
                  {member.whatsapp && (
                    <span className="flex items-center gap-1 text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900">
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </span>
                  )}
                  {member.phone && (
                    <span className="flex items-center gap-1 text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900">
                      <Phone className="w-3 h-3" />
                      <span>Phone</span>
                    </span>
                  )}
                  {member.email && (
                    <span className="flex items-center gap-1 text-slate-300 px-2 py-0.5 rounded bg-black/60 border border-red-950">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </span>
                  )}
                </div>

              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-4 border-t border-red-950/80 grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(member, e)}
                  className="py-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>EDIT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setPreviewMember(member);
                  }}
                  className="py-2 px-3 rounded-xl bg-black/60 hover:bg-red-950/40 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>PREVIEW</span>
                </button>

                {/* Secondary Actions */}
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(member)}
                  className="py-1.5 px-2 rounded-xl bg-black/40 border border-red-950 text-slate-400 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {member.isVisible !== false ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                  <span>{member.isVisible !== false ? "HIDE" : "SHOW"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicate(member.id)}
                  className="py-1.5 px-2 rounded-xl bg-black/40 border border-red-950 text-slate-400 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>DUPLICATE</span>
                </button>

                {member.isArchived ? (
                  <button
                    type="button"
                    onClick={() => handleRestore(member.id)}
                    className="col-span-2 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESTORE PROFILE</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleArchiveDelete(member.id, false)}
                    className="col-span-2 py-1.5 rounded-xl bg-black/40 hover:bg-red-950/40 border border-red-950 text-slate-500 hover:text-red-400 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3 h-3" />
                    <span>ARCHIVE MEMBER</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal (Sticky Header/Footer, Single Scroll Region) */}
      {editingMember && (
        <LeadershipEditorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          member={editingMember}
          onSave={handleSaveMemberAsync}
          onOpenCropper={() => setIsCropperOpen(true)}
          onPreview={(m) => setPreviewMember(m)}
          triggerElement={activeTriggerEl}
        />
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onSave={handleCroppedPhotoSave}
        initialImage={editingMember?.photoUrl}
        title={`Crop Photo for ${editingMember?.name || "Leadership Profile"}`}
      />

      {/* Live Preview Modal */}
      <LeadershipDetailModal
        isOpen={previewMember !== null}
        member={previewMember}
        onClose={() => setPreviewMember(null)}
      />

    </div>
  );
}
