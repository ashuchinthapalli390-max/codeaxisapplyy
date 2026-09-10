"use client";

import { useState, useEffect, useCallback } from "react";
import { MAX_CLIPBOARD_WARNINGS, clearApplicationDraft, isClipboardRestricted } from "@/lib/integrity";
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

  // Scoped handler for restricted assessment fields only — NEVER attached globally to window/document
  const handleRestrictedClipboardEvent = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const target = e.target;
    if (isClipboardRestricted(target)) {
      e.preventDefault();
      const fieldName = target instanceof HTMLElement ? target.getAttribute("name") || undefined : undefined;
      registerClipboardViolation(fieldName);
    }
  }, [registerClipboardViolation]);

  // Tab switch / visibility change monitor (strictly for assessing candidate tab switches)
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
    handleRestrictedClipboardEvent,
    closeWarningModal,
    closeTabWarningModal,
  };
}
