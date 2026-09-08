import { NextResponse } from "next/server";
import { getActiveInternshipRound, getWebsiteSettings } from "@/lib/storage";
import { resolveApplicationAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const round = await getActiveInternshipRound();
    const settings = await getWebsiteSettings();

    const now = new Date();
    const serverTimeMs = now.getTime();

    const availability = resolveApplicationAvailability(round, serverTimeMs);

    const payload = {
      success: true,
      data: {
        round: {
          id: availability.roundId,
          title: round?.title || "CodeXa Developer Internship 2026",
          batch_code: availability.batchCode,
          status: availability.effectiveStatus,
          raw_status: availability.mode,
          opens_at: availability.opensAt,
          closes_at: availability.closesAt,
          next_opens_at: availability.nextOpensAt,
          timezone: availability.timezone,
          is_active: Boolean(round?.is_active),
          canApply: availability.canApply,
          reasonCode: availability.reasonCode,
          isOverride: availability.isOverride,
          revision: availability.revision,
        },
        availability,
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
