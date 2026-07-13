function computeFirstString(symbols, first, nonTerminals) {
  const result = new Set();
  let allEpsilon = true;

  for (const sym of symbols) {
    if (sym === 'ε') continue;
    if (nonTerminals.has(sym)) {
      const fs = first[sym] || [];
      for (const f of fs) {
        if (f !== 'ε') result.add(f);
      }
      if (!fs.includes('ε')) {
        allEpsilon = false;
        break;
      }
    } else {
      result.add(sym);
      allEpsilon = false;
      break;
    }
  }

  if (allEpsilon) result.add('ε');
  return result;
}

export function generateLL1Table(productions, nonTerminalsList, terminalsList, first, follow) {
  const nonTerminals = new Set(nonTerminalsList);
  const allTerminals = terminalsList.filter((t) => t !== 'ε');
  const conflicts = [];

  const table = {};
  for (const nt of nonTerminalsList) {
    table[nt] = {};
    for (const t of allTerminals) {
      table[nt][t] = null;
    }
    table[nt]['$'] = null;
  }

  for (let i = 0; i < productions.length; i++) {
    const prod = productions[i];
    const A = prod.lhs;
    const rhs = prod.rhs;

    const firstRHS = computeFirstString(rhs, first, nonTerminals);

    for (const terminal of firstRHS) {
      if (terminal === 'ε') continue;
      if (table[A][terminal] !== null) {
        conflicts.push({
          type: 'LL(1) Conflict',
          nonTerminal: A,
          symbol: terminal,
          description: `Multiple productions for M[${A}, ${terminal}]`,
          existing: table[A][terminal],
          incoming: i,
        });
      }
      table[A][terminal] = i;
    }

    if (firstRHS.has('ε')) {
      const followA = follow[A] || [];
      for (const terminal of followA) {
        if (terminal === 'ε') continue;
        if (table[A][terminal] !== null) {
          conflicts.push({
            type: 'LL(1) Conflict',
            nonTerminal: A,
            symbol: terminal,
            description: `Multiple productions for M[${A}, ${terminal}] (via ε)`,
            existing: table[A][terminal],
            incoming: i,
          });
        }
        table[A][terminal] = i;
      }
    }
  }

  const isLL1 = conflicts.length === 0;

  return { table, conflicts, isLL1, terminals: [...allTerminals, '$'], nonTerminals: nonTerminalsList };
}

export function simulateLL1(input, table, productions, terminals, startSymbol) {
  const steps = [];
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  tokens.push('$');

  const allTerminals = [...terminals.filter((t) => t !== 'ε'), '$'];
  const stack = ['$', startSymbol];
  let inputPointer = 0;
  let accepted = false;
  let error = false;

  const maxSteps = 200;
  let stepCount = 0;

  while (!accepted && !error && stepCount < maxSteps) {
    stepCount++;
    const top = stack[stack.length - 1];
    const currentInput = tokens[inputPointer] || '$';

    const stackStr = stack.join(' ');
    const inputStr = tokens.slice(inputPointer).join(' ') || '$';

    if (top === '$') {
      if (currentInput === '$') {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: 'Accept',
        });
        accepted = true;
        break;
      } else {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Error: Unexpected input "${currentInput}"`,
        });
        error = true;
        break;
      }
    } else if (allTerminals.includes(top)) {
      if (top === currentInput) {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Match "${top}"`,
        });
        stack.pop();
        inputPointer++;
      } else {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Error: Expected "${top}" but got "${currentInput}"`,
        });
        error = true;
        break;
      }
    } else {
      const prodIdx = table[top]?.[currentInput];
      if (prodIdx === null || prodIdx === undefined) {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Error: No rule for M[${top}, "${currentInput}"]`,
        });
        error = true;
        break;
      }

      const prod = productions[prodIdx];
      if (!prod) {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Error: Unknown production index ${prodIdx}`,
        });
        error = true;
        break;
      }

      stack.pop();

      const rhsStr = prod.rhs[0] === 'ε' ? 'ε' : prod.rhs.join(' ');

      steps.push({
        stack: stackStr,
        input: inputStr,
        action: `Output ${prod.lhs} → ${rhsStr}`,
      });

      if (prod.rhs[0] !== 'ε') {
        for (let i = prod.rhs.length - 1; i >= 0; i--) {
          stack.push(prod.rhs[i]);
        }
      }
    }
  }

  return {
    accepted,
    steps,
    error: error && !accepted ? 'Parsing failed' : null,
  };
}
