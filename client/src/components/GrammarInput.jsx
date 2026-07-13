import { motion } from 'framer-motion';

export default function GrammarInput({ value, onChange, onGenerate, onClear, loading, error }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onGenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Grammar Input</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter context-free grammar rules. Use <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">-&gt;</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-xs">|</kbd> for alternatives.
          </p>
        </div>
        <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-gray-800 text-gray-500 text-xs">
          Ctrl+Enter to generate
        </kbd>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id`}
        className="w-full h-40 bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-gray-600"
        spellCheck={false}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Parser
            </span>
          )}
        </button>
        <button
          onClick={onClear}
          className="px-6 py-3 rounded-xl glass glass-hover text-gray-300 font-semibold text-sm transition-all active:scale-[0.98]"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
}
