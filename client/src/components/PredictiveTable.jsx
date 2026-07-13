import { motion } from 'framer-motion';

export default function PredictiveTable({ ll1Table, conflicts, isLL1 }) {
  if (!ll1Table) return null;

  const { table, startSymbol } = ll1Table;
  const nonTerminals = Object.keys(table || {});
  const terminals = nonTerminals.length > 0 ? Object.keys(table[nonTerminals[0]] || {}) : [];

  const hasConflict = (nt, sym) =>
    conflicts?.some((c) => c.nonTerminal === nt && c.symbol === sym);

  const getCellContent = (nt, sym) => {
    const prodIdx = table[nt]?.[sym];
    if (prodIdx === null || prodIdx === undefined) return null;
    return prodIdx;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">LL(1) Predictive Parsing Table</h2>
          <p className="text-sm text-gray-500">
            {nonTerminals.length} non-terminals × {terminals.length} terminals
          </p>
        </div>
        {isLL1 && (
          <span className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            LL(1)
          </span>
        )}
        {!isLL1 && (
          <span className="ml-auto px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
            Not LL(1)
          </span>
        )}
      </div>

      <div className="space-y-4">
        {conflicts?.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <h4 className="text-sm font-semibold text-red-400 mb-2">
              Grammar is NOT LL(1) — {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
            </h4>
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className="text-xs text-red-300 font-mono bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                  M[{c.nonTerminal}, {c.symbol}] — {c.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {isLL1 && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-semibold">
              ✓ This grammar is LL(1) — no conflicts in predictive table.
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-800/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/60">
                <th className="p-2 text-xs font-semibold text-gray-400 border-r border-gray-800/50 text-center">
                  Non-terminal
                </th>
                {terminals.map((t) => (
                  <th key={t} className="p-2 text-xs font-mono text-emerald-400 border-b border-gray-800/50 border-r border-gray-800/30 text-center">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nonTerminals.map((nt, rowIdx) => (
                <tr
                  key={nt}
                  className={`${rowIdx % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/40'} hover:bg-gray-800/30 transition-colors`}
                >
                  <td className="p-2 text-xs font-mono text-gray-400 text-center border-r border-gray-800/50 font-bold">
                    {nt}
                  </td>
                  {terminals.map((t) => {
                    const prodIdx = getCellContent(nt, t);
                    const conflict = hasConflict(nt, t);
                    return (
                      <td
                        key={t}
                        className={`px-2 py-1.5 text-xs font-mono text-center border border-gray-800/30 ${
                          conflict
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : prodIdx !== null
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'text-gray-600'
                        }`}
                      >
                        {conflict ? (
                          <span className="text-red-300 font-bold">✗</span>
                        ) : prodIdx !== null ? (
                          prodIdx
                        ) : (
                          '—'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLL1 && (
          <p className="text-xs text-gray-500">
            Start symbol: <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">{startSymbol}</kbd>
          </p>
        )}
      </div>
    </motion.div>
  );
}
