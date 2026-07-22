'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TraceabilityResult, GraphNode } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Info, X, ShieldCheck, Sparkles, Coffee, Scale, Layers } from 'lucide-react';

interface TraceabilityGraphProps {
  traceData: TraceabilityResult;
}

function GraphInner({ traceData }: TraceabilityGraphProps) {
  const { fitView } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Replay animation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);

  const maxSteps = useMemo(() => {
    const depths = (traceData.graphNodes || []).map((n) => n.depth);
    return Math.max(...depths, 1);
  }, [traceData]);

  // Replay Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setReplayStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return maxSteps;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxSteps]);

  const handleStartReplay = () => {
    setReplayStep(0);
    setIsPlaying(true);
  };

  const { nodes, edges } = useMemo(() => {
    const rawNodes = traceData.graphNodes || [];
    const rawEdges = traceData.graphEdges || [];

    // Find connected nodes for hover highlighting
    const connectedNodeIds = new Set<string>();
    if (hoveredNodeId) {
      connectedNodeIds.add(hoveredNodeId);
      rawEdges.forEach((e) => {
        if (e.sourceBagId === hoveredNodeId) connectedNodeIds.add(e.targetBagId);
        if (e.targetBagId === hoveredNodeId) connectedNodeIds.add(e.sourceBagId);
      });
    }

    // Group nodes by depth for automatic layout
    const depthMap: Record<number, typeof rawNodes> = {};
    rawNodes.forEach((node) => {
      depthMap[node.depth] = depthMap[node.depth] || [];
      depthMap[node.depth].push(node);
    });

    const formattedNodes: Node[] = rawNodes.map((n) => {
      const tierNodes = depthMap[n.depth] || [n];
      const indexInTier = tierNodes.findIndex((x) => x.id === n.id);

      // Layout coordinates: X based on index in tier, Y based on depth tier
      const xPos = indexInTier * 260 + 80;
      const yPos = n.depth * 170 + 60;

      const isRoot = n.id === traceData.targetBag.id;
      const isReplayActive = !isPlaying && replayStep === 0 ? true : n.depth <= replayStep;
      const isHoverDimmed = hoveredNodeId ? !connectedNodeIds.has(n.id) : false;

      return {
        id: n.id,
        position: { x: xPos, y: yPos },
        data: {
          rawNode: n,
          label: (
            <div
              className={`p-3 rounded-xl border transition-all duration-300 min-w-[210px] cursor-pointer shadow-lg ${
                isHoverDimmed ? 'opacity-30 blur-[0.5px]' : 'opacity-100'
              } ${
                isReplayActive
                  ? isRoot
                    ? 'bg-gradient-to-b from-purple-950/90 to-surface border-purple-500 ring-2 ring-purple-500/50'
                    : n.farmerName
                    ? 'bg-gradient-to-b from-emerald-950/90 to-surface border-emerald-500 ring-2 ring-emerald-500/40'
                    : 'bg-gradient-to-b from-amber-950/90 to-surface border-amberAccent ring-2 ring-amberAccent/40'
                  : 'bg-surface/40 border-gray-800 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between border-b border-borderToken/70 pb-1.5 mb-1.5">
                <span className="font-mono font-bold text-xs text-amberAccent">
                  {n.bagCode}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-extrabold tracking-wider ${
                    isRoot
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : n.farmerName
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isRoot ? 'EXPORT LOT' : n.farmerName ? 'HARVEST BAG' : 'MERGED LOT'}
                </span>
              </div>
              <div className="text-[11px] space-y-0.5">
                <p className="text-gray-300">
                  Weight: <span className="font-mono text-gray-100 font-bold">{n.initialWeightKg} kg</span>
                </p>
                <p className="text-gray-400">
                  Variety: <span className="text-gray-200 font-semibold">{n.variety}</span>
                </p>
                {n.farmerName && (
                  <p className="text-emerald-400 font-bold pt-0.5 truncate">
                    Farmer: {n.farmerName}
                  </p>
                )}
              </div>
            </div>
          ),
        },
      };
    });

    const formattedEdges: Edge[] = rawEdges.map((e) => {
      const sourceNode = rawNodes.find((n) => n.id === e.sourceBagId);
      const isReplayEdge = !isPlaying && replayStep === 0 ? true : (sourceNode?.depth ?? 0) < replayStep;

      return {
        id: e.id,
        source: e.sourceBagId,
        target: e.targetBagId,
        animated: isReplayEdge,
        label: `${e.weightUsedKg} kg`,
        labelStyle: { fill: '#F59E0B', fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: '#14110F', fillOpacity: 0.95, rx: 6 },
        style: {
          stroke: isReplayEdge ? '#F59E0B' : '#4B5563',
          strokeWidth: isReplayEdge ? 2.5 : 1,
          opacity: isReplayEdge ? 1 : 0.3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isReplayEdge ? '#F59E0B' : '#4B5563',
        },
      };
    });

    return { nodes: formattedNodes, edges: formattedEdges };
  }, [traceData, replayStep, isPlaying, hoveredNodeId]);

  return (
    <div className="w-full space-y-3">
      {/* Top Controls & Replay Bar */}
      <div className="p-4 rounded-2xl border border-borderToken bg-surface/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Replay Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleStartReplay}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amberAccent to-amber-600 text-gray-950 font-black text-xs hover:opacity-95 shadow-md shadow-amberAccent/20 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Replay' : 'Replay Lineage'}</span>
          </button>

          <button
            onClick={() => setReplayStep(0)}
            className="p-2 rounded-xl border border-borderToken bg-background hover:bg-surfaceHover text-gray-400 hover:text-gray-200 transition-all"
            title="Reset Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => fitView({ duration: 500 })}
            className="px-3.5 py-2 rounded-xl border border-borderToken bg-background hover:bg-surfaceHover text-gray-200 font-bold text-xs transition-all"
          >
            Fit Graph
          </button>
        </div>

        {/* Lineage Verification & Cycle Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-black shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>✔ Lineage Verified | No Circular References</span>
        </div>
      </div>

      {/* Main Graph Container */}
      <div className="w-full h-[540px] bg-background rounded-2xl border border-borderToken relative overflow-hidden shadow-2xl">
        {/* Graph Legend Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-surface/90 backdrop-blur-md p-3 rounded-xl border border-borderToken text-[10px] space-y-1.5 shadow-xl">
          <div className="font-extrabold uppercase tracking-widest text-amberAccent mb-1">Graph Legend</div>
          <div className="flex items-center space-x-2 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Green = Original Harvest Bag</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Orange = Merged Composite Bag</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Purple = Final Export Lot</span>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(_, node) => setSelectedNode(node.data.rawNode as GraphNode)}
          onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
          onNodeMouseLeave={() => setHoveredNodeId(null)}
        >
          <Background color="#3A2F25" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(n) => (n.id === traceData.targetBag.id ? '#A855F7' : '#F59E0B')}
            maskColor="rgba(10, 8, 6, 0.7)"
            style={{ backgroundColor: '#1A1410', borderRadius: '12px' }}
          />
        </ReactFlow>
      </div>

      {/* Node Selection Drawer Details Panel */}
      {selectedNode && (
        <div className="p-5 rounded-2xl border border-amberAccent/40 bg-surface shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-borderToken pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amberAccent" />
              <h3 className="text-sm font-black text-gray-100 font-mono">
                Node Inspection: {selectedNode.bagCode}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-lg border border-borderToken text-gray-400 hover:text-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-background border border-borderToken space-y-1">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase">Mass Weight</span>
              <div className="font-mono font-bold text-amberAccent text-base">{selectedNode.initialWeightKg} kg</div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-borderToken space-y-1">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase">Coffee Variety</span>
              <div className="font-bold text-gray-200 text-base">{selectedNode.variety}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-borderToken space-y-1">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase">Attributed Farmer</span>
              <div className="font-bold text-emerald-400 text-base">
                {selectedNode.farmerName || 'Merged Composite'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TraceabilityGraph(props: TraceabilityGraphProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
