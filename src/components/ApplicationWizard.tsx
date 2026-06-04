"use client";

import React, { useState, useEffect, useRef } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import OptionCard from "@/components/ui/OptionCard";
import Button3D from "@/components/ui/Button3D";
import { ApplicationData } from "@/types/application";
import { validateStep } from "@/lib/validation";
import { saveDraft } from "@/lib/autosave";

interface ApplicationWizardProps {
  initialData?: Partial<ApplicationData>;
  initialStep?: number;
  onSuccess: (referenceId: string, data: ApplicationData) => void;
  onBackToEntry: () => void;
}

const INITIAL_FORM: ApplicationData = {
  full_name: "",
  date_of_birth: "",
  email: "",
  phone_number: "",
  whatsapp_number: "",
  discord_username: "",
  city_state: "",

  college_name: "",
  course: "",
  branch: "",
  academic_year: "",
  semester: "",
  roll_number: "",

  github_link: "",
  portfolio_link: "",
  linkedin_link: "",

  coding_level: "",
  device_status: "",
  daily_availability: "",
  module_readiness: "",

  project_experience: "",
  future_build_goal: "",
  join_reason: "",
  selection_reason: "",

  mindset_q1: "",
  mindset_q2: "",
  mindset_q3: "",
  mindset_q4: "",
  mindset_q5: "",
  mindset_q6: "",
  mindset_q7: "",
  mindset_q8: "",
  mindset_q9: "",
  mindset_q10: "",

  python_awareness: "",
  python_q1: "",
  python_q2: "",

  java_awareness: "",
  java_q1: "",
  java_q2: "",

  js_ts_awareness: "",
  js_ts_q1: "",
  js_ts_q2: "",

  webstack_awareness: "",
  webstack_q1: "",
  webstack_q2: "",

  vibe_coding_awareness: "",
  vibe_coding_q1: "",
  vibe_coding_q2: "",

  ai_prompting_awareness: "",
  ai_prompting_q1: "",
  ai_prompting_q2: "",

  github_projects_awareness: "",
  github_projects_q1: "",
  github_projects_q2: "",

  failure_experience_answer: "",
  trust_with_tools_answer: "",
  priority_answer: "",
  not_selected_answer: "",
  code_understanding_answer: "",

  agreement_free_internship: false,
  agreement_selection_quality: false,
  agreement_step_by_step: false,
  agreement_no_misuse: false,
  agreement_revenue_share: false,
};

