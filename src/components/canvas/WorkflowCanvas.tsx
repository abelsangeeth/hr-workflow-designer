import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
} from 'reactflow';
import type { NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from '../nodes';
import { useWorkflowStore } from '../../store/workflowStore';
import { makeNodeId, getDefaultNodeData, NODE_COLORS } from '../../utils/graphUtils';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;

export const WorkflowCanvas: React.FC = () => {
  const nodes         = useWorkflowStore(s => s.nodes);
  const edges         = useWorkflowStore(s => s.edges);
  const onNodesChange = useWorkflowStore(s => s.onNodesChange);
  const onEdgesChange = useWorkflowStore(s => s.onEdgesChange);
  const onConnect     = useWorkflowStore(s => s.onConnect);
  const selectNode    = useWorkflowStore(s => s.selectNode);
  const addNode       = useWorkflowStore(s => s.addNode);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // ── Click on empty canvas deselects ─────────────────────────────
  const onPaneClick = useCallback(() => selectNode(null), [selectNode]);

  // ── Select node on click ─────────────────────────────────────────
  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => selectNode(node.id),
    [selectNode]
  );

  // ── Drag-over: allow drop ────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Drop: create new node at pointer position ─────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/reactflow-node');
      if (!kind) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id       = makeNodeId(kind);

      addNode({
        id,
        type: kind,
        position,
        data: getDefaultNodeData(kind),
      } as any);

      selectNode(id);
    },
    [screenToFlowPosition, addNode, selectNode]
  );

  // ── Delete selected with keyboard ─────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') selectNode(null);
    },
    [selectNode]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 relative drop-zone-active"
      onKeyDown={onKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        deleteKeyCode="Delete"
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#21262d"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => NODE_COLORS[n.type ?? 'task'] ?? '#484f58'}
          maskColor="rgba(13,17,23,0.85)"
          style={{ borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
};
