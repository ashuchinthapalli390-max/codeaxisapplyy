"use client";

import React, { useState, useEffect, useCallback } from "react";
import CodingBackground from "@/components/CodingBackground";
import AudioController from "@/components/AudioController";
import StartGate from "@/components/StartGate";
import IntroAnimation from "@/components/IntroAnimation";
import EntryScreen from "@/components/EntryScreen";
import ApplicationWizard from "@/components/ApplicationWizard";
import ApplicantSuccess from "@/components/ApplicantSuccess";
import AdminGate from "@/components/AdminGate";
import AdminDashboard from "@/components/AdminDashboard";
import Modal from "@/components/ui/Modal";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData, ApplicationStage } from "@/types/application";
import { loadDraft, clearDraft } from "@/lib/autosave";

function getSafeWizardStep(step: number) {
  if (!Number.isFinite(step)) return 1;
  return Math.min(9, Math.max(1, Math.trunc(step)));
}

export default function Home() {
  const [stage, setStage] = useState<ApplicationStage>("startGate");
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ApplicationData>>({});
  const [submittedData, setSubmittedData] = useState<ApplicationData | null>(null);

  // Draft recovery states
  const [draftInfo, setDraftInfo] = useState<{ step: number; updatedAt: string | null } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const [adminToken, setAdminToken] = useState<string>("");

  // Check for local storage drafts on mount / when the entry screen is visible
  useEffect(() => {
    if (stage !== "preApplication") return;

    const timer = window.setTimeout(() => {
      const draft = loadDraft();
      if (draft && draft.started && draft.step > 0) {
        setDraftInfo({ step: getSafeWizardStep(draft.step), updatedAt: draft.updatedAt });
        setIsRestoreModalOpen(true);
      } else {
        setDraftInfo(null);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [stage]);

  const handleIntroComplete = useCallback(() => {
    setStage("preApplication");
  }, []);

  const handleStartApplication = useCallback(() => {
    clearDraft();
    setFormData({});
    setWizardStep(1);
    setStage("application");
  }, []);

  const handleContinueDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft.data);
      setWizardStep(getSafeWizardStep(draft.step));
      setStage("application");
    }
    setIsRestoreModalOpen(false);
  };

  const handleStartFreshFromModal = () => {
    clearDraft();
    setFormData({});
    setWizardStep(1);
    setIsRestoreModalOpen(false);
    setStage("application");
  };

  const handleSubmitSuccess = (refId: string, finalData: ApplicationData) => {
    // Clear local storage draft immediately after successful DB insert
    clearDraft();
    setSubmittedData(finalData);
    setStage("success");
  };

  const handleStartFreshSuccess = () => {
    setFormData({});
    setSubmittedData(null);
    setWizardStep(1);
    setStage("preApplication");
  };

  const renderStage = () => {
    if (stage === "startGate") {
      return <StartGate onStart={() => setStage("intro")} />;
    }

    if (stage === "intro") {
      return <IntroAnimation onComplete={handleIntroComplete} />;
    }

    if (stage === "preApplication") {
      return (
        <EntryScreen
          onStartApplication={handleStartApplication}
          onAdminAccess={() => setStage("admin-gate")}
        />
      );
    }

    if (stage === "application") {
      return (
        <ApplicationWizard
          initialData={formData}
          initialStep={wizardStep}
          onSuccess={handleSubmitSuccess}
          onBackToEntry={() => setStage("preApplication")}
        />
      );
    }

    if (stage === "success") {
      if (submittedData) {
        return (
          <ApplicantSuccess
            data={submittedData}
            onStartFresh={handleStartFreshSuccess}
          />
        );
      }
      return (
        <EntryScreen
          onStartApplication={handleStartApplication}
          onAdminAccess={() => setStage("admin-gate")}
        />
      );
    }

    if (stage === "admin-gate") {
      return (
        <AdminGate
          onSuccess={(token) => {
            setAdminToken(token);
            setStage("admin-dashboard");
          }}
          onCancel={() => setStage("preApplication")}
        />
      );
    }

    if (stage === "admin-dashboard" && adminToken) {
      return (
        <AdminDashboard
          token={adminToken}
          onLogout={() => {
            setAdminToken("");
            setStage("preApplication");
          }}
        />
      );
    }

    // Unknown or invalid stage — always show pre-application screen
    return (
      <EntryScreen
        onStartApplication={handleStartApplication}
        onAdminAccess={() => setStage("admin-gate")}
      />
    );
  };

  return (
    <main className="min-h-screen text-slate-100 relative z-0">
      <CodingBackground />
      <AudioController />
      <div className="relative z-10">{renderStage()}</div>

      {/* DRAFT RESTORATION DIALOG MODAL */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Saved Draft Recovered"
      >
        <div className="space-y-4">
          <p className="leading-relaxed">
            We detected a saved application draft from your previous session (Step {draftInfo?.step}/9).
          </p>
          {draftInfo?.updatedAt && (
            <div className="text-[10px] text-slate-500 font-mono">
              LAST MODIFIED: {new Date(draftInfo.updatedAt).toLocaleString()}
            </div>
          )}
          <div className="flex items-center space-x-3 pt-2">
            <Button3D
              type="button"
              variant="secondary"
              onClick={handleStartFreshFromModal}
              className="flex-1"
            >
              START FRESH
            </Button3D>
            
            <Button3D
              type="button"
              variant="primary"
              onClick={handleContinueDraft}
              className="flex-2"
            >
              CONTINUE DRAFT
            </Button3D>
          </div>
        </div>
      </Modal>
    </main>
  );
}
