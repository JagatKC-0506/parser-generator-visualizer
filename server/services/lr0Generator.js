export function closure(items, productions) {
  const closureSet = [...items];
  const nonTerminals = new Set(productions.map((p) => p.lhs));
  let changed = true;

  while (changed) {
    changed = false;
    const currentItems = [...closureSet];

    for (const item of currentItems) {
      const dotIdx = item.rhs.indexOf('•');
      if (dotIdx === -1) continue;

      const nextSym = item.rhs[dotIdx + 1];
      if (!nextSym || !nonTerminals.has(nextSym)) continue;

      for (const prod of productions) {
        if (prod.lhs !== nextSym) continue;

        const newItemRhs = ['•', ...prod.rhs];
        const exists = closureSet.some(
          (ci) => ci.lhs === prod.lhs && ci.rhs.length === newItemRhs.length &&
            ci.rhs.every((s, idx) => s === newItemRhs[idx])
        );

        if (!exists) {
          closureSet.push({ lhs: prod.lhs, rhs: newItemRhs });
          changed = true;
        }
      }
    }
  }

  return closureSet;
}

export function goto(items, symbol, productions) {
  const moved = [];

  for (const item of items) {
    const dotIdx = item.rhs.indexOf('•');
    if (dotIdx === -1) continue;

    const nextSym = item.rhs[dotIdx + 1];
    if (nextSym !== symbol) continue;

    const newRhs = [...item.rhs];
    newRhs[dotIdx] = nextSym;
    newRhs[dotIdx + 1] = '•';
    moved.push({ lhs: item.lhs, rhs: newRhs });
  }

  if (moved.length === 0) return null;
  return closure(moved, productions);
}

function itemsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (const ia of a) {
    const found = b.some(
      (ib) => ia.lhs === ib.lhs && ia.rhs.length === ib.rhs.length &&
        ia.rhs.every((s, i) => s === ib.rhs[i])
    );
    if (!found) return false;
  }
  return true;
}

function formatItem(item) {
  return `${item.lhs} → ${item.rhs.join(' ')}`;
}

export function generateLR0Items(augmentedProductions) {
  const productions = augmentedProductions;

  const startLhs = productions[0].lhs;
  const startRhs = ['•', ...productions[0].rhs];

  const startState = closure([{ lhs: startLhs, rhs: startRhs }], productions);

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

      const newState = goto(state, sym, productions);
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
  }));

  return { states: formattedStates, transitions };
}
