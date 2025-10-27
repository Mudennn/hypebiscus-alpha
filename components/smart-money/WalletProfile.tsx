import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletProfileProps {
  profile: {
    category: string;
    expertise: string[];
    riskProfile: string;
    confidence: number;
    reasoning: string;
  };
}

export function WalletProfile({ profile }: WalletProfileProps) {
  const getCategoryBadge = (category: string): string => {
    const badges: Record<string, string> = {
      'Whale': '🐋',
      'Smart Trader': '🎯',
      'Degen': '🎲',
      'HODLer': '💎',
      'Bot': '🤖',
      'Casual': '👤',
    };
    return badges[category] || '👤';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Whale': 'text-blue-600 bg-blue-50',
      'Smart Trader': 'text-green-600 bg-green-50',
      'Degen': 'text-orange-600 bg-orange-50',
      'HODLer': 'text-purple-600 bg-purple-50',
      'Bot': 'text-gray-600 bg-gray-50',
      'Casual': 'text-slate-600 bg-slate-50',
    };
    return colors[category] || 'text-slate-600 bg-slate-50';
  };

  const getRiskColor = (riskProfile: string): string => {
    const colors: Record<string, string> = {
      'Conservative': 'text-green-600 bg-green-50',
      'Moderate': 'text-yellow-600 bg-yellow-50',
      'Aggressive': 'text-red-600 bg-red-50',
    };
    return colors[riskProfile] || 'text-slate-600 bg-slate-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getCategoryBadge(profile.category)}</span>
          Wallet Profile
        </CardTitle>
        <CardDescription>
          AI-powered wallet categorization based on trading patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Category</p>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg font-semibold ${getCategoryColor(profile.category)}`}>
              {getCategoryBadge(profile.category)} {profile.category}
            </span>
            <span className="text-xs text-slate-400">
              {profile.confidence}% confidence
            </span>
          </div>
        </div>

        {/* Expertise */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Expertise</p>
          <div className="flex flex-wrap gap-2">
            {profile.expertise.length > 0 ? (
              profile.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm rounded-md"
                >
                  {exp}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">No specific expertise detected</span>
            )}
          </div>
        </div>

        {/* Risk Profile */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Risk Profile</p>
          <span className={`px-3 py-1.5 rounded-lg font-semibold ${getRiskColor(profile.riskProfile)}`}>
            {profile.riskProfile}
          </span>
        </div>

        {/* AI Reasoning */}
        <div>
          <p className="text-sm text-slate-500 mb-2">Analysis</p>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
            {profile.reasoning}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
