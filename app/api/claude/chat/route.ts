/**
 * POST /api/claude/chat
 * Handle AI chat requests with optional context data
 */

import { claudeClient } from '@/lib/claude';
import { jupiterClient } from '@/lib/jupiter';
// import { supabaseDB } from '@/lib/supabase'; // TODO: Uncomment when chat_history table is created
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  contextData?: Record<string, unknown> | null;
}

async function enrichContextWithTokenData(
  message: string,
  contextData: Record<string, unknown> | null
): Promise<Record<string, unknown>> {
  const enrichedContext = { ...contextData };

  try {
    // Extract potential token symbols from the message
    const messageLower = message.toLowerCase();
    const tokensToSearch: Set<string> = new Set();

    // Extract Solana addresses (base58, 32-44 chars)
    const addressRegex = /[1-9A-HJ-NP-Z]{32,44}/g;
    const addresses = message.match(addressRegex);
    if (addresses) {
      addresses.forEach(addr => tokensToSearch.add(addr));
    }

    // Extract uppercase token symbols (2-10 letters)
    const symbolRegex = /\b([A-Z]{2,10})\b/g;
    const symbols = message.match(symbolRegex);
    if (symbols) {
      // Filter out common English words
      const excludeWords = ['USD', 'THE', 'AND', 'FOR', 'NOT', 'BUT', 'ARE', 'YOU', 'ALL', 'CAN', 'API'];
      symbols.forEach(symbol => {
        if (!excludeWords.includes(symbol) && symbol.length >= 2) {
          tokensToSearch.add(symbol);
        }
      });
    }

    // Extract lowercase token mentions with context (e.g., "cbbtc token", "wif price")
    const tokenContextRegex = /\b([a-z]{2,10})(?:\s+(?:token|coin|price|chart|data|address))/gi;
    const contextMatches = message.matchAll(tokenContextRegex);
    for (const match of contextMatches) {
      tokensToSearch.add(match[1].toUpperCase());
    }

    // If asking about price/token in general and no token found, default to SOL
    if ((messageLower.includes('price') || messageLower.includes('token')) && tokensToSearch.size === 0) {
      tokensToSearch.add('SOL');
    }

    console.log('Tokens to search:', Array.from(tokensToSearch));

    // Fetch data for each token using Jupiter API
    if (tokensToSearch.size > 0) {
      console.log('Fetching token data from Jupiter API...');
      const allTokenData = await jupiterClient.getMultipleTokensWithPrices(
        Array.from(tokensToSearch)
      );

      if (allTokenData.length > 0) {
        enrichedContext.tokens = allTokenData;
        console.log('Enriched context with Jupiter token data:', allTokenData);
      } else {
        console.log('No token data found from Jupiter');
      }
    }
  } catch (error) {
    console.error('Error enriching context with Jupiter data:', error);
    // Continue without Jupiter data if there's an error
  }

  return enrichedContext;
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
    // TODO: Uncomment when chat_history table is created in Supabase
    // await supabaseDB.saveChatMessage({
    //   session_id: sessionId,
    //   user_id: userId,
    //   role: 'user',
    //   content: message,
    //   context_data: contextData || null,
    // });

    // Enrich context with Jupiter token data
    const enrichedContext = await enrichContextWithTokenData(message, contextData || null);

    // Get AI response with enriched context
    const aiResponse = await claudeClient.chat(message, enrichedContext);

    // Save AI response to database
    // TODO: Uncomment when chat_history table is created in Supabase
    // await supabaseDB.saveChatMessage({
    //   session_id: sessionId,
    //   user_id: userId,
    //   role: 'assistant',
    //   content: aiResponse,
    //   context_data: contextData || null,
    // });

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
