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
