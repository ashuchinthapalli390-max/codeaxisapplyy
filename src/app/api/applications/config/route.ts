import { NextResponse } from "next/server";
import { getActiveInternshipRound, getWebsiteSettings } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const round = await getActiveInternshipRound();
    const settings = await getWebsiteSettings();

    const now = new Date();
    const serverTimeMs = now.getTime();

    const opensAtMs = round?.opens_at ? new Date(round.opens_at).getTime() : 0;
    const closesAtMs = round?.closes_at ? new Date(round.closes_at).getTime() : 0;
    const nextOpensAtMs = round?.next_opens_at ? new Date(round.next_opens_at).getTime() : null;

    let computedStatus = round?.status || "AUTO";

    if (round?.status === "AUTO" || !round?.status) {
      if (opensAtMs > 0 && serverTimeMs < opensAtMs) {
        computedStatus = "OPENING_SOON";
      } else if (closesAtMs > 0 && serverTimeMs >= closesAtMs) {
        computedStatus = "CLOSED";
      } else if (opensAtMs > 0 && closesAtMs > 0 && serverTimeMs >= opensAtMs && serverTimeMs < closesAtMs) {
        computedStatus = "OPEN";
      } else {
        computedStatus = "OPEN";
      }
    }

    const payload = {
      success: true,
      data: {
        round: {
          id: round?.id || "round-2026-sep",
          title: round?.title || "CodeXa Developer Internship 2026",
          batch_code: round?.batch_code || "2026-SEP",
          status: computedStatus,
          raw_status: round?.status || "AUTO",
          opens_at: round?.opens_at || null,
          closes_at: round?.closes_at || null,
          next_opens_at: round?.next_opens_at || null,
          timezone: round?.timezone || "Asia/Kolkata",
          is_active: Boolean(round?.is_active),
        },
        settings: {
          heroHeading: settings.heroHeading,
          heroSubtitle: settings.heroSubtitle,
          heroDescription: settings.heroDescription,
          agencyName: settings.agencyName,
          agencyUrl: settings.agencyUrl,
          agencyDescription: settings.agencyDescription,
          whatsappSupportNumber: settings.whatsappSupportNumber,
          founderEmail: settings.founderEmail,
        },
        server_time: now.toISOString(),
        server_time_ms: serverTimeMs,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("[Applications Config API Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Schedule currently unavailable. Please verify connection.",
        data: {
          round: {
            id: "unavailable",
            title: "CodeXa Developer Internship",
            batch_code: "2026",
            status: "CLOSED",
            raw_status: "CLOSED",
            opens_at: null,
            closes_at: null,
            next_opens_at: null,
            timezone: "Asia/Kolkata",
            is_active: false,
            canApply: false,
          },
          schedule_unavailable: true,
          server_time_ms: Date.now(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
