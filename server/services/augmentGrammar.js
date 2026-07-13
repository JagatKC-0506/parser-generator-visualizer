export function augmentGrammar(productions, startSymbol) {
  const start = startSymbol || productions[0]?.lhs;
  if (!start) return { augmentedProductions: [], numberedProductions: [] };

  const augmented = [{ lhs: start + "'", rhs: [start] }];
  const numbered = [];

  augmented[0].ruleNumber = 0;

  for (const p of productions) {
    augmented.push({ ...p });
  }

  for (let i = 0; i < augmented.length; i++) {
    numbered.push({
      ruleNumber: i,
      lhs: augmented[i].lhs,
      rhs: [...augmented[i].rhs],
      label: `R${i}`,
    });
  }

  return { augmentedProductions: augmented, numberedProductions: numbered };
}
