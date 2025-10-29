/**
 * Intent detection system for chatbot
 * Analyzes user prompts and extracts actionable intents
 */

export type IntentType = 'token' | 'wallet' | 'market' | 'comparison' | 'alert' | 'dapp' | 'general'

export interface DetectedIntent {
  type: IntentType
  confidence: number // 0-1
  tokens?: string[] // Token symbols/addresses
  wallets?: string[] // Wallet addresses
  dapps?: string[] // DApp protocol names
  comparison?: {
    from: string
    to: string
  }
  alertType?: 'price' | 'volume' | 'whale' | 'risk'
  rawQuery: string
}

/**
 * DApp protocol names (comprehensive list)
 */
const DAPP_PROTOCOLS = [
  // DEXs
  'uniswap', 'pancakeswap', 'sushiswap', 'curve', 'balancer', 'dydx', 'aave', '0x', 'matcha',
  // Lending
  'compound', 'aave', 'maker', 'flux', 'iron', 'solend', 'port', 'jet', 'larix', 'orca', 'raydium',
  // Staking
  'lido', 'rocketpool', 'stakewise', 'marinade', 'sanctum', 'socean', 'jup', 'magic eden',
  // Bridges
  'wormhole', 'cctp', 'stargate', 'anyswap',
  // Yield
  'yearn', 'convex', 'aura', 'gains', 'gmd',
  // Other protocols
  'opensea', 'blur', 'reservoir', 'blur protocol', 'gmx', 'perpetual protocol', 'kwenta',
  'instadapp', 'morpho', 'euler', 'venus', 'alpaca', 'beefy', 'autofarm',
]

/**
 * Keywords for each intent type
 */
const INTENT_KEYWORDS = {
  token: [
    'price',
    'token',
    'sol',
    'usdc',
    'usdt',
    'eth',
    'btc',
    'what\'s',
    'show me',
    'health',
    'liquidity',
    'volume',
    'market cap',
    'holders',
    'risk',
    'safe',
    'pump',
    'chart',
  ],
  wallet: [
    'wallet',
    'address',
    'balance',
    'portfolio',
    'whale',
    'inflow',
    'outflow',
    'transaction',
    'activity',
    'smart money',
  ],
  market: [
    'trending',
    'top',
    'movers',
    'market',
    'trend',
    'trends',
    'sector',
    'defi',
    'nft',
    'arbitrage',
    'opportunity',
    'alerts',
    'crypto market',
    'market sentiment',
    'market cap',
    'dominance',
    'gainers',
    'losers',
    'overall',
    'overall market',
    'general market',
  ],
  comparison: [
    'compare',
    'vs',
    'versus',
    'better',
    'difference',
    'which',
  ],
  alert: [
    'alert',
    'notify',
    'watch',
    'remind',
    'when',
    'set',
    'create alert',
  ],
  dapp: [
    'protocol',
    'tvl',
    'apy',
    'dapp',
    'defi',
    'yield',
    'pool',
    'staking',
    'farming',
    'trading',
  ],
}

/**
 * Extract DApp protocols from query
 */
function extractDApps(query: string): string[] {
  const dapps: string[] = []
  const lowerQuery = query.toLowerCase()

  for (const protocol of DAPP_PROTOCOLS) {
    if (lowerQuery.includes(protocol)) {
      dapps.push(protocol)
    }
  }

  return [...new Set(dapps)] // Remove duplicates
}

/**
 * Extract tokens from query (by symbol or address)
 */
