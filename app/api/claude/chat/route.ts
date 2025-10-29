/**
 * POST /api/claude/chat
 * Handle AI chat requests with optional context data (tokens, DApps, wallets)
 * Supports both Zerion multi-chain data and fallback token enrichment
 */

import { claudeClient } from '@/lib/claude';
import { zerionChatbot } from '@/lib/zerion-chatbot';
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
    // If panelData already exists from client-side intent detection, use it
    // This is preferred as it has proper intent context
    if (enrichedContext?.panelData) {
      console.log('Using panel data from client intent detection');
      return enrichedContext;
    }

    // Extract potential token symbols from the message as fallback
    const messageLower = message.toLowerCase();
    const tokensToSearch: Set<string> = new Set();

    // Extract Solana addresses (base58, 32-44 chars)
    const addressRegex = /[1-9A-HJ-NP-Z]{32,44}/g;
    const addresses = message.match(addressRegex);
    if (addresses) {
      addresses.forEach(addr => tokensToSearch.add(addr));
    }

    // Extract token symbols using context-aware patterns
    // Only match uppercase words that appear with token-related context
    const tokenContextPatterns = [
      /(?:price|chart|buy|sell|swap|trade)\s+(?:of\s+)?([A-Z]{2,10})\b/gi,
      /\b([A-Z]{2,10})\s+(?:token|coin|price|chart)/gi,
      /(?:token|coin)\s+([A-Z]{2,10})\b/gi,
    ];

    for (const pattern of tokenContextPatterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        tokensToSearch.add(match[1].toUpperCase());
      }
    }

    // Filter out common English words that might still slip through
    const excludeWords = [
      'USD', 'THE', 'AND', 'FOR', 'NOT', 'BUT', 'ARE', 'YOU', 'ALL', 'CAN', 'API',
      'GET', 'SET', 'HAS', 'WAS', 'ITS', 'OUR', 'OUT', 'DAY', 'MAY', 'NEW', 'NOW',
      'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'CAR', 'EAT', 'FAR', 'FUN', 'GOT',
      'HIM', 'HIS', 'HOW', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'WHY', 'INTO',
      'EXPLAIN', 'SHOW', 'TELL', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHILE', 'WITH'
    ];

    const filteredTokens = Array.from(tokensToSearch).filter(
      token => !excludeWords.includes(token.toUpperCase())
    );

    // Clear and re-populate with filtered tokens
    tokensToSearch.clear();
    filteredTokens.forEach(token => tokensToSearch.add(token));

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

    // Fetch data for each token using Zerion API as fallback
    if (tokensToSearch.size > 0) {
      console.log('Fetching token data from Zerion API as fallback...');
      try {
        const allTokenData = [];
        for (const token of Array.from(tokensToSearch)) {
          const tokenData = await zerionChatbot.searchToken(token);
          if (tokenData && tokenData.length > 0) {
            allTokenData.push(tokenData[0]);
          }
        }

        if (allTokenData.length > 0) {
          enrichedContext.tokens = allTokenData;
          console.log('Enriched context with Zerion token data:', allTokenData);
        } else {
          console.log('No token data found from Zerion');
        }
      } catch (error) {
        console.error('Error fetching from Zerion API:', error);
        // Continue without Zerion data if there's an error
      }
    }
  } catch (error) {
    console.error('Error enriching context with token data:', error);
    // Continue without token data if there's an error
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

    // Enrich context with token/DApp data from Zerion API (or use pre-fetched panelData)
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
