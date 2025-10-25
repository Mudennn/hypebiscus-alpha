"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Bell,
  Share2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetectedIntent } from "@/lib/intent-detector";

interface DataPanelProps {
  intent: DetectedIntent | null;
  loading?: boolean;
  data?: Record<string, any>;
}

export default function DataPanel({
  intent,
  loading = false,
  data,
}: DataPanelProps) {
  const [panelContent, setPanelContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!intent || intent.type === "general") {
      setPanelContent(<EmptyState />);
      return;
    }

    switch (intent.type) {
      case "token":
        setPanelContent(
          <TokenPanel intent={intent} data={data} loading={loading} />
        );
        break;
      case "wallet":
        setPanelContent(
          <WalletPanel intent={intent} data={data} loading={loading} />
        );
        break;
      case "market":
        setPanelContent(
          <MarketPanel intent={intent} data={data} loading={loading} />
        );
        break;
      case "comparison":
        setPanelContent(
          <ComparisonPanel intent={intent} data={data} loading={loading} />
        );
        break;
      case "alert":
        setPanelContent(<AlertPanel intent={intent} />);
        break;
      default:
        setPanelContent(<EmptyState />);
    }
  }, [intent, data, loading]);

  return (
    <div className="h-full overflow-y-auto bg-neutral-50 p-4">
      <div className="space-y-4">{panelContent}</div>
    </div>
  );
}

/**
 * Empty state when no intent is detected
 */
function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-2">
          <p className="text-sm text-neutral-500">
            Start typing a question to see related data
          </p>
          <p className="text-xs text-neutral-400">
            Ask about tokens, wallets, or market trends
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Token data panel
 */
