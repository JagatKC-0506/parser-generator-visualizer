import { useState } from 'react';
import ParserCard from '../components/ParserCard';

const parserTypes = ['ll1', 'lr0', 'slr1', 'clr1', 'lalr1'];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <header className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
                PG
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Parser Generator</h1>
                <p className="text-xs text-gray-500">Compiler Design Visualizer</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg glass glass-hover text-gray-400 hover:text-gray-200 transition-all"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-3">Choose a Parser Type</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Select a parsing algorithm to explore. Each parser type builds upon the previous,
              from top-down LL(1) to the most powerful bottom-up parsers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {parserTypes.map((type) => (
              <ParserCard key={type} type={type} />
            ))}
          </div>

          <div className="mt-16 glass rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-gray-100 mb-4">How Parsers Compare</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left p-2 text-gray-400 font-semibold">Parser</th>
                    <th className="text-left p-2 text-gray-400 font-semibold">Type</th>
                    <th className="text-left p-2 text-gray-400 font-semibold">Items</th>
                    <th className="text-left p-2 text-gray-400 font-semibold">Power</th>
                    <th className="text-left p-2 text-gray-400 font-semibold">States</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800/30"><td className="p-2 text-emerald-300 font-mono">LL(1)</td><td className="p-2 text-gray-400">Top-Down</td><td className="p-2 text-gray-400">—</td><td className="p-2 text-gray-400">Lowest</td><td className="p-2 text-gray-400">N/A</td></tr>
                  <tr className="border-b border-gray-800/30"><td className="p-2 text-amber-300 font-mono">LR(0)</td><td className="p-2 text-gray-400">Bottom-Up</td><td className="p-2 text-gray-400">LR(0)</td><td className="p-2 text-gray-400">Low</td><td className="p-2 text-gray-400">Few</td></tr>
                  <tr className="border-b border-gray-800/30"><td className="p-2 text-indigo-300 font-mono">SLR(1)</td><td className="p-2 text-gray-400">Bottom-Up</td><td className="p-2 text-gray-400">LR(0)</td><td className="p-2 text-gray-400">Medium</td><td className="p-2 text-gray-400">Few</td></tr>
                  <tr className="border-b border-gray-800/30"><td className="p-2 text-violet-300 font-mono">CLR(1)</td><td className="p-2 text-gray-400">Bottom-Up</td><td className="p-2 text-gray-400">LR(1)</td><td className="p-2 text-gray-400">Highest</td><td className="p-2 text-gray-400">Many</td></tr>
                  <tr><td className="p-2 text-rose-300 font-mono">LALR(1)</td><td className="p-2 text-gray-400">Bottom-Up</td><td className="p-2 text-gray-400">Merged LR(1)</td><td className="p-2 text-gray-400">High</td><td className="p-2 text-gray-400">Few</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
