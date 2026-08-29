"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminLoginPage from "@/app/admin/login/page";
import {
  BarChart3,
  Download,
  FileText,
  HelpCircle,
  History,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Network,
  Radio,
  Settings,
  ShieldAlert,
  Terminal,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Verify session with server
    fetch("/api/admin/verify-session", { credentials: "include" })
      .then(async (res) => {
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.authenticated !== false) {
            setIsAuthenticated(true);
            if (pathname === "/admin/login" || pathname === "/admin") {
              router.replace("/admin/dashboard");
            }
            return;
          }
        }
        
        if (res.status === 401) {
          setIsAuthenticated(false);
        } else {
          // If server error or transient status, keep current state (or assume valid if previously logged in)
          setIsAuthenticated((prev) => (prev === null ? false : prev));
        }
      })
      .catch(() => {
        if (!isMounted) return;
        // Offline / network blip: never force-logout an already authenticated session
        setIsAuthenticated((prev) => (prev === null ? false : prev));
      });

    return () => {
      isMounted = false;
    };
  }, [pathname === "/admin/login"]);

  // If on login route explicitly or not yet authenticated, render ONLY the Master Key Terminal Screen
  if (pathname === "/admin/login" || pathname === "/admin" || isAuthenticated === false) {
    if (isAuthenticated === true) {
      return null; // Will redirect via useEffect
    }
    return (
      <div className="min-h-screen bg-[#02040a] text-slate-100 relative font-mono selection:bg-red-600 selection:text-white">
        <AdminLoginPage />
      </div>
    );
  }

  // While checking session, show clean loading state (0 data leakage)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-4">
          <Terminal className="w-6 h-6 text-red-400 animate-pulse" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
          AUTHENTICATING SESSION WITH CODEXA SECURITY DAEMON...
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    playButtonClick();
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Applications", href: "/admin/applications", icon: <UserCheck className="w-4 h-4" /> },
    { label: "Rounds Config", href: "/admin/rounds", icon: <Network className="w-4 h-4" /> },
    { label: "Question Bank", href: "/admin/questions", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "Skills Matrix", href: "/admin/skills", icon: <Zap className="w-4 h-4" /> },
    { label: "Team & Leadership", href: "/admin/team", icon: <Users className="w-4 h-4" /> },
    { label: "Website CMS", href: "/admin/website", icon: <FileText className="w-4 h-4" /> },
    { label: "Asset Manager", href: "/admin/assets", icon: <Image className="w-4 h-4" /> },
    { label: "Email Center", href: "/admin/emails", icon: <Mail className="w-4 h-4" /> },
    { label: "Export Center", href: "/admin/exports", icon: <Download className="w-4 h-4" /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Audit Logs", href: "/admin/audit", icon: <History className="w-4 h-4" /> },
    { label: "Active Sessions", href: "/admin/sessions", icon: <Radio className="w-4 h-4" /> },
    { label: "Security & Keys", href: "/admin/security", icon: <ShieldAlert className="w-4 h-4" /> },
    { label: "Site Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-mono selection:bg-red-600 selection:text-white">
      
      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-[#06060e] border-b border-red-950/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center p-0.5">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded" />
          </div>
          <span className="text-xs font-black text-white">CODEXA COMMAND</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg border border-red-950 text-slate-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-grow flex">
        
        {/* Desktop Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 bottom-0 w-64 bg-[#05050c]/95 backdrop-blur-xl border-r border-red-950/80 z-40 flex flex-col justify-between p-4 transition-transform duration-300 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            {/* Sidebar Brand */}
            <div className="flex items-center space-x-3 px-2 pt-2">
              <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <div className="text-sm font-black text-white tracking-widest">CODEXA ADMIN</div>
                <div className="text-[9px] text-red-400">COMMAND CENTER v2.0</div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      playButtonClick();
                      setMobileNavOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-red-950/50 border border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "text-slate-400 hover:text-white hover:bg-red-950/15"
                    }`}
                  >
                    <span className={isActive ? "text-red-400" : "text-slate-500"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar User Info & Logout */}
          <div className="border-t border-red-950/60 pt-3 space-y-2">
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SESSION ACTIVE
              </span>
              <span>SECURED</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl border border-red-950 bg-black/40 hover:bg-red-950/30 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </aside>

        {/* Main Admin Content Canvas */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}