// Scenario assessment questions
const MINDSET_QUESTIONS = [
  {
    key: "mindset_q1",
    num: "01 / 10",
    q: "You joined the internship but after 3 days tasks feel difficult. What will you do?",
    options: [
      { key: "A", text: "Leave the internship silently" },
      { key: "B", text: "Ask for help, understand mistakes, and try again" },
      { key: "C", text: "Blame the team" },
      { key: "D", text: "Stop opening the portal" },
    ],
  },
  {
    key: "mindset_q2",
    num: "02 / 10",
    q: "You got access to AI tools. What is the correct way to use them?",
    options: [
      { key: "A", text: "Copy everything without understanding" },
      { key: "B", text: "Use AI to learn, debug, and improve my own work" },
      { key: "C", text: "Share private access with others" },
      { key: "D", text: "Generate random code and submit directly" },
    ],
  },
  {
    key: "mindset_q3",
    num: "03 / 10",
    q: "If a teammate is slower than you, what will you do?",
    options: [
      { key: "A", text: "Make fun of them" },
      { key: "B", text: "Help them if possible and keep team progress smooth" },
      { key: "C", text: "Ignore them always" },
      { key: "D", text: "Complain without helping" },
    ],
  },
  {
    key: "mindset_q4",
    num: "04 / 10",
    q: "You completed a task using AI help. What should you do?",
    options: [
      { key: "A", text: "Submit without checking" },
      { key: "B", text: "Test it, understand it, and mention if AI helped" },
      { key: "C", text: "Pretend everything was done manually" },
      { key: "D", text: "Delete the code" },
    ],
  },
  {
    key: "mindset_q5",
    num: "05 / 10",
    q: "A client project deadline is close and your part is pending. What will you do?",
    options: [
      { key: "A", text: "Inform the team early and ask for support" },
      { key: "B", text: "Disappear" },
      { key: "C", text: "Wait until last minute" },
      { key: "D", text: "Blame internet issues without trying" },
    ],
  },
  {
    key: "mindset_q6",
    num: "06 / 10",
    q: "If you don't understand a concept, what is your first step?",
    options: [
      { key: "A", text: "Quit immediately" },
      { key: "B", text: "Search, try, ask doubts, and practice" },
      { key: "C", text: "Say coding is impossible" },
      { key: "D", text: "Skip everything" },
    ],
  },
  {
    key: "mindset_q7",
    num: "07 / 10",
    q: "Which one describes you best?",
    options: [
      { key: "A", text: "I only want certificate" },
      { key: "B", text: "I want to learn seriously and build real projects" },
      { key: "C", text: "I only want free tools" },
      { key: "D", text: "I do not want tasks" },
    ],
  },
  {
    key: "mindset_q8",
    num: "08 / 10",
    q: "You found a bug in a team project. What will you do?",
    options: [
      { key: "A", text: "Hide it" },
      { key: "B", text: "Report it clearly and try to fix it" },
      { key: "C", text: "Delete the file" },
      { key: "D", text: "Blame another teammate" },
    ],
  },
  {
    key: "mindset_q9",
    num: "09 / 10",
    q: "You are selected but another applicant is rejected. What should you do?",
    options: [
      { key: "A", text: "Stay humble and focus on learning" },
      { key: "B", text: "Show attitude" },
      { key: "C", text: "Insult others" },
      { key: "D", text: "Stop working" },
    ],
  },
  {
    key: "mindset_q10",
    num: "10 / 10",
    q: "You are given a project file from CodeAxis / Codexa. What is allowed?",
    options: [
      { key: "A", text: "Sell it outside" },
      { key: "B", text: "Use it only for assigned learning/work" },
      { key: "C", text: "Share it publicly" },
      { key: "D", text: "Upload it anywhere without permission" },
    ],
  },
];

