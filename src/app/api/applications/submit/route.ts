import { NextRequest } from "next/server";
import {
  DATABASE_CONFIG_ERROR_MESSAGE,
  dbQuery,
  isDatabaseConfigError,
} from "@/lib/db";
import { validateFullApplication } from "@/lib/validation";
import { calculateScores } from "@/lib/scoring";
import { jsonResponse } from "@/lib/safeJson";

interface DuplicateRow {
  id: number;
  email: string;
  phone_number: string;
  whatsapp_number: string | null;
  roll_number: string;
}

interface ReferenceRow {
  reference_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Server-side validation
    const errors = validateFullApplication(body);
    if (Object.keys(errors).length > 0) {
      return jsonResponse({
        success: false,
        error: "Validation failed. Please fill in all required fields.",
        details: errors
      }, 400);
    }

    // Server-side scoring calculation
    const scoreReport = calculateScores(body);
    
    // Duplicate checks
    const { email, phone_number, whatsapp_number, roll_number } = body;
    let duplicate_warning = false;
    const duplicate_reason_parts: string[] = [];

    const dupes = await dbQuery<DuplicateRow[]>(
      `SELECT id, email, phone_number, whatsapp_number, roll_number FROM applications WHERE 
       email = ? OR phone_number = ? OR (whatsapp_number IS NOT NULL AND whatsapp_number = ?) OR roll_number = ?`,
      [email, phone_number, whatsapp_number || null, roll_number]
    );

    if (dupes && dupes.length > 0) {
      duplicate_warning = true;
      const matchedFields = new Set<string>();
      
      dupes.forEach((row) => {
        if (row.email.toLowerCase() === email.toLowerCase()) matchedFields.add("email");
        if (row.phone_number === phone_number) matchedFields.add("phone");
        if (whatsapp_number && row.whatsapp_number === whatsapp_number) matchedFields.add("whatsapp");
        if (row.roll_number.toLowerCase() === roll_number.toLowerCase()) matchedFields.add("roll_number");
      });

      duplicate_reason_parts.push(`Matches existing application fields: ${Array.from(matchedFields).join(", ")}`);
    }

    // 2. Generate sequential reference ID: CAX-2026-000001 format
    let nextNum = 1;
    try {
      const lastApp = await dbQuery<ReferenceRow[]>("SELECT reference_id FROM applications ORDER BY id DESC LIMIT 1");
      if (lastApp && lastApp.length > 0) {
        const lastRef = lastApp[0].reference_id;
        const match = lastRef.match(/CAX-2026-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch last reference_id, defaulting to 1:", err);
    }
    const reference_id = `CAX-2026-${String(nextNum).padStart(6, "0")}`;

    // Prepare MySQL save values
    const query = `
      INSERT INTO applications (
        reference_id, full_name, date_of_birth, email, phone_number, whatsapp_number, discord_username, city_state,
        college_name, course, branch, academic_year, semester, roll_number,
        github_link, portfolio_link, linkedin_link,
        coding_level, device_status, daily_availability, module_readiness,
        project_experience, future_build_goal, join_reason, selection_reason,
        mindset_q1, mindset_q2, mindset_q3, mindset_q4, mindset_q5, mindset_q6, mindset_q7, mindset_q8, mindset_q9, mindset_q10,
        python_awareness, python_q1, python_q2,
        java_awareness, java_q1, java_q2,
        js_ts_awareness, js_ts_q1, js_ts_q2,
        webstack_awareness, webstack_q1, webstack_q2,
        vibe_coding_awareness, vibe_coding_q1, vibe_coding_q2,
        ai_prompting_awareness, ai_prompting_q1, ai_prompting_q2,
        github_projects_awareness, github_projects_q1, github_projects_q2,
        failure_experience_answer, trust_with_tools_answer, priority_answer, not_selected_answer, code_understanding_answer,
        agreement_free_internship, agreement_selection_quality, agreement_step_by_step, agreement_no_misuse, agreement_revenue_share,
        mindset_score, coding_awareness_score, profile_completion_score, written_quality_score, total_score,
        auto_status, manual_status, admin_notes,
        duplicate_warning, duplicate_reason, form_data
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, ?, 
        ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, 
        ?, ?, ?
      )
    `;

    const params = [
      reference_id,
      body.full_name,
      body.date_of_birth,
      body.email,
      body.phone_number,
      body.whatsapp_number || null,
      body.discord_username || null,
      body.city_state,
      
      body.college_name,
      body.course,
      body.branch,
      body.academic_year,
      body.semester,
      body.roll_number,
      
      body.github_link || null,
      body.portfolio_link || null,
      body.linkedin_link || null,
      
      body.coding_level,
      body.device_status,
      body.daily_availability,
      body.module_readiness,
      
      body.project_experience,
      body.future_build_goal,
      body.join_reason,
      body.selection_reason,
      
      body.mindset_q1,
      body.mindset_q2,
      body.mindset_q3,
      body.mindset_q4,
      body.mindset_q5,
      body.mindset_q6,
      body.mindset_q7,
      body.mindset_q8,
      body.mindset_q9,
      body.mindset_q10,
      
      body.python_awareness,
      body.python_q1 || null,
      body.python_q2 || null,
      
      body.java_awareness,
      body.java_q1 || null,
      body.java_q2 || null,
      
      body.js_ts_awareness,
      body.js_ts_q1 || null,
      body.js_ts_q2 || null,
      
      body.webstack_awareness,
      body.webstack_q1 || null,
      body.webstack_q2 || null,
      
      body.vibe_coding_awareness,
      body.vibe_coding_q1 || null,
      body.vibe_coding_q2 || null,
      
      body.ai_prompting_awareness,
      body.ai_prompting_q1 || null,
      body.ai_prompting_q2 || null,
      
      body.github_projects_awareness,
      body.github_projects_q1 || null,
      body.github_projects_q2 || null,
      
      body.failure_experience_answer,
      body.trust_with_tools_answer,
      body.priority_answer,
      body.not_selected_answer,
      body.code_understanding_answer,
      
      body.agreement_free_internship ? 1 : 0,
      body.agreement_selection_quality ? 1 : 0,
      body.agreement_step_by_step ? 1 : 0,
      body.agreement_no_misuse ? 1 : 0,
      body.agreement_revenue_share ? 1 : 0,
      
      scoreReport.mindset_score,
      scoreReport.coding_awareness_score,
      scoreReport.profile_completion_score,
      scoreReport.written_quality_score,
      scoreReport.total_score,
      
      scoreReport.auto_status,
      "Pending", // default manual status
      "", // admin notes empty
      
      duplicate_warning ? 1 : 0,
      duplicate_warning ? duplicate_reason_parts.join("; ") : null,
      JSON.stringify(body)
    ];

    await dbQuery(query, params);

    return jsonResponse({
      success: true,
      data: {
        reference_id
      }
    });

  } catch (err) {
    console.error("API application submission crash:", err);
    
    if (isDatabaseConfigError(err)) {
      return jsonResponse({
        success: false,
        error: DATABASE_CONFIG_ERROR_MESSAGE
      }, 500);
    }

    return jsonResponse({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error database insert."
    }, 500);
  }
}
