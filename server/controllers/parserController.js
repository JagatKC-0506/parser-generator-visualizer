import { parseGrammar } from '../services/grammarParser.js';
import { augmentGrammar } from '../services/augmentGrammar.js';
import { computeFirst, computeFollow } from '../services/firstFollow.js';
import { generateLR0Items } from '../services/lr0Generator.js';
import { generateLR1Items } from '../services/lr1Generator.js';
import { generateDFA } from '../services/dfaGenerator.js';
import { generateSLRTable } from '../services/slrTableGenerator.js';
import { generateLR0Table } from '../services/lr0TableGenerator.js';
import { generateLL1Table, simulateLL1 } from '../services/ll1TableGenerator.js';
import { generateCLR1Table } from '../services/clr1TableGenerator.js';
import { generateLALR1Table } from '../services/lalr1TableGenerator.js';
import { simulateParsing } from '../services/parserSimulator.js';
import { validateGrammar } from '../services/grammarValidator.js';

function generateSLR(productions, nonTerminals, terminals, augmentedProductions, numberedProductions) {
  const first = computeFirst(augmentedProductions);
  const follow = computeFollow(augmentedProductions, first);
  const { states, transitions } = generateLR0Items(augmentedProductions);
  const dfa = generateDFA(states, transitions);
  const { actionTable, gotoTable, conflicts } = generateSLRTable(
    states, transitions, numberedProductions, follow, terminals, nonTerminals
  );
  const isSLR = conflicts.length === 0;

  return {
    type: 'slr1',
    augmentedGrammar: numberedProductions,
    productions: augmentedProductions,
    first,
    follow,
    states,
    dfa,
    slrTable: { action: actionTable, goto: gotoTable },
    conflicts,
    isSLR,
    terminals,
    nonTerminals,
    hasDFA: true,
    hasLRStates: true,
    hasParsingTable: true,
    hasPredictiveTable: false,
  };
}

function generateLR0(productions, nonTerminals, terminals, augmentedProductions, numberedProductions) {
  const first = computeFirst(augmentedProductions);
  const follow = computeFollow(augmentedProductions, first);
  const { states, transitions } = generateLR0Items(augmentedProductions);
  const dfa = generateDFA(states, transitions);
  const { actionTable, gotoTable, conflicts } = generateLR0Table(
    states, transitions, numberedProductions, terminals, nonTerminals
  );
  const isLR0 = conflicts.length === 0;

  return {
    type: 'lr0',
    augmentedGrammar: numberedProductions,
    productions: augmentedProductions,
    first,
    follow,
    states,
    dfa,
    slrTable: { action: actionTable, goto: gotoTable },
    conflicts,
    isLR0,
    terminals,
    nonTerminals,
    hasDFA: true,
    hasLRStates: true,
    hasParsingTable: true,
    hasPredictiveTable: false,
  };
}

function generateCLR1(productions, nonTerminals, terminals, augmentedProductions, numberedProductions) {
  const first = computeFirst(augmentedProductions);
  const follow = computeFollow(augmentedProductions, first);
  const { states, transitions } = generateLR1Items(augmentedProductions, first);
  const dfa = generateDFA(states, transitions);
  const { actionTable, gotoTable, conflicts } = generateCLR1Table(
    states, transitions, numberedProductions, terminals, nonTerminals
  );
  const isCLR1 = conflicts.length === 0;

  return {
    type: 'clr1',
    augmentedGrammar: numberedProductions,
    productions: augmentedProductions,
    first,
    follow,
    states,
    dfa,
    slrTable: { action: actionTable, goto: gotoTable },
    conflicts,
    isCLR1,
    terminals,
    nonTerminals,
    hasDFA: true,
    hasLRStates: true,
    hasParsingTable: true,
    hasPredictiveTable: false,
  };
}

