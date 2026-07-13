export function computeFirst(productions) {
  const first = {};

  const nonTerminals = new Set();
  for (const p of productions) {
    nonTerminals.add(p.lhs);
  }

  for (const nt of nonTerminals) {
    first[nt] = new Set();
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (const prod of productions) {
      const A = prod.lhs;
      const rhs = prod.rhs;

      if (rhs[0] === 'ε') {
        if (!first[A].has('ε')) {
          first[A].add('ε');
          changed = true;
        }
        continue;
      }

      let allHaveEpsilon = true;
      for (let i = 0; i < rhs.length; i++) {
        const sym = rhs[i];

        if (nonTerminals.has(sym)) {
          const firstSym = first[sym];
          for (const f of firstSym) {
            if (f !== 'ε' && !first[A].has(f)) {
              first[A].add(f);
              changed = true;
            }
          }
          if (!firstSym.has('ε')) {
            allHaveEpsilon = false;
            break;
          }
        } else {
          if (!first[A].has(sym)) {
            first[A].add(sym);
            changed = true;
          }
          allHaveEpsilon = false;
          break;
        }
      }

      if (allHaveEpsilon && !first[A].has('ε')) {
        first[A].add('ε');
        changed = true;
      }
    }
  }

  const result = {};
  for (const nt of nonTerminals) {
    result[nt] = [...first[nt]];
  }
  return result;
}

export function computeFollow(productions, first) {
  const follow = {};

  const nonTerminals = new Set();
  for (const p of productions) {
    nonTerminals.add(p.lhs);
  }

  for (const nt of nonTerminals) {
    follow[nt] = new Set();
  }

  const startSymbol = productions[0]?.lhs;
  if (startSymbol) {
    follow[startSymbol].add('$');
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (const prod of productions) {
      const A = prod.lhs;
      const rhs = prod.rhs;

      if (rhs[0] === 'ε') continue;

      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!nonTerminals.has(B)) continue;

        const beta = rhs.slice(i + 1);

        if (beta.length === 0) {
          for (const f of follow[A]) {
            if (!follow[B].has(f)) {
              follow[B].add(f);
              changed = true;
            }
          }
        } else {
          let allHaveEpsilon = true;
          for (let j = 0; j < beta.length; j++) {
            const b = beta[j];
            if (nonTerminals.has(b)) {
              for (const f of first[b]) {
                if (f !== 'ε' && !follow[B].has(f)) {
                  follow[B].add(f);
                  changed = true;
                }
              }
              if (!first[b].includes('ε')) {
                allHaveEpsilon = false;
                break;
              }
            } else {
              if (!follow[B].has(b)) {
                follow[B].add(b);
                changed = true;
              }
              allHaveEpsilon = false;
              break;
            }
          }

          if (allHaveEpsilon) {
            for (const f of follow[A]) {
              if (!follow[B].has(f)) {
                follow[B].add(f);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  const result = {};
  for (const nt of nonTerminals) {
    result[nt] = [...follow[nt]];
  }
  return result;
}
