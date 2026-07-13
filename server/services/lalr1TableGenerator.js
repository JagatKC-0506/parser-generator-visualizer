function getCoreKey(item) {
  return `${item.lhs}→${item.rhs.join(' ')}`;
}

function getCoreKeyFromStr(itemStr) {
  const arrowIdx = itemStr.indexOf('→');
  const lhs = itemStr.slice(0, arrowIdx).trim();
  let rhs = itemStr.slice(arrowIdx + 1).trim();
  const bracketIdx = rhs.lastIndexOf('[');
  if (bracketIdx !== -1) {
    rhs = rhs.slice(0, bracketIdx).trim();
  }
  return `${lhs}→${rhs}`;
}

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

function formatMergedItem(itemStr, mergedLookaheads) {
  const arrowIdx = itemStr.indexOf('→');
  const lhs = itemStr.slice(0, arrowIdx).trim();
  const rest = itemStr.slice(arrowIdx + 1).trim();
  const bracketIdx = rest.lastIndexOf('[');
  const rhsPart = bracketIdx !== -1 ? rest.slice(0, bracketIdx).trim() : rest;
  return `${lhs} → ${rhsPart}  [${mergedLookaheads.join('/')}]`;
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

export function generateLALR1Table(clrStates, clrTransitions, numberedProductions, terminals, nonTerminals) {
  const allTerminals = [...terminals, '$'];
  const augmentedStartLhs = clrStates[0]?.items[0]?.split('→')[0]?.trim() || '';
  const allNonTerminals = nonTerminals.filter((nt) => nt !== augmentedStartLhs);
  const conflicts = [];

  const coreGroups = {};
  for (let i = 0; i < clrStates.length; i++) {
    const core = clrStates[i].items.map((itemStr) => getCoreKeyFromStr(itemStr)).sort().join('|||');
    if (!coreGroups[core]) coreGroups[core] = [];
    coreGroups[core].push(i);
  }

  const mergeMap = {};
  let mergedId = 0;
  const mergedStates = [];

  for (const core in coreGroups) {
    const stateIds = coreGroups[core];
    const representative = stateIds[0];

    for (const sid of stateIds) {
      mergeMap[sid] = mergedId;
    }

    const mergedItems = [];
    const seenCores = new Set();

    for (const sid of stateIds) {
      for (const itemStr of clrStates[sid].items) {
        const coreKey = getCoreKeyFromStr(itemStr);
        const info = parseItemInfo(itemStr);

        if (seenCores.has(coreKey)) {
          const existing = mergedItems.find((mi) => getCoreKeyFromStr(mi) === coreKey);
          if (existing) {
            const existInfo = parseItemInfo(existing);
            const mergedLA = new Set([...(existInfo.lookahead || []), ...(info.lookahead || [])]);
            const idx = mergedItems.indexOf(existing);
            mergedItems[idx] = formatMergedItem(existing, [...mergedLA]);
          }
        } else {
          seenCores.add(coreKey);
          mergedItems.push(itemStr);
        }
      }
    }

    mergedStates.push({
      id: mergedId,
      label: `I${mergedId}${stateIds.length > 1 ? ` (merged I${stateIds.join(', I')})` : ''}`,
      items: mergedItems,
      mergedFrom: stateIds.length > 1 ? stateIds : undefined,
      isLALR: true,
    });

    mergedId++;
  }

  const mergedTransitions = [];
  const seenTransitions = new Set();

  for (const t of clrTransitions) {
    const newFrom = mergeMap[t.from];
    const newTo = mergeMap[t.to];
    const key = `${newFrom}-${newTo}-${t.symbol}`;
    if (!seenTransitions.has(key)) {
      seenTransitions.add(key);
      mergedTransitions.push({
        from: newFrom,
        to: newTo,
        symbol: t.symbol,
        type: t.type,
      });
    }
  }

  const actionTable = {};
  const gotoTable = {};
  for (let i = 0; i < mergedStates.length; i++) {
    actionTable[i] = {};
    gotoTable[i] = {};
    for (const t of allTerminals) {
      actionTable[i][t] = [];
    }
    for (const nt of allNonTerminals) {
      gotoTable[i][nt] = null;
    }
  }

  for (const t of mergedTransitions) {
    if (allTerminals.includes(t.symbol)) {
      actionTable[t.from][t.symbol].push(`S${t.to}`);
    } else if (allNonTerminals.includes(t.symbol)) {
      gotoTable[t.from][t.symbol] = t.to;
    }
  }

  for (let i = 0; i < mergedStates.length; i++) {
    const state = mergedStates[i];
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

  for (let i = 0; i < mergedStates.length; i++) {
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

  return {
    states: mergedStates,
    transitions: mergedTransitions,
    actionTable,
    gotoTable,
    conflicts,
    terminals: allTerminals,
    nonTerminals: allNonTerminals,
  };
}
