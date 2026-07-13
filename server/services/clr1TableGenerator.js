function parseItemInfo(itemStr) {
  const arrowIdx = itemStr.indexOf('→');
  const lhs = itemStr.slice(0, arrowIdx).trim();
  const rest = itemStr.slice(arrowIdx + 1).trim();

  let rhsAndLA = rest;
  let lookahead = null;

  const bracketIdx = rest.lastIndexOf('[');
  if (bracketIdx !== -1) {
    rhsAndLA = rest.slice(0, bracketIdx).trim();
    const laContent = rest.slice(bracketIdx + 1, rest.lastIndexOf(']'));
    lookahead = laContent.split('/').map((s) => s.trim()).filter(Boolean);
  }

  const rhs = rhsAndLA.replace('•', '').replace(/\s+/g, ' ').trim();

  return { lhs, rhs, lookahead };
}

function getRuleNumber(lhs, rhs, numberedProductions) {
  for (const np of numberedProductions) {
    const npRhs = np.rhs.join(' ');
    if (np.lhs === lhs && npRhs === rhs) {
      return np.ruleNumber;
    }
  }
  return -1;
}

function isReduceItem(itemStr) {
  const bracketIdx = itemStr.lastIndexOf('[');
  const core = bracketIdx !== -1 ? itemStr.slice(0, bracketIdx).trim() : itemStr.trim();
  return core.includes('•') && core.endsWith('•');
}

export function generateCLR1Table(states, transitions, numberedProductions, terminals, nonTerminals) {
  const allTerminals = [...terminals, '$'];
  const augmentedStartLhs = states[0]?.items[0]?.split('→')[0]?.trim() || '';
  const allNonTerminals = nonTerminals.filter((nt) => nt !== augmentedStartLhs);
  const conflicts = [];

  const actionTable = {};
  const gotoTable = {};

  for (let i = 0; i < states.length; i++) {
    actionTable[i] = {};
    gotoTable[i] = {};
    for (const t of allTerminals) {
      actionTable[i][t] = [];
    }
    for (const nt of allNonTerminals) {
      gotoTable[i][nt] = null;
    }
  }

  for (const t of transitions) {
    if (allTerminals.includes(t.symbol)) {
      actionTable[t.from][t.symbol].push(`S${t.to}`);
    } else if (allNonTerminals.includes(t.symbol)) {
      gotoTable[t.from][t.symbol] = t.to;
    }
  }

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    for (const itemStr of state.items) {
      if (isReduceItem(itemStr) && itemStr.includes("'")) {
        actionTable[i]['$'].push('ACC');
        continue;
      }

      if (isReduceItem(itemStr)) {
        const info = parseItemInfo(itemStr);
        const ruleNum = getRuleNumber(info.lhs, info.rhs, numberedProductions);
        if (ruleNum <= 0) continue;

        const lookaheads = info.lookahead || ['$'];

        for (const sym of lookaheads) {
          if (allTerminals.includes(sym)) {
            actionTable[i][sym].push(`R${ruleNum}`);
          }
        }
      }
    }
  }

  for (let i = 0; i < states.length; i++) {
    for (const sym of allTerminals) {
      const cell = actionTable[i][sym];
      if (cell.length <= 1) continue;

      const shiftActions = cell.filter((a) => a.startsWith('S'));
      const reduceActions = cell.filter((a) => a.startsWith('R'));
      const hasAccept = cell.includes('ACC');

      if (shiftActions.length > 0 && reduceActions.length > 0) {
        conflicts.push({
          type: 'Shift-Reduce Conflict',
          state: i,
          symbol: sym,
          description: `State I${i}: Shift-Reduce conflict on "${sym}"`,
          actions: [...cell],
        });
      }

      if (reduceActions.length > 1) {
        const uniqueReduces = [...new Set(reduceActions)];
        if (uniqueReduces.length > 1) {
          conflicts.push({
            type: 'Reduce-Reduce Conflict',
            state: i,
            symbol: sym,
            description: `State I${i}: Reduce-Reduce conflict on "${sym}" between ${uniqueReduces.join(' and ')}`,
            actions: [...cell],
          });
        }
      }

      if (hasAccept && (shiftActions.length > 0 || reduceActions.length > 0)) {
        conflicts.push({
          type: 'Shift-Reduce Conflict',
          state: i,
          symbol: sym,
          description: `State I${i}: conflict on "${sym}" between accept and existing action`,
          actions: [...cell],
        });
      }
    }
  }

  return { actionTable, gotoTable, conflicts, terminals: allTerminals, nonTerminals: allNonTerminals };
}
