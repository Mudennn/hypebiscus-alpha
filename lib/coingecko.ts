/**
 * CoinGecko API Client
 * Fetches token information including categories for wallet profiling
 * Docs: https://docs.coingecko.com/reference/onchain-networks-tokens-address-info
 */

interface CoinGeckoTokenInfo {
  data: {
    id: string;
    type: string;
    attributes: {
      address: string;
      name?: string;
      symbol?: string;
      // We only need categories, but the API returns more
      categories?: string[];
    };
  };
}

/**
 * Map Zerion chain IDs to CoinGecko API network names
 * Used for fetching token info from CoinGecko API
 */
const COINGECKO_NETWORKS: Record<string, string> = {
  'ethereum': 'ethereum',
  'binance-smart-chain': 'bsc',
  'polygon': 'polygon-pos',
  'base': 'base',
  'arbitrum': 'arbitrum-one',
  'optimism': 'optimistic-ethereum',
  'avalanche': 'avalanche',
  'fantom': 'fantom',
  'solana': 'solana',
  'blast': 'blast',
  'scroll': 'scroll',
  'zksync-era': 'zksync',
  'linea': 'linea',
  'mantle': 'mantle',
  'polygon-zkevm': 'polygon-zkevm',
};

/**
 * Fetch token information from CoinGecko API
 */
export async function getTokenInfo(
  address: string,
  chainId: string
): Promise<CoinGeckoTokenInfo | null> {
  try {
    const network = COINGECKO_NETWORKS[chainId] || 'ethereum';
    const url = `https://api.coingecko.com/api/v3/onchain/networks/${network}/tokens/${address.toLowerCase()}/info`;

    console.log(`🌐 Fetching from CoinGecko: ${url}`);

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add CoinGecko API key
    if (process.env.NEXT_COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.NEXT_COINGECKO_API_KEY;
      console.log('🔑 Using CoinGecko API key');
    } else {
      console.warn('⚠️ No CoinGecko API key found in environment variables');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`❌ CoinGecko API failed for ${address}: ${response.status}`);
      console.log(`   URL: ${url}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched data for ${address}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching token info for ${address}:`, error);
    return null;
  }
}

/**
 * Get token categories for a specific token
 */
export async function getTokenCategories(
  address: string,
  chainId: string
): Promise<string[]> {
  const tokenInfo = await getTokenInfo(address, chainId);

  if (!tokenInfo?.data?.attributes?.categories) {
    console.log(`❌ No categories found for ${address} on ${chainId}`);
    return [];
  }

  const categories = tokenInfo.data.attributes.categories;
  console.log(`✅ Categories for ${address} (${chainId}):`, categories);

  return categories;
}

/**
 * Batch fetch token categories for multiple tokens
 * Returns a map of address -> categories
 */
