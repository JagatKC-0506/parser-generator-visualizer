import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ParsingSteps({ result }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setVisibleSteps(0);
    setPlaying(false);
  }, [result]);

  useEffect(() => {
    if (playing && result?.steps) {
      timerRef.current = setInterval(() => {
        setVisibleSteps((prev) => {
          if (prev >= result.steps.length) {
            clearInterval(timerRef.current);
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, result]);

  const handlePlayPause = () => {
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      if (visibleSteps >= (result?.steps?.length || 0)) setVisibleSteps(0);
      setPlaying(true);
    }
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setVisibleSteps(0);
  };

  if (!result) return null;

  const { accepted, steps, error } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          accepted
            ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30'
            : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30'
        }`}>
          {accepted ? (
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">Parsing Steps</h2>
          <p className="text-sm text-gray-500">
            {steps?.length || 0} step{(steps?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {accepted !== undefined && (
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
            accepted
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {accepted ? '✔ Accepted' : '✘ Rejected'}
          </span>
        )}
      </div>

      {steps && steps.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/20 transition-all active:scale-95"
            >
              {playing ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pause
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {visibleSteps >= steps.length ? 'Replay' : 'Play'}
                </span>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl glass glass-hover text-gray-400 text-sm transition-all active:scale-95"
            >
              Reset
            </button>
            <span className="text-xs text-gray-600">
              {visibleSteps} / {steps.length} steps
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800/50 max-h-[400px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-900/80 backdrop-blur-sm">
                  <th className="text-left p-3 font-semibold text-gray-400 border-b border-gray-800/50 w-12">#</th>
                  <th className="text-left p-3 font-semibold text-cyan-400 border-b border-gray-800/50 font-mono">Stack</th>
                  <th className="text-left p-3 font-semibold text-amber-400 border-b border-gray-800/50 font-mono">Input</th>
                  <th className="text-left p-3 font-semibold text-gray-300 border-b border-gray-800/50">Action</th>
                </tr>
              </thead>
              <tbody>
                {steps.slice(0, Math.max(visibleSteps, 1)).map((step, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`${
                      idx % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/40'
                    } hover:bg-gray-800/30 transition-colors ${
                      idx === Math.max(visibleSteps, 1) - 1 ? 'ring-1 ring-indigo-500/30' : ''
                    }`}
                  >
                    <td className="p-3 text-xs text-gray-600 border-b border-gray-800/30">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs text-cyan-300 border-b border-gray-800/30">{step.stack}</td>
                    <td className="p-3 font-mono text-xs text-amber-300 border-b border-gray-800/30">{step.input}</td>
                    <td className="p-3 text-xs border-b border-gray-800/30">
                      {step.action === 'Accept' ? (
                        <span className="text-emerald-400 font-semibold">✔ Accept</span>
                      ) : step.action?.startsWith('Error') ? (
                        <span className="text-red-400">✘ {step.action}</span>
                      ) : step.action?.startsWith('Shift') ? (
                        <span className="text-cyan-400">{step.action}</span>
                      ) : step.action?.startsWith('Reduce') ? (
                        <span className="text-amber-400">{step.action}</span>
                      ) : (
                        <span className="text-gray-400">{step.action}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-4 rounded-xl text-center ${
              accepted
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            {accepted ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-400 font-bold text-lg">String Accepted</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-400 font-bold text-lg">String Rejected</span>
              </div>
            )}
            {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
