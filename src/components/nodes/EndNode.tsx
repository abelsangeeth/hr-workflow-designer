import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { CheckCircle2, FileText } from 'lucide-react';
import type { EndNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

export const EndNode: React.FC<NodeProps<EndNodeData>> = ({ id, data, selected }) => {
  const allIssues = useWorkflowStore(s => s.validationIssues);
  const issues    = allIssues.filter(i => i.nodeId === id);
  const hasError  = issues.some(i => i.severity === 'error');

  return (
    <div
      className={`node-card ${hasError ? 'has-error' : ''}`}
      style={{
        borderLeft: '4px solid #ef4444',
        minWidth: 180,
        boxShadow: selected ? '0 0 0 2px #ef4444, 0 8px 32px rgba(0,0,0,0.6)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(239,68,68,0.12)' }}>
        <CheckCircle2 size={15} color="#ef4444" />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#ef4444' }}>
          End
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-sm font-medium text-gray-200 truncate">{data.message || 'Workflow complete'}</p>
        {data.showSummary && (
          <span className="flex items-center gap-1 text-xs" style={{ color: '#6ee7b7' }}>
            <FileText size={10} /> Summary enabled
          </span>
        )}
      </div>

      {issues.length > 0 && (
        <div className="px-3 pb-2 space-y-0.5">
          {issues.map(i => (
            <p key={i.id} className="text-xs text-red-400">{i.message}</p>
          ))}
        </div>
      )}
    </div>
  );
};
