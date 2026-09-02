import { NextRequest, NextResponse } from "next/server";
import {
  getWebsiteSettings,
  saveWebsiteSettings,
  getActiveInternshipRound,
  saveInternshipRound,
  getFaqs,
  saveFaq,
  deleteFaq,
} from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Converts date string (YYYY-MM-DD) and time string (HH:MM) to ISO string with Asia/Kolkata (+05:30) offset
 */
function formatIndiaTimestamp(dateStr?: string, timeStr?: string, defaultTime = "00:00:00"): string {
  if (!dateStr || !dateStr.trim()) return "";
  const cleanDate = dateStr.trim();
  let cleanTime = (timeStr && timeStr.trim()) ? timeStr.trim() : defaultTime;
  if (cleanTime.length === 5) {
    cleanTime = `${cleanTime}:00`;
  }
  return `${cleanDate}T${cleanTime}+05:30`;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "faqs") {
      const faqs = await getFaqs();
      return NextResponse.json({ success: true, data: faqs });
    }

    const settings = await getWebsiteSettings();
    const round = await getActiveInternshipRound();

    // Extract exact date & time from database round in Asia/Kolkata timezone
    const openDate = round?.opens_at ? round.opens_at.split("T")[0] : settings.openDate || "2026-09-01";
    const openTime = round?.opens_at ? round.opens_at.split("T")[1]?.slice(0, 5) : settings.openTime || "09:00";
    const closeDate = round?.closes_at ? round.closes_at.split("T")[0] : settings.closeDate || "2026-09-07";
    const closeTime = round?.closes_at ? round.closes_at.split("T")[1]?.slice(0, 5) : settings.closeTime || "23:59";
    const nextOpenDate = round?.next_opens_at ? round.next_opens_at.split("T")[0] : settings.nextOpenDate || "";
    const nextOpenTime = round?.next_opens_at ? round.next_opens_at.split("T")[1]?.slice(0, 5) : settings.nextOpenTime || "09:00";

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        batchCode: round?.batch_code || settings.batchCode || "2026-SEP",
        applicationStatus: round?.status || settings.applicationStatus || "AUTO",
        openDate,
        openTime,
        closeDate,
        closeTime,
        nextOpenDate,
        nextOpenTime,
        round,
      },
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();

    if (body.type === "faq") {
      if (body.action === "delete" && body.id) {
        await deleteFaq(body.id);
        return NextResponse.json({ success: true, message: "FAQ removed." });
      }
      await saveFaq(body.faq);
      return NextResponse.json({ success: true, message: "FAQ saved." });
    }

    const { settings, round } = body;

    // 1. Process and save Internship Round (Single Source of Truth for Dates & Timing)
    if (round || settings) {
      const batchCode = round?.batch_code?.trim() || settings?.batchCode?.trim() || "2026-SEP";
      const status = round?.status || settings?.applicationStatus || "AUTO";
      const timezone = "Asia/Kolkata";

      const openDate = settings?.openDate || (round?.opens_at ? round.opens_at.split("T")[0] : "2026-09-01");
      const openTime = settings?.openTime || (round?.opens_at ? round.opens_at.split("T")[1]?.slice(0, 5) : "09:00");
      const opensAt = formatIndiaTimestamp(openDate, openTime, "09:00:00");

      const closeDate = settings?.closeDate || (round?.closes_at ? round.closes_at.split("T")[0] : "2026-09-07");
      const closeTime = settings?.closeTime || (round?.closes_at ? round.closes_at.split("T")[1]?.slice(0, 5) : "23:59");
      const closesAt = formatIndiaTimestamp(closeDate, closeTime, "23:59:00");

      const nextOpenDate = settings?.nextOpenDate || (round?.next_opens_at ? round.next_opens_at.split("T")[0] : "");
      const nextOpenTime = settings?.nextOpenTime || (round?.next_opens_at ? round.next_opens_at.split("T")[1]?.slice(0, 5) : "09:00");
      const nextOpensAt = nextOpenDate ? formatIndiaTimestamp(nextOpenDate, nextOpenTime, "09:00:00") : null;

      await saveInternshipRound({
        title: round?.title || "CodeXa Developer Internship 2026",
        batch_code: batchCode,
        status,
        opens_at: opensAt,
        closes_at: closesAt,
        next_opens_at: nextOpensAt,
        timezone,
        is_active: true,
      });
    }

    // 2. Save website CMS general settings
    if (settings) {
      await saveWebsiteSettings(settings);
    }

    // 3. Revalidate cache for landing and public pages
    try {
      revalidatePath("/");
      revalidatePath("/apply");
      revalidatePath("/apply/rules");
      revalidatePath("/status");
      // @ts-ignore
      if (typeof revalidateTag === "function") {
        // @ts-ignore
        revalidateTag("internship-config");
      }
    } catch (revalErr) {
      console.warn("Revalidation warning:", revalErr);
    }

    const updatedSettings = await getWebsiteSettings();
    const updatedRound = await getActiveInternshipRound();

    return NextResponse.json({
      success: true,
      message: "Website CMS & Internship timing updated successfully.",
      data: {
        ...updatedSettings,
        round: updatedRound,
      },
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
