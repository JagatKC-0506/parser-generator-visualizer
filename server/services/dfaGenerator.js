function buildAdjacencyList(transitions) {
  const adj = {};
  for (const t of transitions) {
    if (!adj[t.from]) adj[t.from] = [];
    adj[t.from].push(t);
  }
  return adj;
}

function bfsLevels(stateCount, transitions) {
  const adj = buildAdjacencyList(transitions);
  const level = {};
  const visited = new Set();
  const queue = [0];
  level[0] = 0;
  visited.add(0);

  while (queue.length > 0) {
    const cur = queue.shift();
    for (const t of adj[cur] || []) {
      if (!visited.has(t.to)) {
        visited.add(t.to);
        level[t.to] = level[cur] + 1;
        queue.push(t.to);
      }
    }
  }

  for (let i = 0; i < stateCount; i++) {
    if (level[i] === undefined) level[i] = 0;
  }

  return level;
}

function groupByLevel(level, stateCount) {
  const groups = {};
  for (let i = 0; i < stateCount; i++) {
    const l = level[i];
    if (!groups[l]) groups[l] = [];
    groups[l].push(i);
  }
  return groups;
}

function categorizeEdges(transitions, level, groups) {
  const forward = [];
  const backward = [];
  const selfLoop = [];

  const levelIndex = {};
  for (const lvl in groups) {
    groups[lvl].forEach((id, idx) => {
      levelIndex[id] = idx;
    });
  }

  for (const t of transitions) {
    if (t.from === t.to) {
      selfLoop.push(t);
      continue;
    }

    const fromLevel = level[t.from] || 0;
    const toLevel = level[t.to] || 0;
    const fromIdx = levelIndex[t.from] || 0;
    const toIdx = levelIndex[t.to] || 0;

    if (toLevel > fromLevel || (toLevel === fromLevel && toIdx > fromIdx)) {
      forward.push(t);
    } else {
      backward.push(t);
    }
  }

  return { forward, backward, selfLoop };
}

function mergeEdges(edges) {
  const merged = {};
  for (const e of edges) {
    const key = `${e.from}-${e.to}`;
    if (!merged[key]) {
      merged[key] = { ...e, symbol: e.symbol };
    } else {
      merged[key].symbol = [merged[key].symbol, e.symbol].flat().join(',');
    }
  }
  return Object.values(merged);
}

export function generateDFA(states, transitions) {
  const stateCount = states.length;

  const level = bfsLevels(stateCount, transitions);
  const groups = groupByLevel(level, stateCount);
  const maxLevel = Math.max(...Object.keys(groups).map(Number));

  const H_SPACING = 240;
  const V_SPACING = 140;
  const PADDING_X = 80;
  const CANVAS_HEIGHT = 520;

  const sortedLevels = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  const nodePositions = {};
  for (const lvl of sortedLevels) {
    const ids = groups[lvl];
    const totalHeight = (ids.length - 1) * V_SPACING;
    const startY = (CANVAS_HEIGHT - totalHeight) / 2;

    for (let i = 0; i < ids.length; i++) {
      nodePositions[ids[i]] = {
        x: PADDING_X + lvl * H_SPACING,
        y: startY + i * V_SPACING,
      };
    }
  }

  const { forward, backward, selfLoop } = categorizeEdges(transitions, level, groups);

  const mergedForward = mergeEdges(forward);
  const mergedBackward = mergeEdges(backward);

  const nodes = states.map((state, idx) => ({
    id: `state-${idx}`,
    type: 'default',
    position: nodePositions[idx] || { x: 0, y: 0 },
    data: {
      label: state.label,
      items: state.items,
      isInitial: idx === 0,
      isAccepting: state.items.some(
        (item) =>
          item.includes('•') &&
          item.trim().endsWith('•') &&
          item.startsWith(states[0]?.items[0]?.split('→')[0]?.trim() + "'")
      ),
    },
  }));

  let edgeIdx = 0;
  const edges = [];

  for (const e of mergedForward) {
    edges.push({
      id: `edge-${edgeIdx++}`,
      source: `state-${e.from}`,
      target: `state-${e.to}`,
      label: e.symbol,
      type: 'default',
      style: { stroke: '#818cf8', strokeWidth: 2 },
      labelStyle: { fill: '#c7d2fe', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: '#1e1b4b' },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 3,
    });
  }

  for (const e of mergedBackward) {
    edges.push({
      id: `edge-${edgeIdx++}`,
      source: `state-${e.from}`,
      target: `state-${e.to}`,
      label: e.symbol,
      type: 'default',
      style: { stroke: '#f472b6', strokeWidth: 1.5, strokeDasharray: '5,4' },
      labelStyle: { fill: '#f9a8d4', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: '#1e1b4b' },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 3,
    });
  }

  for (const e of selfLoop) {
    edges.push({
      id: `edge-${edgeIdx++}`,
      source: `state-${e.from}`,
      target: `state-${e.to}`,
      label: e.symbol,
      type: 'default',
      style: { stroke: '#fbbf24', strokeWidth: 1.5 },
      labelStyle: { fill: '#fde68a', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: '#1e1b4b' },
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 3,
      sourceHandle: 'loop-source',
      targetHandle: 'loop-target',
    });
  }

  return {
    nodes,
    edges,
    meta: {
      levelCount: maxLevel + 1,
      forwardCount: mergedForward.length,
      backwardCount: mergedBackward.length,
      selfLoopCount: selfLoop.length,
    },
  };
}
