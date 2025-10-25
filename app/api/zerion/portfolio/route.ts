/**
 * GET /api/zerion/portfolio
 * Fetch wallet portfolio data from Zerion API
 */

import { zerionClient } from '@/lib/zerion';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const portfolio = await zerionClient.getPortfolio(address);

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
