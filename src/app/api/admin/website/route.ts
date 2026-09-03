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
import { toKolkataDateTimeParts, fromKolkataDateTime } from "@/lib/timezone";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

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
    const openParts = toKolkataDateTimeParts(round?.opens_at);
    const closeParts = toKolkataDateTimeParts(round?.closes_at);
    const nextOpenParts = toKolkataDateTimeParts(round?.next_opens_at);

    const openDate = openParts?.date || settings.openDate || "2026-09-01";
    const openTime = openParts?.time || settings.openTime || "09:00";
    const closeDate = closeParts?.date || settings.closeDate || "2026-09-07";
    const closeTime = closeParts?.time || settings.closeTime || "23:59";
    const nextOpenDate = nextOpenParts?.date || settings.nextOpenDate || "";
    const nextOpenTime = nextOpenParts?.time || settings.nextOpenTime || "09:00";

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

      const openParts = toKolkataDateTimeParts(round?.opens_at);
      const closeParts = toKolkataDateTimeParts(round?.closes_at);
      const nextOpenParts = toKolkataDateTimeParts(round?.next_opens_at);

      const openDate = settings?.openDate || openParts?.date || "2026-09-01";
      const openTime = settings?.openTime || openParts?.time || "09:00";
      const opensAt = fromKolkataDateTime(openDate, openTime, "09:00:00");

      const closeDate = settings?.closeDate || closeParts?.date || "2026-09-07";
      const closeTime = settings?.closeTime || closeParts?.time || "23:59";
      const closesAt = fromKolkataDateTime(closeDate, closeTime, "23:59:00");

      const nextOpenDate = settings?.nextOpenDate || nextOpenParts?.date || "";
      const nextOpenTime = settings?.nextOpenTime || nextOpenParts?.time || "09:00";
      const nextOpensAt = nextOpenDate ? fromKolkataDateTime(nextOpenDate, nextOpenTime, "09:00:00") : null;

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
