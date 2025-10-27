import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TradingBehaviorProps {
  behavior: {
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
  };
}

export function TradingBehavior({ behavior }: TradingBehaviorProps) {
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const getFrequencyColor = (frequency: string): string => {
    const colors: Record<string, string> = {
      'Very Active': 'text-red-600 bg-red-50',
      'Active': 'text-orange-600 bg-orange-50',
      'Moderate': 'text-yellow-600 bg-yellow-50',
      'Passive': 'text-green-600 bg-green-50',
    };
    return colors[frequency] || 'text-slate-600 bg-slate-50';
  };

  const getConcentrationLevel = (concentration: number): { label: string; color: string } => {
    if (concentration > 70) return { label: 'High Risk', color: 'text-red-600' };
    if (concentration > 50) return { label: 'Moderate Risk', color: 'text-yellow-600' };
    return { label: 'Low Risk', color: 'text-green-600' };
  };

  const concentrationInfo = getConcentrationLevel(behavior.riskMetrics.portfolioConcentration);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Trading Behavior
        </CardTitle>
        <CardDescription>
          Detailed analysis of trading patterns and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Avg Trade Size</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(behavior.avgTradeSize)}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Trading Frequency</p>
            <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getFrequencyColor(behavior.tradingFrequency)}`}>
              {behavior.tradingFrequency}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Trades Per Week</p>
            <p className="text-xl font-bold text-slate-900">
              {behavior.tradesPerWeek.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Preferred Categories */}
        {behavior.preferredCategories.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Preferred Categories</p>
            <div className="space-y-2">
              {behavior.preferredCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium text-slate-700 min-w-[80px]">
                      {cat.category}
                    </span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 ml-3 min-w-[60px] text-right">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Risk Metrics</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm text-slate-600">Portfolio Concentration</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {behavior.riskMetrics.portfolioConcentration.toFixed(1)}%
                </span>
                <span className={`text-xs font-semibold ${concentrationInfo.color}`}>
                  {concentrationInfo.label}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm text-slate-600">Portfolio Diversification</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {behavior.riskMetrics.categoryDiversification.toFixed(0)}/100
                </span>
                <div className="w-20 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${behavior.riskMetrics.categoryDiversification}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="text-sm text-slate-600">Avg Position Size</span>
              <span className="text-sm font-semibold text-slate-900">
                {behavior.riskMetrics.avgPositionSize.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
