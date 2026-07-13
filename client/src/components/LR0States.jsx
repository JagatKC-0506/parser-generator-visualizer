import { motion } from 'framer-motion';

export default function LR0States({ states }) {
  if (!states || states.length === 0) return null;

  const isLR1 = states.some((s) => s.isLR1);
  const isLALR = states.some((s) => s.isLALR);
  const typeLabel = isLALR ? 'LALR(1)' : isLR1 ? 'LR(1)' : 'LR(0)';
  const headerColor = isLALR
    ? 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400'
    : isLR1
    ? 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400'
    : 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${headerColor} flex items-center justify-center`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">{typeLabel} Item Sets</h2>
          <p className="text-sm text-gray-500">{states.length} states</p>
        </div>
        {isLALR && (
          <span className="ml-auto px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
            Merged States
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {states.map((state) => (
          <div
            key={state.id}
            className="rounded-xl bg-gray-900/40 border border-gray-800/50 overflow-hidden hover:border-indigo-500/30 transition-colors"
          >
            <div className={`px-4 py-2 font-bold text-sm border-b border-gray-800/50 flex items-center justify-between ${
              state.id === 0
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-indigo-500/10 text-indigo-400'
            }`}>
              <span>{state.label}</span>
              {state.mergedFrom && (
                <span className="text-[10px] text-gray-500 font-normal">
                  merged
                </span>
              )}
            </div>
            <div className="p-4 space-y-1.5">
              {state.items.map((item, i) => {
                const arrowIdx = item.indexOf('→');
                const hasDotAtEnd = item.trim().endsWith('•');
                const hasLookahead = item.includes('[');
                return (
                  <div
                    key={i}
                    className={`font-mono text-xs px-2 py-1 rounded ${
                      hasDotAtEnd
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'text-gray-300'
                    } ${hasLookahead ? 'border-l-2 border-violet-500/30' : ''}`}
                  >
                    <span className="text-gray-500">{item.slice(0, arrowIdx)}→</span>
                    {hasLookahead ? (
                      <>
                        <span>{item.slice(arrowIdx + 1, item.lastIndexOf('['))}</span>
                        <span className="text-violet-400">{item.slice(item.lastIndexOf('['))}</span>
                      </>
                    ) : (
                      <span>{item.slice(arrowIdx + 1)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
