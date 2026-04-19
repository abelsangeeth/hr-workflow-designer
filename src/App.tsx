import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { NodeSidebar }    from './components/canvas/NodeSidebar';
import { CanvasToolbar }  from './components/canvas/CanvasToolbar';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { NodeFormPanel }  from './components/forms/NodeFormPanel';
import { SandboxPanel }   from './components/sandbox/SandboxPanel';
import { useWorkflowStore } from './store/workflowStore';

const AppInner: React.FC = () => {
  const isSandboxOpen  = useWorkflowStore(s => s.isSandboxOpen);
  const selectedNodeId = useWorkflowStore(s => s.selectedNodeId);
  const runValidation  = useWorkflowStore(s => s.runValidation);

  const showForm = !!selectedNodeId;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <CanvasToolbar onRunValidation={runValidation} />

      {/* ── Main layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <NodeSidebar />

        {/* Canvas area */}
        <WorkflowCanvas />

        {/* Right: Node form panel (slides in when node selected) */}
        {showForm && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{ width: 300 }}
          >
            <NodeFormPanel />
          </div>
        )}
      </div>

      {/* Sandbox overlay */}
      {isSandboxOpen && <SandboxPanel />}
    </div>
  );
};

const App: React.FC = () => (
  <ReactFlowProvider>
    <AppInner />
  </ReactFlowProvider>
);

export default App;
