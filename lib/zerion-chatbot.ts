/**
 * Zerion API Client for Chatbot
 * Handles multi-chain token queries, DApp info, and protocol data
 */

const ZERION_API_BASE = 'https://api.zerion.io/v1';
const ZERION_API_KEY = process.env.NEXT_PUBLIC_ZERION_API_KEY || '';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TokenData {
  fungibleId: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h?: number;
  priceChange30d?: number;
  priceChange90d?: number;
  priceChange365d?: number;
  marketCap?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  icon?: string;
  chains?: ChainTokenInfo[];
  verified?: boolean;
}

export interface ChainTokenInfo {
  chainId: string;
  chainName: string;
  address: string;
  volume24h?: number;
  liquidity?: number;
}

export interface DAppData {
  dappId: string;
  name: string;
  description?: string;
  tvl?: number;
  users?: number;
  liquidity?: number;
  logo?: string;
  chains?: ChainDAppInfo[];
  positionTypes?: PositionType[];
  website?: string;
}

export interface ChainDAppInfo {
  chainId: string;
  chainName: string;
  tvl?: number;
  users?: number;
  volume24h?: number;
  liquidity?: number;
}

export interface PositionType {
  type: string;
  description: string;
  apy?: number;
}

export interface Chain {
  id: string;
  name: string;
  icon?: string;
}

