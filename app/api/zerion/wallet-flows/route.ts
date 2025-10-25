/**
 * GET /api/zerion/wallet-flows
 * Fetch wallet inflows and outflows data
 */

import { zerionClient } from '@/lib/zerion';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const type = searchParams.get('type') || 'both'; // 'inflows', 'outflows', or 'both'
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const result: Record<string, unknown> = {};

    if (type === 'inflows' || type === 'both') {
      result.inflows = await zerionClient.getWalletInflows(address, limit);
    }

    if (type === 'outflows' || type === 'both') {
      result.outflows = await zerionClient.getWalletOutflows(address, limit);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Wallet flows API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet flows' },
      { status: 500 }
    );
  }
}
