"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Bell,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetectedIntent } from "@/lib/intent-detector";

interface TokenData {
  symbol?: string;
  name?: string;
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
  liquidity?: number;
  holderCount?: number;
  organicScore?: number;
  icon?: string;
  [key: string]: unknown;
}

interface DataPanelProps {
  intent: DetectedIntent | null;
  loading?: boolean;
  data?: Record<string, unknown>;
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
  data?: Record<string, unknown>;
  loading?: boolean;
}) {
  const tokenSymbol = intent.tokens?.[0] || "Unknown";

  // Extract Jupiter token data from API response
  const tokenData = data?.data as TokenData | undefined;

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
    // Add thousands separators for larger prices
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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
            src={tokenData?.icon || '/placeholder-token.png'}
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
            const riskFactors: Array<{ label: string; status: 'safe' | 'warning' | 'danger' }> = [];

            // Organic Score (40% weight)
            if (tokenData?.organicScore) {
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
            if (tokenData?.liquidity) {
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
            if (tokenData?.holderCount) {
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
            if (tokenData?.priceChange24h !== null && tokenData?.priceChange24h !== undefined) {
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
            const signals: string[] = [];

            // Organic Score signal
            if (tokenData?.organicScore) {
              if (tokenData.organicScore >= 70) {
                score += 3;
                signals.push("High quality token");
              } else if (tokenData.organicScore < 40) {
                score -= 2;
                signals.push("Low quality concerns");
              }
            }

            // Liquidity signal
            if (tokenData?.liquidity) {
              if (tokenData.liquidity >= 1000000) {
                score += 2;
                signals.push("Easy to trade");
              } else if (tokenData.liquidity < 100000) {
                score -= 2;
                signals.push("Low liquidity risk");
              }
            }

            // Price momentum signal
            if (tokenData?.priceChange24h !== null && tokenData?.priceChange24h !== undefined) {
              if (tokenData.priceChange24h > 10) {
                score += 1;
                signals.push("Strong upward momentum");
              } else if (tokenData.priceChange24h < -10) {
                score -= 1;
                signals.push("Declining price");
              }
            }

            // Holder distribution signal
            if (tokenData?.holderCount) {
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
      {tokenData?.priceChange24h !== null && tokenData?.priceChange24h !== undefined && (
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

