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
import { WalletProfile } from './WalletProfile';
import { TradingBehavior } from './TradingBehavior';

interface Holding {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  quantity: string;
  icon: string | null;
  chain: string;
  chainName: string;
  categories?: string[];
}

interface Transfer {
  symbol: string;
  name: string;
  direction: string;
  quantity: string;
  quantityFloat: number;
  value?: number;
  price?: number;
  sender?: string;
  recipient?: string;
  icon?: string;
  verified?: boolean;
}

interface Transaction {
  type: string;
  timestamp: string;
  hash: string;
  chain: string;
  chainName: string;
  status?: string;
  transfers: Transfer[];
  fee?: {
    symbol: string;
    amount: string;
    amountFloat: number;
    value?: number;
  } | null;
  sentFrom?: string;
  sentTo?: string;
  block?: number;
}

interface WalletProfile {
  category: string;
  expertise: string[];
  riskProfile: string;
  confidence: number;
  reasoning: string;
}

interface TradingBehavior {
  avgTradeSize: number;
  tradingFrequency: string;
  tradesPerWeek: number;
  preferredCategories: Array<{
    category: string;
    percentage: number;
    tradeCount: number;
  }>;
  riskMetrics: {
    portfolioConcentration: number;
    categoryDiversification: number;
    avgPositionSize: number;
  };
}

interface WalletAnalysis {
  profile: WalletProfile;
  behavior: TradingBehavior;
  performance: {
    portfolioValue: number;
    totalPnL: number;
    realizedPnL: number;
    unrealizedPnL: number;
    pnlPercentage: number;
    weeklyReturn: number;
    monthlyReturn: number;
    return7d: number;  // Added
    return30d: number; // Added
  };
  portfolio: {
    topHoldings: Holding[];
    totalHoldings: number;
    diversification: {
      top3Concentration: number;
      diversificationScore: number;
    };
  };
  trading: {
    totalTransactions: number;
    recentActivity: Transaction[];
    tradingFrequency: string;
    lastActivity: string | null;
  };
}

interface WalletDeepAnalysisProps {
  walletAddress?: string;
}

export default function WalletDeepAnalysis({
  walletAddress = '0xd2DD7b597Fd2435b6dB61ddf48544fd931e6869F',
}: WalletDeepAnalysisProps) {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null);
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
      // console.log('=== PnL Values ===');
      // console.log('totalPnL:', data.data?.performance?.totalPnL);
      // console.log('realizedPnL:', data.data?.performance?.realizedPnL);
      // console.log('unrealizedPnL:', data.data?.performance?.unrealizedPnL);
      // console.log('portfolioValue:', data.data?.performance?.portfolioValue);
      // console.log('pnlPercentage:', data.data?.performance?.pnlPercentage);

      // // Check if the values are unreasonably large (indicates bad data)
      // const totalPnL = data.data?.performance?.totalPnL;
      // const portfolioValue = data.data?.performance?.portfolioValue;

      // if (Math.abs(totalPnL) > portfolioValue * 1000) {
      //   console.warn('⚠️ PnL values seem incorrect - much larger than portfolio value');
      //   console.warn('This is likely bad data from Zerion API');
      // }

      setAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching wallet analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number): string => {
    const absValue = Math.abs(value);
    const sign = value >= 0 ? '$' : '-$';

    if (absValue >= 1_000_000_000_000) {
      return `${sign}${(absValue / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (absValue >= 1_000_000_000) {
      return `${sign}${(absValue / 1_000_000_000).toFixed(2)}B`;
    }
    if (absValue >= 1_000_000) {
      return `${sign}${(absValue / 1_000_000).toFixed(2)}M`;
    }
    if (absValue >= 1_000) {
      return `${sign}${(absValue / 1_000).toFixed(2)}K`;
    }
    return `${sign}${absValue.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
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

  const { performance, portfolio, trading, profile, behavior } = analysis;
  const isPositivePnL = performance.totalPnL >= 0;
  const isPositive30d = performance.return30d >= 0;
  const isPositive7d = performance.return7d >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm border border-[#e7e7ee] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gary-900 mb-2 flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Smart Money Wallet Analysis
            </h2>
            <p className="text-slate-400 text-sm">{formatAddress(walletAddress)}</p>
          </div>
          <button
            onClick={fetchWalletAnalysis}
            disabled={loading}
            className="p-2 bg-red-700 hover:bg-red-600 disabled:bg-red-800 text-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Portfolio Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-[#e7e7ee]">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Portfolio Value
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {formatValue(performance.portfolioValue)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7e7ee]">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Total PnL
            </p>
            <p className={`text-3xl font-bold ${isPositivePnL ? 'text-green-600' : 'text-red-600'}`}>
              {isPositivePnL ? '+' : ''}
              {formatValue(performance.totalPnL)}
            </p>
            <p className={`text-sm ${isPositivePnL ? 'text-green-500' : 'text-red-500'}`}>
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

      {/* Wallet Profile & Trading Behavior */}
      {profile && behavior && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletProfile profile={profile} />
          <TradingBehavior behavior={behavior} />
        </div>
      )}


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
            {portfolio.topHoldings.map((holding: Holding, index: number) => (
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
                categories={holding.categories}
              />
            ))}
          </div>

          {portfolio.diversification.top3Concentration > 70 && (
            <div className="mt-4 p-3 bg-red-900/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm flex items-center gap-2">
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
            {trading.recentActivity.slice(0, 5).map((tx: Transaction, index: number) => (
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
