function tokenizeRHS(rhsStr) {
  const tokens = [];
  const trimmed = rhsStr.trim();
  if (!trimmed) return ['ε'];

  const spaced = trimmed.split(/\s+/);
  if (spaced.length > 1) {
    return spaced.filter(Boolean);
  }

  let i = 0;
  const str = trimmed;
  while (i < str.length) {
    if (str[i] === ' ' || str[i] === '\t') { i++; continue; }

    if (/[a-z]/.test(str[i])) {
      let j = i;
      while (j < str.length && /[a-zA-Z0-9_]/.test(str[j])) j++;
      const token = str.slice(i, j);
      tokens.push(token.toLowerCase() === 'epsilon' ? 'ε' : token);
      i = j;
    } else if (/[A-Z]/.test(str[i])) {
      let j = i;
      while (j < str.length && /[A-Za-z0-9_']/.test(str[j])) j++;
      tokens.push(str.slice(i, j));
      i = j;
    } else if (str[i] === 'ε') {
      tokens.push('ε');
      i++;
    } else {
      tokens.push(str[i]);
      i++;
    }
  }

  return tokens;
}

export function parseGrammar(rawLines) {
  const productions = [];
  const nonTerminals = new Set();
  const terminals = new Set();
  let error = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    if (!line.includes('->') && !line.includes('→')) {
      error = `Line ${i + 1}: Missing "->" or "→"`;
      return { productions, nonTerminals, terminals, error };
    }

    const arrow = line.includes('→') ? '→' : '->';
    const parts = line.split(arrow);
    const lhs = parts[0].trim();

    if (!lhs || !/^[A-Z][A-Za-z0-9_']*$/.test(lhs)) {
      error = `Line ${i + 1}: Invalid non-terminal "${lhs}"`;
      return { productions, nonTerminals, terminals, error };
    }

    nonTerminals.add(lhs);

    const rhsPart = parts.slice(1).join(arrow).trim();
    const alternatives = rhsPart.split('|');

    for (const alt of alternatives) {
      const symbols = tokenizeRHS(alt);

      const prod = { lhs, rhs: symbols };
      productions.push(prod);

      for (const sym of symbols) {
        if (sym === 'ε') continue;
        if (/^[A-Z][A-Za-z0-9_']*$/.test(sym)) {
          nonTerminals.add(sym);
        } else {
          terminals.add(sym);
        }
      }
    }
  }

  terminals.delete('ε');

  return { productions, nonTerminals: [...nonTerminals], terminals: [...terminals], error: null };
}
