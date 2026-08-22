import { ApplicationData } from "@/types/application";

export function validateRound(
  round: number,
  data: Partial<ApplicationData>
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (round === 1) {
    if (!data.full_name?.trim()) errors.full_name = "Full name is required.";
    if (!data.date_of_birth?.trim()) errors.date_of_birth = "Date of birth is required.";
    if (!data.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!data.phone_number?.trim()) {
      errors.phone_number = "Phone number is required.";
    } else if (data.phone_number.replace(/\D/g, "").length < 10) {
      errors.phone_number = "Please enter a valid 10-digit phone number.";
    }
    if (!data.city?.trim()) errors.city = "City is required.";
    if (!data.state?.trim()) errors.state = "State is required.";
    if (!data.country?.trim()) errors.country = "Country is required.";
  }

  if (round === 2) {
    if (!data.college_name?.trim()) errors.college_name = "College / Institution name is required.";
    if (!data.university_name?.trim()) errors.university_name = "University / Board is required.";
    if (!data.course?.trim()) errors.course = "Course / Degree is required.";
    if (!data.branch?.trim()) errors.branch = "Branch / Specialization is required.";
    if (!data.academic_year?.trim()) errors.academic_year = "Academic year is required.";
    if (!data.semester?.trim()) errors.semester = "Current semester is required.";
    if (!data.roll_number?.trim()) errors.roll_number = "Roll / Registration number is required.";
    if (!data.expected_graduation?.trim()) errors.expected_graduation = "Expected graduation year is required.";
  }

  if (round === 3) {
    if (!data.coding_start_timeline?.trim()) errors.coding_start_timeline = "Please select when you started coding.";
    if (!data.has_built_projects?.trim()) errors.has_built_projects = "Please select your project experience.";
  }

  if (round === 4) {
    if (!data.daily_availability?.trim()) errors.daily_availability = "Please specify your daily availability.";
    if (!data.available_days || data.available_days.length === 0) {
      errors.available_days = "Please select at least one available day.";
    }
    if (!data.preferred_timing || data.preferred_timing.length === 0) {
      errors.preferred_timing = "Please select at least one preferred time slot.";
    }
    if (!data.can_attend_meetings?.trim()) errors.can_attend_meetings = "Please confirm meeting availability.";
    if (!data.can_meet_deadlines?.trim()) errors.can_meet_deadlines = "Please confirm deadline adherence.";
    if (!data.can_communicate_if_unavailable?.trim()) {
      errors.can_communicate_if_unavailable = "Please confirm communication commitment.";
    }
    if (!data.laptop_status?.trim()) errors.laptop_status = "Please select your laptop/device status.";
    if (!data.operating_system?.trim()) errors.operating_system = "Please select your primary OS.";
    if (!data.ram_capacity?.trim()) errors.ram_capacity = "Please select your RAM capacity.";
    if (!data.internet_stability?.trim()) errors.internet_stability = "Please select your internet stability.";
    if (!data.can_run_dev_tools?.trim()) errors.can_run_dev_tools = "Please confirm if your device runs dev tools.";
  }

  if (round === 5) {
    if (!data.c_level?.trim()) errors.c_level = "Please select your C skill level.";
    if (!data.python_level?.trim()) errors.python_level = "Please select your Python skill level.";
    if (!data.java_level?.trim()) errors.java_level = "Please select your Java skill level.";
    if (!data.html_level?.trim()) errors.html_level = "Please select your HTML skill level.";
    if (!data.vibe_coding_level?.trim()) errors.vibe_coding_level = "Please select your Vibe Coding experience.";
  }

  if (round === 6) {
    const mindset = data.mindset_answers || {};
    for (let i = 1; i <= 10; i++) {
      if (!mindset[`mindset_q${i}`]) {
        errors[`mindset_q${i}`] = `Please answer question ${i}.`;
      }
    }
  }

  if (round === 7) {
    const essays: [keyof ApplicationData, string][] = [
      ["interview_q1_why_codexa", "Question 1: Why join CodeXa"],
      ["interview_q2_why_select", "Question 2: Why should we select you"],
      ["interview_q3_expectations", "Question 3: Internship expectations"],
      ["interview_q4_strongest_skills", "Question 4: Strongest skills"],
      ["interview_q5_weakest_area", "Question 5: Weakest area"],
      ["interview_q6_describe_project", "Question 6: Project description"],
      ["interview_q7_difficult_problem", "Question 7: Difficult problem solved"],
      ["interview_q8_ai_coding_usage", "Question 8: AI coding workflow"],
      ["interview_q9_college_balance", "Question 9: College balance strategy"],
      ["interview_q10_future_goal", "Question 10: Future career aspiration"],
    ];

    essays.forEach(([key, label]) => {
      const text = ((data[key] as string) || "").trim();
      if (!text) {
        errors[key] = `${label} is required.`;
      } else if (text.length < 20) {
        errors[key] = `${label} is too brief. Please write at least 20 characters (current: ${text.length}).`;
      }
    });
  }

  if (round === 8) {
    if (!data.commitment_accurate_info) errors.commitment_accurate_info = "You must confirm information accuracy.";
    if (!data.commitment_independent_work) errors.commitment_independent_work = "You must confirm independent assessment completion.";
    if (!data.commitment_responsible_communication) errors.commitment_responsible_communication = "You must accept responsible communication rules.";
    if (!data.commitment_team_rules) errors.commitment_team_rules = "You must agree to team coordination guidelines.";
    if (!data.commitment_confidentiality) errors.commitment_confidentiality = "You must agree to project confidentiality.";
    if (!data.commitment_assigned_duties) errors.commitment_assigned_duties = "You must commit to assigned learning duties.";
    if (!data.commitment_no_guaranteed_employment) errors.commitment_no_guaranteed_employment = "You must acknowledge program terms.";
    if (!data.commitment_accept_policies) errors.commitment_accept_policies = "You must accept CodeXa internship policies.";
  }

  return errors;
}

export function validateAllRounds(data: Partial<ApplicationData>): {
  isValid: boolean;
  firstInvalidRound?: number;
  errors: Record<string, string>;
} {
  let firstInvalidRound: number | undefined;
  let allErrors: Record<string, string> = {};

  for (let r = 1; r <= 8; r++) {
    const roundErrors = validateRound(r, data);
    if (Object.keys(roundErrors).length > 0) {
      if (!firstInvalidRound) {
        firstInvalidRound = r;
      }
      allErrors = { ...allErrors, ...roundErrors };
    }
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    firstInvalidRound,
    errors: allErrors,
  };
}

// Backward compatibility alias
export const validateStep = validateRound;
