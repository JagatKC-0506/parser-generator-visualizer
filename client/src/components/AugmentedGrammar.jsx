import { motion } from 'framer-motion';

export default function AugmentedGrammar({ productions }) {
  if (!productions || productions.length === 0) return null;

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
          <h2 className="text-xl font-bold text-gray-100">Augmented Grammar</h2>
          <p className="text-sm text-gray-500">{productions.length} productions</p>
        </div>
      </div>

      <div className="grid gap-2">
        {productions.map((prod) => (
          <div
            key={prod.ruleNumber}
            className="flex items-center gap-4 p-3 rounded-xl bg-gray-900/40 border border-gray-800/50 font-mono text-sm"
          >
            <span className="w-10 px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold text-center">
              {prod.label}
            </span>
            <span className="text-gray-400">{prod.lhs}</span>
            <span className="text-gray-600">→</span>
            <span className="text-gray-200">
              {prod.rhs.length === 1 && prod.rhs[0] === 'ε' ? (
                <span className="italic text-gray-500">ε</span>
              ) : (
                prod.rhs.join(' ')
              )}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
