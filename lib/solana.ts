/**
 * Solana RPC Client
 * Handles on-chain queries and wallet data
 */

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

interface SolanaRpcResponse<T> {
  jsonrpc: string;
  result: T;
  id: number;
}

interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface TokenAccount {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data: {
    parsed: {
      info: {
        mint: string;
        owner: string;
        tokenAmount: TokenAmount;
      };
      type: string;
    };
    program: string;
    space: number;
  };
}

interface AccountInfo {
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

export const solanaClient = {
  /**
   * Get wallet balance in SOL
   */
  async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      const data = await response.json() as SolanaRpcResponse<number>;
      return data.result / 1_000_000_000; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  },

  /**
   * Get token accounts for a wallet
   */
  async getTokenAccounts(address: string): Promise<Array<{ pubkey: string; account: TokenAccount }>> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address,
            { programId: 'TokenkegQfeZyiNwAJsyFbPVwwQQfoza5ThxV3LL7o' },
            { encoding: 'jsonParsed' },
          ],
        }),
      });

      const data = await response.json() as SolanaRpcResponse<{ value: Array<{ pubkey: string; account: TokenAccount }> }>;
      return data.result.value;
    } catch (error) {
      console.error('Error getting token accounts:', error);
      throw error;
    }
  },

  /**
   * Get specific token account balance
   */
  async getTokenBalance(tokenAddress: string, address: string): Promise<number> {
    try {
      const tokenAccounts = await this.getTokenAccounts(address);
      const account = tokenAccounts.find(
        (acc) =>
          acc.account.data.parsed.info.mint.toLowerCase() ===
          tokenAddress.toLowerCase()
      );

      if (!account) return 0;

      return account.account.data.parsed.info.tokenAmount.uiAmount;
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  },

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(
    address: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [address, { limit }],
        }),
      });

      const data = await response.json() as SolanaRpcResponse<Array<{ signature: string }>>;
      return data.result.map((tx) => tx.signature);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  },

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [signature, { encoding: 'json' }],
        }),
      });

      const data = await response.json() as SolanaRpcResponse<Record<string, unknown> | null>;
      return data.result;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  },

  /**
   * Check if an address is valid
   */
  async isValidAddress(address: string): Promise<boolean> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [address],
        }),
      });

      const data = await response.json() as SolanaRpcResponse<AccountInfo | null>;
      return data.result !== null;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  },

  /**
   * Get current slot (block height)
   */
  async getCurrentSlot(): Promise<number> {
    try {
      const response = await fetch(SOLANA_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSlot',
        }),
      });

      const data = await response.json() as SolanaRpcResponse<number>;
      return data.result;
    } catch (error) {
      console.error('Error getting current slot:', error);
      throw error;
    }
  },
};
