import { NextResponse } from 'next/server';

// ElevenLabs voice IDs (free tier voices)
// Rachel = warm female voice, Antoni = natural male voice
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah — natural, clear, free tier

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Text required' }, { status: 400 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY in .env.local' }, { status: 400 });
    }

    // Truncate to avoid using too many free credits
    const truncated = text.slice(0, 300);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: truncated,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('ElevenLabs error:', err);

      // If quota exceeded, fall back gracefully
      if (response.status === 429 || response.status === 401) {
        return NextResponse.json(
          { error: 'ElevenLabs quota reached or invalid key. Using browser TTS as fallback.' },
          { status: response.status }
        );
      }
      return NextResponse.json({ error: 'TTS failed' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
  }
}
