function computeFirstOfSeq(symbols, first, nonTerminals) {
  const result = new Set();
  let allEpsilon = true;

  for (const sym of symbols) {
    if (sym === 'ε') { continue; }
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

function itemKey(lhs, rhs, lookahead) {
  return `${lhs}→${rhs.join(' ')}|${[...lookahead].sort().join(',')}`;
}

function itemsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (const ia of a) {
    const laA = [...ia.lookahead];
    const found = b.some(
      (ib) => ia.lhs === ib.lhs && ia.rhs.length === ib.rhs.length &&
        ia.rhs.every((s, i) => s === ib.rhs[i]) &&
        laA.length === ib.lookahead.size &&
        laA.every((s) => ib.lookahead.has(s))
    );
    if (!found) return false;
  }
  return true;
}

function formatItem(item) {
  const laArray = item.lookahead ? [...item.lookahead] : [];
  const la = laArray.length > 0 ? `  [${laArray.join('/')}]` : '';
  return `${item.lhs} → ${item.rhs.join(' ')}${la}`;
}

function closureLR1(items, productions, first, nonTerminals) {
  const closureSet = [...items.map((i) => ({
    lhs: i.lhs,
    rhs: [...i.rhs],
    lookahead: new Set(i.lookahead),
  }))];
  let changed = true;

  while (changed) {
    changed = false;
    const currentItems = closureSet.map((i) => ({
      lhs: i.lhs,
      rhs: [...i.rhs],
      lookahead: new Set(i.lookahead),
    }));

    for (const item of currentItems) {
      const dotIdx = item.rhs.indexOf('•');
      if (dotIdx === -1) continue;

      const nextSym = item.rhs[dotIdx + 1];
      if (!nextSym || !nonTerminals.has(nextSym)) continue;

      const beta = item.rhs.slice(dotIdx + 2);
      const lookaheads = [...item.lookahead];
      const firstBetaA = new Set();

      for (const la of lookaheads) {
        const seq = [...beta, la];
        const fs = computeFirstOfSeq(seq, first, nonTerminals);
        for (const f of fs) {
          if (f !== 'ε') firstBetaA.add(f);
        }
      }

      if (firstBetaA.size === 0) {
        for (const la of lookaheads) firstBetaA.add(la);
      }

      for (const prod of productions) {
        if (prod.lhs !== nextSym) continue;

        const existing = closureSet.find(
          (ci) => ci.lhs === prod.lhs && ci.rhs.length === prod.rhs.length + 1 &&
            ci.rhs[0] === '•' && ci.rhs.slice(1).every((s, idx) => s === prod.rhs[idx])
        );

        if (existing) {
          for (const f of firstBetaA) {
            if (!existing.lookahead.has(f)) {
              existing.lookahead.add(f);
              changed = true;
            }
          }
        } else {
          closureSet.push({
            lhs: prod.lhs,
            rhs: ['•', ...prod.rhs],
            lookahead: new Set(firstBetaA),
          });
          changed = true;
        }
      }
    }
  }

  return closureSet;
}

function gotoLR1(items, symbol, productions, first, nonTerminals) {
  const moved = [];

  for (const item of items) {
    const dotIdx = item.rhs.indexOf('•');
    if (dotIdx === -1) continue;

    const nextSym = item.rhs[dotIdx + 1];
    if (nextSym !== symbol) continue;

    const newRhs = [...item.rhs];
    newRhs[dotIdx] = nextSym;
    newRhs[dotIdx + 1] = '•';
    moved.push({
      lhs: item.lhs,
      rhs: newRhs,
      lookahead: new Set(item.lookahead),
    });
  }

  if (moved.length === 0) return null;
  return closureLR1(moved, productions, first, nonTerminals);
}

export function generateLR1Items(augmentedProductions, first) {
  const productions = augmentedProductions;
  const nonTerminals = new Set(productions.map((p) => p.lhs));

  const startLhs = productions[0].lhs;
  const startRhs = ['•', ...productions[0].rhs];

  const startState = closureLR1(
    [{ lhs: startLhs, rhs: startRhs, lookahead: new Set(['$']) }],
    productions,
    first,
    nonTerminals
  );

  const states = [startState];
  const transitions = [];
  const stateLabels = ['I0'];

  const allSymbols = new Set();
  for (const p of productions) {
    allSymbols.add(p.lhs);
    for (const s of p.rhs) allSymbols.add(s);
  }

  let i = 0;
  while (i < states.length) {
    const state = states[i];
    const seenSymbols = new Set();

    for (const item of state) {
      const dotIdx = item.rhs.indexOf('•');
      if (dotIdx === -1 || dotIdx >= item.rhs.length - 1) continue;

      const sym = item.rhs[dotIdx + 1];
      if (seenSymbols.has(sym)) continue;
      seenSymbols.add(sym);

      const newState = gotoLR1(state, sym, productions, first, nonTerminals);
      if (!newState) continue;

      let foundIdx = -1;
      for (let j = 0; j < states.length; j++) {
        if (itemsEqual(newState, states[j])) {
          foundIdx = j;
          break;
        }
      }

      if (foundIdx === -1) {
        states.push(newState);
        stateLabels.push(`I${states.length - 1}`);
        foundIdx = states.length - 1;
      }

      const isTerminal = !productions.some((p) => p.lhs === sym);
      transitions.push({
        from: i,
        to: foundIdx,
        symbol: sym,
        type: isTerminal ? 'terminal' : 'nonTerminal',
      });
    }
    i++;
  }

  const formattedStates = states.map((state, idx) => ({
    id: idx,
    label: stateLabels[idx],
    items: state.map((item) => formatItem(item)),
    isLR1: true,
  }));

  return { states: formattedStates, transitions };
}
