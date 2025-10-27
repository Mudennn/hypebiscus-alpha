/**
 * Zerion API Client
 * Handles all portfolio, token data, and wallet tracking requests
 */

const ZERION_API_BASE = 'https://api.zerion.io/v1';
const ZERION_API_KEY = process.env.NEXT_PUBLIC_ZERION_API_KEY || '';

interface ZerionPortfolioResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      total: {
        value: number;
      };
    };
    relationships: {
      assets: {
        data: Array<{
          id: string;
          type: string;
        }>;
      };
      positions: {
        data: Array<{
          id: string;
          type: string;
        }>;
      };
    };
  };
}

interface ZerionAssetData {
  id: string;
  type: string;
  attributes: {
    symbol: string;
    name: string;
    icon: {
      url: string;
    };
    price: number;
    decimals: number;
  };
}

interface ZerionTransactionResponse {
  data: Array<{
    id: string;
    attributes: {
      direction: string;
      sent: Array<{
        quantity: number;
        price: number;
      }>;
      received: Array<{
        quantity: number;
        price: number;
      }>;
      mined_at: string;
    };
  }>;
}

interface ZerionTokenResponse {
  data: {
    id: string;
    attributes: {
      symbol: string;
      name: string;
      price: number;
      market_cap_rank: number;
      total_supply: number;
      decimals: number;
      icon: {
        url: string;
      };
    };
  };
}

interface ZerionMarketData {
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      symbol?: string;
      name?: string;
      price?: number;
      market_cap?: number;
      volume_24h?: number;
      price_change_24h?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

const getAuthHeader = (): string => {
  const credentials = `${ZERION_API_KEY}:`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
};

export const zerionClient = {
  /**
   * Fetch token market data with price (using market endpoint)
   */
  async getTokenMarketData(tokenSymbol: string): Promise<ZerionMarketData> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/market/tokens/${tokenSymbol.toLowerCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${ZERION_API_KEY}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching token market data:', error);
      throw error;
    }
  },

  /**
   * Fetch wallet portfolio data
   */
  async getPortfolio(address: string): Promise<ZerionPortfolioResponse> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/wallets/${address}/portfolio?currency=usd`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json() as ZerionPortfolioResponse;
      return data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },

  /**
   * Fetch wallet transactions (inflows)
   */
  async getWalletInflows(
    address: string,
    limit: number = 10
  ): Promise<ZerionTransactionResponse> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/wallets/${address}/transactions?filter=inbound&limit=${limit}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json() as ZerionTransactionResponse;
      return data;
    } catch (error) {
      console.error('Error fetching inflows:', error);
      throw error;
    }
  },

  /**
   * Fetch wallet transactions (outflows)
   */
  async getWalletOutflows(
    address: string,
    limit: number = 10
  ): Promise<ZerionTransactionResponse> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/wallets/${address}/transactions?filter=outbound&limit=${limit}`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json() as ZerionTransactionResponse;
      return data;
    } catch (error) {
      console.error('Error fetching outflows:', error);
      throw error;
    }
  },

  /**
   * Fetch token data by address
   */
  async getTokenData(
    tokenAddress: string,
    chain: string = 'solana'
  ): Promise<ZerionTokenResponse> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/assets/${chain}/${tokenAddress}?currency=usd`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json() as ZerionTokenResponse;
      return data;
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw error;
    }
  },

  /**
   * Search for tokens by query (using fungibles endpoint)
   */
  async searchTokens(query: string): Promise<ZerionAssetData[]> {
    try {
      const response = await fetch(
        `${ZERION_API_BASE}/fungibles/?filter[search_query]=${encodeURIComponent(
          query
        )}&currency=usd`,
        {
          headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Zerion API error: ${response.status}`);
      }

      const data = await response.json() as { data: ZerionAssetData[] };
      return data.data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error;
    }
  },

  /**
   * Get token balance for a wallet
   */
  async getTokenBalance(
    address: string,
    tokenAddress: string
  ): Promise<number> {
    try {
      const portfolio = await this.getPortfolio(address);
      const assets = portfolio.data.relationships.assets.data;

      const tokenAsset = assets.find(
        (asset) =>
          asset.id.toLowerCase().includes(tokenAddress.toLowerCase())
      );

      return tokenAsset ? 1 : 0;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  },
};
