/**
 * GET /api/zerion/dapp-info
 * Get DApp protocol information (TVL, users, supported chains, etc.)
 *
 * Query params:
 * - dappId: DApp identifier (required)
 * - search: Optional search query to find protocols by name
 *
 * Examples:
 * /api/zerion/dapp-info?dappId=uniswap-v3
 * /api/zerion/dapp-info?search=uniswap
 * /api/zerion/dapp-info?search=aave
 */

import { NextRequest, NextResponse } from 'next/server';
import { zerionChatbot, DAppData } from '@/lib/zerion-chatbot';

interface DAppInfoResponse {
  success: boolean;
  data: DAppData | DAppData[] | null;
  timestamp: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<DAppInfoResponse | ErrorResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dappId = searchParams.get('dappId');
    const searchQuery = searchParams.get('search');

    // If search query provided, search for DApps
    if (searchQuery && searchQuery.trim().length > 0) {
      const results = await zerionChatbot.searchDApp(searchQuery.trim());

      return NextResponse.json(
        {
          success: true,
          data: results,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // If dappId provided, get specific DApp info
    if (dappId && dappId.trim().length > 0) {
      const dappInfo = await zerionChatbot.getDAppInfo(dappId.trim());

      if (!dappInfo) {
        return NextResponse.json(
          {
            success: false,
            error: `DApp not found: ${dappId}`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: dappInfo,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Either dappId or search parameter is required',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('DApp info error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch DApp information',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
