/**
 * GET /api/zerion/token
 * Fetch token data and metadata
 */

import { zerionClient } from '@/lib/zerion';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tokenAddress = searchParams.get('address');
    const chain = searchParams.get('chain') || 'solana';

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    const tokenData = await zerionClient.getTokenData(tokenAddress, chain);

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    );
  }
}
