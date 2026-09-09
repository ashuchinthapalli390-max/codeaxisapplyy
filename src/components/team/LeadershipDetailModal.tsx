"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Crown,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  Briefcase,
  Quote,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  Award,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { TeamMember } from "@/types/admin";
import { playButtonClick } from "@/lib/audio";

interface LeadershipDetailModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadershipDetailModal({ member, isOpen, onClose }: LeadershipDetailModalProps) {
  const [prevPhotoUrl, setPrevPhotoUrl] = useState(member?.photoUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (member?.photoUrl !== prevPhotoUrl) {
    setPrevPhotoUrl(member?.photoUrl);
    setImgError(false);
  }

  if (!isOpen || !member) return null;

  const responsibilities = member.responsibilities || member.roles || [];
  const skills = member.skills || [];
  const focusAreas = member.focus_areas || skills;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-mono select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leader-modal-title"
        className="red-glass rounded-3xl border border-red-500/40 w-full max-w-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(239,68,68,0.25)] flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-red-950/80 flex items-center justify-between bg-[#070712]">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-950/80 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>{member.roleType || "Leadership Profile"}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              onClose();
            }}
            aria-label="Close modal"
            className="p-1.5 rounded-xl border border-red-950 text-slate-400 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-grow text-left">
          
          {/* Top Banner with Photo and Core Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-red-950 pb-6">
            
            {/* Profile Avatar / Photo */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-black border-2 border-red-500/60 p-1 shadow-[0_0_25px_rgba(239,68,68,0.4)] shrink-0 overflow-hidden relative">
              {member.photoUrl && member.photoUrl !== "/logo.jpeg" && !imgError ? (
                <img
                  src={member.photoUrl}
                  alt={`Portrait of ${member.displayName || member.name}`}
                  onError={() => setImgError(true)}
                  style={{
                    objectPosition: `${member.profileObjectPositionX ?? 50}% ${member.profileObjectPositionY ?? 50}%`,
                    transform: `scale(${member.profileScale ?? 1})`,
                  }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-red-950 via-[#180709] to-black flex flex-col items-center justify-center border border-red-900/60 text-red-300">
                  <span className="text-2xl font-black">
                    {(member.displayName || member.name || "CX").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[9px] font-bold text-red-400/80 tracking-widest mt-0.5">
                    CODEXA
                  </span>
                </div>
              )}
            </div>

            {/* Names & Taglines */}
            <div className="space-y-1.5 text-center sm:text-left flex-grow">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 id="leader-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {member.displayName || member.name}
                </h2>
                {member.codename && member.codename.trim() && member.codename.toLowerCase() !== "none" && member.codename.toLowerCase() !== "no codename" && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-700/60 font-mono font-bold tracking-wider uppercase">
                    {member.codename}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-red-400">
                {member.primaryDesignation || member.designation || "Core Team"}
              </div>
              {member.secondaryDesignation && (
                <div className="text-xs text-slate-400">{member.secondaryDesignation}</div>
              )}
              {(member.shortTagline || member.tagline) && (
                <p className="text-xs text-slate-300 italic pt-1">{member.shortTagline || member.tagline}</p>
              )}

              {/* Department & Location */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-[10px] text-slate-400">
                {member.department && (
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-red-950">
                    Dept: {member.department}
                  </span>
                )}
                {member.location && (
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-red-950">
                    {member.location}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Personal Quote */}
          {member.quote && (
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 italic flex items-start gap-3">
              <Quote className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">&ldquo;{member.quote}&rdquo;</p>
            </div>
          )}

          {/* Detailed Bio */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              About & Background
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {member.fullBio || member.bio}
            </p>
          </div>

          {/* Professional Summary */}
          {member.professionalSummary && (
            <div className="space-y-2 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Leadership & Vision
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {member.professionalSummary}
              </p>
            </div>
          )}

          {/* Key Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Key Responsibilities & Scope
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {responsibilities.map((resp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-black/50 border border-red-950/80 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Focus Areas */}
          {focusAreas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Focus Areas & Technical Domains
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {focusAreas.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-black/70 border border-red-950 text-slate-300 text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verified Contributions */}
          {member.contributions && member.contributions.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Contributions & Projects</span>
              </h3>
              <div className="space-y-2">
                {member.contributions.map((c: any, idx: number) => (
                  <div
                    key={c.id || idx}
                    className="p-3 rounded-xl bg-black/60 border border-red-950/80 space-y-1 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>{c.title}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/60 uppercase font-bold">
                        {c.contributionType || c.contribution_type || "project"}
                      </span>
                    </div>
                    {c.summary && (
                      <p className="text-slate-300 text-[11px] leading-relaxed pl-3.5">{c.summary}</p>
                    )}
                    {(c.projectName || c.project_name || c.projectUrl || c.project_url || c.repositoryUrl || c.repository_url) && (
                      <div className="flex items-center gap-3 pl-3.5 pt-1 text-[10px] flex-wrap">
                        {(c.projectName || c.project_name) && (
                          <span className="text-slate-400">
                            Project: <strong className="text-slate-200">{c.projectName || c.project_name}</strong>
                          </span>
                        )}
                        {(c.projectUrl || c.project_url) && (
                          <a
                            href={c.projectUrl || c.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 underline flex items-center gap-1"
                          >
                            <span>Live Project</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {(c.repositoryUrl || c.repository_url) && (
                          <a
                            href={c.repositoryUrl || c.repository_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-400 hover:text-red-300 underline flex items-center gap-1"
                          >
                            <span>Repository</span>
                            <GithubIcon className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Summary */}
          {member.educationSummary && (
            <div className="space-y-1.5 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-red-400" />
                <span>Education & Qualifications</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {member.educationSummary}
              </p>
            </div>
          )}

          {/* Experience Summary */}
          {member.experienceSummary && (
            <div className="space-y-1.5 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-red-400" />
                <span>Verified Experience Summary</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {member.experienceSummary}
              </p>
            </div>
          )}

          {/* Contact & Social Links according to Visibility */}
          <div className="space-y-3 pt-3 border-t border-red-950">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Direct Contact & Socials
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {/* WhatsApp Button */}
              {member.showWhatsapp !== false && member.whatsapp && (
                <a
                  href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playButtonClick}
                  className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {member.whatsapp}</span>
                </a>
              )}

              {/* Call Phone Button */}
              {member.showPhone !== false && member.phone && (
                <a
                  href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                  onClick={playButtonClick}
                  className="px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-600/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call: {member.phone}</span>
                </a>
              )}

              {/* Email Button */}
              {member.showEmail !== false && member.email && (
                <a
                  href={`mailto:${member.email}`}
                  onClick={playButtonClick}
                  className="px-4 py-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </a>
              )}

              {/* Social Links */}
              {member.showSocials !== false && (
                <>
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playButtonClick}
                      className="p-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}

                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playButtonClick}
                      className="p-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}

                  {member.instagramUrl && (
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playButtonClick}
                      className="p-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                      title="Instagram Profile"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  )}

                  {member.websiteUrl && (
                    <a
                      href={member.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playButtonClick}
                      className="p-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                      title="Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}

                  {member.portfolioUrl && (
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playButtonClick}
                      className="p-2.5 rounded-xl bg-black/70 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white transition-all"
                      title="Portfolio"
                    >
                      <Briefcase className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-red-950/80 flex items-center justify-between bg-[#070712] text-[10px] text-slate-500">
          <span>CodeXa Leadership & Mentorship Directory</span>
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl border border-red-950 hover:border-red-500 text-white font-bold cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
