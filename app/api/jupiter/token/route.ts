/**
 * GET /api/jupiter/token
 * Fetch token data from Jupiter API
 */

import { jupiterClient } from '@/lib/jupiter';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Token symbol is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching token data for: ${symbol}`);

    // Get token data with price from Jupiter
    const tokenData = await jupiterClient.getTokenWithPrice(symbol);

    if (!tokenData) {
      return NextResponse.json(
        { error: `Token not found: ${symbol}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tokenData,
    });
  } catch (error) {
    console.error('Jupiter token API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token data' },
      { status: 500 }
    );
  }
}
