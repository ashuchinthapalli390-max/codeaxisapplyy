"use client";

import { useState, useEffect, useCallback } from "react";
import { isFieldClipboardAllowed, MAX_CLIPBOARD_WARNINGS, clearApplicationDraft } from "@/lib/integrity";
import { playWarningTone } from "@/lib/audio";

export interface IntegrityState {
  clipboardWarningsCount: number;
  tabSwitchCount: number;
  isResetting: boolean;
  warningModal: {
    open: boolean;
    warningNum: number;
  };
  tabWarningModal: boolean;
}

export function useApplicationIntegrity(
  onResetTriggered?: () => void
) {
  const [clipboardWarningsCount, setClipboardWarningsCount] = useState<number>(0);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [warningModal, setWarningModal] = useState<{ open: boolean; warningNum: number }>({
    open: false,
    warningNum: 1,
  });
  const [tabWarningModal, setTabWarningModal] = useState<boolean>(false);

  const registerClipboardViolation = useCallback((fieldName?: string) => {
    playWarningTone();
    setClipboardWarningsCount((prev) => {
      const next = prev + 1;
      if (next < MAX_CLIPBOARD_WARNINGS) {
        setWarningModal({ open: true, warningNum: next });
      } else {
        // 5th Strike - Full Application Reset
        setIsResetting(true);
        clearApplicationDraft();
        onResetTriggered?.();
      }
      return next;
    });
  }, [onResetTriggered]);

  const closeWarningModal = useCallback(() => {
    setWarningModal({ open: false, warningNum: 1 });
  }, []);

  const closeTabWarningModal = useCallback(() => {
    setTabWarningModal(false);
  }, []);

  // Global window capture for clipboard operations on protected inputs
  useEffect(() => {
    const handleClipboardEvent = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        const name = target.getAttribute("name") || "";
        const type = target.getAttribute("type") || "";

        // Explicitly whitelisted link fields allow clipboard operations without violation
        if (isFieldClipboardAllowed(name, type)) {
          return;
        }

        // Protected application answer field — block and record violation
        e.preventDefault();
        registerClipboardViolation(name);
      }
    };

    window.addEventListener("paste", handleClipboardEvent, true);
    window.addEventListener("copy", handleClipboardEvent, true);
    window.addEventListener("cut", handleClipboardEvent, true);

    return () => {
      window.removeEventListener("paste", handleClipboardEvent, true);
      window.removeEventListener("copy", handleClipboardEvent, true);
      window.removeEventListener("cut", handleClipboardEvent, true);
    };
  }, [registerClipboardViolation]);

  // Tab switch / visibility change monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setTabWarningModal(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return {
    clipboardWarningsCount,
    setClipboardWarningsCount,
    tabSwitchCount,
    setTabSwitchCount,
    isResetting,
    warningModal,
    tabWarningModal,
    registerClipboardViolation,
    closeWarningModal,
    closeTabWarningModal,
  };
}
