export function validateGrammar(productions, nonTerminals, terminals) {
  const errors = [];

  if (productions.length === 0) {
    errors.push('Grammar must have at least one production');
    return errors;
  }

  for (let i = 0; i < productions.length; i++) {
    const p = productions[i];
    const lhs = p.lhs;
    const rhs = p.rhs;

    if (!lhs || lhs.trim() === '') {
      errors.push(`Production ${i + 1}: Missing left-hand side`);
      continue;
    }

    if (!/^[A-Z][A-Za-z0-9_']*$/.test(lhs)) {
      errors.push(`Production ${i + 1}: Invalid non-terminal "${lhs}"`);
    }

    if (!rhs || rhs.length === 0) {
      errors.push(`Production ${i + 1}: Missing right-hand side`);
    }

    for (const sym of rhs) {
      if (sym === 'ε') continue;
      if (!/^[A-Z][A-Za-z0-9_']*$/.test(sym) && !terminals.includes(sym)) {
        errors.push(`Production ${i + 1}: Undefined symbol "${sym}"`);
      }
    }
  }

  if (nonTerminals.length === 0) {
    errors.push('No non-terminals found in grammar');
  }

  for (const nt of nonTerminals) {
    const hasProduction = productions.some((p) => p.lhs === nt);
    if (!hasProduction) {
      errors.push(`Non-terminal "${nt}" has no productions`);
    }
  }

  for (const p of productions) {
    for (const sym of p.rhs) {
      if (sym === 'ε') continue;
      if (/^[A-Z][A-Za-z0-9_']*$/.test(sym)) continue;
      if (terminals.includes(sym)) continue;
      errors.push(`Symbol "${sym}" in production "${p.lhs} → ${p.rhs.join(' ')}" is not defined`);
    }
  }

  return errors;
}
