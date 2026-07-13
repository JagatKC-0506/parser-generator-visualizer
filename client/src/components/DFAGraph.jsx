import { forwardRef, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  BaseEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function StateNode({ data }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative px-5 py-2.5 rounded-2xl font-mono text-sm font-bold cursor-pointer select-none border-2 transition-shadow hover:shadow-lg ${
        data.isInitial
          ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30'
          : data.isAccepting
            ? 'bg-indigo-600 border-amber-400 text-white shadow-indigo-500/30'
            : 'bg-indigo-600 border-indigo-400/50 text-white shadow-indigo-500/20'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#818cf8', width: 10, height: 10, border: '2px solid #1e1b4b' }}
      />
      <div className="flex items-center gap-2">
        <span>{data.label}</span>
        {data.isAccepting && (
          <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#818cf8', width: 10, height: 10, border: '2px solid #1e1b4b' }}
        id="right"
      />
      <Handle
        type="source"
        position={Position.Top}
        style={{ background: '#fbbf24', width: 10, height: 10, border: '2px solid #1e1b4b' }}
        id="loop-source"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        style={{ background: '#fbbf24', width: 10, height: 10, border: '2px solid #1e1b4b' }}
        id="loop-target"
      />
      {hovered && data.items && data.items.length > 0 && (
        <div className="absolute z-40 left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 pointer-events-none">
          <div className="bg-gray-900 border border-gray-700/80 rounded-xl p-3 shadow-2xl">
            <div className="space-y-1">
              {data.items.map((item, i) => {
                const hasDotAtEnd = item.trim().endsWith('•');
                return (
                  <div
                    key={i}
                    className={`font-mono text-[10px] leading-relaxed px-2 py-1 rounded ${
                      hasDotAtEnd
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-gray-900 border-r border-b border-gray-700/80 rotate-45 -mt-[5px]" />
          </div>
        </div>
      )}
    </div>
  );
}

function SelfLoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}) {
  const radius = 40;
  const midX = sourceX;
  const midY = sourceY - radius;
  const edgePath = `M ${sourceX} ${sourceY} Q ${midX} ${midY - radius * 1.2} ${sourceX + radius * 1.5} ${midY} Q ${sourceX + radius * 2} ${midY + radius * 0.8} ${sourceX} ${sourceY}`;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {label && (
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${midX}px,${midY - radius * 1.2}px)`,
            background: labelBgStyle?.fill || '#1e1b4b',
            padding: labelBgPadding ? `${labelBgPadding[1]}px ${labelBgPadding[0]}px` : '3px 6px',
            borderRadius: labelBgBorderRadius || 3,
            fontSize: 11,
            fontWeight: 600,
            color: labelStyle?.fill || '#fde68a',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {label}
        </div>
      )}
    </>
  );
}

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { selfLoop: SelfLoopEdge };

const DFAGraph = forwardRef(({ dfa, states, parserType }, ref) => {
  const [selectedState, setSelectedState] = useState(null);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);
  const [ready, setReady] = useState(false);

  const { nodes: rawNodes, edges: rawEdges } = dfa || { nodes: [], edges: [] };

  const customNodes = useMemo(
    () =>
      rawNodes.map((n) => ({
        id: n.id,
        type: 'stateNode',
        position: n.position,
        data: {
          label: n.data.label,
          items: n.data.items,
          isInitial: n.data.isInitial,
          isAccepting: n.data.isAccepting,
        },
      })),
    [rawNodes]
  );

  const customEdges = useMemo(
    () =>
      rawEdges.map((e) => ({
        ...e,
        type: e.source === e.target ? 'selfLoop' : 'default',
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: e.style?.stroke || '#818cf8' },
        label: e.label,
      })),
    [rawEdges]
  );

  useEffect(() => {
    if (customNodes.length) {
      setFlowNodes(customNodes);
      setFlowEdges(customEdges);
      setReady(true);
    }
  }, [customNodes, customEdges, setFlowNodes, setFlowEdges]);

  const onNodeClick = useCallback(
    (_, node) => {
      const state = states?.find((s) => s.label === node.data.label);
      if (state) setSelectedState(state);
    },
    [states]
  );

  if (!rawNodes.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">{(parserType || 'LR(0)').toUpperCase()} DFA</h2>
          <p className="text-sm text-gray-500">
            {rawNodes.length} states, {rawEdges.length} transitions — click a node to see its items
          </p>
        </div>
      </div>

      <div className="h-[480px] rounded-xl border border-gray-800/50 bg-gray-900/60" ref={ref}>
        {ready && (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            minZoom={0.3}
            maxZoom={2.5}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={24} size={1} />
            <Controls
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden [&_button]:text-gray-400 [&_button:hover]:text-gray-200 [&_button]:border-gray-800 [&_button]:p-2"
              showInteractive={false}
            />
          </ReactFlow>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400" />
          Start (I0)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-600 border border-indigo-400" />
          Normal state
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-indigo-600 border border-amber-400" />
          <svg className="w-3 h-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          Accepting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-indigo-400 rounded" />
          Forward transition
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-pink-400 rounded border-dashed" style={{ borderTop: '1.5px dashed #f472b6', height: 0, width: 16 }} />
          Back edge
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-amber-400 rounded" />
          Self-loop
        </span>
      </div>

      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedState(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    selectedState.id === 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {selectedState.label}
                  </div>
                  <h3 className="text-lg font-bold text-gray-100">{(parserType || 'LR(0)').toUpperCase()} Items</h3>
                </div>
                <button
                  onClick={() => setSelectedState(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {selectedState.items.map((item, i) => {
                  const hasDotAtEnd = item.trim().endsWith('•');
                  return (
                    <div
                      key={i}
                      className={`font-mono text-sm px-3.5 py-2 rounded-xl ${
                        hasDotAtEnd
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-gray-800/50 text-gray-300'
                      }`}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

DFAGraph.displayName = 'DFAGraph';

export default DFAGraph;
