"use client";

import React, { useState, useEffect } from "react";
import { TeamMember } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Button3D from "@/components/ui/Button3D";
import Modal from "@/components/ui/Modal";
import { Users, Crown, Edit2, Plus, Trash2, Mail, MessageCircle, Save, Eye, EyeOff, Sparkles } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team");
      const json = await res.json();
      if (json.success) setTeam(json.data);
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
    setEditingMember({ ...member });
    setIsModalOpen(true);
  };

  const handleAddNewMember = () => {
    playButtonClick();
    setEditingMember({
      id: `member-${Date.now()}`,
      name: "",
      designation: "Core Team Member",
      roleType: "Core Team",
      photoUrl: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
      bio: "Technical contributor and developer mentor at CodeXa Agency.",
      quote: "Building futuristic software.",
      roles: ["Development", "Mentorship"],
      skills: ["Full-Stack", "AI Prompting", "Git"],
      email: "",
      whatsapp: "",
      githubUrl: "",
      linkedinUrl: "",
      websiteUrl: "",
      showContact: true,
      isFeatured: true,
      isVisible: true,
      displayOrder: team.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
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
        setIsModalOpen(false);
        fetchTeam();
      }
    } catch {
      alert("Failed to save team member.");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leadership profile?")) return;
    playButtonClick();
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchTeam();
      }
    } catch {
      alert("Failed to delete member.");
    }
  };

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            DYNAMIC LEADERSHIP CMS
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Team Profiles Management ({team.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={handleAddNewMember}
          className="px-4 py-2.5 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD LEADERSHIP MEMBER</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 font-bold border border-red-900 uppercase">
                      {member.roleType}
                    </span>
                    {member.isVisible === false && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-500 font-bold border border-slate-800">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{member.name}</h3>
                  <div className="text-[11px] text-slate-400">{member.designation}</div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 p-1 overflow-hidden">
                  <img
                    src={member.photoUrl || "/assets/image-assests/hero.jpeg"}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{member.bio}</p>

              <div className="space-y-1 text-[11px] text-slate-400">
                {member.whatsapp && <div>WhatsApp: <span className="text-white">{member.whatsapp}</span></div>}
                {member.email && <div>Email: <span className="text-white">{member.email}</span></div>}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(member)}
              className="w-full py-2.5 bg-red-950/40 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>EDIT PROFILE</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingMember && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Edit Profile: ${editingMember.name || "New Leadership Member"}`}
        >
          <form onSubmit={handleSaveMember} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                placeholder="e.g. Ashu"
                required
              />
              <Input
                label="Designation"
                value={editingMember.designation}
                onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                placeholder="e.g. Founder & Technical Director"
                required
              />
              <Select
                label="Role Type"
                value={editingMember.roleType}
                onChange={(e) => setEditingMember({ ...editingMember, roleType: e.target.value as any })}
                options={[
                  { value: "Founder", label: "Founder" },
                  { value: "Co-Founder", label: "Co-Founder" },
                  { value: "CEO", label: "CEO" },
                  { value: "CTO", label: "CTO" },
                  { value: "COO", label: "COO" },
                  { value: "Mentor", label: "Mentor" },
                  { value: "Lead Developer", label: "Lead Developer" },
                  { value: "Core Team", label: "Core Team" },
                ]}
              />
              <Input
                label="Display Order (Sort)"
                type="number"
                value={String(editingMember.displayOrder || 1)}
                onChange={(e) => setEditingMember({ ...editingMember, displayOrder: parseInt(e.target.value, 10) || 1 })}
              />
            </div>

            {/* Profile Photo URL & Presets */}
            <div className="space-y-2">
              <Input
                label="Profile Image URL / Path"
                value={editingMember.photoUrl}
                onChange={(e) => setEditingMember({ ...editingMember, photoUrl: e.target.value })}
                placeholder="/assets/image-assests/... or https://..."
                required
              />
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="text-slate-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => setEditingMember({ ...editingMember, photoUrl: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg" })}
                  className="px-2 py-0.5 rounded bg-black border border-red-950 text-slate-300 hover:text-white"
                >
                  Asset 1
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember({ ...editingMember, photoUrl: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg" })}
                  className="px-2 py-0.5 rounded bg-black border border-red-950 text-slate-300 hover:text-white"
                >
                  Asset 2
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember({ ...editingMember, photoUrl: "/assets/image-assests/2306fc1d8f6ea04d1ddd4ebfafd003f2.jpg" })}
                  className="px-2 py-0.5 rounded bg-black border border-red-950 text-slate-300 hover:text-white"
                >
                  Asset 3
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember({ ...editingMember, photoUrl: "/assets/image-assests/hero.jpeg" })}
                  className="px-2 py-0.5 rounded bg-black border border-red-950 text-slate-300 hover:text-white"
                >
                  Hero Asset
                </button>
              </div>
            </div>

            <Textarea
              label="Bio Description"
              value={editingMember.bio}
              onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
              required
            />

            <Input
              label="Personal Quote"
              value={editingMember.quote || ""}
              onChange={(e) => setEditingMember({ ...editingMember, quote: e.target.value })}
              placeholder="e.g. I don't just write code, I build solutions..."
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="WhatsApp Number"
                value={editingMember.whatsapp || ""}
                onChange={(e) => setEditingMember({ ...editingMember, whatsapp: e.target.value })}
              />
              <Input
                label="Email Address"
                value={editingMember.email || ""}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              />
              <Input
                label="GitHub URL"
                value={editingMember.githubUrl || ""}
                onChange={(e) => setEditingMember({ ...editingMember, githubUrl: e.target.value })}
              />
              <Input
                label="LinkedIn URL"
                value={editingMember.linkedinUrl || ""}
                onChange={(e) => setEditingMember({ ...editingMember, linkedinUrl: e.target.value })}
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-red-950">
              <Checkbox
                id="is-visible"
                checked={editingMember.isVisible ?? true}
                onChange={(e) => setEditingMember({ ...editingMember, isVisible: (e.target as HTMLInputElement).checked })}
                label="Show profile publicly on landing page"
              />

              <button
                type="button"
                onClick={() => handleDeleteMember(editingMember.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <Button3D type="submit" variant="primary" className="w-full py-3 text-xs font-bold">
              <Save className="w-4 h-4" />
              <span>SAVE LEADERSHIP PROFILE</span>
            </Button3D>
          </form>
        </Modal>
      )}
    </div>
  );
}
