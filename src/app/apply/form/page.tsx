"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CodingBackground from "@/components/CodingBackground";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import OptionCard from "@/components/ui/OptionCard";
import Button3D from "@/components/ui/Button3D";
import Modal from "@/components/ui/Modal";
import ClipboardWarningModal from "@/components/application/ClipboardWarningModal";
import ApplicationResetOverlay from "@/components/application/ApplicationResetOverlay";
import { ApplicationData, ProjectEntry, DeveloperLink, SkillLevel, VibeSkillLevel } from "@/types/application";
import { validateRound } from "@/lib/validation";
import { playButtonClick, playWarningTone, playSuccessSound } from "@/lib/audio";
import { MAX_CLIPBOARD_WARNINGS, isFieldClipboardAllowed, clearApplicationDraft } from "@/lib/integrity";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  Edit2,
  FileCheck,
  FileText,
  Flame,
  HelpCircle,
  Laptop,
  Layers,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trash2,
  UploadCloud,
  User,
} from "lucide-react";

const INITIAL_FORM_DATA: ApplicationData = {
  full_name: "",
  date_of_birth: "",
  email: "",
  phone_number: "",
  whatsapp_number: "",
  city: "",
  state: "",
  country: "India",
  preferred_name: "",
  discord_username: "",
  instagram_handle: "",
  preferred_language: "English",
  hobbies: [],

  college_name: "",
  university_name: "",
  course: "",
  branch: "",
  academic_year: "",
  semester: "",
  roll_number: "",
  expected_graduation: "",
  cgpa: "",
  percentage: "",
  certifications: "",
  achievements: "",
  backlogs: "",

  coding_start_timeline: "",
  has_built_projects: "",
  hackathon_experience: "None",
  internship_experience: "None",
  freelancing_experience: "None",
  open_source_experience: "None",
  team_project_experience: "None",
  developer_links: [],
  projects: [],

  daily_availability: "",
  available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  preferred_timing: ["Evening"],
  can_attend_meetings: "Yes",
  can_meet_deadlines: "Yes",
  academic_constraints: "",
  exam_periods: "",
  can_communicate_if_unavailable: "Yes, always",

  laptop_status: "",
  operating_system: "",
  ram_capacity: "",
  internet_stability: "",
  can_run_dev_tools: "",
  processor: "",
  gpu: "",
  storage_type: "",
  laptop_model: "",
  webcam_available: "Yes",
  mic_available: "Yes",

  c_level: "I Don't Know",
  c_answers: {},

  python_level: "I Don't Know",
  python_answers: {},

  java_level: "I Don't Know",
  java_answers: {},

  html_level: "I Don't Know",
  html_answers: {},

  vibe_coding_level: "Never Used",
  vibe_coding_answers: {},

  mindset_answers: {},

  interview_q1_why_codexa: "",
  interview_q2_why_select: "",
  interview_q3_expectations: "",
  interview_q4_strongest_skills: "",
  interview_q5_weakest_area: "",
  interview_q6_describe_project: "",
  interview_q7_difficult_problem: "",
  interview_q8_ai_coding_usage: "",
  interview_q9_college_balance: "",
  interview_q10_future_goal: "",

  commitment_accurate_info: false,
  commitment_independent_work: false,
  commitment_responsible_communication: false,
  commitment_team_rules: false,
  commitment_confidentiality: false,
  commitment_assigned_duties: false,
  commitment_no_guaranteed_employment: false,
  commitment_accept_policies: false,

  copy_paste_warnings_count: 0,
  tab_switch_count: 0,
};

