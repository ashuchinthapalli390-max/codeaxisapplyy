"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Menu, X, Terminal, ArrowRight, ShieldCheck } from "lucide-react";
import { isSoundEnabled, toggleSound, playButtonClick } from "@/lib/audio";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Internship", href: "/internship" },
    { name: "Process", href: "/#process" },
    { name: "Agency", href: "/about" },
    { name: "Leadership", href: "/#leadership" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#030712]/90 backdrop-blur-md border-b border-red-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={playButtonClick}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(239,68,68,0.25)] group-hover:border-red-500 transition-all">
            <img src="/logo.jpeg" alt="CodeXa Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="text-base font-black tracking-widest font-mono text-white flex items-center gap-1.5">
              <span>CODEXA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600/30 text-red-400 border border-red-500/30">
                APPLY
              </span>
            </div>
            <div className="text-[9px] font-mono text-red-400/70 tracking-wider">
              DEVELOPER RECRUITMENT UNIVERSE
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={playButtonClick}
                className={`text-xs font-mono font-semibold tracking-wider transition-colors uppercase ${
                  isActive
                    ? "text-red-400 glow-red"
                    : "text-slate-300 hover:text-red-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Utilities */}
        <div className="hidden sm:flex items-center space-x-4">
          
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleSoundToggle}
            aria-label="Toggle Sound"
            className="p-2.5 rounded-xl border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-slate-300 hover:text-red-400 transition-all cursor-pointer"
            title={soundOn ? "Mute Sound Effects" : "Enable Sound Effects"}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Track Application Link */}
          <Link
            href="/status"
            onClick={playButtonClick}
            className="text-xs font-mono font-bold tracking-wider text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:border-red-500/40 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            <span>TRACK APPLICATION</span>
          </Link>

          {/* Apply Button */}
          <Link
            href="/apply"
            onClick={playButtonClick}
            className="btn-red-sweep text-xs font-mono font-black uppercase tracking-widest bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
          >
            <span>APPLY NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            type="button"
            onClick={handleSoundToggle}
            className="p-2 rounded-lg border border-red-500/20 bg-red-950/20 text-slate-300"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-red-500/20 bg-red-950/20 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#030712]/98 border-b border-red-500/30 px-6 py-6 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  playButtonClick();
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-mono font-bold uppercase text-slate-200 hover:text-red-400 py-2 border-b border-red-950/40 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-red-500">&rarr;</span>
              </Link>
            ))}
            <Link
              href="/status"
              onClick={() => {
                playButtonClick();
                setMobileMenuOpen(false);
              }}
              className="text-sm font-mono font-bold uppercase text-red-400 py-2 border-b border-red-950/40 flex items-center justify-between"
            >
              <span>Track Application</span>
              <Terminal className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/apply"
              onClick={() => {
                playButtonClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center block font-mono font-black uppercase text-xs tracking-widest bg-gradient-to-r from-red-600 to-rose-700 text-white py-3.5 rounded-xl border border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              START APPLICATION &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