// Coding topics sub-questions
const CODING_TOPICS = [
  {
    key: "python",
    name: "Python",
    q1: "What is the output of print(2 ** 3) in Python?",
    q1Options: [
      { key: "A", text: "6" },
      { key: "B", text: "8" },
      { key: "C", text: "9" },
      { key: "D", text: "5" },
    ],
    q2: "Which of the following is used to define a block of code in Python?",
    q2Options: [
      { key: "A", text: "Curly braces" },
      { key: "B", text: "Parentheses" },
      { key: "C", text: "Indentation" },
      { key: "D", text: "Semicolons" },
    ],
  },
  {
    key: "java",
    name: "Java",
    q1: "Which of the following is the entry point method in Java?",
    q1Options: [
      { key: "A", text: "void start()" },
      { key: "B", text: "public static void main(String[] args)" },
      { key: "C", text: "main()" },
      { key: "D", text: "public void main()" },
    ],
    q2: "Which keyword is used to create a subclass in Java?",
    q2Options: [
      { key: "A", text: "implements" },
      { key: "B", text: "extends" },
      { key: "C", text: "inherits" },
      { key: "D", text: "imports" },
    ],
  },
  {
    key: "js_ts",
    name: "JavaScript / TypeScript",
    q1: "Which keyword is used to declare a variable that cannot be reassigned?",
    q1Options: [
      { key: "A", text: "let" },
      { key: "B", text: "var" },
      { key: "C", text: "const" },
      { key: "D", text: "def" },
    ],
    q2: "What is the output of typeof null in JavaScript?",
    q2Options: [
      { key: "A", text: "'null'" },
      { key: "B", text: "'undefined'" },
      { key: "C", text: "'object'" },
      { key: "D", text: "'string'" },
    ],
  },
  {
    key: "webstack",
    name: "WebStack (HTML/CSS)",
    q1: "Which HTML5 tag is used to embed a native video player?",
    q1Options: [
      { key: "A", text: "<media>" },
      { key: "B", text: "<embed>" },
      { key: "C", text: "<video>" },
      { key: "D", text: "<iframe>" },
    ],
    q2: "Which CSS property is used to change the text color?",
    q2Options: [
      { key: "A", text: "font-color" },
      { key: "B", text: "text-color" },
      { key: "C", text: "color" },
      { key: "D", text: "font-style" },
    ],
  },
  {
    key: "vibe_coding",
    name: "Vibe Coding",
    q1: "What does Vibe Coding primarily emphasize?",
    q1Options: [
      { key: "A", text: "Writing assembly code manually" },
      { key: "B", text: "Guiding AI using high-level concepts and prompts to generate code rapidly" },
      { key: "C", text: "Memorizing all web developer APIs" },
      { key: "D", text: "Refusing to use computers" },
    ],
    q2: "In Vibe Coding, what is the best way to verify AI output?",
    q2Options: [
      { key: "A", text: "Run it immediately in production without reading" },
      { key: "B", text: "Inspect, test, and iterate on code blocks using runtimes" },
      { key: "C", text: "Delete the code" },
      { key: "D", text: "Trust it blindly" },
    ],
  },
  {
    key: "ai_prompting",
    name: "AI Prompting",
    q1: "What is 'Few-Shot Prompting'?",
    q1Options: [
      { key: "A", text: "Giving the model examples of input-output pairs before asking for response" },
      { key: "B", text: "Asking the model only short questions" },
      { key: "C", text: "Generating responses in one word" },
      { key: "D", text: "Prompting the model multiple times in parallel" },
    ],
    q2: "Which technique encourages the model to explain its reasoning step-by-step?",
    q2Options: [
      { key: "A", text: "Zero-shot" },
      { key: "B", text: "Chain-of-Thought" },
      { key: "C", text: "Temperature adjustment" },
      { key: "D", text: "System instructions" },
    ],
  },
  {
    key: "github_projects",
    name: "GitHub / Projects",
    q1: "Which git command is used to record changes in the repository history?",
    q1Options: [
      { key: "A", text: "git add" },
      { key: "B", text: "git commit" },
      { key: "C", text: "git push" },
      { key: "D", text: "git status" },
    ],
    q2: "What is a Pull Request (PR) on GitHub?",
    q2Options: [
      { key: "A", text: "A request to delete a repository" },
      { key: "B", text: "A request to merge changes from one branch to another" },
      { key: "C", text: "A tool to download packages" },
      { key: "D", text: "A security warning" },
    ],
  },
];

