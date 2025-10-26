/**
 * GET /api/zerion/wallet-analysis
 * Comprehensive wallet analysis - aggregates multiple Zerion endpoints
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

    console.log(`Fetching comprehensive wallet analysis for: ${address}`);

    // Fetch all data in parallel for better performance
    const [
      portfolio,
      pnl,
      positions,
      transactions,
      chart30d,
      chart7d
    ] = await Promise.all([
      // Portfolio overview
      zerionClient.getPortfolio(address).catch(err => {
        console.error('Portfolio fetch error:', err);
        return null;
      }),

      // PnL data
      fetch(`https://api.zerion.io/v1/wallets/${address}/pnl?currency=usd`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZERION_API_KEY}:`).toString('base64')}`,
          'accept': 'application/json',
        },
      }).then(async res => {
        if (!res.ok) {
          console.error('PnL fetch failed:', res.status, await res.text());
          return null;
        }
        return res.json();
      }).catch(err => {
        console.error('PnL fetch error:', err);
        return null;
      }),

      // Positions
      fetch(`https://api.zerion.io/v1/wallets/${address}/positions/?filter[positions]=only_simple&filter[trash]=only_non_trash&sort=value`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZERION_API_KEY}:`).toString('base64')}`,
          'accept': 'application/json',
        },
      }).then(res => res.ok ? res.json() : null).catch(() => null),

      // Recent transactions (last 50)
      fetch(`https://api.zerion.io/v1/wallets/${address}/transactions/?page[size]=50`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZERION_API_KEY}:`).toString('base64')}`,
          'accept': 'application/json',
        },
      }).then(res => res.ok ? res.json() : null).catch(() => null),

      // 30-day chart
      fetch(`https://api.zerion.io/v1/wallets/${address}/charts/month?currency=usd`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZERION_API_KEY}:`).toString('base64')}`,
          'accept': 'application/json',
        },
      }).then(async res => {
        if (!res.ok) {
          console.error('30d chart fetch failed:', res.status, await res.text());
          return null;
        }
        return res.json();
      }).catch(err => {
        console.error('30d chart error:', err);
        return null;
      }),

      // 7-day chart
      fetch(`https://api.zerion.io/v1/wallets/${address}/charts/week?currency=usd`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_ZERION_API_KEY}:`).toString('base64')}`,
          'accept': 'application/json',
        },
      }).then(async res => {
        if (!res.ok) {
          console.error('7d chart fetch failed:', res.status, await res.text());
          return null;
        }
        return res.json();
      }).catch(err => {
        console.error('7d chart error:', err);
        return null;
      }),
    ]);

    // Calculate derived metrics
    const analysis = calculateWalletMetrics({
      portfolio,
      pnl,
      positions,
      transactions,
      chart30d,
      chart7d,
    });

    return NextResponse.json({
      success: true,
      address,
      timestamp: new Date().toISOString(),
      data: analysis,
      raw: {
        portfolio,
        pnl,
        positions,
        transactions,
        charts: {
          chart30d,
          chart7d,
        },
      },
    });
  } catch (error) {
    console.error('Wallet analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch wallet analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get readable chain name from chain ID
 */
function getChainName(chainId: string | undefined): string {
  if (!chainId) return 'Unknown';

  const chainMap: Record<string, string> = {
    '0g': '0G',
    'abstract': 'Abstract',
    'ape': 'ApeChain',
    'arbitrum': 'Arbitrum',
    'aurora': 'Aurora',
    'avalanche': 'Avalanche',
    'base': 'Base',
    'berachain': 'Berachain',
    'binance-smart-chain': 'BSC',
    'blast': 'Blast',
    'celo': 'Celo',
    'degen': 'Degen',
    'ethereum': 'Ethereum',
    'fantom': 'Fantom',
    'gravity-alpha': 'Gravity',
    'hyperevm': 'HyperEVM',
    'ink': 'Ink',
    'katana': 'Katana',
    'lens': 'Lens',
    'linea': 'Linea',
    'manta-pacific': 'Manta',
    'mantle': 'Mantle',
    'metis-andromeda': 'Metis',
    'mode': 'Mode',
    'optimism': 'Optimism',
    'plasma': 'Plasma',
    'polygon': 'Polygon',
    'polygon-zkevm': 'Polygon zkEVM',
    'rari': 'RARI',
    'ronin': 'Ronin',
    'scroll': 'Scroll',
    'sei': 'Sei',
    'solana': 'Solana',
    'somnia': 'Somnia',
    'soneium': 'Soneium',
    'sonic': 'Sonic',
    'taiko': 'Taiko',
    'unichain': 'Unichain',
    'wonder': 'Wonder',
    'world': 'World',
    'xdai': 'Gnosis',
    'xinfin-xdc': 'XinFin',
    'zero': 'Zero',
    'zkcandy': 'zkCandy',
    'zksync-era': 'zkSync Era',
    'zora': 'Zora',
  };

  return chainMap[chainId] || chainId.charAt(0).toUpperCase() + chainId.slice(1);
}

/**
 * Calculate wallet performance metrics from raw Zerion data
 */
