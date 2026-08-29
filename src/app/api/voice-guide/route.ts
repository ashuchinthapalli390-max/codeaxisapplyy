import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getWebsiteSettings, getVoiceGuideCache, saveVoiceGuideCache, DEFAULT_TELUGU_NARRATION } from "@/lib/storage";
import { getActiveTTSProvider } from "@/lib/tts/provider";

export const dynamic = "force-dynamic";

const APPROVED_GUIDES: Record<string, string> = {
  "application-rules": DEFAULT_TELUGU_NARRATION,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const guideKey = (body.guide as string) || "application-rules";
    const forceRegenerate = Boolean(body.forceRegenerate);

    // Retrieve approved Telugu narration text from website CMS settings or default
    const settings = await getWebsiteSettings();
    const scriptText =
      settings.voiceGuide?.teluguScript?.trim() ||
      APPROVED_GUIDES[guideKey] ||
      DEFAULT_TELUGU_NARRATION;

    const { providerName, provider, voiceName } = await getActiveTTSProvider();
    const speed = settings.voiceGuide?.speechSpeed || 0.95;

    // Compute SHA-256 content hash for caching
    const contentHash = createHash("sha256")
      .update(`${guideKey}::${scriptText}::${providerName}::${voiceName}::${speed}`)
      .digest("hex");

    // Check audio cache
    if (!forceRegenerate) {
      const cached = await getVoiceGuideCache(contentHash);
      if (cached && cached.audio_base64) {
        const audioBuffer = Buffer.from(cached.audio_base64, "base64");
        return new NextResponse(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": String(audioBuffer.length),
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            "X-Voice-Source": "cache",
            "X-Voice-Hash": contentHash,
          },
        });
      }
    }

    // Synthesize fresh AI audio via active TTS provider
    try {
      const arrayBuffer = await provider.synthesize({
        text: scriptText,
        language: "te-IN",
        voiceName,
        speed,
      });

      const audioBuffer = Buffer.from(arrayBuffer);
      const base64Audio = audioBuffer.toString("base64");

      // Save to cache for all subsequent visitors
      await saveVoiceGuideCache({
        id: `voice-${Date.now()}`,
        guide_key: guideKey,
        content_hash: contentHash,
        language: "te-IN",
        provider: providerName,
        voice_name: voiceName,
        script_text: scriptText,
        audio_base64: base64Audio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(audioBuffer.length),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "X-Voice-Source": "generated",
          "X-Voice-Hash": contentHash,
        },
      });
    } catch (synthErr: any) {
      console.warn("[TTS Synthesis Notice]:", synthErr.message);

      // Return graceful fallback response with the Telugu transcript
      return NextResponse.json(
        {
          success: false,
          error: "AI Voice generation is currently unavailable. Please read the instructions below.",
          transcript: scriptText,
        },
        { status: 503 }
      );
    }
  } catch (err: any) {
    console.error("[Voice Guide API Exception]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error processing voice guide." },
      { status: 500 }
    );
  }
}
