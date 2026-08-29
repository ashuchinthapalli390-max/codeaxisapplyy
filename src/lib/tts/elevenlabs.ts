import "server-only";
import { TTSProvider, SynthesizeOptions } from "./provider";

export class ElevenLabsTTSProvider implements TTSProvider {
  async synthesize(options: SynthesizeOptions): Promise<ArrayBuffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    const voiceId = options.voiceName || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Telugu-compatible female voice
    const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is not configured.");
    }

    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS API failed with status ${response.status}: ${errorText}`);
    }

    return await response.arrayBuffer();
  }
}