const HOBBIES_LIST = [
  "Coding",
  "Gaming",
  "AI & ML",
  "Cybersecurity",
  "UI/UX Design",
  "Video Editing",
  "Content Creation",
  "Sports",
  "Music",
  "Photography",
  "Reading",
  "Robotics",
  "Open Source",
  "Anime",
  "Movies",
  "Other",
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMING_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

// Technical Questions Bank for Round 5
const TECHNICAL_QUESTIONS = {
  c: [
    { id: "c_q1", q: "Which header file is required for printf() and scanf() in C?", options: [{ key: "A", text: "#include <stdio.h>" }, { key: "B", text: "#include <stdlib.h>" }, { key: "C", text: "#include <math.h>" }, { key: "D", text: "#include <string.h>" }] },
    { id: "c_q2", q: "What is the standard entry point function of a C program?", options: [{ key: "A", text: "void start()" }, { key: "B", text: "int main()" }, { key: "C", text: "entry()" }, { key: "D", text: "init()" }] },
    { id: "c_q3", q: "Which operator is used to dereference a pointer in C?", options: [{ key: "A", text: "&" }, { key: "B", text: "->" }, { key: "C", text: "*" }, { key: "D", text: "%" }] },
    { id: "c_q4", q: "Where does the malloc() function allocate memory?", options: [{ key: "A", text: "Stack memory" }, { key: "B", text: "Heap memory" }, { key: "C", text: "Code segment" }, { key: "D", text: "CPU Register" }] },
    { id: "c_q5", q: "Which function is used to prevent memory leaks in C by releasing allocated memory?", options: [{ key: "A", text: "free()" }, { key: "B", text: "delete()" }, { key: "C", text: "release()" }, { key: "D", text: "dispose()" }] },
  ],
  python: [
    { id: "python_q1", q: "What is the output of print(2 ** 3) in Python?", options: [{ key: "A", text: "6" }, { key: "B", text: "8" }, { key: "C", text: "9" }, { key: "D", text: "5" }] },
    { id: "python_q2", q: "Which syntax is used to define blocks of code in Python?", options: [{ key: "A", text: "Curly braces {}" }, { key: "B", text: "Parentheses ()" }, { key: "C", text: "Indentation" }, { key: "D", text: "Semicolons ;" }] },
    { id: "python_q3", q: "Which keyword is used to declare a function in Python?", options: [{ key: "A", text: "def" }, { key: "B", text: "function" }, { key: "C", text: "func" }, { key: "D", text: "fn" }] },
    { id: "python_q4", q: "What is the fundamental difference between a List and a Tuple in Python?", options: [{ key: "A", text: "Tuples can only store numbers" }, { key: "B", text: "Lists are immutable, Tuples mutable" }, { key: "C", text: "Lists are mutable, Tuples immutable" }, { key: "D", text: "No difference" }] },
    { id: "python_q5", q: "Which Python construct is used for concise inline list generation?", options: [{ key: "A", text: "List grouping" }, { key: "B", text: "List comprehension" }, { key: "C", text: "Inline loop" }, { key: "D", text: "Map constructor" }] },
  ],
  java: [
    { id: "java_q1", q: "Which of the following is the valid main method signature in Java?", options: [{ key: "A", text: "public void main(String args)" }, { key: "B", text: "public static void main(String[] args)" }, { key: "C", text: "static void main()" }, { key: "D", text: "void main()" }] },
    { id: "java_q2", q: "Which keyword is used to inherit a class in Java?", options: [{ key: "A", text: "implements" }, { key: "B", text: "extends" }, { key: "C", text: "inherits" }, { key: "D", text: "super" }] },
    { id: "java_q3", q: "What executes Java compiled bytecode?", options: [{ key: "A", text: "JDK directly" }, { key: "B", text: "Operating system kernel" }, { key: "C", text: "Java Virtual Machine (JVM)" }, { key: "D", text: "C compiler" }] },
    { id: "java_q4", q: "How is unused object memory reclaimed in Java?", options: [{ key: "A", text: "Automatic Garbage Collection" }, { key: "B", text: "Manual free() calls" }, { key: "C", text: "delete keyword" }, { key: "D", text: "Memory destructor" }] },
    { id: "java_q5", q: "How can multiple inheritance of type be achieved in Java?", options: [{ key: "A", text: "Multiple class extensions" }, { key: "B", text: "Pointer aliases" }, { key: "C", text: "Implementing multiple interfaces" }, { key: "D", text: "Abstract structs" }] },
  ],
  html: [
    { id: "html_q1", q: "Which HTML5 element is used to embed a native video player?", options: [{ key: "A", text: "<media>" }, { key: "B", text: "<embed>" }, { key: "C", text: "<video>" }, { key: "D", text: "<player>" }] },
    { id: "html_q2", q: "Which CSS property changes text color?", options: [{ key: "A", text: "text-style" }, { key: "B", text: "font-color" }, { key: "C", text: "color" }, { key: "D", text: "text-paint" }] },
    { id: "html_q3", q: "Why are semantic HTML tags (<article>, <section>, <nav>) important?", options: [{ key: "A", text: "They make CSS load faster" }, { key: "B", text: "They improve accessibility & SEO structure" }, { key: "C", text: "They are required by JavaScript" }, { key: "D", text: "They compress HTML" }] },
    { id: "html_q4", q: "Which CSS display property creates a 1-dimensional flexible layout?", options: [{ key: "A", text: "display: flex" }, { key: "B", text: "display: block" }, { key: "C", text: "display: inline" }, { key: "D", text: "display: table" }] },
    { id: "html_q5", q: "Which <meta> tag configuration is essential for mobile responsive viewports?", options: [{ key: "A", text: "name='mobile'" }, { key: "B", text: "name='screen'" }, { key: "C", text: "name='resolution'" }, { key: "D", text: "name='viewport' content='width=device-width, initial-scale=1.0'" }] },
  ],
  vibe: [
    { id: "vibe_q1", q: "What is the primary principle of Vibe Coding?", options: [{ key: "A", text: "Manually typing every single byte" }, { key: "B", text: "Steering AI with architecture, prompt context, and testing" }, { key: "C", text: "Memorizing all web APIs" }, { key: "D", text: "Ignoring tests" }] },
    { id: "vibe_q2", q: "In an AI coding workflow, what is the best way to verify AI-generated code?", options: [{ key: "A", text: "Deploy straight to production without checking" }, { key: "B", text: "Inspect, test, run build verification, and review diffs" }, { key: "C", text: "Delete all files" }, { key: "D", text: "Rely 100% on model outputs" }] },
    { id: "vibe_q3", q: "What provides the highest quality output when prompting AI for code?", options: [{ key: "A", text: "Clear architectural requirements, constraints & expected output format" }, { key: "B", text: "One word prompts" }, { key: "C", text: "Asking for everything at once" }, { key: "D", text: "Vague descriptions" }] },
    { id: "vibe_q4", q: "Why is TypeScript especially valuable during Vibe Coding?", options: [{ key: "A", text: "It replaces HTML" }, { key: "B", text: "It slows down compilers" }, { key: "C", text: "Type checks instantly catch invalid AI-generated property accesses" }, { key: "D", text: "It encrypts files" }] },
    { id: "vibe_q5", q: "What is the safest Git workflow when building with AI agents?", options: [{ key: "A", text: "Commit everything to main without review" }, { key: "B", text: "Feature branches, frequent small commits, and reviewing diffs" }, { key: "C", text: "Never use Git" }, { key: "D", text: "Force push always" }] },
  ],
};

// Mindset Questions for Round 6
const MINDSET_QUESTIONS = [
  {
    key: "mindset_q1",
    num: "01",
    q: "You joined the internship and after 3 days a task feels difficult. What will you do?",
    options: [
      { key: "A", text: "Leave the internship silently" },
      { key: "B", text: "Ask for help, understand mistakes, and try again" },
      { key: "C", text: "Blame the team" },
      { key: "D", text: "Stop checking the portal" },
    ],
  },
  {
    key: "mindset_q2",
    num: "02",
    q: "You are given AI tools for development. What is the correct way to use them?",
    options: [
      { key: "A", text: "Copy everything without understanding" },
      { key: "B", text: "Use AI to learn, debug, and improve my own work" },
      { key: "C", text: "Share private access with external users" },
      { key: "D", text: "Generate random code and submit without testing" },
    ],
  },
  {
    key: "mindset_q3",
    num: "03",
    q: "If a teammate is working slower than you on a project, what will you do?",
    options: [
      { key: "A", text: "Make fun of them" },
      { key: "B", text: "Help them if possible and keep team progress smooth" },
      { key: "C", text: "Ignore them completely" },
      { key: "D", text: "Complain without offering help" },
    ],
  },
  {
    key: "mindset_q4",
    num: "04",
    q: "You completed a module using AI assistance. What should you do?",
    options: [
      { key: "A", text: "Submit without checking" },
      { key: "B", text: "Test it, understand it, and mention if AI helped" },
      { key: "C", text: "Pretend everything was typed manually" },
      { key: "D", text: "Delete the code" },
    ],
  },
  {
    key: "mindset_q5",
    num: "05",
    q: "A client project deadline is close and your part is pending. What will you do?",
    options: [
      { key: "A", text: "Inform the team lead early and ask for guidance" },
      { key: "B", text: "Disappear and switch off phone" },
      { key: "C", text: "Wait until the final hour" },
      { key: "D", text: "Blame connectivity without attempting" },
    ],
  },
  {
    key: "mindset_q6",
    num: "06",
    q: "If you don't understand a coding concept, what is your first step?",
    options: [
      { key: "A", text: "Quit immediately" },
      { key: "B", text: "Search documentation, try examples, ask doubts, and practice" },
      { key: "C", text: "Say coding is impossible" },
      { key: "D", text: "Skip everything" },
    ],
  },
  {
    key: "mindset_q7",
    num: "07",
    q: "Which statement describes your primary motivation best?",
    options: [
      { key: "A", text: "I only want a certificate for my resume" },
      { key: "B", text: "I want to learn seriously and build real-world projects" },
      { key: "C", text: "I only want free software credits" },
      { key: "D", text: "I do not want assigned responsibilities" },
    ],
  },
  {
    key: "mindset_q8",
    num: "08",
    q: "You found a bug in a shared team repository. What will you do?",
    options: [
      { key: "A", text: "Hide it and ignore it" },
      { key: "B", text: "Report it clearly on GitHub and try to fix it" },
      { key: "C", text: "Delete the affected file" },
      { key: "D", text: "Blame another teammate publicly" },
    ],
  },
  {
    key: "mindset_q9",
    num: "09",
    q: "You are selected for a project and another applicant is not. What should you do?",
    options: [
      { key: "A", text: "Stay humble and focus on building high-quality work" },
      { key: "B", text: "Show attitude and boast" },
      { key: "C", text: "Insult other applicants" },
      { key: "D", text: "Stop working" },
    ],
  },
  {
    key: "mindset_q10",
    num: "10",
    q: "You are provided with proprietary CodeXa project code. What is allowed?",
    options: [
      { key: "A", text: "Sell it externally" },
      { key: "B", text: "Use it only for assigned learning and agency work" },
      { key: "C", text: "Share it publicly without authorization" },
      { key: "D", text: "Re-upload to public repositories without permission" },
    ],
  },
];

export default function ApplicationFormPage() {
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [formData, setFormData] = useState<ApplicationData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Draft recovery modal
  const [draftFound, setDraftFound] = useState(false);
  const [draftRound, setDraftRound] = useState(1);

  // Anti-Cheat & 5-Strike Integrity states
  const [copyWarningModal, setCopyWarningModal] = useState<{ open: boolean; warningNum: number }>({
    open: false,
    warningNum: 1,
  });
  const [isResetting, setIsResetting] = useState(false);
  const [tabWarningModal, setTabWarningModal] = useState(false);

  // Submission animation overlay & error retry state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<number>(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // New project modal / form
  const [newProject, setNewProject] = useState<ProjectEntry>({
    id: "",
    name: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
    role: "Full-Stack Developer",
    projectType: "Individual",
    whatYouLearned: "",
  });
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Top ref for smooth scrolling
  const formTopRef = useRef<HTMLDivElement | null>(null);

  // Load draft or verify rules acceptance on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("codexa_application_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.full_name || parsed.email || parsed.current_round > 1) {
            setDraftRound(parsed.current_round || 1);
            setDraftFound(true);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Autosave draft whenever formData or currentRound changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const payload = { ...formData, current_round: currentRound, updated_at: new Date().toISOString() };
      localStorage.setItem("codexa_application_draft", JSON.stringify(payload));
    }
  }, [formData, currentRound]);

  // Tab switch monitor
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFormData((prev) => {
          const count = (prev.tab_switch_count || 0) + 1;
          return { ...prev, tab_switch_count: count };
        });
        setTabWarningModal(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Centralized Clipboard Integrity Violation Trigger (5-Strike Policy)
  const triggerClipboardViolation = (fieldName?: string) => {
    playWarningTone();
    setFormData((prev) => {
      const count = (prev.copy_paste_warnings_count || 0) + 1;
      if (count < MAX_CLIPBOARD_WARNINGS) {
        setCopyWarningModal({ open: true, warningNum: count });
      } else {
        // 5th Strike — Trigger Full Application Reset Sequence
        setIsResetting(true);
      }
      return { ...prev, copy_paste_warnings_count: count };
    });
  };

  // Window-level Capture Listener for Paste, Copy, and Cut on Monitored Answer Fields
  useEffect(() => {
    const handleClipboardAction = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") {
        const name = target.getAttribute("name") || "";
        const type = target.getAttribute("type") || "";

        // Explicit URL & whitelisted link fields are 100% permitted (no violation)
        if (isFieldClipboardAllowed(name, type)) {
          return;
        }

        // Protected application answer field — intercept and register violation!
        e.preventDefault();
        triggerClipboardViolation(name);
      }
    };

    window.addEventListener("paste", handleClipboardAction, true);
    window.addEventListener("copy", handleClipboardAction, true);
    window.addEventListener("cut", handleClipboardAction, true);

    return () => {
      window.removeEventListener("paste", handleClipboardAction, true);
      window.removeEventListener("copy", handleClipboardAction, true);
      window.removeEventListener("cut", handleClipboardAction, true);
    };
  }, []);

  const scrollToTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: string | boolean = value;
    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleHobbyToggle = (hobby: string) => {
    setFormData((prev) => {
      const exists = prev.hobbies.includes(hobby);
      const nextHobbies = exists ? prev.hobbies.filter((h) => h !== hobby) : [...prev.hobbies, hobby];
      return { ...prev, hobbies: nextHobbies };
    });
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const exists = (prev.available_days || []).includes(day);
      const nextDays = exists ? prev.available_days.filter((d) => d !== day) : [...(prev.available_days || []), day];
      return { ...prev, available_days: nextDays };
    });
  };

  const handleTimingToggle = (slot: string) => {
    setFormData((prev) => {
      const exists = (prev.preferred_timing || []).includes(slot);
      const nextSlots = exists ? prev.preferred_timing.filter((s) => s !== slot) : [...(prev.preferred_timing || []), slot];
      return { ...prev, preferred_timing: nextSlots };
    });
  };

  const handleMindsetSelect = (qKey: string, optionKey: string) => {
    playButtonClick();
    setFormData((prev) => ({
      ...prev,
      mindset_answers: { ...prev.mindset_answers, [qKey]: optionKey },
    }));
    if (errors[qKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[qKey];
        return next;
      });
    }
  };

  const handleTechLevelChange = (topic: "c" | "python" | "java" | "html" | "vibe", level: string) => {
    playButtonClick();
    if (topic === "vibe") {
      setFormData((prev) => ({ ...prev, vibe_coding_level: level as VibeSkillLevel }));
    } else {
      setFormData((prev) => ({ ...prev, [`${topic}_level`]: level as SkillLevel }));
    }
  };

  const handleTechQuizAnswer = (topic: "c" | "python" | "java" | "html" | "vibe", qId: string, optKey: string) => {
    playButtonClick();
    const answerField = topic === "vibe" ? "vibe_coding_answers" : (`${topic}_answers` as keyof ApplicationData);
    setFormData((prev) => {
      const current = (prev[answerField] as Record<string, string>) || {};
      return {
        ...prev,
        [answerField]: { ...current, [qId]: optKey },
      };
    });
  };

  const handleAddProjectSubmit = () => {
    if (!newProject.name.trim() || !newProject.description.trim()) return;
    const projectWithId: ProjectEntry = {
      ...newProject,
      id: `proj-${Date.now()}`,
    };
    setFormData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), projectWithId],
      has_built_projects: "Yes, multiple complete projects",
    }));
    setNewProject({
      id: "",
      name: "",
      description: "",
      techStack: "",
      githubUrl: "",
      liveUrl: "",
      role: "Full-Stack Developer",
      projectType: "Individual",
      whatYouLearned: "",
    });
    setIsAddingProject(false);
  };

  const handleRemoveProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== id),
    }));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const isValidExt = /\.(pdf|doc|docx)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isValidExt) {
      alert("Invalid file format. Please upload a PDF, DOC, or DOCX document.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB limit. Please upload a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        resume_url: base64Url,
        resume_file_name: file.name,
        resume_file_size: file.size,
      }));
      playSuccessSound();
    };
    reader.onerror = () => {
      alert("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    playButtonClick();
    setFormData((prev) => ({
      ...prev,
      resume_url: undefined,
      resume_file_name: undefined,
      resume_file_size: undefined,
    }));
  };

  const handleNextRound = () => {
    playButtonClick();
    const roundErrors = validateRound(currentRound, formData);
    if (Object.keys(roundErrors).length > 0) {
      setErrors(roundErrors);
      playWarningTone();
      return;
    }

    setErrors({});
    setCurrentRound((prev) => Math.min(8, prev + 1));
    scrollToTop();
  };

  const handlePrevRound = () => {
    playButtonClick();
    setErrors({});
    if (currentRound > 1) {
      setCurrentRound((prev) => prev - 1);
      scrollToTop();
    } else {
      router.push("/apply/rules");
    }
  };

  const handleJumpToRound = (roundNum: number) => {
    playButtonClick();
    setCurrentRound(roundNum);
    scrollToTop();
  };

  const handleRestoreDraft = () => {
    if (typeof window !== "undefined") {
      const draft = localStorage.getItem("codexa_application_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData(parsed);
          setCurrentRound(parsed.current_round || 1);
        } catch {
          // ignore
        }
      }
    }
    setDraftFound(false);
  };

  const handleDiscardDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("codexa_application_draft");
    }
    setFormData(INITIAL_FORM_DATA);
    setCurrentRound(1);
    setDraftFound(false);
  };

  const handleSubmitFinalApplication = async () => {
    playButtonClick();

    // Import and validate all 8 screening rounds
    const { validateAllRounds } = await import("@/lib/validation");
    const validation = validateAllRounds(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      playWarningTone();
      if (validation.firstInvalidRound && validation.firstInvalidRound !== 8) {
        setCurrentRound(validation.firstInvalidRound);
        scrollToTop();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep(1);

    // Cinematic step-by-step submission progression
    const t1 = setTimeout(() => setSubmissionStep(2), 600);
    const t2 = setTimeout(() => setSubmissionStep(3), 1200);
    const t3 = setTimeout(() => setSubmissionStep(4), 1800);

    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          integrity_meta: {
            clipboardWarnings: formData.copy_paste_warnings_count || 0,
            tabSwitchCount: formData.tab_switch_count || 0,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.reference_id) {
        setSubmissionStep(5);
        playSuccessSound();
        // Clear local draft ONLY after verified database submission success
        clearApplicationDraft();
        setTimeout(() => {
          router.replace(`/apply/success/${json.data.reference_id}`);
        }, 700);
      } else {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        setIsSubmitting(false);
        setSubmissionError(
          json.error || "Submission could not be completed. Your responses are safely kept. Please retry."
        );
        playWarningTone();
      }
    } catch {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsSubmitting(false);
      setSubmissionError(
        "A network connection issue occurred while submitting. Your draft is completely safe. Please click Retry Submission."
      );
      playWarningTone();
    }
  };

  // Helper for determining adaptive question count for Round 5
  const getExpectedQuestionCount = (level: string) => {
    if (level === "Learner" || level === "Learning") return 2;
    if (level === "Basic") return 3;
    if (level === "Average") return 4;
    if (level === "Expert" || level === "Advanced") return 5;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <CodingBackground />
      <Navbar />

      <main ref={formTopRef} className="flex-grow pt-28 pb-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 font-mono">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-red-950/60 pb-4 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Terminal className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-sm font-black text-white uppercase tracking-wider">
                CODEXA SCREENING PIPELINE
              </div>
              <div className="text-[10px] text-red-400">
                ROUND 0{currentRound} OF 08 &mdash; {currentRound === 1 ? "PERSONAL" : currentRound === 2 ? "EDUCATION" : currentRound === 3 ? "DEVELOPER" : currentRound === 4 ? "AVAILABILITY" : currentRound === 5 ? "TECHNICAL" : currentRound === 6 ? "MINDSET" : currentRound === 7 ? "INTERVIEW" : "REVIEW"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-[10px] text-red-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              INTEGRITY ACTIVE
            </span>
            {(formData.copy_paste_warnings_count || 0) > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-[10px] text-amber-300 font-bold animate-pulse">
                WARNINGS: {formData.copy_paste_warnings_count} / {MAX_CLIPBOARD_WARNINGS}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AUTOSAVED
            </span>
            <div className="px-3 py-1 rounded-lg bg-black/60 border border-red-950 text-red-300 font-bold">
              {Math.round((currentRound / 8) * 100)}% COMPLETE
            </div>
          </div>
        </div>

        {/* Desktop Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Content (Left / Middle 8 cols) */}
          <div className="lg:col-span-8 red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 text-left space-y-8">
            
            {/* =========================================================================
                ROUND 1: PERSONAL INFORMATION
               ========================================================================= */}
            {currentRound === 1 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 01</span>
                  <h2 className="text-xl font-bold text-white uppercase">Personal Information</h2>
                  <p className="text-xs text-slate-400">Provide your official identification and contact details.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    error={errors.full_name}
                    placeholder="Enter your full name"
                    required
                  />

                  <Input
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    error={errors.date_of_birth}
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    placeholder="developer@example.com"
                    required
                  />

                  <Input
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    error={errors.phone_number}
                    placeholder="10-digit mobile number"
                    required
                  />

                  <Input
                    label="WhatsApp Number"
                    name="whatsapp_number"
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={handleInputChange}
                    placeholder="WhatsApp number (optional)"
                    optional
                  />

                  <Input
                    label="Preferred Name / Alias"
                    name="preferred_name"
                    value={formData.preferred_name}
                    onChange={handleInputChange}
                    placeholder="What should we call you?"
                    optional
                  />

                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    placeholder="e.g. Hyderabad"
                    required
                  />

                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    error={errors.state}
                    placeholder="e.g. Telangana"
                    required
                  />

                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    error={errors.country}
                    placeholder="India"
                    required
                  />

                  <Input
                    label="Discord Username"
                    name="discord_username"
                    value={formData.discord_username}
                    onChange={handleInputChange}
                    placeholder="username#1234 (optional)"
                    optional
                  />
                </div>

                {/* Hobbies Section (Explicitly Zero Penalty) */}
                <div className="space-y-3 pt-4 border-t border-red-950">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Hobbies & Creative Interests <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-normal">Does NOT affect evaluation score</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HOBBIES_LIST.map((hobby) => {
                      const selected = formData.hobbies.includes(hobby);
                      return (
                        <button
                          key={hobby}
                          type="button"
                          onClick={() => handleHobbyToggle(hobby)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            selected
                              ? "bg-red-950/40 border-red-500 text-white font-bold"
                              : "bg-black/40 border-red-950/60 text-slate-400 hover:border-red-500/40 hover:text-slate-200"
                          }`}
                        >
                          {hobby}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 2: EDUCATION
               ========================================================================= */}
            {currentRound === 2 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 02</span>
                  <h2 className="text-xl font-bold text-white uppercase">Education & Academic Record</h2>
                  <p className="text-xs text-slate-400">Tell us about your college, university, branch, and graduation timeline.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="College / Institution Name"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleInputChange}
                    error={errors.college_name}
                    placeholder="e.g. JNTU College of Engineering"
                    required
                  />

                  <Input
                    label="University / Board"
                    name="university_name"
                    value={formData.university_name}
                    onChange={handleInputChange}
                    error={errors.university_name}
                    placeholder="e.g. JNTUH, VTU, Anna University"
                    required
                  />

                  <Input
                    label="Degree / Course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    error={errors.course}
                    placeholder="e.g. B.Tech, B.E, MCA, BCA, BSc"
                    required
                  />

                  <Input
                    label="Branch / Specialization"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    error={errors.branch}
                    placeholder="e.g. Computer Science, AI, ECE, IT"
                    required
                  />

                  <Select
                    label="Academic Year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    error={errors.academic_year}
                    options={[
                      { value: "1", label: "1st Year" },
                      { value: "2", label: "2nd Year" },
                      { value: "3", label: "3rd Year" },
                      { value: "4", label: "4th Year" },
                      { value: "Graduated", label: "Graduated / Post-Graduate" },
                    ]}
                    required
                  />

                  <Select
                    label="Current Semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    error={errors.semester}
                    options={[
                      { value: "1", label: "Semester 1" },
                      { value: "2", label: "Semester 2" },
                      { value: "3", label: "Semester 3" },
                      { value: "4", label: "Semester 4" },
                      { value: "5", label: "Semester 5" },
                      { value: "6", label: "Semester 6" },
                      { value: "7", label: "Semester 7" },
                      { value: "8", label: "Semester 8" },
                      { value: "N/A", label: "Not Applicable" },
                    ]}
                    required
                  />

                  <Input
                    label="Roll Number / Registration PIN"
                    name="roll_number"
                    value={formData.roll_number}
                    onChange={handleInputChange}
                    error={errors.roll_number}
                    placeholder="e.g. 22071A0501"
                    required
                  />

                  <Input
                    label="Expected Graduation Year"
                    name="expected_graduation"
                    value={formData.expected_graduation}
                    onChange={handleInputChange}
                    error={errors.expected_graduation}
                    placeholder="e.g. 2026 or 2027"
                    required
                  />

                  <Input
                    label="CGPA / Percentage"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    placeholder="e.g. 8.5 or 82% (optional)"
                    optional
                  />

                  <Input
                    label="Certifications / Achievements"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. AWS Certified, Hackathon Winner"
                    optional
                  />
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 3: DEVELOPER PROFILE & PROJECTS
               ========================================================================= */}
            {currentRound === 3 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 03</span>
                  <h2 className="text-xl font-bold text-white uppercase">Developer Presence & Projects</h2>
                  <p className="text-xs text-slate-400">Share your coding background, profiles, and any projects you have built.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="When did you start coding?"
                    name="coding_start_timeline"
                    value={formData.coding_start_timeline}
                    onChange={handleInputChange}
                    error={errors.coding_start_timeline}
                    options={[
                      { value: "Just started (under 3 months)", label: "Just started (under 3 months)" },
                      { value: "3 to 6 months ago", label: "3 to 6 months ago" },
                      { value: "6 to 12 months ago", label: "6 to 12 months ago" },
                      { value: "1 to 2 years ago", label: "1 to 2 years ago" },
                      { value: "2+ years ago", label: "2+ years ago" },
                    ]}
                    required
                  />

                  <Select
                    label="Have you built software projects?"
                    name="has_built_projects"
                    value={formData.has_built_projects}
                    onChange={handleInputChange}
                    error={errors.has_built_projects}
                    options={[
                      { value: "Yes, multiple complete projects", label: "Yes, multiple complete projects" },
                      { value: "Yes, basic learning projects", label: "Yes, basic learning projects" },
                      { value: "Tried but did not complete", label: "Tried but did not complete" },
                      { value: "No, none yet", label: "No, none yet (eager to start)" },
                    ]}
                    required
                  />
                </div>

                {/* Developer Profile Links */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-300">Developer Profile Links (Optional):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="GitHub Profile URL"
                      name="github_link"
                      value={formData.developer_links.find((l) => l.platform === "GitHub")?.url || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const links = prev.developer_links.filter((l) => l.platform !== "GitHub");
                          if (val.trim()) links.push({ platform: "GitHub", url: val.trim() });
                          return { ...prev, developer_links: links };
                        });
                      }}
                      placeholder="https://github.com/username"
                      optional
                    />

                    <Input
                      label="LinkedIn Profile URL"
                      name="linkedin_link"
                      value={formData.developer_links.find((l) => l.platform === "LinkedIn")?.url || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const links = prev.developer_links.filter((l) => l.platform !== "LinkedIn");
                          if (val.trim()) links.push({ platform: "LinkedIn", url: val.trim() });
                          return { ...prev, developer_links: links };
                        });
                      }}
                      placeholder="https://linkedin.com/in/username"
                      optional
                    />

                    <Input
                      label="Portfolio / Website URL"
                      name="portfolio_link"
                      value={formData.developer_links.find((l) => l.platform === "Portfolio")?.url || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const links = prev.developer_links.filter((l) => l.platform !== "Portfolio");
                          if (val.trim()) links.push({ platform: "Portfolio", url: val.trim() });
                          return { ...prev, developer_links: links };
                        });
                      }}
                      placeholder="https://yourportfolio.vercel.app"
                      optional
                    />

                    <Input
                      label="LeetCode / HackerRank URL"
                      name="coding_platform_link"
                      value={formData.developer_links.find((l) => l.platform === "LeetCode")?.url || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const links = prev.developer_links.filter((l) => l.platform !== "LeetCode");
                          if (val.trim()) links.push({ platform: "LeetCode", url: val.trim() });
                          return { ...prev, developer_links: links };
                        });
                      }}
                      placeholder="https://leetcode.com/username"
                      optional
                    />
                  </div>
                </div>

                {/* Dynamic Projects List */}
                <div className="space-y-4 pt-4 border-t border-red-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Project Showcase</h3>
                      <p className="text-[11px] text-slate-400">Add any personal, college, or hackathon projects.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingProject(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD PROJECT</span>
                    </button>
                  </div>

                  {/* Project Cards List */}
                  <div className="space-y-3">
                    {(formData.projects || []).map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="p-4 rounded-2xl bg-black/60 border border-red-950 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-900">
                              {p.techStack}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{p.description}</p>
                          {p.githubUrl && (
                            <a
                              href={p.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-red-400 hover:underline inline-block mt-1"
                            >
                              GitHub: {p.githubUrl}
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(p.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {(formData.projects || []).length === 0 && !isAddingProject && (
                      <div className="text-center py-6 border border-dashed border-red-950 rounded-2xl text-xs text-slate-500">
                        No projects added yet. Click &ldquo;ADD PROJECT&rdquo; to showcase your work (optional).
                      </div>
                    )}
                  </div>

                  {/* Project Add Form Modal / Expandable */}
                  {isAddingProject && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-red-500/40 space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-red-400 border-b border-red-950 pb-2">
                        <span>New Project Entry</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="text-slate-500 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Project Name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="e.g. AI Portfolio Generator"
                          required
                        />
                        <Input
                          label="Tech Stack"
                          value={newProject.techStack}
                          onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                          placeholder="e.g. React, Node.js, Tailwind"
                          required
                        />
                        <Input
                          label="GitHub URL"
                          value={newProject.githubUrl || ""}
                          onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                          placeholder="https://github.com/..."
                          optional
                        />
                        <Input
                          label="Live URL"
                          value={newProject.liveUrl || ""}
                          onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                          placeholder="https://..."
                          optional
                        />
                      </div>
                      <Textarea
                        label="Project Description & What You Learned"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Briefly describe what this project does and what you learned while building it..."
                        required
                      />
                      <Button3D
                        type="button"
                        variant="primary"
                        onClick={handleAddProjectSubmit}
                        className="py-2.5 px-5 text-xs font-bold"
                      >
                        SAVE PROJECT ENTRY
                      </Button3D>
                    </div>
                  )}
                </div>

                {/* Optional Resume Upload Section */}
                <div className="space-y-3 pt-4 border-t border-red-950">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        Optional Resume / Curriculum Vitae (CV)
                      </h3>
                      <p className="text-[11px] text-slate-400">PDF, DOC, or DOCX formats accepted (Maximum file size: 5 MB).</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-normal">Optional &bull; Zero penalty if omitted</span>
                  </div>

                  {formData.resume_url ? (
                    <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-white truncate">{formData.resume_file_name || "Uploaded_Resume.pdf"}</div>
                          <div className="text-[10px] text-emerald-400">
                            {formData.resume_file_size ? `${(formData.resume_file_size / (1024 * 1024)).toFixed(2)} MB` : "Ready"} &bull; Verified & Attached
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="px-3 py-1.5 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/50 text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer">
                          <span>Replace</span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveResume}
                          className="p-1.5 rounded-xl bg-black/60 border border-red-950 hover:border-red-500 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove Resume"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="p-6 border-2 border-dashed border-red-950 hover:border-red-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all bg-black/30 hover:bg-black/50 group">
                      <div className="p-3 rounded-2xl bg-red-950/30 text-red-400 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                          Click to upload your resume (Optional)
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">Supports PDF, DOC, DOCX up to 5 MB</div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 4: AVAILABILITY & HARDWARE
               ========================================================================= */}
            {currentRound === 4 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 04</span>
                  <h2 className="text-xl font-bold text-white uppercase">Availability & Hardware Specifications</h2>
                  <p className="text-xs text-slate-400">Specify your weekly building schedule and device readiness.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Daily Time Availability"
                    name="daily_availability"
                    value={formData.daily_availability}
                    onChange={handleInputChange}
                    error={errors.daily_availability}
                    options={[
                      { value: "Below 1 hour", label: "Below 1 hour" },
                      { value: "1–2 hours", label: "1–2 hours" },
                      { value: "2–3 hours", label: "2–3 hours" },
                      { value: "3–4 hours", label: "3–4 hours" },
                      { value: "4+ hours", label: "4+ hours" },
                    ]}
                    required
                  />

                  <Select
                    label="Laptop / Computer Access"
                    name="laptop_status"
                    value={formData.laptop_status}
                    onChange={handleInputChange}
                    error={errors.laptop_status}
                    options={[
                      { value: "Own Laptop", label: "Own Laptop (Personal device)" },
                      { value: "Shared Laptop", label: "Shared Laptop (Family/College)" },
                      { value: "Will Arrange", label: "Will Arrange for Internship" },
                      { value: "Currently No Laptop", label: "Currently No Laptop" },
                    ]}
                    required
                  />

                  <Select
                    label="Primary Operating System"
                    name="operating_system"
                    value={formData.operating_system}
                    onChange={handleInputChange}
                    error={errors.operating_system}
                    options={[
                      { value: "Windows", label: "Windows" },
                      { value: "Linux", label: "Linux (Ubuntu/Fedora/Arch)" },
                      { value: "macOS", label: "macOS" },
                      { value: "Other", label: "Other" },
                    ]}
                    required
                  />

                  <Select
                    label="Device RAM Capacity"
                    name="ram_capacity"
                    value={formData.ram_capacity}
                    onChange={handleInputChange}
                    error={errors.ram_capacity}
                    options={[
                      { value: "4 GB or below", label: "4 GB or below" },
                      { value: "8 GB", label: "8 GB" },
                      { value: "16 GB", label: "16 GB" },
                      { value: "32 GB+", label: "32 GB+" },
                      { value: "Not sure", label: "Not sure" },
                    ]}
                    required
                  />

                  <Select
                    label="Internet Stability"
                    name="internet_stability"
                    value={formData.internet_stability}
                    onChange={handleInputChange}
                    error={errors.internet_stability}
                    options={[
                      { value: "Stable", label: "Stable (Broadband / Wi-Fi)" },
                      { value: "Mostly stable", label: "Mostly stable" },
                      { value: "Mobile hotspot", label: "Mobile hotspot (4G/5G)" },
                      { value: "Limited", label: "Limited connection" },
                    ]}
                    required
                  />

                  <Select
                    label="Can your device run VS Code + Git comfortably?"
                    name="can_run_dev_tools"
                    value={formData.can_run_dev_tools}
                    onChange={handleInputChange}
                    error={errors.can_run_dev_tools}
                    options={[
                      { value: "Yes", label: "Yes, smoothly" },
                      { value: "Mostly", label: "Mostly, with minor slowdowns" },
                      { value: "No", label: "No" },
                      { value: "Not sure", label: "Not sure" },
                    ]}
                    required
                  />
                </div>

                {/* Days of Week Select */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-300">Available Days in Week *</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const sel = (formData.available_days || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            sel
                              ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                              : "bg-black/60 border-red-950 text-slate-400 hover:border-red-500/40 hover:text-white"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Timing Slots */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-300">Preferred Daily Building Time *</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMING_SLOTS.map((slot) => {
                      const sel = (formData.preferred_timing || []).includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimingToggle(slot)}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            sel
                              ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                              : "bg-black/60 border-red-950 text-slate-400 hover:border-red-500/40 hover:text-white"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Hardware Specs */}
                <div className="space-y-3 pt-4 border-t border-red-950">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Optional Hardware Specifications</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Zero negative penalty if left blank</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Processor / CPU Model"
                      name="processor"
                      value={formData.processor || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. Intel i5 / Ryzen 5 / Apple M1"
                      optional
                    />
                    <Input
                      label="Laptop Brand & Model"
                      name="laptop_model"
                      value={formData.laptop_model || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. Dell Inspiron 15, MacBook Air"
                      optional
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 5: TECHNICAL AWARENESS (ADAPTIVE FLOW)
               ========================================================================= */}
            {currentRound === 5 && (
              <div className="space-y-8">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 05</span>
                  <h2 className="text-xl font-bold text-white uppercase">Technical Awareness</h2>
                  <p className="text-xs text-slate-400">
                    Select your familiarity level for each category. Questions dynamically adapt to your claimed level.
                  </p>
                </div>

                {/* 5 Categories Accordion/Blocks */}
                {(
                  [
                    { key: "c", title: "C Language", field: "c_level", answersField: "c_answers", icon: "⚙️" },
                    { key: "python", title: "Python", field: "python_level", answersField: "python_answers", icon: "🐍" },
                    { key: "java", title: "Java", field: "java_level", answersField: "java_answers", icon: "☕" },
                    { key: "html", title: "HTML & Web Basics", field: "html_level", answersField: "html_answers", icon: "🌐" },
                    { key: "vibe", title: "Vibe Coding & AI Workflows", field: "vibe_coding_level", answersField: "vibe_coding_answers", icon: "⚡" },
                  ] as const
                ).map((topic) => {
                  const currentLevel = (formData[topic.field as keyof ApplicationData] as string) || "I Don't Know";
                  const qCount = getExpectedQuestionCount(currentLevel);
                  const questions = TECHNICAL_QUESTIONS[topic.key].slice(0, qCount);
                  const currentAnswers = (formData[topic.answersField as keyof ApplicationData] as Record<string, string>) || {};

                  return (
                    <div
                      key={topic.key}
                      className="p-5 sm:p-6 rounded-2xl bg-black/60 border border-red-950 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-red-950 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{topic.icon}</span>
                          <h3 className="text-sm font-bold text-white">{topic.title}</h3>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-900">
                          {currentLevel}
                        </span>
                      </div>

                      {/* Level Selection Pill Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-300">Select Claimed Familiarity Level:</label>
                        <div className="flex flex-wrap gap-2">
                          {(topic.key === "vibe"
                            ? ["Never Used", "Learning", "Basic", "Average", "Advanced"]
                            : ["I Don't Know", "Learner", "Basic", "Average", "Expert"]
                          ).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleTechLevelChange(topic.key, lvl)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                currentLevel === lvl
                                  ? "bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                                  : "bg-black border-red-950 text-slate-400 hover:border-red-500/40 hover:text-white"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Case 1: "I Don't Know" or "Never Used" */}
                      {(currentLevel === "I Don't Know" || currentLevel === "Never Used") && (
                        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-slate-300 flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            That&rsquo;s completely okay! Technical knowledge is not compulsory. You can continue with zero score penalty.
                          </span>
                        </div>
                      )}

                      {/* Case 2: Adaptive Quiz Questions */}
                      {qCount > 0 && (
                        <div className="space-y-4 pt-2">
                          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                            Adaptive Assessment ({qCount} Questions):
                          </div>
                          {questions.map((q, qidx) => (
                            <div key={q.id} className="p-3.5 rounded-xl bg-[#070710] border border-red-950/80 space-y-2.5">
                              <div className="text-xs font-bold text-slate-200">
                                Q{qidx + 1}. {q.q}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt) => {
                                  const selected = currentAnswers[q.id] === opt.key;
                                  return (
                                    <OptionCard
                                      key={opt.key}
                                      optionKey={opt.key}
                                      label={opt.text}
                                      selected={selected}
                                      onClick={() => handleTechQuizAnswer(topic.key, q.id, opt.key)}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* =========================================================================
                ROUND 6: MINDSET TEST (10 SCENARIOS)
               ========================================================================= */}
            {currentRound === 6 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 06</span>
                  <h2 className="text-xl font-bold text-white uppercase">Mindset & Work Habits Assessment</h2>
                  <p className="text-xs text-slate-400">
                    10 situational questions assessing responsibility, ownership, communication, and team ethics.
                  </p>
                </div>

                <div className="space-y-5">
                  {MINDSET_QUESTIONS.map((item) => {
                    const chosen = (formData.mindset_answers || {})[item.key];
                    const hasErr = Boolean(errors[item.key]);

                    return (
                      <div
                        key={item.key}
                        className={`p-5 rounded-2xl bg-black/60 border transition-all space-y-3 ${
                          hasErr ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "border-red-950"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white">
                            <span className="text-red-500 mr-2">Q{item.num}.</span>
                            {item.q}
                          </span>
                          {chosen && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((opt) => (
                            <OptionCard
                              key={opt.key}
                              optionKey={opt.key}
                              label={opt.text}
                              selected={chosen === opt.key}
                              onClick={() => handleMindsetSelect(item.key, opt.key)}
                            />
                          ))}
                        </div>
                        {hasErr && <span className="text-[10px] font-bold text-red-400">Please answer this question.</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 7: THOUGHT-PROCESS INTERVIEW (10 ESSAYS)
               ========================================================================= */}
            {currentRound === 7 && (
              <div className="space-y-6">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 07</span>
                  <h2 className="text-xl font-bold text-white uppercase">Thought-Process Interview</h2>
                  <p className="text-xs text-slate-400">
                    Express your motivations, technical problem-solving approaches, and future goals in your own words.
                  </p>
                </div>

                <div className="space-y-5">
                  <Textarea
                    label="1. Why do you want to join CodeXa Agency?"
                    name="interview_q1_why_codexa"
                    value={formData.interview_q1_why_codexa}
                    onChange={handleInputChange}
                    error={errors.interview_q1_why_codexa}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Share what caught your interest about our engineering environment..."
                    required
                  />

                  <Textarea
                    label="2. Why should we select you for this developer cohort?"
                    name="interview_q2_why_select"
                    value={formData.interview_q2_why_select}
                    onChange={handleInputChange}
                    error={errors.interview_q2_why_select}
                    minChars={20}
                    maxChars={1200}
                    placeholder="What unique dedication, consistency, or strengths do you bring..."
                    required
                  />

                  <Textarea
                    label="3. What do you expect to learn and achieve during this internship?"
                    name="interview_q3_expectations"
                    value={formData.interview_q3_expectations}
                    onChange={handleInputChange}
                    error={errors.interview_q3_expectations}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Describe the technical skills and project outcomes you want to achieve..."
                    required
                  />

                  <Textarea
                    label="4. What are your strongest technical or soft skills right now?"
                    name="interview_q4_strongest_skills"
                    value={formData.interview_q4_strongest_skills}
                    onChange={handleInputChange}
                    error={errors.interview_q4_strongest_skills}
                    minChars={20}
                    maxChars={1200}
                    placeholder="e.g. Fast debugging, clean UI design, rapid learning, teamwork..."
                    required
                  />

                  <Textarea
                    label="5. What is currently your weakest area and how do you plan to improve it?"
                    name="interview_q5_weakest_area"
                    value={formData.interview_q5_weakest_area}
                    onChange={handleInputChange}
                    error={errors.interview_q5_weakest_area}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Honest self-awareness is highly respected..."
                    required
                  />

                  <Textarea
                    label="6. Describe one project or script you have built or attempted."
                    name="interview_q6_describe_project"
                    value={formData.interview_q6_describe_project}
                    onChange={handleInputChange}
                    error={errors.interview_q6_describe_project}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Explain what the project does, tech stack used, and your personal role..."
                    required
                  />

                  <Textarea
                    label="7. Describe a difficult bug or coding challenge you faced and how you solved it."
                    name="interview_q7_difficult_problem"
                    value={formData.interview_q7_difficult_problem}
                    onChange={handleInputChange}
                    error={errors.interview_q7_difficult_problem}
                    minChars={20}
                    maxChars={1200}
                    placeholder="How did you diagnose the issue and verify the fix..."
                    required
                  />

                  <Textarea
                    label="8. How do you use AI tools (ChatGPT, Claude, Copilot) when coding?"
                    name="interview_q8_ai_coding_usage"
                    value={formData.interview_q8_ai_coding_usage}
                    onChange={handleInputChange}
                    error={errors.interview_q8_ai_coding_usage}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Explain how you verify, test, and understand code generated by AI..."
                    required
                  />

                  <Textarea
                    label="9. How will you balance college coursework and daily internship building?"
                    name="interview_q9_college_balance"
                    value={formData.interview_q9_college_balance}
                    onChange={handleInputChange}
                    error={errors.interview_q9_college_balance}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Detail your daily time management plan..."
                    required
                  />

                  <Textarea
                    label="10. Where do you want to reach professionally after completing this internship?"
                    name="interview_q10_future_goal"
                    value={formData.interview_q10_future_goal}
                    onChange={handleInputChange}
                    error={errors.interview_q10_future_goal}
                    minChars={20}
                    maxChars={1200}
                    placeholder="Share your 1-2 year career or technical aspirations..."
                    required
                  />
                </div>
              </div>
            )}

            {/* =========================================================================
                ROUND 8: REVIEW & FINAL COMMITMENT POLICY
               ========================================================================= */}
            {currentRound === 8 && (
              <div className="space-y-8">
                <div className="space-y-1 border-b border-red-950 pb-3">
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">ROUND 08</span>
                  <h2 className="text-xl font-bold text-white uppercase">Profile Review & Final Declarations</h2>
                  <p className="text-xs text-slate-400">
                    Review your completed sections. Click &ldquo;EDIT&rdquo; on any round to revise answers before final submission.
                  </p>
                </div>

                {/* Review Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { num: 1, title: "Personal Profile", summary: `${formData.full_name || "N/A"} (${formData.email || ""})` },
                    { num: 2, title: "Education Record", summary: `${formData.college_name || "N/A"} — ${formData.course || ""} ${formData.branch || ""}` },
                    { num: 3, title: "Developer Presence", summary: `${formData.coding_start_timeline || "N/A"} | ${(formData.projects || []).length} projects attached` },
                    { num: 4, title: "Availability & Hardware", summary: `${formData.daily_availability || "N/A"} (${formData.laptop_status || ""}, ${formData.operating_system || ""})` },
                    { num: 5, title: "Technical Awareness", summary: `C: ${formData.c_level} | Py: ${formData.python_level} | Java: ${formData.java_level} | HTML: ${formData.html_level} | Vibe: ${formData.vibe_coding_level}` },
                    { num: 6, title: "Mindset Assessment", summary: "10 / 10 Scenario responses recorded" },
                    { num: 7, title: "Thought-Process Interview", summary: "10 / 10 Essay questions answered" },
                  ].map((rev) => (
                    <div
                      key={rev.num}
                      className="p-4 rounded-2xl bg-black/60 border border-red-950 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-white">
                          <span className="text-red-500 mr-1.5">Round 0{rev.num}:</span>
                          {rev.title}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{rev.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleJumpToRound(rev.num)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>EDIT</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Final Commitment Policy Checkboxes */}
                <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Final Candidate Declarations & Policy Acceptance *</span>
                  </div>

                  <div className="space-y-3">
                    <Checkbox
                      id="c-accurate"
                      name="commitment_accurate_info"
                      checked={formData.commitment_accurate_info}
                      onChange={handleInputChange}
                      error={errors.commitment_accurate_info}
                      label="I certify that all information submitted in this application is accurate and represents my genuine background."
                    />

                    <Checkbox
                      id="c-independent"
                      name="commitment_independent_work"
                      checked={formData.commitment_independent_work}
                      onChange={handleInputChange}
                      error={errors.commitment_independent_work}
                      label="I completed the assessment independently without unauthorized proxy assistance."
                    />

                    <Checkbox
                      id="c-communication"
                      name="commitment_responsible_communication"
                      checked={formData.commitment_responsible_communication}
                      onChange={handleInputChange}
                      error={errors.commitment_responsible_communication}
                      label="I commit to maintaining active, responsible, and professional communication with team leads and peers."
                    />

                    <Checkbox
                      id="c-confidentiality"
                      name="commitment_confidentiality"
                      checked={formData.commitment_confidentiality}
                      onChange={handleInputChange}
                      error={errors.commitment_confidentiality}
                      label="I agree to maintain confidentiality regarding internal CodeXa repository architectures and agency assets."
                    />

                    <Checkbox
                      id="c-duties"
                      name="commitment_assigned_duties"
                      checked={formData.commitment_assigned_duties}
                      onChange={handleInputChange}
                      error={errors.commitment_assigned_duties}
                      label="I commit to fulfilling assigned project milestones to the best of my ability."
                    />

                    <Checkbox
                      id="c-terms"
                      name="commitment_no_guaranteed_employment"
                      checked={formData.commitment_no_guaranteed_employment}
                      onChange={handleInputChange}
                      error={errors.commitment_no_guaranteed_employment}
                      label="I understand that selection is based on comprehensive evaluation and represents an educational project internship."
                    />

                    <Checkbox
                      id="c-policies"
                      name="commitment_accept_policies"
                      checked={formData.commitment_accept_policies}
                      onChange={handleInputChange}
                      error={errors.commitment_accept_policies}
                      label="I accept all terms outlined in the CodeXa Internship Policy and Terms of Service."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Navigation Buttons (Inside Card) */}
            <div className="flex items-center justify-between border-t border-red-950/60 pt-6">
              <Button3D
                type="button"
                variant="secondary"
                onClick={handlePrevRound}
                className="py-3 px-6 text-xs font-bold uppercase"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentRound === 1 ? "RULES" : "BACK"}</span>
              </Button3D>

              {currentRound < 8 ? (
                <Button3D
                  type="button"
                  variant="primary"
                  onClick={handleNextRound}
                  className="py-3.5 px-8 text-xs font-black uppercase tracking-wider"
                >
                  <span>CONTINUE TO ROUND 0{currentRound + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button3D>
              ) : (
                <Button3D
                  type="button"
                  variant="primary"
                  onClick={handleSubmitFinalApplication}
                  className="py-4 px-9 text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.7)]"
                >
                  <span>SUBMIT APPLICATION TO CODEXA</span>
                  <ArrowRight className="w-4 h-4" />
                </Button3D>
              )}
            </div>

          </div>

          {/* Right Sidebar: Step Map & Integrity Telemetry (Desktop 4 cols) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-28">
            
            {/* Step Map Card */}
            <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-red-950 pb-2">
                <span className="text-xs font-bold text-white uppercase">Screening Stages</span>
                <span className="text-[10px] text-red-400 font-bold">{currentRound} / 8</span>
              </div>

              <div className="space-y-2">
                {[
                  { num: 1, name: "Personal Information" },
                  { num: 2, name: "Academic Verification" },
                  { num: 3, name: "Developer Profile" },
                  { num: 4, name: "Availability & Hardware" },
                  { num: 5, name: "Technical Awareness" },
                  { num: 6, name: "Mindset Assessment" },
                  { num: 7, name: "Thought-Process Interview" },
                  { num: 8, name: "Review & Commitment" },
                ].map((s) => {
                  const isCurrent = currentRound === s.num;
                  const isDone = currentRound > s.num;

                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => handleJumpToRound(s.num)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? "bg-red-950/60 border-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : isDone
                          ? "bg-black/50 border-red-950/60 text-slate-300 hover:border-red-500/30"
                          : "bg-black/30 border-transparent text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCurrent
                              ? "bg-red-600 text-white"
                              : isDone
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-black text-slate-600"
                          }`}
                        >
                          {isDone ? "✓" : s.num}
                        </span>
                        <span className="truncate">{s.name}</span>
                      </div>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Integrity Status Card */}
            <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-3 text-left text-xs">
              <div className="flex items-center justify-between border-b border-red-950 pb-2">
                <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <span>Integrity Telemetry</span>
                </span>
                <span className="text-[10px] text-emerald-400">ACTIVE</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Paste Warnings:</span>
                  <span className={formData.copy_paste_warnings_count > 0 ? "text-amber-400 font-bold" : "text-slate-300"}>
                    {formData.copy_paste_warnings_count} / {MAX_CLIPBOARD_WARNINGS}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Focus Lost Events:</span>
                  <span className="text-slate-300">{formData.tab_switch_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Draft Autosave:</span>
                  <span className="text-emerald-400">Continuous</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Draft Recovery Modal */}
      <Modal
        isOpen={draftFound}
        onClose={() => setDraftFound(false)}
        title="Saved Application Draft Found"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            We detected a saved screening draft from your previous session (Round 0{draftRound}/08). Would you like to restore your answers or start fresh?
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <Button3D
              type="button"
              variant="secondary"
              onClick={handleDiscardDraft}
              className="flex-1 py-3 text-xs"
            >
              START FRESH
            </Button3D>
            <Button3D
              type="button"
              variant="primary"
              onClick={handleRestoreDraft}
              className="flex-1 py-3 text-xs font-bold"
            >
              CONTINUE DRAFT
            </Button3D>
          </div>
        </div>
      </Modal>

      {/* Dedicated 5-Strike Clipboard Warning Modal (Warnings 1 to 4) */}
      <ClipboardWarningModal
        open={copyWarningModal.open}
        warningNum={copyWarningModal.warningNum}
        onClose={() => setCopyWarningModal({ open: false, warningNum: 1 })}
      />

      {/* Fullscreen 5th Violation Application Reset Overlay */}
      <ApplicationResetOverlay active={isResetting} />

      {/* Tab Switch Warning Modal */}
      <Modal
        isOpen={tabWarningModal}
        onClose={() => setTabWarningModal(false)}
        title="Focus Alert"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Please remain on the application portal while completing your assessment. Browser focus changes are recorded as review telemetry for human evaluators.
          </p>
          <div className="pt-2">
            <Button3D
              type="button"
              variant="primary"
              onClick={() => setTabWarningModal(false)}
              className="w-full py-3 text-xs font-bold"
            >
              CONTINUE ASSESSMENT
            </Button3D>
          </div>
        </div>
      </Modal>

      {/* Fullscreen Submission Processing Animation Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-[#02040a]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none font-mono">
          <div className="w-full max-w-md space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-950/60 border border-red-500/50 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] ring-pulse-red">
              <Terminal className="w-8 h-8 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                PROCESSING APPLICATION
              </h2>
              <p className="text-xs text-slate-400">
                Please wait while we verify and encrypt your candidate profile...
              </p>
            </div>

            {/* Animated Step Progression */}
            <div className="bg-black/70 rounded-2xl p-5 border border-red-950 space-y-3 text-xs text-left">
              <div className={`flex items-center justify-between ${submissionStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                <span>1. Validating candidate profile...</span>
                <span>{submissionStep >= 1 ? "✓" : "..."}</span>
              </div>
              <div className={`flex items-center justify-between ${submissionStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                <span>2. Verifying screening answers & scoring...</span>
                <span>{submissionStep >= 2 ? "✓" : "..."}</span>
              </div>
              <div className={`flex items-center justify-between ${submissionStep >= 3 ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                <span>3. Generating unique Reference ID...</span>
                <span>{submissionStep >= 3 ? "✓" : "..."}</span>
              </div>
              <div className={`flex items-center justify-between ${submissionStep >= 4 ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                <span>4. Encrypting & storing in CodeXa database...</span>
                <span>{submissionStep >= 4 ? "✓" : "..."}</span>
              </div>
              <div className={`flex items-center justify-between ${submissionStep >= 5 ? "text-red-400 font-bold" : "text-slate-600"}`}>
                <span>5. Submitting to recruitment review pipeline...</span>
                <span>{submissionStep >= 5 ? "✓ COMPLETE" : "..."}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Failure & Retry Dialog */}
      <Modal
        isOpen={Boolean(submissionError)}
        onClose={() => setSubmissionError(null)}
        title="APPLICATION SUBMISSION FAILED"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-white uppercase tracking-wider">Draft Preserved Safely</span>
              <span className="leading-relaxed">{submissionError}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All your 8-round screening responses, written essays, and progress are preserved. You will not lose any data.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <Button3D
              type="button"
              variant="secondary"
              onClick={() => setSubmissionError(null)}
              className="flex-1 py-3 text-xs font-bold"
            >
              REVIEW APPLICATION
            </Button3D>
            <Button3D
              type="button"
              variant="primary"
              onClick={() => {
                setSubmissionError(null);
                handleSubmitFinalApplication();
              }}
              className="flex-1 py-3 text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)]"
            >
              RETRY SUBMISSION
            </Button3D>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
