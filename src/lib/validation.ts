import { ApplicationData } from "@/types/application";

export function validateStep(step: number, data: Partial<ApplicationData>): Record<string, string> {
  const errors: Record<string, string> = {};

  // Email format validator
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone number format validator
  const isValidPhone = (phone: string) => {
    return /^\d{10,15}$/.test(phone.replace(/[\s\-+()]/g, ""));
  };

  switch (step) {
    case 1:
      if (!data.full_name || !data.full_name.trim()) {
        errors.full_name = "Full Name is required";
      }
      if (!data.date_of_birth) {
        errors.date_of_birth = "Date of Birth is required";
      }
      if (!data.email || !data.email.trim()) {
        errors.email = "Email Address is required";
      } else if (!isValidEmail(data.email)) {
        errors.email = "Please enter a valid email address";
      }
      if (!data.phone_number || !data.phone_number.trim()) {
        errors.phone_number = "Phone Number is required";
      } else if (!isValidPhone(data.phone_number)) {
        errors.phone_number = "Please enter a valid phone number (at least 10 digits)";
      }
      if (!data.city_state || !data.city_state.trim()) {
        errors.city_state = "City & State is required";
      }
      break;

    case 2:
      if (!data.college_name || !data.college_name.trim()) {
        errors.college_name = "College Name is required";
      }
      if (!data.course || !data.course.trim()) {
        errors.course = "Course is required";
      }
      if (!data.branch || !data.branch.trim()) {
        errors.branch = "Branch is required";
      }
      if (!data.academic_year) {
        errors.academic_year = "Academic Year is required";
      }
      if (!data.semester) {
        errors.semester = "Semester is required";
      }
      if (!data.roll_number || !data.roll_number.trim()) {
        errors.roll_number = "Roll Number is required";
      }
      break;

    case 3:
      // Developer Presence - All fields optional. No errors.
      break;

    case 4:
      if (!data.coding_level) {
        errors.coding_level = "Coding Level selection is required";
      }
      if (!data.device_status) {
        errors.device_status = "Device Status selection is required";
      }
      if (!data.daily_availability) {
        errors.daily_availability = "Daily Availability selection is required";
      }
      if (!data.module_readiness) {
        errors.module_readiness = "Module Readiness selection is required";
      }
      break;

    case 5:
      if (!data.project_experience) {
        errors.project_experience = "Project Experience selection is required";
      }
      if (!data.future_build_goal || !data.future_build_goal.trim()) {
        errors.future_build_goal = "Future project goal is required";
      }
      if (!data.join_reason || !data.join_reason.trim()) {
        errors.join_reason = "Reason to join CodeAxis is required";
      }
      if (!data.selection_reason || !data.selection_reason.trim()) {
        errors.selection_reason = "Reason for selection is required";
      }
      break;

    case 6:
      // 10 Mindset Assessment questions
      const mindsetKeys = [
        "mindset_q1", "mindset_q2", "mindset_q3", "mindset_q4", "mindset_q5",
        "mindset_q6", "mindset_q7", "mindset_q8", "mindset_q9", "mindset_q10"
      ];
      mindsetKeys.forEach((key, idx) => {
        const val = data[key as keyof ApplicationData];
        if (!val) {
          errors[key] = `Scenario ${idx + 1} selection is required`;
        }
      });
      break;

    case 7:
      // 7 Coding Awareness topics
      const topics = [
        { key: "python", name: "Python" },
        { key: "java", name: "Java" },
        { key: "js_ts", name: "JavaScript / TypeScript" },
        { key: "webstack", name: "WebStack" },
        { key: "vibe_coding", name: "Vibe Coding" },
        { key: "ai_prompting", name: "AI Prompting" },
        { key: "github_projects", name: "GitHub / Projects" }
      ];

      topics.forEach((topic) => {
        const awarenessKey = `${topic.key}_awareness` as keyof ApplicationData;
        const awarenessVal = data[awarenessKey];

        if (!awarenessVal) {
          errors[awarenessKey] = `Topic selection for ${topic.name} is required`;
        } else if (awarenessVal === "Yes" || awarenessVal === "Little bit") {
          // Require follow-up questions
          const q1Key = `${topic.key}_q1` as keyof ApplicationData;
          const q2Key = `${topic.key}_q2` as keyof ApplicationData;

          if (!data[q1Key]) {
            errors[q1Key] = `Follow-up Question 1 for ${topic.name} is required`;
          }
          if (!data[q2Key]) {
            errors[q2Key] = `Follow-up Question 2 for ${topic.name} is required`;
          }
        }
      });
      break;

    case 8:
      if (!data.failure_experience_answer || !data.failure_experience_answer.trim()) {
        errors.failure_experience_answer = "This written answer is required";
      }
      if (!data.trust_with_tools_answer || !data.trust_with_tools_answer.trim()) {
        errors.trust_with_tools_answer = "This written answer is required";
      }
      if (!data.priority_answer || !data.priority_answer.trim()) {
        errors.priority_answer = "This written answer is required";
      }
      if (!data.not_selected_answer || !data.not_selected_answer.trim()) {
        errors.not_selected_answer = "This written answer is required";
      }
      if (!data.code_understanding_answer || !data.code_understanding_answer.trim()) {
        errors.code_understanding_answer = "This written answer is required";
      }
      break;

    case 9:
      if (!data.agreement_free_internship) {
        errors.agreement_free_internship = "Must accept free internship terms";
      }
      if (!data.agreement_selection_quality) {
        errors.agreement_selection_quality = "Must accept selection parameters";
      }
      if (!data.agreement_step_by_step) {
        errors.agreement_step_by_step = "Must accept training parameters";
      }
      if (!data.agreement_no_misuse) {
        errors.agreement_no_misuse = "Must accept anti-misuse guidelines";
      }
      if (!data.agreement_revenue_share) {
        errors.agreement_revenue_share = "Must accept revenue share terms";
      }
      break;

    default:
      break;
  }

  return errors;
}

export function validateFullApplication(data: Partial<ApplicationData>): Record<string, string> {
  let allErrors: Record<string, string> = {};
  for (let step = 1; step <= 9; step++) {
    allErrors = { ...allErrors, ...validateStep(step, data) };
  }
  return allErrors;
}
