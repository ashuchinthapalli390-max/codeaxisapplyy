import "server-only";

export interface SynthesizeOptions {
  text: string;
  language?: string; // e.g. "te-IN"
  voiceName?: string;
  speed?: number; // 0.8 to 1.2
}

export interface TTSProvider {
  synthesize(options: SynthesizeOptions): Promise<ArrayBuffer>;
}

export async function getActiveTTSProvider(): Promise<{
  providerName: string;
  provider: TTSProvider;
  voiceName: string;
}> {
  const providerKey = (process.env.TTS_PROVIDER || "google").toLowerCase().trim();
  const configuredVoice = process.env.TTS_VOICE_NAME?.trim();

  if (providerKey === "elevenlabs" && process.env.ELEVENLABS_API_KEY) {
    const { ElevenLabsTTSProvider } = await import("./elevenlabs");
    return {
      providerName: "elevenlabs",
      provider: new ElevenLabsTTSProvider(),
      voiceName: process.env.ELEVENLABS_VOICE_ID || "default-telugu-female",
    };
  }

  if (providerKey === "azure" && process.env.AZURE_SPEECH_KEY) {
    const { AzureTTSProvider } = await import("./azure");
    return {
      providerName: "azure",
      provider: new AzureTTSProvider(),
      voiceName: process.env.AZURE_SPEECH_VOICE || "te-IN-ShrutiNeural",
    };
  }

  // Default: Google Cloud Text-to-Speech (Chirp 3 HD / Neural)
  const { GoogleCloudTTSProvider } = await import("./google");
  return {
    providerName: "google",
    provider: new GoogleCloudTTSProvider(),
    voiceName: configuredVoice || "te-IN-Chirp3-HD-Aoede",
  };
}
