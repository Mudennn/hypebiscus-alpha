import Image from 'next/image';

interface HoldingRowProps {
  rank: number;
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  icon: string | null;
  chain?: string;
  chainName?: string;
}

export function HoldingRow({
  rank,
  symbol,
  name,
  value,
  percentage,
  icon,
  chainName,
}: HoldingRowProps) {
  const formatValue = (val: number): string => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-400 w-6">#{rank}</span>
        {icon && (
          <Image
            src={icon}
            alt={symbol}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div>
          <p className="font-semibold text-slate-900">{symbol}</p>
          <p className="text-xs text-slate-500">
            {name} {chainName && <span className="text-blue-600">• {chainName}</span>}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-slate-900">{formatValue(value)}</p>
        <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
}
