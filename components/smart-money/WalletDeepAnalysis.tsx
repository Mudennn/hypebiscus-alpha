'use client';

import { useState, useEffect } from 'react';
import {
  Loader,
  AlertCircle,
  Wallet,
  BarChart3,
  Activity,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { HoldingRow } from './HoldingRow';
import { TransactionRow } from './TransactionRow';

interface WalletDeepAnalysisProps {
  walletAddress?: string;
}

export default function WalletDeepAnalysis({
  walletAddress = '0xd2DD7b597Fd2435b6dB61ddf48544fd931e6869F',
}: WalletDeepAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWalletAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const fetchWalletAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/zerion/wallet-analysis?address=${walletAddress}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wallet analysis');
      }

      const data = await response.json();
      console.log('=== API Response (JSON) ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('=== Analysis Data (JSON) ===');
      console.log(JSON.stringify(data.data, null, 2));
      setAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching wallet analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-slate-400 animate-spin" />
        <span className="ml-2 text-slate-400">Analyzing wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-300 font-medium">Error Loading Data</p>
          <p className="text-red-200 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No wallet data available</p>
      </div>
    );
  }

  const { performance, portfolio, trading } = analysis;
  const isPositivePnL = performance.totalPnL >= 0;
  const isPositive30d = performance.return30d >= 0;
  const isPositive7d = performance.return7d >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Smart Money Wallet Analysis
            </h2>
            <p className="text-slate-400 text-sm">{formatAddress(walletAddress)}</p>
          </div>
          <button
            onClick={fetchWalletAnalysis}
            disabled={loading}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Portfolio Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Portfolio Value
            </p>
            <p className="text-3xl font-bold text-white">
              {formatValue(performance.portfolioValue)}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Total PnL
            </p>
            <p className={`text-3xl font-bold ${isPositivePnL ? 'text-green-400' : 'text-red-400'}`}>
              {isPositivePnL ? '+' : ''}
              {formatValue(performance.totalPnL)}
            </p>
            <p className={`text-sm ${isPositivePnL ? 'text-green-300' : 'text-red-300'}`}>
              {formatPercentage(performance.pnlPercentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Realized and unrealized gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Realized PnL"
              value={formatValue(performance.realizedPnL)}
              trend={performance.realizedPnL >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="Unrealized PnL"
              value={formatValue(performance.unrealizedPnL)}
              trend={performance.unrealizedPnL >= 0 ? 'up' : 'down'}
            />
            <MetricCard
              label="7d Return"
              value={formatPercentage(performance.return7d)}
              trend={isPositive7d ? 'up' : 'down'}
            />
            <MetricCard
              label="30d Return"
              value={formatPercentage(performance.return30d)}
              trend={isPositive30d ? 'up' : 'down'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Composition
          </CardTitle>
          <CardDescription>
            {portfolio.totalHoldings} assets • Diversification Score: {portfolio.diversification.diversificationScore.toFixed(0)}/100
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolio.topHoldings.map((holding: any, index: number) => (
              <HoldingRow
                key={index}
                rank={index + 1}
                symbol={holding.symbol}
                name={holding.name}
                value={holding.value}
                percentage={holding.percentage}
                icon={holding.icon}
                chain={holding.chain}
                chainName={holding.chainName}
              />
            ))}
          </div>

          {portfolio.diversification.top3Concentration > 70 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <p className="text-yellow-300 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                High concentration: Top 3 holdings represent {portfolio.diversification.top3Concentration.toFixed(0)}% of portfolio
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trading Activity
          </CardTitle>
          <CardDescription>
            {trading.tradingFrequency} trader • {trading.totalTransactions} total transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trading.recentActivity.slice(0, 5).map((tx: any, index: number) => (
              <TransactionRow
                key={index}
                type={tx.type}
                transfers={tx.transfers}
                timestamp={tx.timestamp}
                fee={tx.fee}
                hash={tx.hash}
                chain={tx.chain}
                chainName={tx.chainName}
                status={tx.status}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
