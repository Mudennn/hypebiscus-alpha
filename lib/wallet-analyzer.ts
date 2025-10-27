/**
 * Wallet Profile Analyzer
 * Categorizes wallets and analyzes trading behavior
 */

export type WalletCategory = 'Whale' | 'Smart Trader' | 'Degen' | 'HODLer' | 'Bot' | 'Casual';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';

export interface Holding {
  symbol: string;
  value: number;
  categories?: string[];
}

export interface Transfer {
  value?: number;
  direction?: string;
  symbol?: string;
  [key: string]: unknown;
}

export interface Transaction {
  transfers?: Transfer[];
  [key: string]: unknown;
}

export interface WalletProfile {
  category: WalletCategory;
  expertise: string[];           // ["DeFi", "Meme", "AI", etc.]
  riskProfile: RiskProfile;
  confidence: number;            // 0-100
  reasoning: string;
}

export interface TradingBehavior {
  avgTradeSize: number;          // Average trade value in USD
  tradingFrequency: string;      // "Very Active", "Active", etc.
  tradesPerWeek: number;
  preferredCategories: {         // What they trade most
    category: string;
    percentage: number;
    tradeCount: number;
  }[];
  riskMetrics: {
    portfolioConcentration: number;  // 0-100
    categoryDiversification: number; // 0-100
    avgPositionSize: number;         // % of portfolio
  };
}

/**
 * Analyze wallet and determine category
 */
export function categorizeWallet(data: {
  portfolioValue: number;
  totalTransactions: number;
  tradingFrequency: string;
  diversificationScore: number;
  topHoldings: Holding[];
  recentActivity: Transaction[];
}): WalletProfile {
  const { portfolioValue, totalTransactions, tradingFrequency, diversificationScore } = data;

  // Determine category based on multiple factors
  let category: WalletCategory = 'Casual';
  let confidence = 0;
  let reasoning = '';

  // Whale detection
  if (portfolioValue > 1_000_000) {
    category = 'Whale';
    confidence = 90;
    reasoning = `Large portfolio value of $${(portfolioValue / 1_000_000).toFixed(2)}M indicates whale status.`;
  }
  // Bot detection - very high frequency + low diversity
  else if (tradingFrequency === 'Very Active' && diversificationScore < 30 && totalTransactions > 100) {
    category = 'Bot';
    confidence = 75;
    reasoning = 'Very high trading frequency with low diversification suggests automated trading.';
  }
  // Degen detection - high risk, meme focus
  else if (diversificationScore < 40 && tradingFrequency !== 'Passive') {
    category = 'Degen';
    confidence = 70;
    reasoning = 'Low diversification with active trading suggests high-risk degen behavior.';
  }
  // HODLer detection - low trading frequency
  else if (tradingFrequency === 'Passive' && totalTransactions < 20) {
    category = 'HODLer';
    confidence = 80;
    reasoning = 'Low trading frequency indicates long-term holding strategy.';
  }
  // Smart Trader - balanced portfolio, moderate activity
  else if (diversificationScore > 60 && totalTransactions > 30) {
    category = 'Smart Trader';
    confidence = 75;
    reasoning = 'Good diversification with consistent trading activity suggests smart trading strategy.';
  }

  // Risk profile determination
  let riskProfile: RiskProfile = 'Moderate';
  if (diversificationScore < 40 || category === 'Degen') {
    riskProfile = 'Aggressive';
  } else if (diversificationScore > 70 || category === 'HODLer') {
    riskProfile = 'Conservative';
  }

  return {
    category,
    expertise: [], // Will be filled by analyzeExpertise
    riskProfile,
    confidence,
    reasoning,
  };
}

/**
 * Analyze wallet expertise based on token categories they hold/trade
 */
