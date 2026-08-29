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
  { name: "Founder Ashu", url: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg" },
  { name: "Co-Founder Deepak", url: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg" },
  { name: "CEO Kishore", url: "/assets/image-assests/2306fc1d8f6ea04d1ddd4ebfafd003f2.jpg" },
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
      const res = await fetch("/api/admin/team?archived=true");
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

  const handleOpenEdit = (member: TeamMember) => {
    playButtonClick();
    setEditingMember({
      ...member,
      responsibilities: member.responsibilities ? [...member.responsibilities] : (member.roles ? [...member.roles] : []),
      skills: member.skills ? [...member.skills] : [],
      otherLinks: member.otherLinks ? [...member.otherLinks] : [],
      profileObjectPositionX: member.profileObjectPositionX ?? 50,
      profileObjectPositionY: member.profileObjectPositionY ?? 50,
      profileScale: member.profileScale ?? 1,
    });
    setActiveTab("basic");
    setSaveSuccessMsg(null);
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const handleAddNewMember = () => {
    playButtonClick();
    const newId = `member-${Date.now()}`;
    const newRecord: TeamMember = {
      id: newId,
      name: "",
      displayName: "",
      designation: "",
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
      responsibilities: ["Technical Development", "Team Collaboration"],
      skills: ["Full-Stack", "Next.js", "AI Prompting"],
      email: "",
      secondaryEmail: "",
      phone: "",
      whatsapp: "",
      location: "India",
      preferredContact: "WhatsApp",
      githubUrl: "",
      linkedinUrl: "",
      instagramUrl: "",
      portfolioUrl: "",
      websiteUrl: "",
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
      displayOrder: team.length + 1,
    };
    setEditingMember(newRecord);
    setActiveTab("basic");
    setSaveSuccessMsg(null);
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.designation.trim()) {
      setErrorMessage("Full Name and Designation are required.");
      playWarningTone();
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);
    playButtonClick();

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMember),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setSaveSuccessMsg("PROFILE SAVED & LIVE ON WEBSITE ✓");
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchTeam();
        }, 1200);
      } else {
        setErrorMessage(json.error || "Failed to save team member.");
        playWarningTone();
      }
    } catch {
      setErrorMessage("Network error saving profile. Your form changes have been preserved.");
      playWarningTone();
    } finally {
      setIsSaving(false);
    }
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
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setEditingMember((prev) =>
          prev
            ? {
                ...prev,
                photoUrl: json.url,
                profileStoragePath: json.storagePath,
              }
            : null
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
          onClick={handleAddNewMember}
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
                  onClick={() => handleOpenEdit(member)}
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

      {/* Edit / Add Modal (2-Column Studio) */}
      {editingMember && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Profile: ${editingMember.name || "New Leadership Member"}`}
        >
          <form onSubmit={handleSaveMember} className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Profile Image Studio & Framing */}
              <div className="lg:col-span-4 space-y-5">
                <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-4 text-center">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    Profile Photo & Framing
                  </span>

                  {/* Main Preview Box */}
                  <div className="w-36 h-36 mx-auto rounded-3xl bg-black border-2 border-red-500/50 p-1 shadow-[0_0_20px_rgba(239,68,68,0.3)] overflow-hidden relative">
                    {editingMember.photoUrl ? (
                      <img
                        src={editingMember.photoUrl}
                        alt="Profile Preview"
                        style={{
                          objectPosition: `${editingMember.profileObjectPositionX ?? 50}% ${editingMember.profileObjectPositionY ?? 50}%`,
                          transform: `scale(${editingMember.profileScale ?? 1})`,
                        }}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-red-950/60 flex items-center justify-center text-3xl font-black text-white">
                        {editingMember.name ? editingMember.name.slice(0, 2).toUpperCase() : "CX"}
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setIsCropperOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600/30 hover:bg-red-600 border border-red-500/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>UPLOAD / CROP PHOTO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setEditingMember({
                          ...editingMember,
                          photoUrl: "/logo.jpeg",
                          profileStoragePath: "",
                        });
                      }}
                      className="w-full py-1.5 px-3 rounded-xl border border-red-950 hover:border-red-500 text-slate-400 hover:text-white text-[10px] font-bold cursor-pointer"
                    >
                      RESET TO DEFAULT AVATAR
                    </button>
                  </div>

                  {/* Positioning Sliders */}
                  <div className="space-y-3 pt-3 border-t border-red-950/80 text-left text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Horizontal Center ({editingMember.profileObjectPositionX ?? 50}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingMember.profileObjectPositionX ?? 50}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            profileObjectPositionX: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Vertical Center ({editingMember.profileObjectPositionY ?? 50}%)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingMember.profileObjectPositionY ?? 50}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            profileObjectPositionY: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Zoom Scale ({(editingMember.profileScale ?? 1).toFixed(2)}x)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="1.5"
                        step="0.05"
                        value={editingMember.profileScale ?? 1}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            profileScale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Photos */}
                  <div className="space-y-2 pt-3 border-t border-red-950/80 text-left">
                    <span className="text-[10px] text-slate-500 block">Preset Assets:</span>
                    <div className="flex flex-wrap gap-1">
                      {PHOTO_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            playButtonClick();
                            setEditingMember({ ...editingMember, photoUrl: preset.url });
                          }}
                          className="px-2 py-1 rounded bg-black border border-red-950 text-[10px] text-slate-300 hover:text-white hover:border-red-500 cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: Tabbed Fields */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Navigation Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-red-950 pb-2">
                  {[
                    { id: "basic", label: "Basic Info" },
                    { id: "bio", label: "Bio & Quote" },
                    { id: "contact", label: "Contacts & Socials" },
                    { id: "roles", label: "Roles" },
                    { id: "skills", label: "Skills" },
                    { id: "visibility", label: "Visibility" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playButtonClick();
                        setActiveTab(tab.id as any);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-red-950 border border-red-500 text-red-300"
                          : "text-slate-400 hover:text-white hover:bg-red-950/20"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: BASIC INFORMATION */}
                {activeTab === "basic" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Full Legal Name *"
                        value={editingMember.name}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        placeholder="e.g. Ashu"
                        required
                      />
                      <Input
                        label="Display Name (Public)"
                        value={editingMember.displayName || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, displayName: e.target.value })}
                        placeholder="e.g. Ashu Chinthapalli"
                      />
                      <Input
                        label="Primary Designation *"
                        value={editingMember.designation}
                        onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                        placeholder="e.g. Founder & Technical Director"
                        required
                      />
                      <Input
                        label="Secondary Designation (Optional)"
                        value={editingMember.secondaryDesignation || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, secondaryDesignation: e.target.value })}
                        placeholder="e.g. Lead System Architect"
                      />
                      <Select
                        label="Role Type"
                        value={editingMember.roleType}
                        onChange={(e) => setEditingMember({ ...editingMember, roleType: e.target.value })}
                        options={ROLE_OPTIONS}
                      />
                      <Input
                        label="Department"
                        value={editingMember.department || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                        placeholder="e.g. Core Engineering & Product"
                      />
                    </div>
                    <Input
                      label="Short Tagline / Catchphrase"
                      value={editingMember.tagline || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, tagline: e.target.value })}
                      placeholder="e.g. Building technology and helping developers grow."
                    />
                  </div>
                )}

                {/* TAB 2: BIO & QUOTES */}
                {activeTab === "bio" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <Textarea
                      label="Short Bio (Displays on Card) *"
                      value={editingMember.shortBio || editingMember.bio}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          bio: e.target.value,
                          shortBio: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Brief 2-3 line summary shown on landing card..."
                      required
                    />
                    <Textarea
                      label="Detailed Full Bio (Displays in Profile Modal)"
                      value={editingMember.fullBio || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, fullBio: e.target.value })}
                      rows={4}
                      placeholder="Comprehensive background, achievements, and responsibilities..."
                    />
                    <Input
                      label="Personal Leadership Quote"
                      value={editingMember.quote || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, quote: e.target.value })}
                      placeholder="e.g. I don't just write code, I build solutions that create impact."
                    />
                    <Textarea
                      label="Professional Summary / Vision"
                      value={editingMember.professionalSummary || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, professionalSummary: e.target.value })}
                      rows={2}
                      placeholder="Strategic goals and guiding principles..."
                    />
                  </div>
                )}

                {/* TAB 3: CONTACTS & SOCIALS */}
                {activeTab === "contact" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Phone Number"
                        value={editingMember.phone || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        placeholder="+91 88979 01413"
                      />
                      <Input
                        label="WhatsApp Number"
                        value={editingMember.whatsapp || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, whatsapp: e.target.value })}
                        placeholder="+91 88979 01413"
                      />
                      <Input
                        label="Primary Email"
                        type="email"
                        value={editingMember.email || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                        placeholder="founder@codexa-agency.online"
                      />
                      <Input
                        label="Secondary Email"
                        type="email"
                        value={editingMember.secondaryEmail || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, secondaryEmail: e.target.value })}
                        placeholder="personal@gmail.com"
                      />
                      <Input
                        label="Location"
                        value={editingMember.location || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, location: e.target.value })}
                        placeholder="Hyderabad, India"
                      />
                      <Input
                        label="GitHub Profile URL"
                        value={editingMember.githubUrl || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                      <Input
                        label="LinkedIn Profile URL"
                        value={editingMember.linkedinUrl || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                      />
                      <Input
                        label="Instagram URL"
                        value={editingMember.instagramUrl || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/..."
                      />
                      <Input
                        label="Portfolio / Website URL"
                        value={editingMember.websiteUrl || editingMember.portfolioUrl || ""}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            websiteUrl: e.target.value,
                            portfolioUrl: e.target.value,
                          })
                        }
                        placeholder="https://codexa-agency.online"
                      />
                      <Input
                        label="Discord Username"
                        value={editingMember.discordUsername || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, discordUsername: e.target.value })}
                        placeholder="username#0000"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: ROLES & RESPONSIBILITIES */}
                {activeTab === "roles" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <Input
                        label="Add Responsibility"
                        value={newResponsibility}
                        onChange={(e) => setNewResponsibility(e.target.value)}
                        placeholder="e.g. Technical Direction & Program Oversight"
                      />
                      <button
                        type="button"
                        onClick={handleAddResponsibility}
                        className="px-4 py-3 rounded-xl bg-red-950 hover:bg-red-600 border border-red-500/40 text-white text-xs font-bold shrink-0 mt-6 cursor-pointer"
                      >
                        + ADD
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(editingMember.responsibilities || []).map((resp, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-red-950 text-xs text-slate-200"
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                            <span>{resp}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveResponsibility(idx)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: SKILLS */}
                {activeTab === "skills" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <Input
                        label="Add Skill / Focus Domain"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. Next.js 16, Supabase, AI Systems"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="px-4 py-3 rounded-xl bg-red-950 hover:bg-red-600 border border-red-500/40 text-white text-xs font-bold shrink-0 mt-6 cursor-pointer"
                      >
                        + ADD
                      </button>
                    </div>

                    {/* Quick suggestions */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_SKILLS.map((sk) => (
                          <button
                            key={sk}
                            type="button"
                            onClick={() => handleAddSkill(sk)}
                            className="px-2 py-0.5 rounded bg-black/60 border border-red-950 text-[10px] text-slate-400 hover:text-white hover:border-red-500 cursor-pointer"
                          >
                            + {sk}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Skills Chips */}
                    <div className="space-y-2 pt-2 border-t border-red-950">
                      <span className="text-xs font-bold text-white block">Assigned Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(editingMember.skills || []).map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-bold"
                          >
                            <span>{sk}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(sk)}
                              className="text-red-400 hover:text-white ml-1 cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: PUBLIC VISIBILITY & SETTINGS */}
                {activeTab === "visibility" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-black/60 border border-red-950 space-y-3">
                      <Checkbox
                        id="vis-live"
                        checked={editingMember.isVisible !== false}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            isVisible: (e.target as HTMLInputElement).checked,
                          })
                        }
                        label="Visible on Public Website Landing Page"
                      />

                      <Checkbox
                        id="vis-featured"
                        checked={editingMember.isFeatured === true}
                        onChange={(e) =>
                          setEditingMember({
                            ...editingMember,
                            isFeatured: (e.target as HTMLInputElement).checked,
                          })
                        }
                        label="Highlight as Featured Leadership Card"
                      />

                      <div className="border-t border-red-950/80 pt-3 space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Public Contact Display Controls:
                        </span>

                        <Checkbox
                          id="vis-phone"
                          checked={editingMember.showPhone !== false}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              showPhone: (e.target as HTMLInputElement).checked,
                            })
                          }
                          label="Show Call / Phone Button on Public Card"
                        />

                        <Checkbox
                          id="vis-whatsapp"
                          checked={editingMember.showWhatsapp !== false}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              showWhatsapp: (e.target as HTMLInputElement).checked,
                            })
                          }
                          label="Show WhatsApp Button on Public Card"
                        />

                        <Checkbox
                          id="vis-email"
                          checked={editingMember.showEmail !== false}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              showEmail: (e.target as HTMLInputElement).checked,
                            })
                          }
                          label="Show Email Button on Public Card"
                        />

                        <Checkbox
                          id="vis-socials"
                          checked={editingMember.showSocials !== false}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              showSocials: (e.target as HTMLInputElement).checked,
                            })
                          }
                          label="Show GitHub / LinkedIn / Social Buttons"
                        />
                      </div>

                      <div className="pt-3 border-t border-red-950/80">
                        <Input
                          label="Display Order (Numeric Sort)"
                          type="number"
                          value={String(editingMember.displayOrder || 1)}
                          onChange={(e) =>
                            setEditingMember({
                              ...editingMember,
                              displayOrder: parseInt(e.target.value, 10) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500 text-xs text-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Bottom Sticky Action Bar */}
            <div className="pt-4 border-t border-red-950 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-[#070712] py-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-red-950 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playButtonClick();
                    setPreviewMember(editingMember);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-black/60 border border-red-950 hover:border-red-500 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>PREVIEW CARD</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button3D
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "SAVING PROFILE..." : "SAVE CHANGES"}</span>
                </Button3D>
              </div>
            </div>

          </form>
        </Modal>
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
