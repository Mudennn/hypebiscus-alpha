/**
 * Jupiter API Client
 * Handles token price data from Jupiter aggregator
 */

const JUPITER_LITE_API = 'https://lite-api.jup.ag/tokens/v2';

interface JupiterToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon?: string;
  tags?: string[];
  usdPrice?: number;
  mcap?: number;
  fdv?: number;
  liquidity?: number;
  holderCount?: number;
  organicScore?: number;
  stats24h?: {
    priceChange: number;
    volumeChange: number;
    buyVolume: number;
    sellVolume: number;
  };
}

export const jupiterClient = {
  /**
   * Search for token by symbol - uses search endpoint which includes price data
   */
  async searchToken(symbol: string): Promise<JupiterToken | null> {
    try {
      console.log(`Searching for token: ${symbol}`);
      const response = await fetch(`${JUPITER_LITE_API}/search?query=${encodeURIComponent(symbol)}`);

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const tokens = await response.json() as JupiterToken[];

      // Find exact match by symbol
      const token = tokens.find(
        t => t.symbol.toLowerCase() === symbol.toLowerCase()
      );

      if (token) {
        console.log(`Found token ${symbol}:`, {
          symbol: token.symbol,
          name: token.name,
          price: token.usdPrice,
          mcap: token.mcap
        });
      } else {
        console.log(`Token not found: ${symbol}`);
      }

      return token || null;
    } catch (error) {
      console.error(`Error searching token ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get token info with price by symbol
   */
  async getTokenWithPrice(symbol: string): Promise<any> {
    try {
      console.log(`Getting token with price for: ${symbol}`);

      // Search for the token - this already includes price data
      const token = await this.searchToken(symbol);

      if (!token) {
        console.log(`Token not found: ${symbol}`);
        return null;
      }

      const result = {
        symbol: token.symbol,
        name: token.name,
        id: token.id,
        decimals: token.decimals,
        icon: token.icon,
        price: token.usdPrice || null,
        marketCap: token.mcap,
        liquidity: token.liquidity,
        holderCount: token.holderCount,
        organicScore: token.organicScore,
        priceChange24h: token.stats24h?.priceChange,
        volume24h: token.stats24h ? token.stats24h.buyVolume + token.stats24h.sellVolume : null,
      };

      console.log(`Token data for ${symbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error fetching token with price for ${symbol}:`, error);
      return null;
    }
  },

  /**
   * Get multiple token prices at once
   */
  async getMultipleTokensWithPrices(symbols: string[]): Promise<any[]> {
    try {
      const results = [];

      for (const symbol of symbols) {
        const tokenData = await this.getTokenWithPrice(symbol);
        if (tokenData) {
          results.push(tokenData);
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      throw error;
    }
  },
};
