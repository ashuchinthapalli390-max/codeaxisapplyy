import "server-only";
import { TTSProvider, SynthesizeOptions } from "./provider";

export class GoogleCloudTTSProvider implements TTSProvider {
  async synthesize(options: SynthesizeOptions): Promise<ArrayBuffer> {
    const languageCode = options.language || process.env.TTS_LANGUAGE || "te-IN";
    const voiceName = options.voiceName || process.env.TTS_VOICE_NAME || "te-IN-Chirp3-HD-Aoede";
    const speakingRate = options.speed || 0.95;

    const apiKey = process.env.GOOGLE_TTS_API_KEY?.trim();

    if (apiKey) {
      const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: options.text },
          voice: {
            languageCode,
            name: voiceName,
            ssmlGender: "FEMALE",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate,
            pitch: 0.0,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google TTS API failed with status ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      if (!json.audioContent) {
        throw new Error("Google TTS API returned no audio content.");
      }

      const buffer = Buffer.from(json.audioContent, "base64");
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }

    // If no API key configured, throw informative error for fallback handling
    throw new Error(
      "Google TTS credentials not configured. Please set GOOGLE_TTS_API_KEY in .env.local."
    );
  }
}
