"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Sparkles,
  Headphones,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { playButtonClick } from "@/lib/audio";

const DEFAULT_SCRIPT =
  "హాయ్... CodeXa Apply కి స్వాగతం. Developer Internship application ప్రారంభించే ముందు, కొన్ని ముఖ్యమైన విషయాలు తెలుసుకుందాం. ఈ application లో మొత్తం ఎనిమిది rounds ఉంటాయి. ప్రతి round లో మీ వివరాలను నిజాయితీగా మరియు సరైన విధంగా నమోదు చేయండి. Application answer fields లో Copy, Cut మరియు Paste అనుమతించబడవు. అయితే GitHub, LinkedIn, Portfolio, Project Link వంటి URL మరియు Link fields లో Copy మరియు Paste ఉపయోగించవచ్చు. Restricted fields లో మొదటి నాలుగు clipboard attempts కి warnings వస్తాయి. ఆ warnings ఉన్నప్పటికీ మీ application ని submit చేయవచ్చు. ఐదవ restricted clipboard attempt జరిగితే, మీ current application progress reset అవుతుంది. Application సమయంలో tab మార్చడం లేదా page focus బయటకు వెళ్లడం review signal గా record కావచ్చు. అది automatic rejection కాదు. మరొక ముఖ్యమైన విషయం... Technical knowledge compulsory కాదు. C, Python, Java లేదా HTML తెలియకపోయినా సమస్య లేదు. మీ actual skill level ఏదైతే ఉందో, దానినే నిజాయితీగా select చేయండి. మీరు application complete చేస్తున్నప్పుడు, మీ progress automatically save అవుతుంది. అందుకే తొందరపడకుండా, ప్రతి question ని జాగ్రత్తగా చదివి, మీ own answers ఇవ్వండి. CodeXa Developer Internship application కి all the best. మీ journey ఇక్కడ నుంచే మొదలవుతుంది.";

interface CodeXaVoiceGuideProps {
  scrollThreshold?: number; // default 350
  autoCollapseOnForm?: boolean;
  className?: string;
}

export default function CodeXaVoiceGuide({
  scrollThreshold = 350,
  autoCollapseOnForm = false,
  className = "",
}: CodeXaVoiceGuideProps) {
  const [isVisible, setIsVisible] = useState(autoCollapseOnForm);
  const [isCollapsed, setIsCollapsed] = useState(autoCollapseOnForm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Scroll trigger detection
  useEffect(() => {
    if (autoCollapseOnForm) {
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      if (scrollY >= scrollThreshold || scrollPercent >= 12) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial position in case page refreshed scrolled down
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold, autoCollapseOnForm]);

  // Clean up audio & ObjectURL on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handlePlayVoice = async () => {
    playButtonClick();

    if (audioRef.current && objectUrlRef.current && audioRef.current.src) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setErrorMessage(null);
        } catch {
          setErrorMessage("Playback failed. Please click play again.");
        }
      }
      return;
    }

    // Fetch AI Voice audio stream from server
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/voice-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guide: "application-rules" }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(
          errorJson.error || "Voice guide is temporarily unavailable. Please read the transcript below."
        );
      }

      const blob = await res.blob();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.muted = isMuted;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 68);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setErrorMessage("Could not play audio. Please view the instructions transcript.");
        setShowTranscript(true);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Voice guide currently unavailable.";
      setErrorMessage(msg);
      setShowTranscript(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = () => {
    playButtonClick();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    playButtonClick();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  if (!isVisible) return null;

  // Collapsed Mode (Small floating pill)
  if (isCollapsed) {
    return (
      <div className={`fixed bottom-5 right-5 z-40 font-mono ${className}`}>
        <button
          type="button"
          onClick={() => {
            playButtonClick();
            setIsCollapsed(false);
          }}
          className="px-4 py-2.5 rounded-full bg-black/90 border border-red-500/50 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 hover:border-red-400 transition-all cursor-pointer backdrop-blur-md"
        >
          <Headphones className="w-4 h-4 text-red-400 animate-pulse" />
          <span>🎧 CODEXA GUIDE (తెలుగు)</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[360px] sm:max-w-[390px] w-[calc(100vw-32px)] font-mono animate-in fade-in slide-in-from-bottom-4 duration-300 select-none ${className}`}
    >
      <div className="rounded-3xl bg-[#080812]/95 border border-red-500/40 p-4 sm:p-5 shadow-[0_0_35px_rgba(239,68,68,0.35)] backdrop-blur-xl space-y-3.5 text-left text-xs">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-red-950/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              CODEXA GUIDE
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 font-bold border border-red-900/60">
              AI TELUGU
            </span>
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                setIsCollapsed(true);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Minimize Guide"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status / Telugu Prompt */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-200 leading-snug">
            {isPlaying
              ? "సూచనలు వినిపిస్తున్నాయి..."
              : isLoading
              ? "AI Voice సిద్ధమవుతోంది..."
              : "అప్లికేషన్ ప్రారంభించే ముందు ముఖ్యమైన సూచనలు వినండి."}
          </p>
          <div className="text-[10px] text-slate-400">
            Natural Onboarding Guide from CodeXa Agency
          </div>
        </div>

        {/* Audio Waveform Animation */}
        <div className="h-6 flex items-center justify-center gap-1 bg-black/60 rounded-xl px-3 border border-red-950/60">
          {[40, 75, 50, 95, 60, 85, 45, 90, 70, 50, 80, 60].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying
                  ? "bg-gradient-to-t from-red-600 to-rose-400 animate-pulse"
                  : "bg-red-950/80 h-1.5"
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.8)) * 0.22)}px` : "3px",
                animationDelay: `${i * 70}ms`,
              }}
            />
          ))}
        </div>

        {/* Audio Timeline & Slider */}
        {duration > 0 && (
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 68}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-red-950 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Error message notice if any */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayVoice}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>సిద్ధమవుతోంది...</span>
              ) : isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>పాజ్</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>వినండి</span>
                </>
              )}
            </button>

            {duration > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleReplay}
                  className="p-2 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="మళ్లీ వినండి"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-2 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              playButtonClick();
              setShowTranscript(!showTranscript);
            }}
            className="text-[11px] text-slate-300 hover:text-white underline underline-offset-4 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3 h-3 text-red-400" />
            <span>{showTranscript ? "దాచు" : "సూచనలు చదవండి"}</span>
          </button>
        </div>

        {/* Transcript Drawer */}
        {showTranscript && (
          <div className="pt-2 border-t border-red-950/80 space-y-2 max-h-48 overflow-y-auto pr-1 text-[11px] text-slate-300 leading-relaxed custom-scrollbar">
            <div className="font-bold text-red-400 uppercase text-[10px]">
              తెలుగు సూచనలు (Telugu Script):
            </div>
            <p className="text-slate-300">{DEFAULT_SCRIPT}</p>

            <div className="font-bold text-rose-400 uppercase text-[10px] pt-1">
              Key Rules Summary:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
              <li>8 Rounds total with continuous autosave.</li>
              <li>Copy/Paste allowed for URLs & Link fields only.</li>
              <li>Warnings 1–4 are review signals and do NOT block submission.</li>
              <li>Technical knowledge is optional (&ldquo;I Don&apos;t Know&rdquo; has zero penalty).</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
