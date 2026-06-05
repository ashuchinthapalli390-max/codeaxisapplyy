"use client";

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

// ─── Device Capability Detection ───────────────────────────────────────────
type VFXMode = "high" | "optimized";

function detectVFXMode(): VFXMode {
  if (typeof window === "undefined") return "optimized";

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 2;
  const width = window.innerWidth;

  // Mobile viewport or low hardware = optimized mode
  if (width < 768) return "optimized";
  if (mem !== undefined && mem <= 3) return "optimized";
  if (cores <= 2) return "optimized";

  return "high";
}

// ─── Stable seeded random for SSR/hydration consistency ─────────────────────
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Code snippets for floating streams ─────────────────────────────────────
const CODE_SNIPPETS = [
  "const db = mysql.createPool(url);",
  "await dbQuery('INSERT INTO apps', params);",
  "export async function POST(req) {",
  "return NextResponse.json({ success: true });",
  "const score = calculateScores(data);",
  "if (total >= 85) status = 'Auto Selected';",
  "const ref = generateReferenceId();",
  "<CyberGlass className='shadow-glow' />",
  "SELECT * FROM applications ORDER BY id;",
  "npm run build && vercel deploy --prod",
  "const [stage, setStage] = useState('intro');",
  "border: 1px solid rgba(6,182,212,0.25);",
];

