import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  const isPositive = trend === 'up';

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-slate-600 text-xs font-medium mb-1">{label}</p>
      <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {value}
      </p>
      {isPositive ? (
        <ArrowUpRight className="h-4 w-4 text-green-600 mt-1" />
      ) : (
        <ArrowDownRight className="h-4 w-4 text-red-600 mt-1" />
      )}
    </div>
  );
}
