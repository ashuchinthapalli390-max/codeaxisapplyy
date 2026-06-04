"use client";

import React, { useState, useEffect } from "react";
import CodingBackground from "@/components/CodingBackground";
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

export default function Home() {
  const [stage, setStage] = useState<ApplicationStage>("intro");
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ApplicationData>>({});
  const [submittedData, setSubmittedData] = useState<ApplicationData | null>(null);

  // Draft recovery states
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ step: number; updatedAt: string | null } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const [adminToken, setAdminToken] = useState<string>("");

  // Check for local storage drafts on mount / when intro finishes
  useEffect(() => {
    if (stage === "entry") {
      const draft = loadDraft();
      if (draft && draft.started && draft.step > 0) {
        setHasDraft(true);
        setDraftInfo({ step: draft.step, updatedAt: draft.updatedAt });
        setIsRestoreModalOpen(true);
      }
    }
  }, [stage]);

  const handleIntroComplete = () => {
    setStage("entry");
  };

  const handleStartApplication = () => {
    // Standard fresh launch
    clearDraft();
    setFormData({});
    setWizardStep(1);
    setStage("application");
  };

  const handleContinueDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft.data);
      setWizardStep(draft.step);
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
    setStage("entry");
  };

  return (
    <main className="min-h-screen text-slate-100 relative">
      {/* High-fidelity Cyber Coding Terminal Ambient Background */}
      <CodingBackground />

      {/* STAGE: INTRO ANIMATION */}
      {stage === "intro" && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      {/* STAGE: ENTRY SCREEN */}
      {stage === "entry" && (
        <EntryScreen
          onStartApplication={handleStartApplication}
          onAdminAccess={() => setStage("admin-gate")}
        />
      )}

      {/* STAGE: APPLICATION FORM WIZARD */}
      {stage === "application" && (
        <ApplicationWizard
          initialData={formData}
          initialStep={wizardStep}
          onSuccess={handleSubmitSuccess}
          onBackToEntry={() => setStage("entry")}
        />
      )}

      {/* STAGE: SUCCESS & PDF RECEIPT */}
      {stage === "success" && submittedData && (
        <ApplicantSuccess
          data={submittedData}
          onStartFresh={handleStartFreshSuccess}
        />
      )}

      {/* STAGE: ADMIN SECURITY ACCESS GATE */}
      {stage === "admin-gate" && (
        <AdminGate
          onSuccess={(token) => {
            setAdminToken(token);
            setStage("admin-dashboard");
          }}
          onCancel={() => setStage("entry")}
        />
      )}

      {/* STAGE: ADMIN DASHBOARD CONTROL PANEL */}
      {stage === "admin-dashboard" && adminToken && (
        <AdminDashboard
          token={adminToken}
          onLogout={() => {
            setAdminToken("");
            setStage("entry");
          }}
        />
      )}

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
