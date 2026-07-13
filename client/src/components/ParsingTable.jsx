import { useState } from 'react';
import { motion } from 'framer-motion';

function Tooltip({ children, content }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 shadow-xl text-xs text-gray-200 whitespace-nowrap pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-gray-700 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}

function ConflictTooltip({ conflict, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 rounded-xl bg-gray-900 border border-red-500/30 shadow-xl text-xs pointer-events-none min-w-[200px]">
          <div className="text-red-400 font-bold mb-1.5">{conflict.type}</div>
          {conflict.productions?.length > 0 && (
            <div className="space-y-0.5 mb-1.5">
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">Productions:</div>
              {conflict.productions.map((p, i) => (
                <div key={i} className="text-gray-200 font-mono">{p}</div>
              ))}
            </div>
          )}
          <div className="text-gray-400">State I{conflict.state}, on "{conflict.symbol}"</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-red-500/30 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}

function CellContent({ val, conflict }) {
  if (!val || (Array.isArray(val) && val.length === 0)) {
    return <span className="text-gray-600">—</span>;
  }

  const displayVal = Array.isArray(val) ? val : [val];

  if (conflict) {
    return (
      <ConflictTooltip conflict={conflict}>
        <div className="flex flex-col items-center gap-0.5">
          {displayVal.map((v, i) => (
            <span key={i} className="leading-tight">{v}</span>
          ))}
        </div>
      </ConflictTooltip>
    );
  }

  if (displayVal.length === 1) {
    return <span>{displayVal[0]}</span>;
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      {displayVal.map((v, i) => (
        <span key={i} className="leading-tight">{v}</span>
      ))}
    </div>
  );
}

export default function ParsingTable({ slrTable, conflicts, isSLR, isLR0, isCLR1, isLALR1, parserType }) {
  if (!slrTable) return null;

  const { action, goto } = slrTable;
  const stateIds = Object.keys(action || {}).map(Number).sort((a, b) => a - b);
  const terminals = stateIds.length > 0 ? Object.keys(action[stateIds[0]] || {}) : [];
  const nonTerminals = stateIds.length > 0 ? Object.keys(goto[stateIds[0]] || {}) : [];

  const typeName = parserType || 'slr1';
  const typeLabel = typeName.toUpperCase();

  const typeColors = {
    lr0: { header: 'text-amber-400', table: 'amber', actionHeader: 'text-amber-400', gotoHeader: 'text-amber-400' },
    slr1: { header: 'text-indigo-400', table: 'indigo', actionHeader: 'text-cyan-400', gotoHeader: 'text-indigo-400' },
    clr1: { header: 'text-violet-400', table: 'violet', actionHeader: 'text-violet-400', gotoHeader: 'text-violet-400' },
    lalr1: { header: 'text-rose-400', table: 'rose', actionHeader: 'text-rose-400', gotoHeader: 'text-rose-400' },
  };

  const colors = typeColors[typeName] || typeColors.slr1;

  const hasConflict = (state, sym) =>
    conflicts?.some((c) => c.state === state && c.symbol === sym);

  const getConflict = (state, sym) =>
    conflicts?.find((c) => c.state === state && c.symbol === sym) || null;

  const getCellClass = (val, state, sym) => {
    const base = 'px-2 py-1.5 text-xs font-mono text-center border border-gray-800/30 ';
    if (hasConflict(state, sym)) return base + 'bg-red-500/20 text-red-300 border-red-500/30';
    const displayVal = Array.isArray(val) ? val : [val];
    if (displayVal.includes('ACC')) return base + 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold';
    if (displayVal.some((v) => v?.startsWith('S'))) return base + 'bg-cyan-500/10 text-cyan-300';
    if (displayVal.some((v) => v?.startsWith('R'))) return base + 'bg-amber-500/10 text-amber-300';
    return base + 'text-gray-600';
  };

  const reduceConflictCount = conflicts?.filter((c) => c.type === 'Reduce-Reduce Conflict').length || 0;
  const shiftReduceConflictCount = conflicts?.filter((c) => c.type === 'Shift-Reduce Conflict').length || 0;

  const isClean = (isSLR || isLR0 || isCLR1 || isLALR1) && (!conflicts || conflicts.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${colors.header}`}>{typeLabel} Parsing Table</h2>
          <p className="text-sm text-gray-500">
            {stateIds.length} states
            {conflicts?.length > 0 && (
              <span className="ml-2 text-red-400">
                — {reduceConflictCount} Reduce-Reduce, {shiftReduceConflictCount} Shift-Reduce
              </span>
            )}
          </p>
        </div>
        {isClean && (
          <span className={`ml-auto px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20`}>
            No Conflicts
          </span>
        )}
        {!isClean && conflicts?.length > 0 && (
          <span className="ml-auto px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20">
            {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {conflicts?.length > 0 && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <h4 className="text-sm font-semibold text-red-400 mb-2">
              Grammar is NOT {typeLabel} — {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
            </h4>
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div key={i} className="text-xs text-red-300 font-mono bg-red-500/5 rounded-lg p-2 border border-red-500/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                      {c.type}
                    </span>
                    <span className="text-red-400">I{c.state} on "{c.symbol}"</span>
                  </div>
                  {c.productions?.length > 0 && (
                    <div className="ml-2 text-gray-400">
                      Productions:
                      {c.productions.map((p, j) => (
                        <span key={j} className="ml-1 text-red-300">{p}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isClean && (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-semibold">
              ✓ This grammar is {typeLabel} — no conflicts detected.
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-800/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/60">
                <th className="p-2 text-xs font-semibold text-gray-400 border-r border-gray-800/50 text-center" rowSpan={2}>
                  State
                </th>
                <th className={`p-2 text-xs font-semibold ${colors.actionHeader} border-r border-gray-800/50 text-center`} colSpan={terminals.length}>
                  ACTION
                </th>
                <th className={`p-2 text-xs font-semibold ${colors.gotoHeader} text-center`} colSpan={nonTerminals.length}>
                  GOTO
                </th>
              </tr>
              <tr className="bg-gray-900/40">
                {terminals.map((t) => (
                  <th key={t} className={`p-2 text-xs font-mono ${colors.actionHeader} border-b border-gray-800/50 border-r border-gray-800/30 text-center`}>
                    {t}
                  </th>
                ))}
                {nonTerminals.map((nt) => (
                  <th key={nt} className={`p-2 text-xs font-mono ${colors.gotoHeader} border-b border-gray-800/50 text-center`}>
                    {nt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stateIds.map((stateId, rowIdx) => (
                <tr
                  key={stateId}
                  className={`${rowIdx % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/40'} hover:bg-gray-800/30 transition-colors`}
                >
                  <td className="p-2 text-xs font-mono text-gray-400 text-center border-r border-gray-800/50 font-bold">
                    {stateId}
                  </td>
                  {terminals.map((t) => {
                    const val = action[stateId]?.[t];
                    const conflict = getConflict(stateId, t);
                    return (
                      <td key={t} className={getCellClass(val, stateId, t)}>
                        <CellContent val={val} conflict={conflict} />
                      </td>
                    );
                  })}
                  {nonTerminals.map((nt) => (
                    <td key={nt} className="px-2 py-1.5 text-xs font-mono text-center border border-gray-800/30 text-indigo-300">
                      {goto[stateId]?.[nt] !== null && goto[stateId]?.[nt] !== undefined
                        ? goto[stateId][nt]
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/30" /> Shift
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" /> Reduce
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" /> Accept
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" /> Conflict
          </span>
        </div>
      </div>
    </motion.div>
  );
}
