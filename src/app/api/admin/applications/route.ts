import { NextRequest } from "next/server";
import {
  DATABASE_CONFIG_ERROR_MESSAGE,
  dbQuery,
  isDatabaseConfigError,
} from "@/lib/db";
import { jsonResponse } from "@/lib/safeJson";

interface TotalRow {
  total: number;
}

interface CountRow {
  cnt: number;
}

interface MaxScoreRow {
  max_score: number | null;
}

type ApplicationRow = Record<string, unknown>;

export async function GET(req: NextRequest) {
  try {
    // Authorization check
    const authHeader = req.headers.get("Authorization");
    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";
    const expectedToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return jsonResponse({ success: false, error: "Unauthorized access." }, 401);
    }

    // Get search, filters and pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const autoStatus = searchParams.get("autoStatus") || "all";
    const manualStatus = searchParams.get("manualStatus") || "all";
    const isDeletedParam = searchParams.get("is_deleted") || "false";
    const is_deleted = isDeletedParam === "true" ? 1 : 0;

    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = "is_deleted = ?";
    const queryParams: Array<string | number> = [is_deleted];

    if (search.trim() !== "") {
      const searchLike = `%${search.trim()}%`;
      conditions += ` AND (full_name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR roll_number LIKE ? OR reference_id LIKE ? OR college_name LIKE ?)`;
      queryParams.push(searchLike, searchLike, searchLike, searchLike, searchLike, searchLike);
    }

    if (autoStatus !== "all" && autoStatus.trim() !== "") {
      conditions += " AND auto_status = ?";
      queryParams.push(autoStatus);
    }

    if (manualStatus !== "all" && manualStatus.trim() !== "") {
      conditions += " AND manual_status = ?";
      queryParams.push(manualStatus);
    }

    // Query for total matching records count
    const countQuery = `SELECT COUNT(*) as total FROM applications WHERE ${conditions}`;
    const countResult = await dbQuery<TotalRow[]>(countQuery, queryParams);
    const total = countResult[0]?.total || 0;

    // Query for paginated data
    const query = `SELECT * FROM applications WHERE ${conditions} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const dataParams = [...queryParams, limit, offset];
    const applications = await dbQuery<ApplicationRow[]>(query, dataParams);

    // Compute stats dynamically on server for the dashboard counters
    const [
      totalActiveRes,
      totalTrashRes,
      todayActiveRes,
      autoSelectedRes,
      strongShortlistRes,
      pendingReviewRes,
      lowPriorityRes,
      rejectedRes,
      duplicateWarningsRes,
      highestScoreRes
    ] = await Promise.all([
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 1"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND DATE(created_at) = CURDATE()"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND auto_status = 'Auto Selected'"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND auto_status = 'Strong Shortlist'"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND auto_status = 'Pending Review'"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND auto_status = 'Low Priority Review'"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND manual_status = 'Rejected'"),
      dbQuery<CountRow[]>("SELECT COUNT(*) as cnt FROM applications WHERE is_deleted = 0 AND duplicate_warning = 1"),
      dbQuery<MaxScoreRow[]>("SELECT MAX(total_score) as max_score FROM applications WHERE is_deleted = 0")
    ]);

    const stats = {
      totalApplications: totalActiveRes[0]?.cnt || 0,
      trashCount: totalTrashRes[0]?.cnt || 0,
      todayApplications: todayActiveRes[0]?.cnt || 0,
      autoSelected: autoSelectedRes[0]?.cnt || 0,
      strongShortlist: strongShortlistRes[0]?.cnt || 0,
      pendingReview: pendingReviewRes[0]?.cnt || 0,
      lowPriority: lowPriorityRes[0]?.cnt || 0,
      rejected: rejectedRes[0]?.cnt || 0,
      duplicateWarnings: duplicateWarningsRes[0]?.cnt || 0,
      highestScore: Number(highestScoreRes[0]?.max_score || 0)
    };

    return jsonResponse({
      success: true,
      data: {
        applications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        stats
      }
    });

  } catch (err) {
    console.error("applications fetch crash:", err);
    if (isDatabaseConfigError(err)) {
      return jsonResponse({
        success: false,
        error: DATABASE_CONFIG_ERROR_MESSAGE
      }, 500);
    }

    return jsonResponse({ 
      success: false, 
      error: err instanceof Error ? err.message : "Internal server error database query." 
    }, 500);
  }
}
