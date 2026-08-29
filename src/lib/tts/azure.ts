import "server-only";
import { TTSProvider, SynthesizeOptions } from "./provider";

export class AzureTTSProvider implements TTSProvider {
  async synthesize(options: SynthesizeOptions): Promise<ArrayBuffer> {
    const key = process.env.AZURE_SPEECH_KEY?.trim();
    const region = process.env.AZURE_SPEECH_REGION?.trim() || "centralindia";
    const voiceName = options.voiceName || process.env.AZURE_SPEECH_VOICE || "te-IN-ShrutiNeural";
    const speed = options.speed || 0.95;

    if (!key) {
      throw new Error("AZURE_SPEECH_KEY is not configured.");
    }

    const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="te-IN">
        <voice name="${voiceName}">
          <prosody rate="${speed}">
            ${options.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </prosody>
        </voice>
      </speak>
    `.trim();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "CodeXaApplyVoiceGuide",
      },
      body: ssml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure Speech API failed with status ${response.status}: ${errorText}`);
    }

    return await response.arrayBuffer();
  }
}