function calculateWalletMetrics(data: any) {
  const { pnl, positions, transactions, chart30d, chart7d } = data;

  // Extract PnL data
  const pnlData = pnl?.data?.attributes || {};
  const realizedGain = pnlData.realized_gain || 0;
  const unrealizedGain = pnlData.unrealized_gain || 0;
  const totalPnL = realizedGain + unrealizedGain;
  const netInvested = pnlData.net_invested || 1; // Avoid division by zero
  const totalFees = pnlData.total_fee || 0;

  // Calculate PnL percentage
  const pnlPercentage = (totalPnL / netInvested) * 100;

  // Extract portfolio value
  const positionsArray = positions?.data || [];
  const portfolioValue = positionsArray.reduce((sum: number, pos: any) => {
    return sum + (pos.attributes?.value || 0);
  }, 0);

  // Calculate returns from charts
  const chart30dPoints = chart30d?.data?.attributes?.points || [];
  const chart7dPoints = chart7d?.data?.attributes?.points || [];

  const return30d = calculateReturn(chart30dPoints);
  const return7d = calculateReturn(chart7dPoints);

  // Analyze transactions for trading behavior
  const txArray = transactions?.data || [];
  const tradingMetrics = analyzeTransactions(txArray);

  // Portfolio diversification
  const topHoldings = positionsArray
    .filter((pos: any) => pos.attributes?.value > 0)
    .sort((a: any, b: any) => b.attributes.value - a.attributes.value)
    .slice(0, 5)
    .map((pos: any) => ({
      symbol: pos.attributes?.fungible_info?.symbol || 'Unknown',
      name: pos.attributes?.fungible_info?.name || 'Unknown',
      value: pos.attributes?.value || 0,
      percentage: portfolioValue > 0 ? ((pos.attributes?.value || 0) / portfolioValue) * 100 : 0,
      quantity: pos.attributes?.quantity?.numeric || '0',
      icon: pos.attributes?.fungible_info?.icon?.url || null,
      chain: pos.relationships?.chain?.data?.id || 'unknown',
      chainName: getChainName(pos.relationships?.chain?.data?.id),
    }));

  const totalHoldings = positionsArray.filter((pos: any) => pos.attributes?.value > 0).length;
  const top3Concentration = topHoldings.slice(0, 3).reduce((sum: number, h: any) => sum + h.percentage, 0);

  return {
    performance: {
      portfolioValue,
      realizedPnL: realizedGain,
      unrealizedPnL: unrealizedGain,
      totalPnL,
      pnlPercentage,
      totalFees,
      return30d,
      return7d,
    },
    portfolio: {
      totalValue: portfolioValue,
      totalHoldings,
      topHoldings,
      diversification: {
        top3Concentration,
        diversificationScore: Math.max(0, 100 - top3Concentration), // Higher is more diversified
      },
    },
    trading: tradingMetrics,
  };
}

/**
 * Calculate percentage return from chart points
 */
function calculateReturn(points: any[]): number {
  if (!points || points.length < 2) return 0;

  const firstValue = points[0]?.[1] || 0;
  const lastValue = points[points.length - 1]?.[1] || 0;

  if (firstValue === 0) return 0;

  return ((lastValue - firstValue) / firstValue) * 100;
}

/**
 * Analyze transactions to calculate trading metrics
 */
function analyzeTransactions(transactions: any[]): any {
  if (!transactions || transactions.length === 0) {
    return {
      totalTransactions: 0,
      recentActivity: [],
      tradingFrequency: 'Unknown',
      lastActivity: null,
    };
  }

  // Filter out trash transactions and get recent 10
  const validTransactions = transactions.filter(
    (tx: any) => !tx.attributes?.flags?.is_trash
  );

  const recentActivity = validTransactions.slice(0, 10).map((tx: any) => {
    const attrs = tx.attributes || {};
    const operationType = attrs.operation_type || 'unknown';
    const chain = tx.relationships?.chain?.data?.id || 'unknown';

    // Extract detailed token transfers
    const transfers = (attrs.transfers || []).map((transfer: any) => {
      const fungibleInfo = transfer.fungible_info || transfer.nft_info;
      return {
        symbol: fungibleInfo?.symbol || 'Unknown',
        name: fungibleInfo?.name || 'Unknown',
        direction: transfer.direction || 'unknown',
        quantity: transfer.quantity?.numeric || '0',
        quantityFloat: transfer.quantity?.float || 0,
        value: transfer.value || null,
        price: transfer.price || null,
        sender: transfer.sender,
        recipient: transfer.recipient,
        icon: fungibleInfo?.icon?.url || null,
        verified: fungibleInfo?.flags?.verified || false,
      };
    });

    // Extract fee information
    const feeInfo = attrs.fee
      ? {
          symbol: attrs.fee.fungible_info?.symbol || 'Unknown',
          amount: attrs.fee.quantity?.numeric || '0',
          amountFloat: attrs.fee.quantity?.float || 0,
          value: attrs.fee.value || null,
        }
      : null;

    return {
      type: operationType,
      timestamp: attrs.mined_at,
      hash: attrs.hash || tx.id,
      chain,
      chainName: getChainName(chain),
      status: attrs.status || 'unknown',
      transfers,
      fee: feeInfo,
      sentFrom: attrs.sent_from,
      sentTo: attrs.sent_to,
      block: attrs.mined_at_block,
    };
  });

  // Calculate trading frequency
  const first = transactions[transactions.length - 1]?.attributes?.mined_at;
  const last = transactions[0]?.attributes?.mined_at;
  let tradingFrequency = 'Unknown';

  if (first && last) {
    const daysDiff = (new Date(last).getTime() - new Date(first).getTime()) / (1000 * 60 * 60 * 24);
    const tradesPerDay = transactions.length / daysDiff;

    if (tradesPerDay >= 1) tradingFrequency = 'Very Active';
    else if (tradesPerDay >= 0.5) tradingFrequency = 'Active';
    else if (tradesPerDay >= 0.2) tradingFrequency = 'Moderate';
    else tradingFrequency = 'Passive';
  }

  return {
    totalTransactions: transactions.length,
    recentActivity,
    tradingFrequency,
    lastActivity: last,
  };
}
