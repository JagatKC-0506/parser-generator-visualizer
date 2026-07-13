function getRuleNumber(item, numberedProductions) {
  const lhs = item.split('→')[0].trim();
  const rhs = item.split('→')[1].trim().replace('•', '').replace(/\s+/g, ' ').trim();

  for (const np of numberedProductions) {
    const npRhs = np.rhs.join(' ');
    if (np.lhs === lhs && npRhs === rhs) {
      return np.ruleNumber;
    }
  }
  return -1;
}

function isReduceItem(itemStr) {
  return itemStr.includes('•') && itemStr.trim().endsWith('•');
}

function getProductionForRule(ruleNum, numberedProductions) {
  const prod = numberedProductions.find((p) => p.ruleNumber === ruleNum);
  if (!prod) return null;
  return `${prod.lhs} -> ${prod.rhs.join(' ')}`;
}

export function generateSLRTable(states, transitions, numberedProductions, follow, terminals, nonTerminals) {
  const allTerminals = [...terminals, '$'];
  const augmentedStartLhs = states[0]?.items[0]?.split('→')[0]?.trim() || '';
  const allNonTerminals = nonTerminals.filter((nt) => nt !== augmentedStartLhs);

  const actionTable = {};
  const gotoTable = {};
  const conflicts = [];

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
    const from = t.from;
    const sym = t.symbol;
    const to = t.to;

    if (allTerminals.includes(sym)) {
      actionTable[from][sym].push(`S${to}`);
    } else if (allNonTerminals.includes(sym)) {
      gotoTable[from][sym] = to;
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
        const ruleNum = getRuleNumber(itemStr, numberedProductions);
        if (ruleNum <= 0) continue;

        const lhs = itemStr.split('→')[0].trim();
        const followSet = follow[lhs] || [];

        for (const sym of followSet) {
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
          const ruleNums = uniqueReduces.map((a) => parseInt(a.substring(1), 10)).filter((n) => n > 0);
          const productions = ruleNums.map((rn) => getProductionForRule(rn, numberedProductions)).filter(Boolean);

          conflicts.push({
            type: 'Reduce-Reduce Conflict',
            state: i,
            symbol: sym,
            description: `State I${i}: Reduce-Reduce conflict on "${sym}" between ${uniqueReduces.join(' and ')}`,
            actions: [...cell],
            productions,
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
