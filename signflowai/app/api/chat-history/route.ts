import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await getDb();
    const history = await db
      .collection('chat_history')
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await getDb();
    await db.collection('chat_history').deleteMany({ userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat history delete error:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
