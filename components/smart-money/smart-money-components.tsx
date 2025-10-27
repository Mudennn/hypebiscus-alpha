"use client";

/**
 * Smart Money Page Components (Saved for future use)
 * These components contain wallet analysis, market data, and comparison features
 * that will be used when implementing the Smart Money Tracker feature
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Share2,
} from "lucide-react";
import { DetectedIntent } from "@/lib/intent-detector";

/**
 * Wallet data panel - Shows wallet portfolio and transaction history
 */
export function WalletPanel({
  intent,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, unknown>;
  loading?: boolean;
}) {
  const wallet = intent.wallets?.[0] || "Unknown";
  const shortWallet = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wallet Analysis</CardTitle>
          <CardDescription>{shortWallet}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm text-neutral-600">Total Balance</div>
                <div className="text-2xl font-bold">$245,670.45</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <MetricBadge label="Assets" value="8" />
                <MetricBadge label="Transactions" value="342" />
                <MetricBadge label="Win Rate" value="62%" />
                <MetricBadge label="PnL" value="+$45.2K" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AssetBadge symbol="SOL" percentage={45} value="$110K" />
            <AssetBadge symbol="USDC" percentage={30} value="$73.7K" />
            <AssetBadge symbol="BONK" percentage={15} value="$36.8K" />
            <AssetBadge symbol="Other" percentage={10} value="$24.6K" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <TransactionRow
            type="buy"
            token="PUMP"
            amount="50,000"
            value="$1,250"
            time="2h ago"
          />
          <TransactionRow
            type="sell"
            token="BONK"
            amount="100K"
            value="$800"
            time="5h ago"
          />
          <TransactionRow
            type="buy"
            token="JTO"
            amount="250"
            value="$5,500"
            time="1d ago"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Watch
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}

/**
 * Market data panel - Shows trending tokens and sector performance
 */
export function MarketPanel({
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, unknown>;
  loading?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Overview</CardTitle>
          <CardDescription>Real-time trending data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium text-neutral-700">
                  Top Gainers
                </div>
                <TokenRow
                  symbol="PUMP"
                  change="+28.5%"
                  price="$2.34"
                  volume="$450M"
                />
                <TokenRow
                  symbol="BONK"
                  change="+15.2%"
                  price="$0.0082"
                  volume="$380M"
                />
                <TokenRow
                  symbol="JTO"
                  change="+8.4%"
                  price="$3.56"
                  volume="$220M"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sector Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sector Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <SectorRow sector="DeFi" performance="+12.3%" tokens="24" />
          <SectorRow sector="NFT" performance="+5.8%" tokens="18" />
          <SectorRow sector="MEMEs" performance="+18.2%" tokens="42" />
          <SectorRow sector="Utility" performance="-2.1%" tokens="35" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Comparison data panel - Side-by-side token comparison
 */
export function ComparisonPanel({
  intent,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, unknown>;
  loading?: boolean;
}) {
  const from = intent.comparison?.from || "Token A";
  const to = intent.comparison?.to || "Token B";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {from} vs {to}
          </CardTitle>
          <CardDescription>Side-by-side comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            </div>
          ) : (
            <div className="space-y-4">
              <ComparisonMetric
                metric="Price"
                value1="$152.34"
                value2="$0.0082"
              />
              <ComparisonMetric
                metric="Market Cap"
                value1="$45.2B"
                value2="$2.1B"
              />
              <ComparisonMetric
                metric="24h Volume"
                value1="$12.3B"
                value2="$380M"
              />
              <ComparisonMetric
                metric="Liquidity"
                value1="$2.1M"
                value2="$156K"
              />
              <ComparisonMetric metric="Holders" value1="1.2M" value2="450K" />
              <ComparisonMetric
                metric="Health Score"
                value1="78/100"
                value2="65/100"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Winner Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-1">
              Better for Risk Management
            </p>
            <p className="text-lg font-bold text-green-700">{from}</p>
            <p className="text-xs text-neutral-500 mt-2">
              Higher liquidity & more holders
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Alert setup panel - Create price/volume alerts
 */
export function AlertPanel({ intent }: { intent: DetectedIntent }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create Alert</CardTitle>
          <CardDescription>Alert Type: {intent.alertType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset</label>
            <div className="p-2 bg-neutral-100 rounded text-sm">
              {intent.tokens?.join(", ") || "Select token"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition</label>
            <select className="w-full px-3 py-2 border rounded-md text-sm">
              <option>Price goes above</option>
              <option>Price goes below</option>
              <option>Volume increases by</option>
              <option>Large whale movement</option>
              <option>Risk score changes</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Threshold</label>
            <input
              type="text"
              placeholder="Enter value"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <Button className="w-full">Create Alert</Button>
        </CardContent>
      </Card>

      <div className="text-xs text-neutral-500 text-center">
        You&apos;ll receive notifications when this condition is met
      </div>
    </div>
  );
}

/**
 * Reusable Helper Components
 */

export function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

export function AssetBadge({
  symbol,
  percentage,
  value,
}: {
  symbol: string;
  percentage: number;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{symbol}</span>
        <span className="text-xs text-neutral-600">{value}</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-neutral-500 text-right">{percentage}%</div>
    </div>
  );
}

export function TransactionRow({
  type,
  token,
  amount,
  value,
  time,
}: {
  type: "buy" | "sell";
  token: string;
  amount: string;
  value: string;
  time: string;
}) {
  const bgColor = type === "buy" ? "bg-green-50" : "bg-red-50";
  const borderColor = type === "buy" ? "border-green-200" : "border-red-200";

  return (
    <div className={`p-2 rounded border ${bgColor} ${borderColor} text-xs`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold capitalize">
            {type} {token}
          </div>
          <div className="text-neutral-600">{amount}</div>
        </div>
        <div className="text-right">
          <div className="font-semibold">{value}</div>
          <div className="text-neutral-600">{time}</div>
        </div>
      </div>
    </div>
  );
}

export function TokenRow({
  symbol,
  change,
  price,
  volume,
}: {
  symbol: string;
  change: string;
  price: string;
  volume: string;
}) {
  const isPositive = change.startsWith("+");

  return (
    <div className="flex items-center justify-between py-2 px-2 bg-neutral-50 rounded">
      <div>
        <div className="font-semibold text-sm">{symbol}</div>
        <div className="text-xs text-neutral-600">{price}</div>
      </div>
      <div className="text-right">
        <div
          className={`text-sm font-semibold ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </div>
        <div className="text-xs text-neutral-600">{volume}</div>
      </div>
    </div>
  );
}

export function SectorRow({
  sector,
  performance,
  tokens,
}: {
  sector: string;
  performance: string;
  tokens: string;
}) {
  const isPositive = performance.startsWith("+");

  return (
    <div className="flex items-center justify-between py-2 px-2 bg-neutral-50 rounded">
      <div>
        <div className="font-semibold text-sm">{sector}</div>
        <div className="text-xs text-neutral-600">{tokens} tokens</div>
      </div>
      <div
        className={`text-sm font-semibold ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {performance}
      </div>
    </div>
  );
}

export function ComparisonMetric({
  metric,
  value1,
  value2,
}: {
  metric: string;
  value1: string;
  value2: string;
}) {
  return (
    <div className="space-y-2 py-2 border-b last:border-b-0">
      <div className="text-sm text-neutral-600">{metric}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-neutral-100 rounded">
          <div className="text-sm font-semibold">{value1}</div>
        </div>
        <div className="p-2 bg-neutral-100 rounded">
          <div className="text-sm font-semibold">{value2}</div>
        </div>
      </div>
    </div>
  );
}
