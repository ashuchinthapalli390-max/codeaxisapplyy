"use client";

let isMuted = false;

if (typeof window !== "undefined") {
  try {
    isMuted = localStorage.getItem("codexa_audio_muted") === "true";
  } catch {
    // Fail silent
  }
}

export function setMuted(mute: boolean) {
  isMuted = mute;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("codexa_audio_muted", mute ? "true" : "false");
    } catch {
      // Fail silent
    }
  }
}

export function getMuted() {
  if (typeof window !== "undefined") {
    try {
      isMuted = localStorage.getItem("codexa_audio_muted") === "true";
    } catch {
      // Fail silent
    }
  }
  return isMuted;
}

let introAudio: HTMLAudioElement | null = null;

export function playIntroMusic() {
  if (typeof window === "undefined" || getMuted()) return;
  
  try {
    if (!introAudio) {
      introAudio = new Audio("/audio/intro-music.mp3");
      introAudio.volume = 0.35;
      introAudio.loop = true;
    }
    introAudio.play().catch((err) => {
      console.warn("Intro music play blocked or file missing:", err);
    });
  } catch (err) {
    console.warn("Audio not supported or file missing:", err);
  }
}

export function stopIntroMusic() {
  if (introAudio) {
    try {
      introAudio.pause();
      introAudio.currentTime = 0;
    } catch (err) {
      // Ignore
    }
  }
}

export function playButtonClick() {
  if (typeof window === "undefined" || getMuted()) return;
  try {
    const clickAudio = new Audio("/audio/button-click.mp3");
    clickAudio.volume = 0.55;
    clickAudio.play().catch((err) => {
      // Ignore
    });
  } catch (err) {
    // Ignore
  }
}

export function playSuccessSound() {
  if (typeof window === "undefined" || getMuted()) return;
  try {
    const successAudio = new Audio("/audio/success.mp3");
    successAudio.volume = 0.45;
    successAudio.play().catch((err) => {
      // Ignore
    });
  } catch (err) {
    // Ignore
  }
}