export interface FungibleResponse {
  id: string;
  type: string;
  attributes: {
    name: string;
    symbol: string;
    description?: string;
    icon?: {
      url: string;
    };
    flags?: {
      verified?: boolean;
    };
    price?: number;
    market_cap?: number;
    volume_24h?: number;
    price_change_24h?: number;
    market_data?: {
      price?: number;
      market_cap?: number;
      volume_24h?: number;
      circulating_supply?: number;
      total_supply?: number;
      changes?: {
        percent_1d?: number;
        percent_30d?: number;
        percent_90d?: number;
        percent_365d?: number;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface FungibleListResponse {
  data: FungibleResponse[];
}

export interface ChartPoint {
  timestamp: number;
  value: number;
}

export interface TokenChart {
  period: 'week' | 'month' | 'year';
  points: ChartPoint[];
}

export interface ChartResponse {
  data: {
    attributes: {
      points: Array<[number, number]>;
    };
  };
}

export interface ChainResponse {
  id: string;
  attributes?: {
    icon?: {
      url: string;
    };
  };
}

export interface ChainsListResponse {
  data: ChainResponse[];
}

export interface WalletPosition {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

export interface WalletPositionsResponse {
  data: WalletPosition[];
}

// ============================================================================
// HELPERS
// ============================================================================

const getAuthHeader = (): string => {
  const credentials = `${ZERION_API_KEY}:`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
};

const fetchZerion = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Record<string, unknown>> => {
  try {
    const url = `${ZERION_API_BASE}${endpoint}`;
    console.log(`[Zerion API] GET ${endpoint}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`Zerion API error: ${response.status} - ${response.statusText} for ${endpoint}`);
      throw new Error(`Zerion API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Zerion API] ✓ ${endpoint} - Status: ${response.status}`);
    return data;
  } catch (error) {
    console.error(`Zerion API fetch error for ${endpoint}:`, error);
    throw error;
  }
};

// ============================================================================
// CHAIN UTILITIES
// ============================================================================

const CHAIN_MAP: Record<string, string> = {
  'ethereum': 'ethereum',
  'eth': 'ethereum',
  'polygon': 'polygon',
  'matic': 'polygon',
  'arbitrum': 'arbitrum',
  'arb': 'arbitrum',
  'optimism': 'optimism',
  'op': 'optimism',
  'base': 'base',
  'solana': 'solana',
  'sol': 'solana',
  'avalanche': 'avalanche',
  'avax': 'avalanche',
  'bsc': 'binance-smart-chain',
  'binance': 'binance-smart-chain',
  'fantom': 'fantom',
  'ftm': 'fantom',
  'celo': 'celo',
  'gnosis': 'gnosis',
  'xdai': 'gnosis',
  'zksync': 'zksync-era',
  'scroll': 'scroll',
  'manta': 'manta-pacific',
  'linea': 'linea',
  'blast': 'blast',
  'mode': 'mode',
  'mantle': 'mantle',
};

const normalizeChainId = (chain: string): string => {
  const normalized = chain.toLowerCase();
  return CHAIN_MAP[normalized] || normalized;
};

const getChainName = (chainId: string): string => {
  const chainNameMap: Record<string, string> = {
    'ethereum': 'Ethereum',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'base': 'Base',
    'solana': 'Solana',
    'avalanche': 'Avalanche',
    'binance-smart-chain': 'BSC',
    'fantom': 'Fantom',
    'celo': 'Celo',
    'gnosis': 'Gnosis',
    'zksync-era': 'zkSync Era',
    'scroll': 'Scroll',
    'manta-pacific': 'Manta Pacific',
    'linea': 'Linea',
    'blast': 'Blast',
    'mode': 'Mode',
    'mantle': 'Mantle',
  };

  return chainNameMap[chainId] || chainId.charAt(0).toUpperCase() + chainId.slice(1);
};

// ============================================================================
// PUBLIC API - TOKEN METHODS
// ============================================================================

export const zerionChatbot = {
  /**
   * Search for tokens across all chains
   * @param query Token name or symbol (e.g., "ETH", "Ethereum")
   * @param chainId Optional: filter by specific chain
   * @returns Array of matching tokens (optimized to fetch only top result with detailed data)
   */
  async searchToken(query: string, chainId?: string): Promise<TokenData[]> {
    try {
      // Step 1: Search for tokens by name/symbol to get fungible IDs
      // Only request essential fields to minimize response size
      const params = new URLSearchParams({
        'filter[search_query]': query,
        'currency': 'usd',
        'limit': '3', // Only fetch top 3 for initial search
      });

      if (chainId) {
        params.append('filter[implementation_chain_id]', normalizeChainId(chainId));
      }

      const response = await fetchZerion(`/fungibles/?${params.toString()}`);
      const fungibleListResponse = response as unknown as FungibleListResponse;
      const fungibles = fungibleListResponse.data || [];

      console.log(`[Token Search] Query: "${query}" - Found ${fungibles.length} results`);
      if (fungibles.length > 0) {
        console.log('[Token Search] Top results:', fungibles.map((f: FungibleResponse) => ({
          id: f.id,
          symbol: f.attributes.symbol,
          name: f.attributes.name,
        })));
      }

      // If no results, return empty array
      if (fungibles.length === 0) {
        console.log(`[Token Search] No tokens found for query: "${query}"`);
        return [];
      }

      // Step 2: Fetch detailed data ONLY for the top 1 result to reduce API calls
      // This is the most relevant match
      const topFungible = fungibles[0];
      console.log(`[Token Detail] Fetching details for: ${topFungible.attributes.symbol} (ID: ${topFungible.id})`);

      try {
        // Fetch detailed token data by fungible ID to get complete market data
        const detailedResponse = await fetchZerion(`/fungibles/${topFungible.id}?currency=usd`);
        const detailedData = detailedResponse as unknown as { data: FungibleResponse };
        const detailedFungible = detailedData.data;

        if (!detailedFungible) {
          console.log(`[Token Detail] No detailed data found for ${topFungible.id}`);
          return [];
        }

        const marketData = detailedFungible.attributes.market_data;
        console.log(`[Token Detail] Market Data for ${detailedFungible.attributes.symbol}:`, {
          price: marketData?.price,
          marketCap: marketData?.market_cap,
          circulatingSupply: marketData?.circulating_supply,
          totalSupply: marketData?.total_supply,
          changes: {
            percent_1d: marketData?.changes?.percent_1d,
            percent_30d: marketData?.changes?.percent_30d,
            percent_90d: marketData?.changes?.percent_90d,
            percent_365d: marketData?.changes?.percent_365d,
          },
          verified: detailedFungible.attributes.flags?.verified,
        });
        const price = marketData?.price || detailedFungible.attributes.price || 0;
        const priceChange24h = marketData?.changes?.percent_1d || detailedFungible.attributes.price_change_24h;
        const priceChange30d = marketData?.changes?.percent_30d as number | undefined;
        const priceChange90d = marketData?.changes?.percent_90d as number | undefined;
        const priceChange365d = marketData?.changes?.percent_365d as number | undefined;
        const marketCap = marketData?.market_cap || detailedFungible.attributes.market_cap;
        const circulatingSupply = marketData?.circulating_supply as number | undefined;
        const totalSupply = marketData?.total_supply as number | undefined;
        const verified = detailedFungible.attributes.flags?.verified;

        const tokenResult: TokenData = {
          fungibleId: detailedFungible.id,
          symbol: detailedFungible.attributes.symbol || 'Unknown',
          name: detailedFungible.attributes.name || 'Unknown',
          price,
          priceChange24h,
          priceChange30d,
          priceChange90d,
          priceChange365d,
          marketCap,
          circulatingSupply,
          totalSupply,
          icon: detailedFungible.attributes.icon?.url,
          verified,
        };

        console.log(`[Token Result] Returning token data:`, tokenResult);
        return [tokenResult];
      } catch (error) {
        console.error(`Error fetching detailed data for ${topFungible.id}:`, error);
        return [];
      }
    } catch (error) {
      console.error('Error searching token:', error);
      return [];
    }
  },

  /**
   * Get detailed token information including price chart
   * @param fungibleId Unique token ID from Zerion (e.g., "ethereum:0xdAC17F958D2ee523a2206206994597C13D831ec7")
   * @returns Detailed token data
   */
  async getTokenInfo(fungibleId: string): Promise<TokenData | null> {
    try {
      const response = await fetchZerion(`/fungibles/${fungibleId}?currency=usd`);
      const responseData = response as unknown as { data: FungibleResponse };
      const fungible = responseData.data;

      if (!fungible) return null;

      const marketData = fungible.attributes.market_data;
      const price = marketData?.price || fungible.attributes.price || 0;
      const priceChange24h = marketData?.changes?.percent_1d || fungible.attributes.price_change_24h;
      const priceChange30d = marketData?.changes?.percent_30d as number | undefined;
      const priceChange90d = marketData?.changes?.percent_90d as number | undefined;
      const priceChange365d = marketData?.changes?.percent_365d as number | undefined;
      const marketCap = marketData?.market_cap || fungible.attributes.market_cap;
      const circulatingSupply = marketData?.circulating_supply as number | undefined;
      const totalSupply = marketData?.total_supply as number | undefined;

      return {
        fungibleId: fungible.id,
        symbol: fungible.attributes.symbol || 'Unknown',
        name: fungible.attributes.name || 'Unknown',
        price,
        priceChange24h,
        priceChange30d,
        priceChange90d,
        priceChange365d,
        marketCap,
        circulatingSupply,
        totalSupply,
        icon: fungible.attributes.icon?.url,
        verified: fungible.attributes.flags?.verified,
      };
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  },

  /**
   * Get token price chart for specified period
   * @param fungibleId Token ID
   * @param period Chart period: 'day', 'week', 'month', 'year'
   * @returns Array of price points
   */
  async getTokenChart(
    fungibleId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<TokenChart | null> {
    try {
      const response = await fetchZerion(`/fungibles/${fungibleId}/charts/${period}?currency=usd`);
      const chartResponse = response as unknown as ChartResponse;
      const chart = chartResponse.data;

      if (!chart?.attributes?.points) return null;

      return {
        period: period as 'week' | 'month' | 'year',
        points: chart.attributes.points.map((point: [number, number]) => ({
          timestamp: point[0],
          value: point[1],
        })),
      };
    } catch (error) {
      console.error('Error fetching token chart:', error);
      return null;
    }
  },

  /**
   * Get list of all supported chains
   * @returns Array of chain information
   */
  async getChains(): Promise<Chain[]> {
    try {
      const response = await fetchZerion('/chains/');
      const chainsResponse = response as unknown as ChainsListResponse;
      const chains = chainsResponse.data || [];

      return chains.map((chain: ChainResponse): Chain => ({
        id: chain.id,
        name: getChainName(chain.id),
        icon: chain.attributes?.icon?.url,
      }));
    } catch (error) {
      console.error('Error fetching chains:', error);
      return [];
    }
  },

  // ============================================================================
  // DAPP METHODS
  // ============================================================================

  /**
   * Search for DApp protocols
   * @param query Protocol name (e.g., "Uniswap", "Aave", "OpenSea")
   * @returns Array of matching DApps
   */
  async searchDApp(query: string): Promise<DAppData[]> {
    try {
      console.log(`[DApp Search] Searching for: "${query}"`);

      // Normalize the query to potential DApp ID format
      // Most DApp IDs in Zerion are lowercase with hyphens
      const dappId = query.toLowerCase().replace(/\s+/g, '-');

      console.log(`[DApp Search] Trying to fetch DApp with ID: "${dappId}"`);

      try {
        // First, try to fetch the DApp directly by ID
        const response = await fetchZerion(`/dapps/${dappId}`);

        if (response.data) {
          const dappData = response.data as Record<string, unknown>;
          const attributes = dappData.attributes as Record<string, unknown> || {};
          const icon = attributes.icon as Record<string, unknown> | undefined;
          const url = attributes.url as string | undefined;

          const transformedDapp: DAppData = {
            dappId: dappData.id as string,
            name: attributes.name as string || query,
            logo: (icon as Record<string, unknown>)?.url as string | undefined,
            website: url,
          };

          console.log(`[DApp Search] Found DApp:`, transformedDapp);
          return [transformedDapp];
        }
      } catch {
        console.log(`[DApp Search] Direct fetch failed for "${dappId}", trying database search...`);
      }

      // Fallback: Search through the DApp database
      const dapps = await this.getDAppDatabase();
      const lowerQuery = query.toLowerCase();

      const results = dapps.filter(dapp =>
        dapp.name.toLowerCase().includes(lowerQuery) ||
        dapp.dappId.toLowerCase().includes(lowerQuery)
      );

      console.log(`[DApp Search] Found ${results.length} results for "${query}":`,
        results.map(d => ({ name: d.name, dappId: d.dappId }))
      );

      return results;
    } catch (error) {
      console.error('Error searching DApp:', error);
      return [];
    }
  },

  /**
   * Get detailed DApp information
   * @param dappId DApp identifier
   * @returns DApp information including TVL, users, supported chains
   */
  async getDAppInfo(dappId: string): Promise<DAppData | null> {
    try {
      const dapps = await this.getDAppDatabase();
      return dapps.find(d => d.dappId === dappId) || null;
    } catch (error) {
      console.error('Error fetching DApp info:', error);
      return null;
    }
  },

  /**
   * Get DApp database from Zerion API (Fallback)
   * Fetches list of DApps with basic info
   * Used as fallback when direct DApp ID fetch fails
   */
  async getDAppDatabase(): Promise<DAppData[]> {
    try {
      console.log('[DApp Database] Fetching DApp list from Zerion API...');
      // Fetch from Zerion DApps endpoint with limit to reduce payload
      const params = new URLSearchParams({
        'limit': '20', // Fetch top 20 DApps for fallback search
      });

      const response = await fetchZerion(`/dapps/?${params.toString()}`);

      if (!response.data) {
        console.error('Zerion DApp API returned no data');
        return [];
      }

      const dappsList = response.data as Array<Record<string, unknown>>;
      console.log(`[DApp Database] Received ${dappsList.length} DApps from Zerion API`);

      // Transform Zerion DApp data to our DAppData format
      const transformedDapps = dappsList.map((dapp: Record<string, unknown>): DAppData => {
        const attributes = dapp.attributes as Record<string, unknown> || {};
        const dappId = dapp.id as string;
        const name = attributes.name as string || dappId;
        const icon = attributes.icon as Record<string, unknown> | undefined;
        const url = attributes.url as string | undefined;

        return {
          dappId,
          name,
          logo: (icon as Record<string, unknown>)?.url as string | undefined,
          website: url,
        };
      });

      console.log('[DApp Database] Transformed DApps:', transformedDapps.map(d => ({ name: d.name, dappId: d.dappId })));
      return transformedDapps;
    } catch (error) {
      console.error('Error fetching DApp database from Zerion API:', error);
      return [];
    }
  },

  /**
   * Get wallet DeFi positions (showing which protocols user is invested in)
   * @param walletAddress Wallet address to analyze
   * @returns List of DApp positions
   */
  async getWalletDeFiPositions(walletAddress: string): Promise<WalletPosition[]> {
    try {
      const response = await fetchZerion(
        `/wallets/${walletAddress}/positions/?filter[positions]=only_complex&filter[trash]=only_non_trash`
      );
      const positionsResponse = response as unknown as WalletPositionsResponse;
      return positionsResponse.data || [];
    } catch (error) {
      console.error('Error fetching wallet DeFi positions:', error);
      return [];
    }
  },
};

