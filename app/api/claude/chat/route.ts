/**
 * POST /api/claude/chat
 * Handle AI chat requests with optional context data
 */

import { claudeClient } from '@/lib/claude';
import { supabaseDB } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  contextData?: Record<string, unknown> | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as ChatRequest;
    const { message, sessionId, userId, contextData } = body;

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Message, sessionId, and userId are required' },
        { status: 400 }
      );
    }

    // Save user message to database
    await supabaseDB.saveChatMessage({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: message,
      context_data: contextData || null,
    });

    // Get AI response
    const aiResponse = await claudeClient.chat(message, contextData);

    // Save AI response to database
    await supabaseDB.saveChatMessage({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: aiResponse,
      context_data: contextData || null,
    });

    return NextResponse.json({
      message: aiResponse,
      success: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
