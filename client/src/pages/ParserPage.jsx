import { useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GrammarInput from '../components/GrammarInput';
import AugmentedGrammar from '../components/AugmentedGrammar';
import FirstFollowTable from '../components/FirstFollowTable';
import LR0States from '../components/LR0States';
import DFAGraph from '../components/DFAGraph';
import ParsingTable from '../components/ParsingTable';
import PredictiveTable from '../components/PredictiveTable';
import StringParser from '../components/StringParser';
import ParsingSteps from '../components/ParsingSteps';
import { generateParser, parseString } from '../services/api';

const parserInfo = {
  ll1: {
    title: 'LL(1)',
    subtitle: 'Top-Down Predictive Parsing',
    gradient: 'from-emerald-500 to-teal-400',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    description: 'Uses FIRST and FOLLOW sets to build a predictive parsing table. Reads input left-to-right producing a leftmost derivation.',
  },
  lr0: {
    title: 'LR(0)',
    subtitle: 'Bottom-Up LR(0) Parsing',
    gradient: 'from-amber-500 to-orange-400',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    description: 'Uses LR(0) items to build a parsing table. Reduce actions are placed in all terminal columns — the simplest LR parser.',
  },
  slr1: {
    title: 'SLR(1)',
    subtitle: 'Simple LR Parsing',
    gradient: 'from-indigo-500 to-cyan-400',
    iconColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    bgGradient: 'from-indigo-500/10 to-cyan-500/10',
    description: 'Extends LR(0) by using FOLLOW sets to decide reduce actions. The most commonly taught LR parser in compiler courses.',
  },
  clr1: {
    title: 'CLR(1)',
    subtitle: 'Canonical LR Parsing',
    gradient: 'from-violet-500 to-purple-400',
    iconColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgGradient: 'from-violet-500/10 to-purple-500/10',
    description: 'Uses LR(1) items with lookahead symbols. Most powerful LR parser but may produce many states.',
  },
  lalr1: {
    title: 'LALR(1)',
    subtitle: 'Look-Ahead LR Parsing',
    gradient: 'from-rose-500 to-pink-400',
    iconColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    description: 'Merges CLR(1) states with identical LR(0) cores. Same number of states as SLR but with the power of CLR(1).',
  },
};

const DEFAULT_GRAMMAR = [
  'E -> E + T | T',
  'T -> T * F | F',
  'F -> ( E ) | id',
];

export default function ParserPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const info = parserInfo[type] || parserInfo.slr1;

  const [grammar, setGrammar] = useState(DEFAULT_GRAMMAR.join('\n'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parserData, setParserData] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [parsing, setParsing] = useState(false);
  const dfaRef = useRef(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setParserData(null);
    setParseResult(null);
    try {
      const lines = grammar
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const data = await generateParser(lines, type);
      setParserData(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate parser';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [grammar, type]);

  const handleClear = useCallback(() => {
    setGrammar('');
    setParserData(null);
    setError(null);
    setParseResult(null);
  }, []);

  const handleParse = useCallback(async (input) => {
    if (!parserData) return;
    setParsing(true);
    setParseResult(null);
    try {
      if (type === 'll1') {
        const result = await parseString(
          input,
          null, null, null, null,
          {
            type: 'll1',
            table: parserData.ll1Table.table,
            productions: parserData.ll1Productions,
            terminals: parserData.terminals,
            startSymbol: parserData.ll1Table.startSymbol,
          }
        );
        setParseResult(result);
      } else {
        const result = await parseString(
          input,
          parserData.slrTable.action,
          parserData.slrTable.goto,
          parserData.augmentedGrammar,
          parserData.terminals,
          { type }
        );
        setParseResult(result);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Parsing failed';
      setParseResult({ accepted: false, error: msg, steps: [] });
    } finally {
      setParsing(false);
    }
  }, [parserData, type]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg glass glass-hover text-gray-400 hover:text-gray-200 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
              {type === 'll1' ? 'L' : type === 'lr0' ? 'LR' : type === 'slr1' ? 'SLR' : type === 'clr1' ? 'CLR' : 'LALR'}
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">{info.title} Parser Generator</h1>
              <p className="text-xs text-gray-500">{info.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-block px-3 py-1 rounded-full bg-gradient-to-r ${info.gradient} text-white text-xs font-bold shadow-lg`}>
              {type === 'll1' ? 'Top-Down' : 'Bottom-Up'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {parserData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl ${info.bgGradient} border ${info.borderColor}`}
          >
            <p className="text-sm text-gray-300">{info.description}</p>
          </motion.div>
        )}

        <GrammarInput
          value={grammar}
          onChange={setGrammar}
          onGenerate={handleGenerate}
          onClear={handleClear}
          loading={loading}
          error={error}
        />

        {parserData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AugmentedGrammar productions={parserData.augmentedGrammar} />
            <FirstFollowTable
              first={parserData.first}
              follow={parserData.follow}
              nonTerminals={parserData.nonTerminals}
            />

            {parserData.hasPredictiveTable && (
              <PredictiveTable
                ll1Table={parserData.ll1Table}
                productions={parserData.ll1Productions}
                conflicts={parserData.conflicts}
                isLL1={parserData.isLL1}
              />
            )}

            {parserData.hasLRStates && (
              <LR0States states={parserData.states} />
            )}

            {parserData.type === 'lalr1' && (
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                <p className="text-sm text-violet-300 font-semibold">
                  LALR(1) is built by merging CLR(1) states with identical LR(0) cores.
                  Below is the <strong>CLR(1) DFA</strong> followed by the merged <strong>LALR(1) DFA</strong>, then the <strong>CLR(1) table</strong> then <strong>LALR(1) table</strong>.
                </p>
              </div>
            )}

            {parserData.type === 'lalr1' && parserData.clrDfa && (
              <DFAGraph dfa={parserData.clrDfa} states={parserData.clrStates} parserType="clr1" />
            )}

            {parserData.hasDFA && (
              <DFAGraph dfa={parserData.dfa} states={parserData.states} ref={dfaRef} parserType={parserData.type} />
            )}

            {parserData.type === 'lalr1' && parserData.clrTable && (
              <ParsingTable
                slrTable={parserData.clrTable}
                conflicts={parserData.clrConflicts}
                isCLR1={parserData.clrConflicts?.length === 0}
                parserType="clr1"
              />
            )}

            {parserData.hasParsingTable && (
              <ParsingTable
                slrTable={parserData.slrTable}
                conflicts={parserData.conflicts}
                isSLR={parserData.type === 'slr1' ? parserData.isSLR : false}
                isLR0={parserData.type === 'lr0' ? parserData.isLR0 : false}
                isCLR1={parserData.type === 'clr1' ? parserData.isCLR1 : false}
                isLALR1={parserData.type === 'lalr1' ? parserData.isLALR1 : false}
                parserType={parserData.type}
              />
            )}

            <StringParser onParse={handleParse} parsing={parsing} disabled={!parserData} />
            <ParsingSteps result={parseResult} />
          </motion.div>
        )}

        {!parserData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${info.bgGradient} border ${info.borderColor} flex items-center justify-center`}>
              <svg className={`w-12 h-12 ${info.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Enter a Context-Free Grammar</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Input your grammar rules above and click "Generate Parser" to explore {info.title} parsing.
            </p>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-gray-400 animate-pulse">Generating {info.title} parser...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
