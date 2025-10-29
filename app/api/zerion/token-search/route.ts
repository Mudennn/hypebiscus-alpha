/**
 * GET /api/zerion/token-search
 * Search for tokens across all chains using Zerion API
 * Replaces Jupiter API (Solana-only)
 *
 * Query params:
 * - query: Token name or symbol (required)
 * - chain: Optional chain filter (ethereum, polygon, solana, etc.)
 *
 * Example:
 * /api/zerion/token-search?query=ethereum
 * /api/zerion/token-search?query=eth&chain=ethereum
 */

import { NextRequest, NextResponse } from 'next/server';
import { zerionChatbot, TokenData } from '@/lib/zerion-chatbot';

interface TokenSearchResponse {
  success: boolean;
  data: TokenData[];
  query: string;
  chain?: string;
  timestamp: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<TokenSearchResponse | ErrorResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const chain = searchParams.get('chain');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Search tokens using Zerion API
    const tokens = await zerionChatbot.searchToken(query.trim(), chain || undefined);

    return NextResponse.json(
      {
        success: true,
        data: tokens,
        query: query.trim(),
        ...(chain && { chain }),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search tokens',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DEPRECATED: Jupiter API endpoint (kept for reference, commented out)
// ============================================================================

/*
// OLD ENDPOINT: /api/jupiter/token-search (Solana-only)
// DO NOT USE - Use /api/zerion/token-search instead
//
// Original Jupiter implementation:
// import { NextRequest, NextResponse } from 'next/server';
//
// const JUPITER_API_BASE = 'https://api.jup.ag';
//
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const query = searchParams.get('query');
//
//     if (!query) {
//       return NextResponse.json(
//         { error: 'Query parameter is required' },
//         { status: 400 }
//       );
//     }
//
//     const response = await fetch(
//       `${JUPITER_API_BASE}/quote/search?q=${encodeURIComponent(query)}`
//     );
//
//     if (!response.ok) {
//       throw new Error(`Jupiter API error: ${response.status}`);
//     }
//
//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error('Jupiter API error:', error);
//     return NextResponse.json(
//       { error: 'Failed to search tokens' },
//       { status: 500 }
//     );
//   }
// }
*/
