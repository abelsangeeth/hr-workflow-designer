import React from 'react';
import { X, Trash2, PlayCircle, ClipboardList, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { StartNodeForm }    from './StartNodeForm';
import { TaskNodeForm }     from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedNodeForm } from './AutomatedNodeForm';
import { EndNodeForm }      from './EndNodeForm';
import { NODE_COLORS } from '../../utils/graphUtils';

const NODE_ICONS: Record<string, React.ReactNode> = {
  start:     <PlayCircle  size={16} />,
  task:      <ClipboardList size={16} />,
  approval:  <ShieldCheck size={16} />,
  automated: <Zap         size={16} />,
  end:       <CheckCircle2 size={16} />,
};

const NODE_TITLES: Record<string, string> = {
  start:     'Start Node',
  task:      'Task Node',
  approval:  'Approval Node',
  automated: 'Automated Step',
  end:       'End Node',
};

export const NodeFormPanel: React.FC = () => {
  const getSelectedNode = useWorkflowStore(s => s.getSelectedNode);
  const selectNode      = useWorkflowStore(s => s.selectNode);
  const deleteNode      = useWorkflowStore(s => s.deleteNode);

  const node = getSelectedNode();
  if (!node) return null;

  const kind    = node.type as string;
  const color   = NODE_COLORS[kind] ?? '#7c3aed';
  const data    = node.data as any;

  const renderForm = () => {
    switch (kind) {
      case 'start':     return <StartNodeForm    nodeId={node.id} data={data} />;
      case 'task':      return <TaskNodeForm      nodeId={node.id} data={data} />;
      case 'approval':  return <ApprovalNodeForm  nodeId={node.id} data={data} />;
      case 'automated': return <AutomatedNodeForm nodeId={node.id} data={data} />;
      case 'end':       return <EndNodeForm       nodeId={node.id} data={data} />;
      default: return <p className="text-sm text-gray-500">Unknown node type.</p>;
    }
  };

  return (
    <div
      className="flex flex-col h-full animate-slide-in-right"
      style={{ background: '#161b22', borderLeft: '1px solid #30363d' }}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #30363d', background: `${color}18` }}
      >
        <span style={{ color }}>{NODE_ICONS[kind]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
            {NODE_TITLES[kind] ?? kind}
          </p>
          <p className="text-xs text-gray-500 truncate font-mono">{node.id}</p>
        </div>
        {/* Delete */}
        <button
          onClick={() => deleteNode(node.id)}
          title="Delete node"
          className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
        {/* Close */}
        <button
          onClick={() => selectNode(null)}
          className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderForm()}
      </div>

      {/* Node ID footer */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: '1px solid #21262d' }}>
        <p className="text-xs text-gray-700 font-mono">id: {node.id}</p>
      </div>
    </div>
  );
};
