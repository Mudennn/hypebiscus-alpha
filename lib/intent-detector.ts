/**
 * Intent detection system for chatbot
 * Analyzes user prompts and extracts actionable intents
 */

export type IntentType = 'token' | 'wallet' | 'market' | 'comparison' | 'alert' | 'general'

export interface DetectedIntent {
  type: IntentType
  confidence: number // 0-1
  tokens?: string[] // Token symbols/addresses
  wallets?: string[] // Wallet addresses
  comparison?: {
    from: string
    to: string
  }
  alertType?: 'price' | 'volume' | 'whale' | 'risk'
  rawQuery: string
}

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
    'sector',
    'defi',
    'nft',
    'arbitrage',
    'opportunity',
    'alerts',
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
}

/**
 * Extract tokens from query (by symbol or address)
 */
function extractTokens(query: string): string[] {
  const tokens: string[] = []

  // Common token symbols
  const commonTokens = [
    'SOL',
    'USDC',
    'USDT',
    'BONK',
    'PUMP',
    'JTO',
    'ORCA',
    'RAYDIUM',
    'AAVE',
    'COMPOUND',
    'SHIB',
  ]

  for (const token of commonTokens) {
    if (query.toUpperCase().includes(token)) {
      tokens.push(token)
    }
  }

  // Extract Solana addresses (base58, 44 chars)
  const addressRegex = /[1-9A-HJ-NP-Z]{44}/g
  const addresses = query.match(addressRegex)
  if (addresses) {
    tokens.push(...addresses)
  }

  return [...new Set(tokens)] // Remove duplicates
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
  const lowerQuery = query.toLowerCase()

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
    general: 0,
  }

  // Score each intent type
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matchCount = keywords.filter((kw) => lowerQuery.includes(kw)).length
    scores[intent as IntentType] = matchCount / keywords.length
  }

  // Boost scores based on extracted entities
  const tokens = extractTokens(query)
  const wallets = extractWallets(query)
  const comparison = detectComparison(query)

  if (tokens.length > 0) {
    scores.token += 0.3
  }
  if (wallets.length > 0) {
    scores.wallet += 0.3
  }
  if (comparison) {
    scores.comparison += 0.3
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
            endpoint: '/api/zerion/token',
            params: { address: token },
          })
        }
      }
      break

    case 'wallet':
      if (intent.wallets && intent.wallets.length > 0) {
        for (const wallet of intent.wallets) {
          fetches.push(
            {
              endpoint: '/api/zerion/portfolio',
              params: { address: wallet },
            },
            {
              endpoint: '/api/zerion/wallet-flows',
              params: { address: wallet, type: 'both' },
            }
          )
        }
      }
      break

    case 'comparison':
      if (intent.comparison) {
        // Fetch data for both tokens
        fetches.push(
          {
            endpoint: '/api/zerion/token',
            params: { address: intent.comparison.from },
          },
          {
            endpoint: '/api/zerion/token',
            params: { address: intent.comparison.to },
          }
        )
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
      return `The user is asking about token(s): ${intent.tokens?.join(', ')}. Provide detailed token analysis including price, liquidity, health metrics, and risk assessment.`

    case 'wallet':
      return `The user is asking about wallet(s): ${intent.wallets?.join(', ')}. Provide portfolio overview, recent activity, and smart money insights.`

    case 'market':
      return 'The user is asking about market trends. Provide insights on trending tokens, sector performance, and market opportunities.'

    case 'comparison':
      return `The user wants to compare ${intent.comparison?.from} with ${intent.comparison?.to}. Provide side-by-side comparison of key metrics.`

    case 'alert':
      return `The user wants to set up an alert for ${intent.alertType} changes. Help them configure appropriate thresholds.`

    case 'general':
    default:
      return 'Provide helpful insights about Solana tokens and wallets based on the user query.'
  }
}
