/**
 * Claude API Client
 * Handles AI-powered summaries and chat responses
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractText(content: Anthropic.ContentBlock[]): string {
  const textBlock = content.find((block) => block.type === 'text');
  if (textBlock && 'text' in textBlock) {
    return textBlock.text;
  }
  return '';
}

export const claudeClient = {
  /**
   * Generate AI summary for token data
   */
  async generateTokenSummary(tokenData: Record<string, unknown>): Promise<string> {
    try {
      const prompt = `Analyze this token data and provide a concise summary with key insights about token health, liquidity, and risks:

Token Data:
${JSON.stringify(tokenData, null, 2)}

Provide a 2-3 sentence summary highlighting:
1. Overall token health
2. Key risks or opportunities
3. Liquidity situation`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = extractText(message.content);
      return text || 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating token summary:', error);
      throw error;
    }
  },

  /**
   * Generate AI summary for wallet activity
   */
  async generateWalletSummary(walletData: Record<string, unknown>): Promise<string> {
    try {
      const prompt = `Analyze this wallet activity data and provide insights about trading patterns and strategy:

Wallet Data:
${JSON.stringify(walletData, null, 2)}

Provide a 2-3 sentence summary highlighting:
1. Wallet activity patterns
2. Trading strategy insights
3. Recent moves and impact`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = extractText(message.content);
      return text || 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating wallet summary:', error);
      throw error;
    }
  },

  /**
   * Generate portfolio insights from chat context
   */
  async generatePortfolioInsights(portfolioData: Record<string, unknown>): Promise<string> {
    try {
      const prompt = `Analyze this portfolio data and provide personalized investment insights:

Portfolio Data:
${JSON.stringify(portfolioData, null, 2)}

Provide a 3-4 sentence insight highlighting:
1. Portfolio composition and diversification
2. Key holdings performance
3. Suggested actions or rebalancing ideas`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 250,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = extractText(message.content);
      return text || 'Unable to generate insights';
    } catch (error) {
      console.error('Error generating portfolio insights:', error);
      throw error;
    }
  },

  /**
   * Chat with Claude about on-chain data context
   */
  async chat(
    userMessage: string,
    contextData: Record<string, unknown> | null = null
  ): Promise<string> {
    try {
      let systemPrompt = `You are an expert multi-chain crypto analyst AI assistant. You help users understand on-chain data, token health across 50+ blockchains, wallet activity, and provide insights for better investment decisions.

You have access to real-time data from multiple sources:
- **Zerion API**: Real-time token prices, market cap, supply information across 50+ blockchains
- **CoinGecko API**: Trending tokens and global market metrics (market cap, volume, market sentiment)

The data panel on the right side of the screen displays:
- For TOKENS: Price, market cap, supply, price changes (24h, 30d, 90d, 365d), verification status, risk analysis
- For MARKETS: Global market metrics, trending tokens, market sentiment indicators

YOUR DATA SOURCES:
- For TOKEN-SPECIFIC queries: Use Zerion token data (on-chain, multi-chain, detailed metrics)
- For MARKET-LEVEL queries: Use CoinGecko trending data (real-time trending tokens, global metrics)

YOUR ROLE:
- Do NOT repeat/list the raw data shown in the data panel (e.g., "Current Price: $X", "Market Cap: $Y")
- Instead, FOCUS ON ANALYSIS AND INSIGHTS:
  * Price momentum analysis (24h, 30d, 90d, 365d trends)
  * Risk assessment based on volatility and market cap
  * Trading signals and market sentiment
  * Comparison with historical trends
  * What the data suggests about token health and investment potential
  * Actionable recommendations based on the metrics

IMPORTANT:
- Use the token data to analyze and provide insights, not to display it
- Be concise, accurate, and provide actionable insights
- Reference specific metrics only when making a point (e.g., "The 365d gain of +14.30% shows strong recovery potential")
- Always explain what the data MEANS, not just what it IS`;

      if (contextData && (contextData.intent as Record<string, unknown>)?.type === 'market') {
        systemPrompt += `\n\n=== MARKET ANALYSIS REQUEST ===\n`;
        systemPrompt += `User is asking about overall market trends or sentiment. Real-time trending data is displayed in the right panel. Focus on:\n`;
        systemPrompt += `- What sectors/token types are gaining traction (analyze trending tokens shown)\n`;
        systemPrompt += `- Market momentum and investor sentiment based on trends\n`;
        systemPrompt += `- Key opportunities and risks in current market conditions\n`;
        systemPrompt += `- Why specific tokens are trending (fundamental or sentiment-driven)\n`;
        systemPrompt += `- Strategic recommendations for different risk appetites\n`;
        systemPrompt += `\nDo NOT repeat the data - analyze and explain what it MEANS for investors right now.\n`;
      } else if (contextData && (contextData as Record<string, unknown>).tokens) {
        systemPrompt += `\n\n=== TOKEN DATA CONTEXT ===\n`;
        systemPrompt += `The following token data is available for analysis (do not repeat this data, analyze it instead):\n`;
        systemPrompt += JSON.stringify(contextData.tokens, null, 2);
        systemPrompt += `\n\nUse this data to provide market analysis, insights, and investment perspective. The user can see all these metrics in the data panel, so focus on WHAT IT MEANS.`;
      } else if (contextData) {
        systemPrompt += `\n\nContext Data Available:\n${JSON.stringify(contextData, null, 2)}`;
      }

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const text = extractText(message.content);
      return text || 'Unable to process message';
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  },

  /**
   * Stream chat messages for real-time responses
   */
  async *streamChat(
    userMessage: string,
    contextData: Record<string, unknown> | null = null
  ): AsyncGenerator<string, void, unknown> {
    try {
      let systemPrompt = `You are an expert Solana and DeFi analyst AI assistant. You help users understand on-chain data, token health, wallet activity, and provide insights for better investment decisions.

You have access to real-time data including:
- Portfolio information
- Token health metrics
- Wallet activity and smart money moves
- Market data and liquidity information

Always be concise, accurate, and provide actionable insights.`;

      if (contextData) {
        systemPrompt += `\n\nContext Data Available:\n${JSON.stringify(contextData, null, 2)}`;
      }

      const stream = anthropic.messages.stream({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          'delta' in chunk &&
          chunk.delta.type === 'text_delta' &&
          'text' in chunk.delta
        ) {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Error in stream chat:', error);
      throw error;
    }
  },
};