function extractTokens(query: string): string[] {
  const tokens: string[] = []

  // Extract Solana addresses (base58, 32-44 chars)
  const addressRegex = /[1-9A-HJ-NP-Z]{32,44}/g
  const addresses = query.match(addressRegex)
  if (addresses) {
    tokens.push(...addresses)
  }

  // Extract potential token symbols ONLY if they appear with context
  // Look for patterns like "token SOL", "price of BTC", "SOL coin"
  const tokenContextPatterns = [
    /(?:price|chart|buy|sell|swap|trade|cost|current|show)\s+(?:of\s+)?([A-Z]{2,10})\b/gi,
    /\b([A-Z]{2,10})\s+(?:token|coin|price|chart|cost|current)/gi,
    /(?:token|coin|price|current|cost)\s+([A-Z]{2,10})\b/gi,
    /(?:what(?:'s|s)?|is|the|check)\s+(?:the\s+)?(?:current\s+)?(?:price\s+(?:of\s+)?)?([A-Z]{2,10})\b/gi,
  ]

  for (const pattern of tokenContextPatterns) {
    const matches = query.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        tokens.push(match[1].toUpperCase())
      }
    }
  }

  // Common English words to exclude (expanded list)
  const excludeWords = [
    'THE', 'AND', 'FOR', 'NOT', 'BUT', 'ARE', 'YOU', 'ALL', 'CAN', 'HER',
    'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
    'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID',
    'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'WHY', 'INTO', 'EXPLAIN',
    'SHOW', 'TELL', 'WHAT', 'WHEN', 'WHERE', 'WHICH', 'WHILE', 'WITH',
    'CHECK', 'WHATS', 'WHATS'
  ]

  // Filter out excluded words
  const filteredTokens = tokens.filter(token => !excludeWords.includes(token.toUpperCase()))

  // Look for token mentions in lowercase with context
  // Patterns like "cbbtc token", "zbtc price", "bonk coin", "eth price"
  const tokenContextRegex = /\b([a-z]{2,10})(?:\s+(?:token|coin|price|chart|data|current|cost))/gi
  const contextMatches = query.matchAll(tokenContextRegex)

  for (const match of contextMatches) {
    filteredTokens.push(match[1].toUpperCase())
  }

  // Fallback: If query is very short (like "eth" or "bitcoin") and looks like a token symbol
  // This allows simple queries like just typing "eth" or "ethereum"
  const trimmedQuery = query.trim()
  if (filteredTokens.length === 0 && trimmedQuery.length <= 15) {
    // Check if it looks like a single token symbol (2-10 chars, letters only)
    const simpleTokenMatch = trimmedQuery.match(/^[a-z]{2,10}$/i)
    if (simpleTokenMatch) {
      filteredTokens.push(simpleTokenMatch[0].toUpperCase())
    }
  }

  return [...new Set(filteredTokens)] // Remove duplicates
}

/**
 * Extract wallet addresses from query
 */
function extractWallets(query: string): string[] {
  const wallets: string[] = []

  // Solana addresses (base58, 44 chars)
  const addressRegex = /[1-9A-HJ-NP-Z]{44}/g
  const addresses = query.match(addressRegex)
  if (addresses) {
    wallets.push(...addresses)
  }

  return [...new Set(wallets)]
}

/**
 * Detect comparison intent
 */
function detectComparison(query: string): { from: string; to: string } | undefined {
  // Pattern: "X vs Y", "X versus Y", "compare X and Y"
  const vsMatch = query.match(/([A-Z\w]+)\s+(?:vs|versus)\s+([A-Z\w]+)/i)
  if (vsMatch) {
    return {
      from: vsMatch[1],
      to: vsMatch[2],
    }
  }

  const compareMatch = query.match(
    /compare\s+([A-Z\w]+)\s+(?:and|to|with)\s+([A-Z\w]+)/i
  )
  if (compareMatch) {
    return {
      from: compareMatch[1],
      to: compareMatch[2],
    }
  }

  return undefined
}

/**
 * Main intent detection function
 */
