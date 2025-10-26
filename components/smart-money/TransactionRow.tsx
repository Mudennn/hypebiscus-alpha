import Image from 'next/image';

interface TransactionRowProps {
  type: string;
  transfers: any[];
  timestamp: string;
  fee: any;
  hash: string;
  chain?: string;
  chainName?: string;
  status?: string;
}

export function TransactionRow({
  type,
  transfers,
  timestamp,
  fee,
  hash,
  chainName,
  status
}: TransactionRowProps) {
  const formatTime = (ts: string): string => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string): string => {
    if (type.includes('send') || type.includes('sell')) return 'text-red-600';
    if (type.includes('receive') || type.includes('buy')) return 'text-green-600';
    return 'text-blue-600';
  };

  const getTypeBadge = (type: string): string => {
    if (type === 'trade') return '💱 Trade';
    if (type === 'send') return '📤 Send';
    if (type === 'receive') return '📥 Receive';
    if (type === 'mint') return '🌟 Mint';
    if (type === 'burn') return '🔥 Burn';
    if (type === 'approve') return '✅ Approve';
    return type;
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
    if (amount >= 1) return amount.toFixed(2);
    if (amount >= 0.0001) return amount.toFixed(4);
    return amount.toFixed(8);
  };

  const formatValue = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatHash = (hash: string): string => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getExplorerUrl = (hash: string, chain?: string): string => {
    const explorers: Record<string, string> = {
      'ethereum': 'https://etherscan.io/tx/',
      'base': 'https://basescan.org/tx/',
      'arbitrum': 'https://arbiscan.io/tx/',
      'optimism': 'https://optimistic.etherscan.io/tx/',
      'polygon': 'https://polygonscan.com/tx/',
      'binance-smart-chain': 'https://bscscan.com/tx/',
      'avalanche': 'https://snowtrace.io/tx/',
      'fantom': 'https://ftmscan.com/tx/',
      'solana': 'https://solscan.io/tx/',
      'linea': 'https://lineascan.build/tx/',
    };
    const baseUrl = chain ? explorers[chain] || 'https://etherscan.io/tx/' : 'https://etherscan.io/tx/';
    return `${baseUrl}${hash}`;
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      {/* Header: Type, Chain, Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${getTypeColor(type)}`}>
            {getTypeBadge(type)}
          </span>
          {chainName && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {chainName}
            </span>
          )}
          {status && status === 'confirmed' && (
            <span className="text-xs text-green-600">✓</span>
          )}
        </div>
        <span className="text-xs text-slate-500">{formatTime(timestamp)}</span>
      </div>

      {/* Transfers */}
      {transfers && transfers.length > 0 && (
        <div className="space-y-1 mb-2">
          {transfers.slice(0, 3).map((transfer: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                {transfer.direction === 'in' ? (
                  <span className="text-green-600 font-bold">↓</span>
                ) : (
                  <span className="text-red-600 font-bold">↑</span>
                )}
                {transfer.icon && (
                  <Image
                    src={transfer.icon}
                    alt={transfer.symbol}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                )}
                <span className={`font-medium ${transfer.verified ? 'text-slate-900' : 'text-slate-500'}`}>
                  {transfer.symbol}
                </span>
                <span className="text-slate-600">
                  {formatAmount(transfer.quantityFloat)}
                </span>
              </div>
              {transfer.value && (
                <span className="text-slate-500 text-xs">
                  {formatValue(transfer.value)}
                </span>
              )}
            </div>
          ))}
          {transfers.length > 3 && (
            <span className="text-xs text-slate-400">
              +{transfers.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer: Hash and Fee */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
        <a
          href={getExplorerUrl(hash, chainName?.toLowerCase())}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono hover:text-blue-600 transition-colors"
        >
          {formatHash(hash)}
        </a>
        {fee && fee.amountFloat > 0 && (
          <span>
            Fee: {formatAmount(fee.amountFloat)} {fee.symbol}
          </span>
        )}
      </div>
    </div>
  );
}