function generateLALR1(productions, nonTerminals, terminals, augmentedProductions, numberedProductions) {
  const first = computeFirst(augmentedProductions);
  const follow = computeFollow(augmentedProductions, first);
  const { states: clrStates, transitions: clrTransitions } = generateLR1Items(augmentedProductions, first);

  const clrTable = generateCLR1Table(
    clrStates, clrTransitions, numberedProductions, terminals, nonTerminals
  );
  const clrDfa = generateDFA(clrStates, clrTransitions);

  const { states, transitions, actionTable, gotoTable, conflicts } = generateLALR1Table(
    clrStates, clrTransitions, numberedProductions, terminals, nonTerminals
  );
  const dfa = generateDFA(states, transitions);
  const isLALR1 = conflicts.length === 0;

  return {
    type: 'lalr1',
    augmentedGrammar: numberedProductions,
    productions: augmentedProductions,
    first,
    follow,
    states,
    dfa,
    slrTable: { action: actionTable, goto: gotoTable },
    clrTable: { action: clrTable.actionTable, goto: clrTable.gotoTable },
    clrConflicts: clrTable.conflicts,
    clrStates,
    clrDfa,
    conflicts,
    isLALR1,
    terminals,
    nonTerminals,
    hasDFA: true,
    hasLRStates: true,
    hasParsingTable: true,
    hasPredictiveTable: false,
  };
}

function generateLL1(productions, nonTerminals, terminals, augmentedProductions, numberedProductions) {
  const first = computeFirst(augmentedProductions);
  const follow = computeFollow(augmentedProductions, first);
  const originalStart = productions[0]?.lhs;
  const tableProductions = numberedProductions.slice(1).map((p) => ({
    lhs: p.lhs, rhs: p.rhs,
  }));

  const { table, conflicts, isLL1 } = generateLL1Table(
    tableProductions, nonTerminals, terminals, first, follow
  );

  return {
    type: 'll1',
    augmentedGrammar: numberedProductions,
    productions: augmentedProductions,
    first,
    follow,
    ll1Table: { table, startSymbol: originalStart },
    ll1Productions: tableProductions,
    conflicts,
    isLL1,
    terminals,
    nonTerminals,
    hasDFA: false,
    hasLRStates: false,
    hasParsingTable: false,
    hasPredictiveTable: true,
  };
}

const generators = {
  slr1: generateSLR,
  lr0: generateLR0,
  clr1: generateCLR1,
  lalr1: generateLALR1,
  ll1: generateLL1,
};

export function generate(req, res) {
  try {
    const { grammar, type = 'slr1' } = req.body;

    if (!grammar || !Array.isArray(grammar) || grammar.length === 0) {
      return res.status(400).json({ error: 'Grammar input is required as an array of strings' });
    }

    if (!generators[type]) {
      return res.status(400).json({ error: `Unknown parser type "${type}". Valid types: ${Object.keys(generators).join(', ')}` });
    }

    const parsed = parseGrammar(grammar);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const { productions, nonTerminals, terminals } = parsed;

    const validationErrors = validateGrammar(productions, nonTerminals, terminals);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join('; ') });
    }

    const { augmentedProductions, numberedProductions } = augmentGrammar(productions);

    const result = generators[type](productions, nonTerminals, terminals, augmentedProductions, numberedProductions);

    return res.json(result);
  } catch (err) {
    console.error('Generate error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export function parse(req, res) {
  try {
    const { input, actionTable, gotoTable, numberedProductions, terminals, type } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'Input string is required' });
    }

    if (type === 'll1') {
      const { table, productions, terminals: term, startSymbol } = req.body;
      if (!table || !productions || !startSymbol) {
        return res.status(400).json({ error: 'LL(1) table and productions required' });
      }
      const result = simulateLL1(input, table, productions, term || [], startSymbol);
      return res.json(result);
    }

    if (!actionTable || !gotoTable || !numberedProductions) {
      return res.status(400).json({ error: 'Parsing tables required. Generate parser first.' });
    }

    const result = simulateParsing(
      input,
      actionTable,
      gotoTable,
      numberedProductions,
      terminals || []
    );

    return res.json(result);
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