export default function ApplicationWizard({
  initialData = {},
  initialStep = 1,
  onSuccess,
  onBackToEntry,
}: ApplicationWizardProps) {
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<ApplicationData>({
    ...INITIAL_FORM,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Autosave setup (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      saveDraft(formData, step, true);
    }, 500);
    return () => clearTimeout(delay);
  }, [formData, step]);

  // Scroll to top on step change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear step error once user inputs value
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleOptionSelect = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Scroll to first error element
      const firstError = Object.keys(stepErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    setStep((prev) => Math.min(9, prev + 1));
  };

  const handleBack = () => {
    setErrors({});
    if (step === 1) {
      onBackToEntry();
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stepErrors = validateStep(9, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.data?.reference_id) {
        onSuccess(result.data.reference_id, {
          ...formData,
          reference_id: result.data.reference_id,
          created_at: new Date().toISOString(),
        });
      } else {
        setSubmitError(result.error || "Submission failed. Your progress is saved. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError("Submission failed. Your progress is saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col justify-center min-h-screen px-4 py-8">
      {/* Container - mobile locked width */}
      <div className="w-full max-w-md mx-auto cyber-glass rounded-3xl p-5 md:p-6 flex flex-col relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500" />
        <div className="absolute top-3 left-4 text-[9px] font-mono text-cyan-500/40">STEP {step} / 9</div>
        <div className="absolute top-3 right-4 text-[9px] font-mono text-cyan-500/40">SECURE_LINK</div>

        {/* Progress bar */}
        <div className="w-full mt-6 mb-6">
          <div className="w-full h-1 bg-slate-900 border border-cyan-950/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_#06b6d4]"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content Area */}
        <div className="flex-grow mb-20">
          
          {/* STEP 1: Identity Module */}
          {step === 1 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-4">
                Step 1: Identity Scan
              </h3>
              <Input
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                placeholder="Enter your full name"
                required
              />
              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="developer@example.com"
                required
              />
              <Input
                label="Phone Number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                error={errors.phone_number}
                placeholder="10-digit mobile number"
                required
              />
              <Input
                label="WhatsApp Number"
                name="whatsapp_number"
                type="tel"
                value={formData.whatsapp_number}
                onChange={handleChange}
                error={errors.whatsapp_number}
                placeholder="WhatsApp number (if different)"
                optional
              />
              <Input
                label="Discord Username"
                name="discord_username"
                value={formData.discord_username}
                onChange={handleChange}
                error={errors.discord_username}
                placeholder="username#0000 or username"
                optional
              />
              <Input
                label="City / State"
                name="city_state"
                value={formData.city_state}
                onChange={handleChange}
                error={errors.city_state}
                placeholder="e.g. Hyderabad, TS"
                required
              />
            </div>
          )}

          {/* STEP 2: Academic Module */}
          {step === 2 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-4">
                Step 2: Academic Verification
              </h3>
              <Input
                label="College Name"
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                error={errors.college_name}
                placeholder="Your institution name"
                required
              />
              <Input
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                error={errors.course}
                placeholder="e.g. B.Tech, MCA, BCA"
                required
              />
              <Input
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                error={errors.branch}
                placeholder="e.g. CSE, ECE, IT"
                required
              />
              <Select
                label="Academic Year"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleChange}
                error={errors.academic_year}
                options={[
                  { value: "1", label: "1st Year" },
                  { value: "2", label: "2nd Year" },
                  { value: "3", label: "3rd Year" },
                  { value: "4", label: "4th Year" },
                  { value: "Graduated", label: "Graduated / Other" },
                ]}
                required
              />
              <Select
                label="Semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                error={errors.semester}
                options={[
                  { value: "1", label: "1st Sem" },
                  { value: "2", label: "2nd Sem" },
                  { value: "3", label: "3rd Sem" },
                  { value: "4", label: "4th Sem" },
                  { value: "5", label: "5th Sem" },
                  { value: "6", label: "6th Sem" },
                  { value: "7", label: "7th Sem" },
                  { value: "8", label: "8th Sem" },
                  { value: "N/A", label: "Not Applicable" },
                ]}
                required
              />
              <Input
                label="Roll Number / PIN"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                error={errors.roll_number}
                placeholder="University roll/registration code"
                required
              />
            </div>
          )}

          {/* STEP 3: Developer Presence */}
          {step === 3 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-2">
                Step 3: Developer Presence
              </h3>
              <p className="text-[10px] text-slate-400 mb-4 font-mono leading-relaxed">
                Provide links to showcase your coding profiles. These are optional and do not block submission.
              </p>
              <Input
                label="GitHub Link"
                name="github_link"
                value={formData.github_link}
                onChange={handleChange}
                placeholder="https://github.com/username"
                optional
              />
              <Input
                label="Portfolio Link"
                name="portfolio_link"
                value={formData.portfolio_link}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                optional
              />
              <Input
                label="LinkedIn Link"
                name="linkedin_link"
                value={formData.linkedin_link}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                optional
              />
            </div>
          )}

          {/* STEP 4: Readiness Scan */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Step 4: Readiness Scan
              </h3>
              
              <Select
                label="Current Coding Level"
                name="coding_level"
                value={formData.coding_level}
                onChange={handleChange}
                error={errors.coding_level}
                options={[
                  { value: "Complete Beginner", label: "Complete Beginner" },
                  { value: "Basic Knowledge", label: "Basic Knowledge" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                ]}
                required
              />

              <Select
                label="Laptop / Desktop Status"
                name="device_status"
                value={formData.device_status}
                onChange={handleChange}
                error={errors.device_status}
                options={[
                  { value: "Yes", label: "Yes (I have a personal laptop)" },
                  { value: "No", label: "No (Do not have access)" },
                  { value: "Mobile Only", label: "Mobile Only" },
                  { value: "Will Arrange Soon", label: "Will Arrange Soon" },
                ]}
                required
              />

              <Select
                label="Daily Availability"
                name="daily_availability"
                value={formData.daily_availability}
                onChange={handleChange}
                error={errors.daily_availability}
                options={[
                  { value: "Less than 1 hour", label: "Less than 1 hour" },
                  { value: "1–2 hours", label: "1–2 hours" },
                  { value: "2–4 hours", label: "2–4 hours" },
                  { value: "4+ hours", label: "4+ hours" },
                ]}
                required
              />

              <Select
                label="Module Readiness"
                name="module_readiness"
                value={formData.module_readiness}
                onChange={handleChange}
                error={errors.module_readiness}
                options={[
                  { value: "Yes, I am ready", label: "Yes, I am ready" },
                  { value: "I need guidance", label: "I need guidance" },
                  { value: "I am beginner but serious", label: "I am beginner but serious" },
                ]}
                required
              />
            </div>
          )}

          {/* STEP 5: Intent Mapping */}
          {step === 5 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-4">
                Step 5: Intent Mapping
              </h3>
              
              <Select
                label="Previous Coding/Project Experience?"
                name="project_experience"
                value={formData.project_experience}
                onChange={handleChange}
                error={errors.project_experience}
                options={[
                  { value: "Yes", label: "Yes, built minor/major projects" },
                  { value: "No", label: "No, never written code/built project" },
                  { value: "Tried but not completed", label: "Tried but not completed" },
                ]}
                required
              />

              <Textarea
                label="What do you want to build in future?"
                name="future_build_goal"
                value={formData.future_build_goal}
                onChange={handleChange}
                error={errors.future_build_goal}
                placeholder="Explain the kind of apps, websites, or tools you wish to build..."
                required
              />

              <Textarea
                label="Why do you want to join CodeAxis / Codexa?"
                name="join_reason"
                value={formData.join_reason}
                onChange={handleChange}
                error={errors.join_reason}
                placeholder="What attracts you to this internship?"
                required
              />

              <Textarea
                label="Why should we select you?"
                name="selection_reason"
                value={formData.selection_reason}
                onChange={handleChange}
                error={errors.selection_reason}
                placeholder="What sets your application apart?"
                required
              />
            </div>
          )}

          {/* STEP 6: Mindset Assessment (Vertical cards) */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Step 6: Mindset Assessment
              </h3>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed mb-2">
                Evaluate scenarios carefully. Note: Correct/best answers are NOT shown to candidates.
              </p>

              {MINDSET_QUESTIONS.map((item, qIdx) => (
                <div 
                  key={item.key} 
                  className={`p-4 rounded-2xl border ${
                    errors[item.key] ? "border-red-500/40 bg-red-950/5" : "border-cyan-950/40 bg-slate-950/20"
                  } space-y-3 text-left`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                    <span>Scenario {item.num}</span>
                    {errors[item.key] && <span className="text-red-400 font-semibold">Required</span>}
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-semibold">
                    {item.q}
                  </p>
                  <div className="space-y-2">
                    {item.options.map((opt) => (
                      <OptionCard
                        key={opt.key}
                        letter={opt.key}
                        text={opt.text}
                        selected={formData[item.key as keyof ApplicationData] === opt.key}
                        onClick={() => handleOptionSelect(item.key, opt.key)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 7: Basic Coding Awareness (Conditional follow-ups) */}
          {step === 7 && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                Step 7: Coding Awareness
              </h3>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed mb-2">
                Indicate your experience with specific technologies. Follow-up MCQ blocks load conditionally based on your answers.
              </p>

              {CODING_TOPICS.map((topic) => {
                const awarenessKey = `${topic.key}_awareness` as keyof ApplicationData;
                const q1Key = `${topic.key}_q1` as keyof ApplicationData;
                const q2Key = `${topic.key}_q2` as keyof ApplicationData;

                const awarenessVal = formData[awarenessKey] as string;
                const showFollowups = awarenessVal === "Yes" || awarenessVal === "Little bit";

                return (
                  <div 
                    key={topic.key} 
                    className="p-4 rounded-2xl border border-cyan-950/40 bg-slate-950/20 text-left space-y-4"
                  >
                    {/* Awareness Question */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-mono font-bold text-cyan-400 uppercase">
                        Topic: {topic.name}
                      </label>
                      <p className="text-[11px] text-slate-350 font-mono">
                        Do you have basic idea about {topic.name}?
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: "Yes", text: "Yes" },
                          { value: "Little bit", text: "Little bit" },
                          { value: "No, but I want to learn", text: "No, but I want to learn" },
                        ].map((opt, oIdx) => (
                          <OptionCard
                            key={opt.value}
                            letter={oIdx === 0 ? "A" : oIdx === 1 ? "B" : "C"}
                            text={opt.text}
                            selected={awarenessVal === opt.value}
                            onClick={() => handleOptionSelect(awarenessKey, opt.value)}
                          />
                        ))}
                      </div>
                      {errors[awarenessKey] && (
                        <span className="block text-[9px] text-red-400 font-semibold font-mono">&gt; Topic selection is required</span>
                      )}
                    </div>

                    {/* Conditional Follow-up MCQs */}
                    {showFollowups && (
                      <div className="space-y-4 border-t border-cyan-950/60 pt-4 mt-2">
                        <div className="text-[9px] font-mono text-cyan-500/70 tracking-wider">
                          CONDITIONAL MODULES ACTIVATED
                        </div>

                        {/* Q1 */}
                        <div className="space-y-2">
                          <p className="text-[11px] font-mono text-slate-200 leading-normal">
                            Q1: {topic.q1}
                          </p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {topic.q1Options.map((opt) => (
                              <OptionCard
                                key={opt.key}
                                letter={opt.key}
                                text={opt.text}
                                selected={formData[q1Key] === opt.key}
                                onClick={() => handleOptionSelect(q1Key, opt.key)}
                              />
                            ))}
                          </div>
                          {errors[q1Key] && (
                            <span className="block text-[9px] text-red-400 font-semibold font-mono">&gt; Q1 answer is required</span>
                          )}
                        </div>

                        {/* Q2 */}
                        <div className="space-y-2 mt-2">
                          <p className="text-[11px] font-mono text-slate-200 leading-normal">
                            Q2: {topic.q2}
                          </p>
                          <div className="grid grid-cols-1 gap-1.5">
                            {topic.q2Options.map((opt) => (
                              <OptionCard
                                key={opt.key}
                                letter={opt.key}
                                text={opt.text}
                                selected={formData[q2Key] === opt.key}
                                onClick={() => handleOptionSelect(q2Key, opt.key)}
                              />
                            ))}
                          </div>
                          {errors[q2Key] && (
                            <span className="block text-[9px] text-red-400 font-semibold font-mono">&gt; Q2 answer is required</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 8: Thought Process Essay Questions */}
          {step === 8 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-4">
                Step 8: Thought Process
              </h3>
              
              <Textarea
                label="Tell us about one time you failed or got stuck while learning something. What did you do?"
                name="failure_experience_answer"
                value={formData.failure_experience_answer}
                onChange={handleChange}
                error={errors.failure_experience_answer}
                placeholder="Share your real learning experience..."
                required
              />

              <Textarea
                label="Why should CodeAxis / Codexa trust you with AI tools and project resources?"
                name="trust_with_tools_answer"
                value={formData.trust_with_tools_answer}
                onChange={handleChange}
                error={errors.trust_with_tools_answer}
                placeholder="How do you handle shared resources responsibly?"
                required
              />

              <Textarea
                label="What matters more to you: learning, certificate, free tools, or earning? Explain honestly."
                name="priority_answer"
                value={formData.priority_answer}
                onChange={handleChange}
                error={errors.priority_answer}
                placeholder="Please answer with absolute honesty..."
                required
              />

              <Textarea
                label="If you are not selected, what will you do next?"
                name="not_selected_answer"
                value={formData.not_selected_answer}
                onChange={handleChange}
                error={errors.not_selected_answer}
                placeholder="What is your plan B?"
                required
              />

              <Textarea
                label="What will you do if your code works but you don’t understand how it works?"
                name="code_understanding_answer"
                value={formData.code_understanding_answer}
                onChange={handleChange}
                error={errors.code_understanding_answer}
                placeholder="How do you ensure you truly learn?"
                required
              />
            </div>
          )}

          {/* STEP 9: Final Confirmation & Submit */}
          {step === 9 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide mb-4">
                Step 9: Final Confirmation
              </h3>
              
              <div className="space-y-3 bg-slate-950/40 p-4 border border-cyan-950/40 rounded-2xl">
                <Checkbox
                  id="agreement_free_internship"
                  name="agreement_free_internship"
                  label="I understand this is a free internship application."
                  checked={formData.agreement_free_internship}
                  onChange={handleChange}
                  error={errors.agreement_free_internship}
                />
                
                <Checkbox
                  id="agreement_selection_quality"
                  name="agreement_selection_quality"
                  label="I understand selection depends on seriousness, activity, and application quality."
                  checked={formData.agreement_selection_quality}
                  onChange={handleChange}
                  error={errors.agreement_selection_quality}
                />
                
                <Checkbox
                  id="agreement_step_by_step"
                  name="agreement_step_by_step"
                  label="I understand all modules will be taught step-by-step."
                  checked={formData.agreement_step_by_step}
                  onChange={handleChange}
                  error={errors.agreement_step_by_step}
                />
                
                <Checkbox
                  id="agreement_no_misuse"
                  name="agreement_no_misuse"
                  label="I will not misuse AI tools, Codexa resources, project files, or private access."
                  checked={formData.agreement_no_misuse}
                  onChange={handleChange}
                  error={errors.agreement_no_misuse}
                />
                
                <Checkbox
                  id="agreement_revenue_share"
                  name="agreement_revenue_share"
                  label="I understand revenue share applies only to selected skilled members after internship."
                  checked={formData.agreement_revenue_share}
                  onChange={handleChange}
                  error={errors.agreement_revenue_share}
                />
              </div>

              {submitError && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 text-red-400 text-[10px] font-mono rounded-xl leading-normal text-left">
                  &gt; {submitError}
                </div>
              )}
            </form>
          )}

        </div>

        {/* Sticky bottom navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-950/60 bg-slate-950/85 backdrop-blur-md flex items-center justify-between space-x-3">
          <Button3D
            type="button"
            variant="secondary"
            onClick={handleBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            &larr; BACK
          </Button3D>
          
          {step < 9 ? (
            <Button3D
              type="button"
              variant="primary"
              onClick={handleNext}
              className="flex-grow-[2]"
            >
              NEXT &rarr;
            </Button3D>
          ) : (
            <Button3D
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-grow-[2]"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
            </Button3D>
          )}
        </div>

      </div>
    </div>
  );
}
