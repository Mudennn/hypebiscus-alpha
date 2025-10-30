# Hypebiscus Alpha

An AI-powered crypto analytics platform that democratizes access to institutional-grade wallet intelligence for retail traders.

**Mission:** Track smart money, analyze wallet behavior, and make data-driven trading decisions across all blockchains.

---

## 🎯 What is Hypebiscus Alpha?

Hypebiscus Alpha helps retail investors track and learn from successful traders ("smart money") in real-time. Instead of flying blind on market moves, users can:

- 📊 **Track Smart Wallets** - Monitor what successful traders are buying/selling
- 🤖 **AI-Powered Insights** - Claude-powered analysis of tokens and market trends
- 💰 **Analyze Performance** - Deep dive into wallet PnL, trading patterns, and risk metrics
- 🔗 **Multi-Chain** - Support for 50+ blockchains via Zerion API

Think of it as **"Twitter Analytics for Crypto Wallets"** — instead of following what people say, you follow what they actually do with their money.

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** + React 19
- **Tailwind CSS** + Shadcn UI
- **TypeScript** for type safety

### Data & APIs
- **Zerion API** - Multi-chain wallet and token data (50+ blockchains)
- **CoinGecko API** - Token metadata and categorization
- **Claude AI (Haiku)** - Lightweight, cost-efficient AI insights

---

## 🎯 Key Features Explained

### 1. AI Chatbot
Ask questions about:
- **Tokens** - "What's the price of ETH?" or "Is this token safe?"
- **Market Trends** - "What's trending in crypto?"
- **DApps** - "Tell me about Uniswap"
- **Smart Money** - "Show me smart money buying this week"

The chatbot uses Zerion data to provide real-time, AI-powered insights.

### 2. Smart Money Tracker
Track wallets and see:
- Portfolio composition (holdings breakdown)
- PnL metrics (realized/unrealized gains)
- Trading patterns (recent activity)
- Risk assessment (diversification, concentration)
- Wallet categorization (Degen, Conservative, Yield Farmer)

### 3. Token Analysis
Deep dive into tokens with:
- Price trends across multiple timeframes
- Health scoring based on market metrics
- Risk analysis and volatility assessment
- Trading recommendations based on data
- Multi-chain support across 50+ blockchains

---

## 📊 Data Sources

All data is sourced from public, read-only APIs:

| Data Type | Source | Usage |
|-----------|--------|-------|
| Wallet data | Zerion API | Portfolio, PnL, transactions |
| Token prices | Zerion API | Real-time pricing, market cap |
| Token metadata | CoinGecko API | Categories, verification status |
| AI insights | Claude API | Analysis and recommendations |

**No private keys or sensitive data is stored or transmitted.**

---

## 🔒 Privacy & Security

- All blockchain data is public (no private data accessed)
- User preferences encrypted in Supabase
- GDPR compliant
- No data sold or shared with third parties
- Open-source codebase (transparency)