// ─── Terminal boot messages for cinematic feel ──────────────────────────────
const TERMINAL_LINES = [
  { text: "initializing core systems", delay: 6000 },
  { text: "loading secure environment", delay: 6400 },
  { text: "connecting application interface", delay: 6800 },
  { text: "database protection enabled", delay: 7200 },
  { text: "portal ready", delay: 7600 },
];

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [vfxMode, setVfxMode] = useState<VFXMode>("optimized");
  const [isExiting, setIsExiting] = useState(false);
  const [visibleTermLines, setVisibleTermLines] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Detect VFX mode on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVfxMode(detectVFXMode());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Master intro timer: 9.2s animation + 0.8s exit = 10s total.
  useEffect(() => {
    startTimeRef.current = performance.now();
    const DURATION = 9200;

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Terminal lines reveal schedule ───────────────────────────────────────
  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, idx) =>
      setTimeout(() => setVisibleTermLines(idx + 1), line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsExiting(true);
    window.setTimeout(() => {
      onCompleteRef.current();
    }, 800);
  }, []);

  // ─── Trigger exit animation, then call onComplete ─────────────────────────
  useEffect(() => {
    if (progress >= 100) {
      finishIntro();
    }
  }, [progress, finishIntro]);

  // Backup timer: never leave intro stuck / blank after fade-out.
  useEffect(() => {
    const backupTimer = window.setTimeout(() => {
      finishIntro();
    }, 10000);

    return () => window.clearTimeout(backupTimer);
  }, [finishIntro]);

  // ─── Canvas particle system ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle counts based on VFX mode
    const particleCount = vfxMode === "high" ? 80 : 30;
    const codeStreamCount = vfxMode === "high" ? 12 : 5;

    // Depth particles (floating specks with parallax)
    const particles: { x: number; y: number; z: number; speed: number; size: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.2 + Math.random() * 0.8, // depth: 0.2 (far) to 1.0 (near)
        speed: 0.3 + Math.random() * 0.8,
        size: 1 + Math.random() * 1.5,
      });
    }

    // Code streams
    const chars = "01ABCDEF<>[]{}$#@!";
    const streams: { x: number; y: number; speed: number; chars: string[] }[] = [];
    for (let i = 0; i < codeStreamCount; i++) {
      streams.push({
        x: Math.random() * w,
        y: Math.random() * -h,
        speed: 1 + Math.random() * 2,
        chars: Array.from({ length: 6 + Math.floor(Math.random() * 8) }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ),
      });
    }

    // Grid scrolling
    let gridOffset = 0;

    const render = () => {
      // Semi-transparent clear for trail effect
      ctx.fillStyle = "rgba(1, 3, 9, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // ── Holographic grid perspective lines (lower half) ──
      const gridAlpha = 0.04;
      ctx.strokeStyle = `rgba(6, 182, 212, ${gridAlpha})`;
      ctx.lineWidth = 0.5;

      gridOffset += 0.3;
      if (gridOffset >= 50) gridOffset = 0;

      const gridStartY = h * 0.6;
      for (let y = gridStartY; y < h; y += 40) {
        const gy = y + gridOffset;
        if (gy > h) continue;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Vanishing perspective lines
      const cx = w / 2;
      for (let x = -w * 0.5; x < w * 1.5; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(cx, gridStartY);
        ctx.stroke();
      }

      // ── Floating depth particles ──
      particles.forEach((p) => {
        p.y -= p.speed * p.z;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        const alpha = p.z * 0.4;
        const size = p.size * p.z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.fill();

        // Glow effect for near particles
        if (p.z > 0.7 && vfxMode === "high") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha * 0.15})`;
          ctx.fill();
        }
      });

      // ── Code character streams ──
      ctx.font = "10px monospace";
      streams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > h) {
          stream.y = Math.random() * -200 - 50;
          stream.x = Math.random() * w;
        }

        stream.chars.forEach((char, idx) => {
          const cy = stream.y + idx * 13;
          if (cy > 0 && cy < h) {
            const isHead = idx === stream.chars.length - 1;
            const alpha = isHead ? 0.5 : (idx / stream.chars.length) * 0.18;
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.fillText(char, stream.x, cy);
          }
        });

        // Random char mutation
        if (Math.random() < 0.04) {
          const ri = Math.floor(Math.random() * stream.chars.length);
          stream.chars[ri] = chars[Math.floor(Math.random() * chars.length)];
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [vfxMode]);

  // ─── Phase calculations ───────────────────────────────────────────────────
  const phase1 = progress >= 0;    // 0s–1.5s: dark + bloom + logo silhouette
  const phase2 = progress >= 15;   // 1.5s–3s: scanlines + grid + particles
  const phase3 = progress >= 30;   // 3s–4.5s: code panels + terminal windows
  const phase4 = progress >= 45;   // 4.5s–6s: peak VFX - data rings, holo cube, arcs
  const phase5 = progress >= 60;   // 6s–7.5s: text reveal + terminal lines
  const phase6 = progress >= 75;   // 7.5s–9s: energy wave + loading bar
  const phase7 = progress >= 90;   // 9s–10s: final settle + transition prep

  // ─── Pulse wave triggers (staggered) ──────────────────────────────────────
  const [pulseWaves, setPulseWaves] = useState<number[]>([]);
  useEffect(() => {
    if (phase6 && pulseWaves.length === 0) {
      const t1 = setTimeout(() => setPulseWaves([1]), 0);
      const t2 = setTimeout(() => setPulseWaves((p) => [...p, 2]), 600);
      const t3 = setTimeout(() => setPulseWaves((p) => [...p, 3]), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [phase6, pulseWaves.length]);

  // ─── Scanline trigger ─────────────────────────────────────────────────────
  const [showScanline, setShowScanline] = useState(false);
  useEffect(() => {
    if (phase2 && !showScanline) {
      const timer = setTimeout(() => setShowScanline(true), 0);
      return () => clearTimeout(timer);
    }
  }, [phase2, showScanline]);

  // ─── Arc flash triggers ──────────────────────────────────────────────────
  const [arcs, setArcs] = useState<{ id: number; top: string; left: string; width: string; angle: number }[]>([]);
  useEffect(() => {
    if (!phase4 || vfxMode !== "high") return;
    const interval = setInterval(() => {
      setArcs((prev) => {
        const newArc = {
          id: Date.now(),
          top: `${30 + Math.random() * 40}%`,
          left: `${20 + Math.random() * 60}%`,
          width: `${60 + Math.random() * 100}px`,
          angle: -30 + Math.random() * 60,
        };
        // Keep max 3 arcs active
        return [...prev.slice(-2), newArc];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [phase4, vfxMode]);

  // ─── Code panel content (memoized) ────────────────────────────────────────
  const codePanels = useMemo(() => {
    if (vfxMode === "high") {
      return [
        { side: "right", top: "18%", right: "8%", lines: ["const pool = mysql.createPool(url);", "await pool.query('SELECT * FROM apps');", "// Connection: SECURED"] },
        { side: "left", top: "22%", left: "6%", lines: ["export default function Portal() {", "  return <CyberWizard steps={9} />;", "}"] },
        { side: "right", top: "58%", right: "5%", lines: ["POST /api/applications/submit", "→ 200 OK { success: true }", "ref: CAX-2026-XXXXXX"] },
      ];
    }
    return [
      { side: "right", top: "20%", right: "5%", lines: ["const pool = mysql.createPool(url);", "// CONNECTED"] },
    ];
  }, [vfxMode]);

  // ─── Floating code lines (CSS-only, for depth) ────────────────────────────
  const floatingCodeLines = useMemo(() => {
    const count = vfxMode === "high" ? 8 : 4;
    return Array.from({ length: count }, (_, i) => ({
      text: CODE_SNIPPETS[i % CODE_SNIPPETS.length],
      left: `${seededRandom(i * 7) * 90 + 5}%`,
      delay: `${-(seededRandom(i * 7 + 1) * 12).toFixed(1)}s`,
      duration: `${(seededRandom(i * 7 + 2) * 8 + 10).toFixed(1)}s`,
    }));
  }, [vfxMode]);

  // ─── CSS particles (lightweight fallback + enhancement) ───────────────────
  const cssParticles = useMemo(() => {
    const count = vfxMode === "high" ? 20 : 8;
    return Array.from({ length: count }, (_, i) => ({
      left: `${seededRandom(i * 5 + 100) * 100}%`,
      top: `${seededRandom(i * 5 + 101) * 100}%`,
      delay: `${-(seededRandom(i * 5 + 102) * 8).toFixed(1)}s`,
      duration: `${(seededRandom(i * 5 + 103) * 6 + 6).toFixed(1)}s`,
      size: `${1 + seededRandom(i * 5 + 104) * 2}px`,
    }));
  }, [vfxMode]);

  // ─── Volumetric rays (desktop only) ───────────────────────────────────────
  const volRays = useMemo(() => {
    if (vfxMode !== "high") return [];
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (360 / 8) * i,
      opacity: 0.15 + seededRandom(i * 11) * 0.15,
      height: 200 + seededRandom(i * 11 + 1) * 150,
    }));
  }, [vfxMode]);

  return (
    <div className={`intro-scene ${isExiting ? "intro-exit" : ""}`}>

      {/* ── Layer 0: Canvas Particle Engine ── */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
          phase2 ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform" }}
      />

      {/* ── Layer 1: Digital Fog ── */}
      {phase2 && <div className="intro-fog" />}

      {/* ── Layer 2: Holographic Grid Floor ── */}
      {phase2 && <div className="intro-grid-floor" />}

      {/* ── Layer 3: Cinematic Bloom ── */}
      {phase1 && (
        <div
          className="intro-bloom"
          style={{
            width: phase4 ? "500px" : "300px",
            height: phase4 ? "500px" : "300px",
            transition: "width 2s ease, height 2s ease",
          }}
        />
      )}

      {/* ── Layer 4: Scan Line Sweep ── */}
      {showScanline && <div className="intro-scanline" />}

      {/* ── Layer 5: CSS Floating Particles ── */}
      {phase2 && cssParticles.map((p, i) => (
        <div
          key={`p-${i}`}
          className="intro-particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      {/* ── Layer 6: Floating Code Lines ── */}
      {phase2 && floatingCodeLines.map((line, i) => (
        <div
          key={`cl-${i}`}
          className="intro-code-line"
          style={{
            left: line.left,
            animationDelay: line.delay,
            animationDuration: line.duration,
          }}
        >
          {line.text}
        </div>
      ))}

      {/* ── Layer 7: Volumetric Light Rays (High VFX only) ── */}
      {phase4 && volRays.map((ray, i) => (
        <div
          key={`vr-${i}`}
          className="intro-vol-ray"
          style={{
            transform: `translate(-50%, -50%) rotate(${ray.angle}deg)`,
            opacity: ray.opacity,
            height: `${ray.height}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* ── Layer 8: Holographic Data Rings ── */}
      {phase4 && (
        <>
          <div className="intro-data-ring" style={{ width: 220, height: 220 }} />
          <div className="intro-data-ring ring-reverse" style={{ width: 300, height: 300 }} />
          {vfxMode === "high" && (
            <div className="intro-data-ring" style={{ width: 380, height: 380, animationDuration: "12s" }} />
          )}
        </>
      )}

      {/* ── Layer 9: Electric Arcs (High VFX only) ── */}
      {arcs.map((arc) => (
        <div
          key={arc.id}
          className="intro-arc"
          style={{
            top: arc.top,
            left: arc.left,
            width: arc.width,
            transform: `rotate(${arc.angle}deg)`,
          }}
        />
      ))}

      {/* ── Layer 10: Energy Pulse Waves ── */}
      {pulseWaves.map((id) => (
        <div key={`pw-${id}`} className="intro-pulse-wave" />
      ))}

      {/* ── Layer 11: Glass Code Panels ── */}
      {phase3 && codePanels.map((panel, i) => (
        <div
          key={`cp-${i}`}
          className={`intro-code-panel ${panel.side === "left" ? "panel-left" : ""} hidden sm:block`}
          style={{
            top: panel.top,
            ...(panel.side === "right" ? { right: panel.right } : { left: panel.left }),
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {panel.lines.map((line, li) => (
            <div key={li} className="leading-relaxed">{line}</div>
          ))}
        </div>
      ))}

      {/* ── HERO CENTER CONTENT ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">

        {/* Logo Hero Container */}
        <div
          className="relative mb-8 transition-all ease-out"
          style={{
            transform: phase4
              ? "perspective(800px) rotateY(0deg) scale(1)"
              : "perspective(800px) rotateY(-5deg) scale(0.95)",
            transitionDuration: "1.5s",
          }}
        >
          {/* Glow ring around logo */}
          <div
            className="intro-logo-ring transition-opacity duration-1000"
            style={{ opacity: phase1 ? 1 : 0 }}
          />

          {/* Logo image */}
          <div
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/90 transition-all duration-[2000ms]"
            style={{
              boxShadow: phase4
                ? "0 0 50px rgba(6, 182, 212, 0.35), 0 0 100px rgba(6, 182, 212, 0.15), 0 0 20px rgba(239, 68, 68, 0.1)"
                : "0 0 20px rgba(6, 182, 212, 0.1)",
            }}
          >
            <img
              src="/logo.jpeg"
              alt="CodeXa Logo"
              className="w-full h-full object-contain"
            />

            {/* Scanner beam over logo */}
            {phase2 && <div className="intro-logo-scanner" />}
          </div>

          {/* Holographic mini cube (High VFX, desktop) */}
          {phase4 && vfxMode === "high" && (
            <div className="absolute -right-16 -top-4 hidden sm:block" style={{ perspective: "400px" }}>
              <div className="intro-holo-cube">
                <div className="hc-face hc-front" />
                <div className="hc-face hc-back" />
                <div className="hc-face hc-right" />
                <div className="hc-face hc-left" />
                <div className="hc-face hc-top" />
                <div className="hc-face hc-bottom" />
              </div>
            </div>
          )}
        </div>

        {/* Main Title Text */}
        <div className="h-20 flex flex-col items-center justify-center text-center mb-4">
          {phase5 && (
            <>
              <h1
                className="intro-text-reveal text-2xl sm:text-3xl font-extrabold tracking-[0.15em] text-white font-mono uppercase"
                style={{
                  textShadow: "0 0 15px rgba(6, 182, 212, 0.5), 0 0 30px rgba(6, 182, 212, 0.2)",
                }}
              >
                CODEXA AGENCY
              </h1>
              <h2
                className="intro-text-reveal text-[9px] sm:text-[11px] font-bold text-cyan-400 tracking-[0.25em] uppercase mt-2"
                style={{ animationDelay: "0.3s" }}
              >
                FREE DEVELOPER INTERNSHIP PORTAL
              </h2>
            </>
          )}
        </div>

        {/* Terminal Console */}
        <div
          className={`w-full max-w-xs sm:max-w-sm transition-opacity duration-700 ${
            phase5 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="cyber-glass rounded-xl p-3 border border-cyan-950/60 bg-[#010309]/80">
            {/* Terminal header */}
            <div className="flex justify-between items-center text-[8px] font-mono text-cyan-500/50 border-b border-cyan-950/40 pb-1.5 mb-2">
              <span className="tracking-widest">AXIS_BOOTLOADER</span>
              <span className="text-emerald-400 animate-pulse">● LIVE</span>
            </div>

            {/* Terminal lines */}
            <div className="font-mono text-[9px] space-y-1 min-h-[60px]">
              {TERMINAL_LINES.slice(0, visibleTermLines).map((line, idx) => (
                <div
                  key={idx}
                  className="intro-terminal-line flex items-center"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <span className="text-cyan-600 mr-1.5">&gt;</span>
                  <span className={`${idx === visibleTermLines - 1 ? "text-cyan-400" : "text-cyan-400/50"}`}>
                    {line.text}
                  </span>
                  {idx === visibleTermLines - 1 && (
                    <span className="w-1 h-3 bg-cyan-400 inline-block ml-1 cursor-blink" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Progress Bar */}
        <div
          className={`w-full max-w-xs sm:max-w-sm mt-6 transition-opacity duration-500 ${
            phase6 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex justify-between text-[8px] font-mono text-cyan-400/70 mb-1.5 tracking-wider">
            <span>INITIALIZING APPLICATION SYSTEM</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-2 bg-[#010309] border border-cyan-950/50 rounded-full p-[1.5px] overflow-hidden">
            <div
              className="intro-loading-bar h-full rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #1e40af, #06b6d4, #22d3ee)",
                boxShadow: "0 0 10px rgba(6, 182, 212, 0.5), 0 0 25px rgba(6, 182, 212, 0.2)",
              }}
            />
          </div>

          {/* Status text under bar */}
          {phase7 && (
            <div className="text-center mt-2">
              <span className="text-[8px] font-mono text-emerald-400/60 tracking-widest animate-pulse">
                SYSTEM READY — ENTERING PORTAL
              </span>
            </div>
          )}
        </div>

        {/* VFX Mode indicator (subtle) */}
        <div className="absolute bottom-4 right-4 text-[7px] font-mono text-cyan-950/40 tracking-wider">
          {vfxMode === "high" ? "VFX:HIGH" : "VFX:OPT"}
        </div>
      </div>
    </div>
  );
}
