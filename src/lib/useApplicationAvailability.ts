"use client";

import { useSyncExternalStore } from "react";
import { InternshipRound } from "@/types/admin";
import type { ApplicationAvailability } from "@/lib/availability";

interface AvailabilityState {
  round: InternshipRound | null;
  settings: Record<string, unknown> | null;
  availability: ApplicationAvailability | null;
  serverTimeMs: number;
  serverClockOffset: number;
  canApply: boolean;
  effectiveStatus: "OPEN" | "OPENING_SOON" | "CLOSED" | "PAUSED";
  isLoading: boolean;
}

const defaultState: AvailabilityState = {
  round: null,
  settings: null,
  availability: null,
  serverTimeMs: Date.now(),
  serverClockOffset: 0,
  canApply: true, // optimistic until confirmed
  effectiveStatus: "OPEN",
  isLoading: true,
};

let globalState: AvailabilityState = { ...defaultState };
const listeners = new Set<() => void>();
let fetchPromise: Promise<void> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

async function fetchAvailability() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch("/api/applications/config", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const round = json.data.round || null;
        const settings = json.data.settings || null;
        const avail: ApplicationAvailability | null = json.data.availability || null;
        const srvTime = typeof json.data.server_time_ms === "number" ? json.data.server_time_ms : Date.now();
        const offset = srvTime - Date.now();

        const canApply = avail ? avail.canApply : true;
        const effectiveStatus = avail ? avail.effectiveStatus : "OPEN";

        globalState = {
          round,
          settings,
          availability: avail,
          serverTimeMs: srvTime,
          serverClockOffset: offset,
          canApply,
          effectiveStatus,
          isLoading: false,
        };

        listeners.forEach((listener) => listener());
      }
    } catch {
      // Keep existing state on transient network error, release loading
      if (globalState.isLoading) {
        globalState = { ...globalState, isLoading: false };
        listeners.forEach((listener) => listener());
      }
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

function startGlobalPolling() {
  if (!pollTimer && typeof window !== "undefined") {
    fetchAvailability();
    pollTimer = setInterval(fetchAvailability, 5000);

    const onFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        fetchAvailability();
      }
    };
    window.addEventListener("focus", onFocusOrVisible);
    document.addEventListener("visibilitychange", onFocusOrVisible);
  }
}

function stopGlobalPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  subscriberCount++;

  if (subscriberCount === 1) {
    startGlobalPolling();
  }

  return () => {
    listeners.delete(callback);
    subscriberCount--;
    if (subscriberCount <= 0) {
      subscriberCount = 0;
      stopGlobalPolling();
    }
  };
}

function getSnapshot(): AvailabilityState {
  return globalState;
}

export function useApplicationAvailability() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    ...state,
    refetch: fetchAvailability,
  };
}

