/**
 * POST /api/claude/stream
 * Handle streaming AI chat requests for real-time responses
 */

import { claudeClient } from '@/lib/claude';
import { supabaseDB } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface StreamChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  contextData?: Record<string, unknown> | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as StreamChatRequest;
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

    // Create a ReadableStream for streaming responses
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          // Stream AI response
          for await (const chunk of claudeClient.streamChat(message, contextData)) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Save full AI response to database
          await supabaseDB.saveChatMessage({
            session_id: sessionId,
            user_id: userId,
            role: 'assistant',
            content: fullResponse,
            context_data: contextData || null,
          });

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to start stream' },
      { status: 500 }
    );
  }
}
