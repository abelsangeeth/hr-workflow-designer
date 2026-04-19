import React from 'react';
import { PlayCircle, ClipboardList, ShieldCheck, Zap, CheckCircle2, GripVertical } from 'lucide-react';
import { NODE_COLORS } from '../../utils/graphUtils';

interface NodeTypeEntry {
  kind: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SIDEBAR_NODES: NodeTypeEntry[] = [
  { kind: 'start',     label: 'Start',          description: 'Workflow entry point',      icon: <PlayCircle   size={18} /> },
  { kind: 'task',      label: 'Task',            description: 'Human task or action',      icon: <ClipboardList size={18} /> },
  { kind: 'approval',  label: 'Approval',        description: 'Requires sign-off',         icon: <ShieldCheck  size={18} /> },
  { kind: 'automated', label: 'Automated Step',  description: 'System-triggered action',   icon: <Zap          size={18} /> },
  { kind: 'end',       label: 'End',             description: 'Workflow completion',        icon: <CheckCircle2 size={18} /> },
];

const TEMPLATE_WORKFLOWS = [
  { id: 'onboarding',   label: 'Employee Onboarding' },
  { id: 'leave',        label: 'Leave Approval' },
  { id: 'offboarding',  label: 'Offboarding' },
];

export const NodeSidebar: React.FC = () => {
  const onDragStart = (e: React.DragEvent, kind: string) => {
    e.dataTransfer.setData('application/reactflow-node', kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside
      className="flex flex-col h-full select-none"
      style={{ background: '#12151f', borderRight: '1px solid #21262d', width: 220 }}
    >
      {/* Logo / Brand */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #21262d' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            <Zap size={14} color="white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">SmartRoute</p>
            <p className="text-xs font-medium" style={{ color: '#7c3aed' }}>HR Designer</p>
          </div>
        </div>
      </div>

      {/* Node palette */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Node Types
          </p>
          <div className="space-y-1.5">
            {SIDEBAR_NODES.map(entry => {
              const color = NODE_COLORS[entry.kind];
              return (
                <div
                  key={entry.kind}
                  draggable
                  onDragStart={e => onDragStart(e, entry.kind)}
                  className="sidebar-node-type flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ border: `1px solid ${color}30`, background: `${color}10` }}
                  title={`Drag to add ${entry.label} node`}
                >
                  <GripVertical size={12} className="text-gray-700 flex-shrink-0" />
                  <span style={{ color }}>{entry.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-200 leading-none">{entry.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">{entry.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow templates */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Templates
          </p>
          <div className="space-y-1">
            {TEMPLATE_WORKFLOWS.map(t => (
              <button
                key={t.id}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors flex items-center gap-2"
                title="Templates coming soon"
                disabled
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-700 flex-shrink-0" />
                {t.label}
                <span className="ml-auto text-gray-700 text-xs">soon</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Help footer */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid #21262d' }}>
        <p className="text-xs text-gray-700">
          Drag nodes onto the canvas.<br />
          Click to edit • Delete key to remove.
        </p>
      </div>
    </aside>
  );
};