export function analyzeExpertise(
  holdings: Holding[]
): string[] {
  const categoryCount = new Map<string, number>();
  const categoryValue = new Map<string, number>();

  // Analyze current holdings
  holdings.forEach(holding => {
    if (holding.categories && holding.categories.length > 0) {
      holding.categories.forEach(cat => {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
        categoryValue.set(cat, (categoryValue.get(cat) || 0) + holding.value);
      });
    }
  });

  // Calculate total value
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  // Determine expertise (categories that are >20% of portfolio or >3 tokens)
  const expertise: string[] = [];

  categoryCount.forEach((count, category) => {
    const value = categoryValue.get(category) || 0;
    const percentage = (value / totalValue) * 100;

    if (percentage > 20 || count >= 3) {
      expertise.push(category);
    }
  });

  // If no specific expertise found, show top 3 categories by value
  if (expertise.length === 0 && categoryValue.size > 0) {
    const sortedCategories = Array.from(categoryValue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    console.log('💡 Expertise (top 3 by value):', sortedCategories);
    return sortedCategories;
  }

  const finalExpertise = expertise.length > 0 ? expertise : ['Diversified Portfolio'];
  console.log('💡 Expertise detected:', finalExpertise);
  return finalExpertise;
}

/**
 * Analyze trading behavior patterns
 */
export function analyzeTradingBehavior(data: {
  recentActivity: Transaction[];
  portfolioValue: number;
  topHoldings: Holding[];
  totalTransactions: number;
  tradingFrequency: string;
  diversificationScore?: number;
}): TradingBehavior {
  const { recentActivity, topHoldings, totalTransactions, tradingFrequency, diversificationScore } = data;

  // Calculate average trade size
  let totalTradeValue = 0;
  let tradeCount = 0;

  recentActivity.forEach(tx => {
    if (tx.transfers) {
      tx.transfers.forEach((transfer: Transfer) => {
        if (transfer.value && transfer.value > 0) {
          totalTradeValue += transfer.value;
          tradeCount++;
        }
      });
    }
  });

  const avgTradeSize = tradeCount > 0 ? totalTradeValue / tradeCount : 0;

  // Calculate trades per week (estimate based on recent activity)
  const tradesPerWeek = totalTransactions > 0
    ? (recentActivity.length / 7) * 7  // Assume recentActivity is ~1 week
    : 0;

  // Analyze preferred categories (from holdings with categories)
  const categoryStats = new Map<string, { count: number; value: number }>();

  topHoldings.forEach(holding => {
    if (holding.categories && holding.categories.length > 0) {
      holding.categories.forEach((cat: string) => {
        const stats = categoryStats.get(cat) || { count: 0, value: 0 };
        stats.count += 1;
        stats.value += holding.value || 0;
        categoryStats.set(cat, stats);
      });
    }
  });

  const totalValue = topHoldings.reduce((sum, h) => sum + (h.value || 0), 0);

  const preferredCategories = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({
      category,
      percentage: (stats.value / totalValue) * 100,
      tradeCount: stats.count,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  // Calculate risk metrics
  const top3Value = topHoldings.slice(0, 3).reduce((sum, h) => sum + (h.value || 0), 0);
  const portfolioConcentration = totalValue > 0 ? (top3Value / totalValue) * 100 : 0;

  // Use the diversificationScore from portfolio analysis if available
  // Otherwise calculate based on number of unique categories
  const categoryDiversification = diversificationScore !== undefined
    ? diversificationScore
    : Math.min(categoryStats.size * 20, 100);

  const avgPositionSize = topHoldings.length > 0 ? 100 / topHoldings.length : 0;

  return {
    avgTradeSize,
    tradingFrequency,
    tradesPerWeek,
    preferredCategories,
    riskMetrics: {
      portfolioConcentration,
      categoryDiversification,
      avgPositionSize,
    },
  };
}

/**
 * Generate emoji badge for wallet category
 */
export function getCategoryBadge(category: WalletCategory): string {
  const badges: Record<WalletCategory, string> = {
    'Whale': '🐋',
    'Smart Trader': '🎯',
    'Degen': '🎲',
    'HODLer': '💎',
    'Bot': '🤖',
    'Casual': '👤',
  };
  return badges[category];
}

/**
 * Get color for risk profile
 */
export function getRiskColor(riskProfile: RiskProfile): string {
  const colors: Record<RiskProfile, string> = {
    'Conservative': 'text-green-600',
    'Moderate': 'text-yellow-600',
    'Aggressive': 'text-red-600',
  };
  return colors[riskProfile];
}
