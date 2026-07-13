import { motion } from 'framer-motion';

export default function FirstFollowTable({ first, follow, nonTerminals }) {
  if (!nonTerminals || nonTerminals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">FIRST &amp; FOLLOW Sets</h2>
          <p className="text-sm text-gray-500">{nonTerminals.length} non-terminals</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/60">
              <th className="text-left p-4 font-semibold text-gray-300 border-b border-gray-800/50">
                Non Terminal
              </th>
              <th className="text-left p-4 font-semibold text-emerald-400 border-b border-gray-800/50">
                FIRST
              </th>
              <th className="text-left p-4 font-semibold text-amber-400 border-b border-gray-800/50">
                FOLLOW
              </th>
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt, idx) => (
              <tr
                key={nt}
                className={`${idx % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/40'} hover:bg-gray-800/30 transition-colors`}
              >
                <td className="p-4 font-mono text-indigo-300 border-b border-gray-800/30">{nt}</td>
                <td className="p-4 font-mono text-emerald-300 border-b border-gray-800/30">
                  {first[nt]?.length > 0 ? (
                    <span className="inline-flex flex-wrap gap-1">
                      {first[nt].map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          {s}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="p-4 font-mono text-amber-300 border-b border-gray-800/30">
                  {follow[nt]?.length > 0 ? (
                    <span className="inline-flex flex-wrap gap-1">
                      {follow[nt].map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs">
                          {s}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