function TokenPanel({
  intent,
  data,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, any>;
  loading?: boolean;
}) {
  const tokenSymbol = intent.tokens?.[0] || "Unknown";

  // Extract Jupiter token data from API response
  const tokenData = data?.data;

  // Helper to format large numbers
  const formatNumber = (num: number | null | undefined) => {
    if (!num) return "N/A";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "N/A";
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatCount = (count: number | null | undefined) => {
    if (!count) return "N/A";
    if (count >= 1e6) return `${(count / 1e6).toFixed(1)}M`;
    if (count >= 1e3) return `${(count / 1e3).toFixed(1)}K`;
    return count.toString();
  };

  const priceChange24h = tokenData?.priceChange24h;
  const isPositiveChange = priceChange24h && priceChange24h > 0;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-start px-5 gap-2">
          <Image
            src={tokenData.icon}
            alt={tokenSymbol}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">
              {tokenData?.symbol || tokenSymbol}
            </h2>
            <span>
              {tokenData?.name}
            </span>
          </div>
        </div>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            </div>
          ) : tokenData ? (
            <>
              {/* Price Card */}
              <div className="space-y-2">
                <div className="text-sm text-neutral-600">Price</div>
                <div className="text-2xl font-bold">
                  {formatPrice(tokenData.price)}
                </div>
                {priceChange24h !== null && priceChange24h !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      isPositiveChange ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositiveChange ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {isPositiveChange ? "+" : ""}
                    {priceChange24h.toFixed(2)}% (24h)
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <MetricBadge
                  label="Market Cap"
                  value={formatNumber(tokenData.marketCap)}
                />
                <MetricBadge
                  label="Volume (24h)"
                  value={formatNumber(tokenData.volume24h)}
                />
                <MetricBadge
                  label="Liquidity"
                  value={formatNumber(tokenData.liquidity)}
                />
                <MetricBadge
                  label="Holders"
                  value={formatCount(tokenData.holderCount)}
                />
              </div>

              {/* Organic Score */}
              {tokenData.organicScore && (
                <div className="pt-3 border-t">
                  <div className="text-sm text-neutral-600 mb-2">
                    Organic Score
                  </div>
                  <HealthBar score={Math.round(tokenData.organicScore)} />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">No data available</p>
              <p className="text-xs mt-1">
                Token not found or data is loading...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Analysis & Buy Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Overall Risk Score */}
          {(() => {
            // Calculate risk score based on multiple factors
            let riskScore = 0;
            let riskFactors = [];

            // Organic Score (40% weight)
            if (tokenData.organicScore) {
              if (tokenData.organicScore >= 70) {
                riskScore += 40;
                riskFactors.push({ label: "High Quality Token", status: "safe" as const });
              } else if (tokenData.organicScore >= 40) {
                riskScore += 25;
                riskFactors.push({ label: "Moderate Quality", status: "warning" as const });
              } else {
                riskScore += 10;
                riskFactors.push({ label: "Low Quality Token", status: "danger" as const });
              }
            }

            // Liquidity (30% weight)
            if (tokenData.liquidity) {
              if (tokenData.liquidity >= 1000000) {
                riskScore += 30;
                riskFactors.push({ label: "High Liquidity", status: "safe" as const });
              } else if (tokenData.liquidity >= 100000) {
                riskScore += 20;
                riskFactors.push({ label: "Moderate Liquidity", status: "warning" as const });
              } else {
                riskScore += 5;
                riskFactors.push({ label: "Low Liquidity Risk", status: "danger" as const });
              }
            }

            // Holder Distribution (20% weight)
            if (tokenData.holderCount) {
              if (tokenData.holderCount >= 100000) {
                riskScore += 20;
                riskFactors.push({ label: "Wide Distribution", status: "safe" as const });
              } else if (tokenData.holderCount >= 10000) {
                riskScore += 12;
                riskFactors.push({ label: "Fair Distribution", status: "warning" as const });
              } else {
                riskScore += 5;
                riskFactors.push({ label: "Concentrated Holders", status: "danger" as const });
              }
            }

            // Price Volatility (10% weight)
            if (tokenData.priceChange24h !== null && tokenData.priceChange24h !== undefined) {
              const absChange = Math.abs(tokenData.priceChange24h);
              if (absChange < 10) {
                riskScore += 10;
                riskFactors.push({ label: "Stable Price", status: "safe" as const });
              } else if (absChange < 30) {
                riskScore += 6;
                riskFactors.push({ label: "Moderate Volatility", status: "warning" as const });
              } else {
                riskScore += 2;
                riskFactors.push({ label: "High Volatility", status: "danger" as const });
              }
            }

            const riskLevel =
              riskScore >= 70 ? "Low Risk" : riskScore >= 40 ? "Medium Risk" : "High Risk";
            const riskColor =
              riskScore >= 70
                ? "text-green-600"
                : riskScore >= 40
                ? "text-yellow-600"
                : "text-red-600";
            const bgColor =
              riskScore >= 70
                ? "bg-green-50 border-green-200"
                : riskScore >= 40
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200";

            return (
              <>
                <div className={`p-3 rounded-lg border ${bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Risk Level</span>
                    <span className={`text-sm font-bold ${riskColor}`}>
                      {riskLevel}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        riskScore >= 70
                          ? "bg-green-500"
                          : riskScore >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    Score: {riskScore}/100
                  </p>
                </div>

                {/* Risk Factors */}
                <div className="space-y-2">
                  {riskFactors.map((factor, idx) => (
                    <RiskFactor
                      key={idx}
                      label={factor.label}
                      status={factor.status}
                    />
                  ))}
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* Buy/Sell Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trading Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate recommendation based on multiple signals
            let score = 0;
            let signals = [];

            // Organic Score signal
            if (tokenData.organicScore) {
              if (tokenData.organicScore >= 70) {
                score += 3;
                signals.push("High quality token");
              } else if (tokenData.organicScore < 40) {
                score -= 2;
                signals.push("Low quality concerns");
              }
            }

            // Liquidity signal
            if (tokenData.liquidity) {
              if (tokenData.liquidity >= 1000000) {
                score += 2;
                signals.push("Easy to trade");
              } else if (tokenData.liquidity < 100000) {
                score -= 2;
                signals.push("Low liquidity risk");
              }
            }

            // Price momentum signal
            if (tokenData.priceChange24h !== null && tokenData.priceChange24h !== undefined) {
              if (tokenData.priceChange24h > 10) {
                score += 1;
                signals.push("Strong upward momentum");
              } else if (tokenData.priceChange24h < -10) {
                score -= 1;
                signals.push("Declining price");
              }
            }

            // Holder distribution signal
            if (tokenData.holderCount) {
              if (tokenData.holderCount >= 100000) {
                score += 1;
                signals.push("Wide holder base");
              } else if (tokenData.holderCount < 10000) {
                score -= 1;
                signals.push("Concentrated ownership");
              }
            }

            const recommendation =
              score >= 4
                ? { action: "BUY", color: "green", bg: "bg-green-50 border-green-200" }
                : score >= 1
                ? { action: "HOLD", color: "blue", bg: "bg-blue-50 border-blue-200" }
                : score >= -2
                ? { action: "WAIT", color: "yellow", bg: "bg-yellow-50 border-yellow-200" }
                : { action: "AVOID", color: "red", bg: "bg-red-50 border-red-200" };

            return (
              <div className={`p-4 rounded-lg border ${recommendation.bg}`}>
                <div className="text-center mb-3">
                  <div
                    className={`text-2xl font-bold text-${recommendation.color}-600`}
                  >
                    {recommendation.action}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">
                    Based on current market data
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  {signals.map((signal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-600">{signal}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 italic">
                    {recommendation.action === "BUY"
                      ? "Strong fundamentals suggest potential upside. Consider your risk tolerance."
                      : recommendation.action === "HOLD"
                      ? "Decent metrics but monitor closely for changes."
                      : recommendation.action === "WAIT"
                      ? "Mixed signals. Wait for better entry opportunity."
                      : "High risk factors detected. Proceed with extreme caution."}
                  </p>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Trading Activity (24h) */}
      {tokenData.priceChange24h !== null && tokenData.priceChange24h !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">24h Trading Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Price Change */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Price Change</span>
              <span
                className={`text-sm font-semibold ${
                  tokenData.priceChange24h >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {tokenData.priceChange24h >= 0 ? "+" : ""}
                {tokenData.priceChange24h.toFixed(2)}%
              </span>
            </div>

            {/* Volume */}
            {tokenData.volume24h && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-neutral-600">24h Volume</span>
                <span className="text-sm font-semibold">
                  {formatNumber(tokenData.volume24h)}
                </span>
              </div>
            )}

            {/* Market Cap */}
            {tokenData.marketCap && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-neutral-600">Market Cap</span>
                <span className="text-sm font-semibold">
                  {formatNumber(tokenData.marketCap)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          <Bell className="w-4 h-4 mr-2" />
          Alert
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Watchlist
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
 * Wallet data panel
 */
function WalletPanel({
  intent,
  data,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, any>;
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
 * Market data panel
 */
function MarketPanel({
  intent,
  data,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, any>;
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
 * Comparison data panel
 */
function ComparisonPanel({
  intent,
  data,
  loading,
}: {
  intent: DetectedIntent;
  data?: Record<string, any>;
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
 * Alert setup panel
 */
function AlertPanel({ intent }: { intent: DetectedIntent }) {
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
        You'll receive notifications when this condition is met
      </div>
    </div>
  );
}

/**
 * Reusable Components
 */

function MetricBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function HealthBar({ score }: { score: number }) {
  const percentage = Math.min(score, 100);
  const color =
    percentage >= 70
      ? "bg-green-500"
      : percentage >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-neutral-600">Health Score</span>
        <span className="text-sm font-semibold">{score}/100</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Helper component for risk factors
function RiskFactor({
  label,
  status,
}: {
  label: string;
  status: "safe" | "warning" | "danger";
}) {
  const config = {
    safe: { icon: "✓", color: "text-green-600", bg: "bg-green-50" },
    warning: { icon: "⚠", color: "text-yellow-600", bg: "bg-yellow-50" },
    danger: { icon: "✕", color: "text-red-600", bg: "bg-red-50" },
  };

  const { icon, color, bg } = config[status];

  return (
    <div className={`flex items-center gap-2 p-2 rounded ${bg}`}>
      <span className={`text-sm font-bold ${color}`}>{icon}</span>
      <span className="text-sm text-neutral-700">{label}</span>
    </div>
  );
}

function AssetBadge({
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

function TransactionRow({
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

function TokenRow({
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

function SectorRow({
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

function ComparisonMetric({
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
