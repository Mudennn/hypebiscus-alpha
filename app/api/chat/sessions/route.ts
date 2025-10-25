/**
 * GET|POST /api/chat/sessions
 * Manage chat sessions
 */

import { supabaseDB } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface CreateSessionRequest {
  userId: string;
  title: string;
}

// GET - Fetch all sessions for a user
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const sessions = await supabaseDB.getChatSessions(userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new session
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as CreateSessionRequest;
    const { userId, title } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      );
    }

    const session = await supabaseDB.createChatSession(userId, title);
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
