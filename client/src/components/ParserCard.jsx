import { useNavigate } from 'react-router-dom';

const parserConfig = {
  ll1: {
    title: 'LL(1)',
    subtitle: 'Top-Down Predictive Parsing',
    description: 'Uses FIRST/FOLLOW sets to build a predictive parsing table. Reads input left-to-right, produces leftmost derivation with 1 lookahead.',
    badge: 'Top-Down',
    badgeColor: 'from-emerald-600 to-teal-500',
    gradient: 'from-emerald-500 to-teal-400',
    shadowColor: 'shadow-emerald-500/20',
    hoverShadow: 'hover:shadow-emerald-500/40',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    stats: ['Predictive Table', 'Leftmost Derivation', 'No Conflicts = LL(1)'],
  },
  lr0: {
    title: 'LR(0)',
    subtitle: 'Bottom-Up LR(0) Parsing',
    description: 'Uses LR(0) items to build a parsing table. Reduces in all terminal columns. Weakest LR parser but easiest to construct.',
    badge: 'Bottom-Up',
    badgeColor: 'from-amber-600 to-orange-500',
    gradient: 'from-amber-500 to-orange-400',
    shadowColor: 'shadow-amber-500/20',
    hoverShadow: 'hover:shadow-amber-500/40',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-400',
    stats: ['LR(0) Items', 'DFA Visualization', 'Many Conflicts Likely'],
  },
  slr1: {
    title: 'SLR(1)',
    subtitle: 'Simple LR Parsing',
    description: 'Extends LR(0) with FOLLOW sets to decide reduce actions. Most commonly taught LR parser in compiler design courses.',
    badge: 'Bottom-Up',
    badgeColor: 'from-indigo-600 to-cyan-500',
    gradient: 'from-indigo-500 to-cyan-400',
    shadowColor: 'shadow-indigo-500/20',
    hoverShadow: 'hover:shadow-indigo-500/40',
    borderColor: 'border-indigo-500/30',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    stats: ['LR(0) + FOLLOW', 'DFA Visualization', 'Most Common'],
  },
  clr1: {
    title: 'CLR(1)',
    subtitle: 'Canonical LR Parsing',
    description: 'Uses LR(1) items with lookahead propagation. Most powerful LR parser but can produce many states.',
    badge: 'Bottom-Up',
    badgeColor: 'from-violet-600 to-purple-500',
    gradient: 'from-violet-500 to-purple-400',
    shadowColor: 'shadow-violet-500/20',
    hoverShadow: 'hover:shadow-violet-500/40',
    borderColor: 'border-violet-500/30',
    iconBg: 'bg-violet-500/10 border-violet-500/30',
    iconColor: 'text-violet-400',
    stats: ['LR(1) Items', 'Lookahead Propagation', 'Most Powerful'],
  },
  lalr1: {
    title: 'LALR(1)',
    subtitle: 'Look-Ahead LR Parsing',
    description: 'Merges CLR(1) states with identical LR(0) cores. Same number of states as SLR but with CLR power. Used by many real-world parser generators.',
    badge: 'Bottom-Up',
    badgeColor: 'from-rose-600 to-pink-500',
    gradient: 'from-rose-500 to-pink-400',
    shadowColor: 'shadow-rose-500/20',
    hoverShadow: 'hover:shadow-rose-500/40',
    borderColor: 'border-rose-500/30',
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    iconColor: 'text-rose-400',
    stats: ['Merged LR(1)', 'Compact States', 'Practical & Powerful'],
  },
};

export default function ParserCard({ type }) {
  const navigate = useNavigate();
  const config = parserConfig[type];

  return (
    <div
      onClick={() => navigate(`/parser/${type}`)}
      className={`group relative glass rounded-2xl p-6 cursor-pointer border ${config.borderColor} ${config.shadowColor} ${config.hoverShadow} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl ${config.iconBg} flex items-center justify-center`}>
          <span className={`text-2xl font-black ${config.iconColor}`}>
            {type === 'll1' ? 'L' : type === 'lr0' ? 'LR' : type === 'slr1' ? 'SLR' : type === 'clr1' ? 'CLR' : 'LALR'}
          </span>
        </div>
        <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${config.badgeColor} text-white text-xs font-bold shadow-lg`}>
          {config.badge}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-100 mb-1">{config.title}</h3>
      <p className="text-sm text-gray-400 mb-3">{config.subtitle}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{config.description}</p>

      <div className="border-t border-gray-800/50 pt-3 space-y-1">
        {config.stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.gradient}`} />
            {stat}
          </div>
        ))}
      </div>

      <div className={`mt-4 text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
        Click to explore →
      </div>
    </div>
  );
}