export function detectIntent(query: string): DetectedIntent {
  const lowerQuery = query.toLowerCase()
  const scores: Record<IntentType, number> = {
    token: 0,
    wallet: 0,
    market: 0,
    comparison: 0,
    alert: 0,
    dapp: 0,
    general: 0,
  }

  // Score each intent type
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matchCount = keywords.filter((kw) => lowerQuery.includes(kw)).length
    scores[intent as IntentType] = matchCount / keywords.length
  }

  // Boost scores based on extracted entities
  let tokens = extractTokens(query)
  const wallets = extractWallets(query)
  const comparison = detectComparison(query)
  const dapps = extractDApps(query)

  // If this is clearly a market query, don't extract individual tokens
  // (e.g., "what's trending", "market movers", "current market trends")
  const isMarketQuery = lowerQuery.includes('trend') ||
                        lowerQuery.includes('overall market') ||
                        lowerQuery.includes('crypto market') ||
                        lowerQuery.includes('market sentiment') ||
                        lowerQuery.includes('gainers') ||
                        lowerQuery.includes('losers') ||
                        lowerQuery.includes('market cap ranking') ||
                        lowerQuery.includes('market dominance')

  if (isMarketQuery) {
    tokens = [] // Clear tokens for pure market queries
  }

  if (tokens.length > 0) {
    scores.token += 0.3
  }
  if (wallets.length > 0) {
    scores.wallet += 0.3
  }
  if (comparison) {
    scores.comparison += 0.3
  }
  if (dapps.length > 0) {
    scores.dapp += 0.4 // Higher boost for DApp mentions
  }
  if (lowerQuery.includes('alert')) {
    scores.alert += 0.2
  }

  // Determine primary intent
  let primaryIntent: IntentType = 'general'
  let maxScore = scores.general

  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      primaryIntent = intent as IntentType
    }
  }

  // If comparison detected, use comparison intent
  if (comparison) {
    primaryIntent = 'comparison'
  }

  // Determine confidence (normalize to 0-1)
  const confidence = Math.min(maxScore, 1)

  // Determine alert type if alert intent
  let alertType: 'price' | 'volume' | 'whale' | 'risk' | undefined
  if (primaryIntent === 'alert') {
    if (lowerQuery.includes('price')) {
      alertType = 'price'
    } else if (lowerQuery.includes('volume')) {
      alertType = 'volume'
    } else if (lowerQuery.includes('whale')) {
      alertType = 'whale'
    } else if (lowerQuery.includes('risk')) {
      alertType = 'risk'
    }
  }

  return {
    type: primaryIntent,
    confidence,
    tokens: tokens.length > 0 ? tokens : undefined,
    wallets: wallets.length > 0 ? wallets : undefined,
    dapps: dapps.length > 0 ? dapps : undefined,
    comparison: comparison || undefined,
    alertType,
    rawQuery: query,
  }
}

/**
 * Get suggested data fetch calls based on intent
 */
export function getSuggestedDataFetches(intent: DetectedIntent): {
  endpoint: string
  params: Record<string, string>
}[] {
  const fetches: { endpoint: string; params: Record<string, string> }[] = []

  switch (intent.type) {
    case 'token':
      if (intent.tokens && intent.tokens.length > 0) {
        for (const token of intent.tokens) {
          fetches.push({
            endpoint: '/api/zerion/token-search',
            params: { query: token },
          })
        }
      }
      break

    case 'wallet':
      if (intent.wallets && intent.wallets.length > 0) {
        for (const wallet of intent.wallets) {
          fetches.push({
            endpoint: '/api/solana/wallet',
            params: { address: wallet },
          })
        }
      }
      break

    case 'comparison':
      if (intent.comparison) {
        // Fetch data for both tokens using Zerion
        fetches.push(
          {
            endpoint: '/api/zerion/token-search',
            params: { query: intent.comparison.from },
          },
          {
            endpoint: '/api/zerion/token-search',
            params: { query: intent.comparison.to },
          }
        )
      }
      break

    case 'dapp':
      if (intent.dapps && intent.dapps.length > 0) {
        for (const dapp of intent.dapps) {
          fetches.push({
            endpoint: '/api/zerion/dapp-info',
            params: { search: dapp },
          })
        }
      }
      break

    case 'market':
      // Market data would require a dedicated endpoint
      break

    case 'alert':
      // Alert setup doesn't require immediate data fetch
      break

    case 'general':
    default:
      // General queries don't have specific data fetches
      break
  }

  return fetches
}

/**
 * Generate context message for AI based on intent
 */
export function generateIntentContext(intent: DetectedIntent): string {
  switch (intent.type) {
    case 'token':
      return `The user is asking about token(s): ${intent.tokens?.join(', ')}. Provide detailed token analysis including price, liquidity, health metrics, multi-chain availability, and risk assessment.`

    case 'wallet':
      return `The user is asking about wallet(s): ${intent.wallets?.join(', ')}. Provide portfolio overview, recent activity, DeFi positions, and smart money insights.`

    case 'market':
      return 'The user is asking about market trends. Provide insights on trending tokens, sector performance, and market opportunities.'

    case 'comparison':
      return `The user wants to compare ${intent.comparison?.from} with ${intent.comparison?.to}. Provide side-by-side comparison of key metrics.`

    case 'dapp':
      return `The user is asking about DApp protocol(s): ${intent.dapps?.join(', ')}. Provide TVL (Total Value Locked), user count, supported chains, position types, and yield opportunities. Include risk factors and usage metrics.`

    case 'alert':
      return `The user wants to set up an alert for ${intent.alertType} changes. Help them configure appropriate thresholds.`

    case 'general':
    default:
      return 'Provide helpful insights about crypto tokens, DeFi protocols, and wallets based on the user query.'
  }
}
