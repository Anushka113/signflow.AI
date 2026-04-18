import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Get current user from Clerk
    const { userId } = auth();

    // ── Gemini 1.5 Pro chat ──
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: `You are SignFlowAI's expert assistant — a knowledgeable, warm, and encouraging guide 
      specializing in American Sign Language (ASL), Deaf culture, and accessible communication.

      You help users:
      - Learn how to sign specific words and phrases with clear step-by-step instructions
      - Understand ASL grammar and sentence structure
      - Handle emergency communication situations
      - Learn about Deaf culture, history, and etiquette
      - Get the most out of the SignFlowAI platform
      - Find free ASL learning resources

      Always be encouraging, clear, and concise. Use emojis to make responses friendly.
      When describing signs, be very specific about hand shapes, movements, and locations.
      Format longer responses with bullet points for clarity.`,
    });

    // Build chat history for context
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    // ── Save to MongoDB ──
    if (userId) {
      try {
        const db = await getDb();
        await db.collection('chat_history').insertOne({
          userId,
          userMessage: message,
          assistantReply: reply,
          timestamp: new Date(),
          model: 'gemini-1.5-pro',
        });
      } catch (dbErr) {
        // Don't fail the request if DB save fails
        console.error('MongoDB save error:', dbErr);
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    if (error?.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'Invalid Gemini API key. Check your .env.local file.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to get AI response. Please try again.' }, { status: 500 });
  }
}
