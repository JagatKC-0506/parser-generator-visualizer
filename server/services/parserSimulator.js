export function simulateParsing(input, actionTable, gotoTable, numberedProductions, terminals) {
  const steps = [];
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  tokens.push('$');

  const stack = [0];
  let inputPointer = 0;
  let accepted = false;
  let error = false;

  const maxSteps = 200;
  let stepCount = 0;

  while (!accepted && !error && stepCount < maxSteps) {
    stepCount++;
    const state = stack[stack.length - 1];
    const currentInput = tokens[inputPointer] || '$';

    const stackStr = stack.join(' ');
    const inputStr = tokens.slice(inputPointer).join(' ') || '$';

    let action = actionTable[state]?.[currentInput];

    if (!action || (Array.isArray(action) && action.length === 0)) {
      steps.push({
        stack: stackStr,
        input: inputStr,
        action: `Error: No action for state ${state} on "${currentInput}"`,
      });
      error = true;
      break;
    }

    if (Array.isArray(action)) {
      if (action.length > 1) {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Conflict: Multiple actions ${action.join('/')} — using first`,
        });
      }
      action = action[0];
    }

    if (action === 'ACC') {
      steps.push({
        stack: stackStr,
        input: inputStr,
        action: 'Accept',
      });
      accepted = true;
      break;
    }

    if (action.startsWith('S')) {
      const nextState = parseInt(action.substring(1), 10);
      steps.push({
        stack: stackStr,
        input: inputStr,
        action: `Shift ${nextState}`,
      });
      stack.push(currentInput);
      stack.push(nextState);
      inputPointer++;
    } else if (action.startsWith('R')) {
      const ruleNum = parseInt(action.substring(1), 10);
      const prod = numberedProductions.find((p) => p.ruleNumber === ruleNum);

      if (!prod) {
        steps.push({
          stack: stackStr,
          input: inputStr,
          action: `Error: Unknown rule ${action}`,
        });
        error = true;
        break;
      }

      const rhsLen = prod.rhs[0] === 'ε' ? 0 : prod.rhs.length;
      const popCount = rhsLen * 2;

      steps.push({
        stack: stackStr,
        input: inputStr,
        action: `Reduce ${prod.lhs} → ${prod.rhs.join(' ')}`,
      });

      for (let i = 0; i < popCount; i++) {
        if (stack.length > 0) stack.pop();
      }

      const topState = stack[stack.length - 1];
      const gotoState = gotoTable[topState]?.[prod.lhs];
      if (gotoState === undefined || gotoState === null) {
        steps.push({
          stack: stack.join(' '),
          input: tokens.slice(inputPointer).join(' ') || '$',
          action: `Error: No GOTO state for ${prod.lhs} from state ${topState}`,
        });
        error = true;
        break;
      }

      stack.push(prod.lhs);
      stack.push(gotoState);
    } else {
      steps.push({
        stack: stackStr,
        input: inputStr,
        action: `Error: Unknown action ${action}`,
      });
      error = true;
      break;
    }
  }

  return {
    accepted,
    steps,
    error: error && !accepted ? 'Parsing failed' : null,
  };
}