export async function batchGetTokenCategories(
  tokens: Array<{ address: string; chainId: string }>
): Promise<Map<string, string[]>> {
  console.log(`\n🔍 Fetching categories for ${tokens.length} tokens...`);
  console.log('Tokens:', tokens.map(t => `${t.address.slice(0, 6)}...${t.address.slice(-4)} (${t.chainId})`));

  const results = new Map<string, string[]>();

  // Fetch in parallel with a limit to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tokens.length / batchSize)}`);

    const promises = batch.map(async ({ address, chainId }) => {
      const categories = await getTokenCategories(address, chainId);
      return { address: address.toLowerCase(), categories };
    });

    const batchResults = await Promise.all(promises);

    batchResults.forEach(({ address, categories }) => {
      results.set(address, categories);
    });

    // Small delay between batches to respect rate limits
    if (i + batchSize < tokens.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Summary
  const tokensWithCategories = Array.from(results.entries()).filter(([, cats]) => cats.length > 0);
  console.log(`\n📊 Summary: ${tokensWithCategories.length}/${tokens.length} tokens have categories`);

  if (tokensWithCategories.length > 0) {
    console.log('Tokens with categories:');
    tokensWithCategories.forEach(([address, categories]) => {
      console.log(`  - ${address}: [${categories.join(', ')}]`);
    });
  }

  return results;
}

/**
 * Normalize categories to standard format
 * GeckoTerminal categories can be inconsistent, so we normalize them
 */
export function normalizeCategory(category: string): string {
  const normalized = category.toLowerCase().trim();

  const categoryMap: Record<string, string> = {
    'defi': 'DeFi',
    'decentralized finance': 'DeFi',
    'meme': 'Meme',
    'memecoin': 'Meme',
    'meme coin': 'Meme',
    'gaming': 'Gaming',
    'gamefi': 'Gaming',
    'nft': 'NFT',
    'ai': 'AI',
    'artificial intelligence': 'AI',
    'layer 1': 'L1',
    'layer 2': 'L2',
    'infrastructure': 'Infrastructure',
    'privacy': 'Privacy',
    'oracle': 'Oracle',
    'yield': 'Yield',
    'lending': 'Lending',
    'dex': 'DEX',
    'derivatives': 'Derivatives',
    'stablecoin': 'Stablecoin',
    'governance': 'Governance',
  };

  return categoryMap[normalized] || category;
}

/**
 * Get unique normalized categories from a list
 */
export function getUniqueCategories(categories: string[]): string[] {
  const normalized = categories.map(normalizeCategory);
  return [...new Set(normalized)];
}

/**
 * Market trending data interfaces
 */
interface TrendingToken {
  item: {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank?: number | null;
    small?: string; // 64x64px - optimal for display
    data?: {
      price?: string;
    };
  };
}

interface GlobalMarketData {
  data?: {
    active_cryptocurrencies?: number;
    total_market_cap?: Record<string, number>;
    total_volume?: Record<string, number>;
    btc_dominance?: number;
    eth_dominance?: number;
    market_cap_percentage?: Record<string, number>;
    market_cap_change_percentage_24h_usd?: number;
  };
}

interface MarketMetrics {
  activeCryptos?: number;
  totalMarketCap?: number;
  total24hVolume?: number;
  marketCapChange24h?: number;
}

interface TrendingResponse {
  coins?: TrendingToken[];
  exchanges?: unknown[];
  nfts?: unknown[];
}

/**
 * Fetch trending cryptocurrencies from CoinGecko
 * Returns top trending tokens from the past 24 hours
 */
export async function getTrendingTokens(): Promise<TrendingToken[]> {
  try {
    const url = 'https://api.coingecko.com/api/v3/search/trending';

    console.log('[Market Trends] Fetching trending tokens from CoinGecko...');

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add CoinGecko API key if available
    if (process.env.NEXT_COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.NEXT_COINGECKO_API_KEY;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`[Market Trends] Failed to fetch trending tokens: ${response.status}`);
      return [];
    }

    const data: TrendingResponse = await response.json();
    const trendingCoins = data.coins || [];

    console.log(`[Market Trends] Found ${trendingCoins.length} trending tokens`);

    // Extract only the fields we need to reduce payload
    // Use only 'small' image (64x64px) - optimal balance between quality and bandwidth
    const optimizedCoins = trendingCoins.map(coin => ({
      item: {
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        market_cap_rank: coin.item.market_cap_rank,
        data: coin.item.data ? {
          price: coin.item.data.price,
        } : undefined,
        small: coin.item.small,
      },
    })) as TrendingToken[];

    return optimizedCoins;
  } catch (error) {
    console.error('[Market Trends] Error fetching trending tokens:', error);
    return [];
  }
}

/**
 * Fetch global cryptocurrency market data
 */
export async function getGlobalMarketData(): Promise<MarketMetrics | null> {
  try {
    const url = 'https://api.coingecko.com/api/v3/global';

    console.log('[Market Trends] Fetching global market data from CoinGecko...');

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Add CoinGecko API key if available
    if (process.env.NEXT_COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.NEXT_COINGECKO_API_KEY;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`[Market Trends] Failed to fetch global market data: ${response.status}`);
      return null;
    }

    const data: GlobalMarketData = await response.json();

    console.log('[Market Trends] Global market data fetched successfully');

    // Extract and format market metrics
    const marketData = data.data;
    if (!marketData) return null;

    return {
      activeCryptos: marketData.active_cryptocurrencies,
      totalMarketCap: marketData.total_market_cap?.usd,
      total24hVolume: marketData.total_volume?.usd,
      marketCapChange24h: marketData.market_cap_change_percentage_24h_usd,
    };
  } catch (error) {
    console.error('[Market Trends] Error fetching global market data:', error);
    return null;
  }
}

/**
 * Format trending tokens for display
 */
export function formatTrendingTokens(tokens: TrendingToken[]): string {
  if (tokens.length === 0) {
    return 'No trending tokens found.';
  }

  const formatted = tokens.slice(0, 10).map((token, index) => {
    const item = token.item;
    const price = item.data?.price ? `$${item.data.price}` : 'N/A';

    return `${index + 1}. ${item.name} (${item.symbol.toUpperCase()}) - Price: ${price}`;
  }).join('\n');

  return formatted;
}
