"use client";

import React from "react";
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
  Sparkles,
  ExternalLink,
  ShieldCheck,
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
  if (!isOpen || !member) return null;

  const responsibilities = member.responsibilities || member.roles || [];
  const skills = member.skills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono select-none">
      <div className="red-glass rounded-3xl border border-red-500/40 w-full max-w-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(239,68,68,0.25)] flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
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
            className="p-1.5 rounded-xl border border-red-950 text-slate-400 hover:text-white hover:border-red-500 transition-colors"
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
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  style={{
                    objectPosition: `${member.profileObjectPositionX ?? 50}% ${member.profileObjectPositionY ?? 50}%`,
                    transform: `scale(${member.profileScale ?? 1})`,
                  }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-red-950 to-black flex items-center justify-center text-2xl font-black text-white">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Names & Taglines */}
            <div className="space-y-1.5 text-center sm:text-left flex-grow">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {member.displayName || member.name}
              </h2>
              <div className="text-xs sm:text-sm font-bold text-red-400">{member.designation}</div>
              {member.secondaryDesignation && (
                <div className="text-xs text-slate-400">{member.secondaryDesignation}</div>
              )}
              {member.tagline && (
                <p className="text-xs text-slate-300 italic pt-1">{member.tagline}</p>
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
          {skills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-red-950/60">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Focus Areas & Technical Domains
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
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
