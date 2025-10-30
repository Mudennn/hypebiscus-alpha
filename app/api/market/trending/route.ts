/**
 * GET /api/market/trending
 * Fetch trending cryptocurrencies and market data from CoinGecko
 *
 * Returns:
 * - trending: Array of trending tokens
 * - marketData: Global market metrics
 *
 * Example:
 * /api/market/trending
 */

import { NextResponse } from 'next/server';
import { getTrendingTokens, getGlobalMarketData } from '@/lib/coingecko';

interface GlobalMarketMetrics {
  activeCryptos?: number;
  totalMarketCap?: number;
  total24hVolume?: number;
  marketCapChange24h?: number;
}

interface MarketTrendingResponse {
  success: boolean;
  trending?: Array<{
    rank: number;
    name: string;
    symbol: string;
    price?: string;
    marketCapRank?: number | null;
    icon?: string;
  }>;
  marketData?: GlobalMarketMetrics;
  timestamp: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<MarketTrendingResponse | ErrorResponse>> {
  try {
    console.log('[Market API] Fetching trending tokens and market data...');

    // Fetch trending tokens and global market data in parallel
    const [trendingTokens, globalData] = await Promise.all([
      getTrendingTokens(),
      getGlobalMarketData(),
    ]);

    console.log('[Market API] Optimized trending tokens (first 2):', JSON.stringify(trendingTokens.slice(0, 2), null, 2));
    console.log('[Market API] Global market data:', JSON.stringify(globalData, null, 2));

    // Format trending tokens
    const formattedTrending = trendingTokens.slice(0, 10).map((token, index) => ({
      rank: index + 1,
      name: token.item.name,
      symbol: token.item.symbol.toUpperCase(),
      price: token.item.data?.price,
      marketCapRank: token.item.market_cap_rank,
      icon: token.item.small, // Use only 'small' image (64x64px)
    }));

    // Format market data
    const marketMetrics: GlobalMarketMetrics = {
      activeCryptos: globalData?.activeCryptos,
      totalMarketCap: globalData?.totalMarketCap,
      total24hVolume: globalData?.total24hVolume,
      marketCapChange24h: globalData?.marketCapChange24h,
    };

    console.log('[Market API] Formatted response:', JSON.stringify({
      trending: formattedTrending,
      marketData: marketMetrics,
    }, null, 2));

    return NextResponse.json(
      {
        success: true,
        trending: formattedTrending,
        marketData: marketMetrics,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Market Trending] Error fetching market data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch market trending data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
