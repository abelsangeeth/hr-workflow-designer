import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { PlayCircle, AlertCircle } from 'lucide-react';
import type { StartNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

export const StartNode: React.FC<NodeProps<StartNodeData>> = ({ id, data, selected }) => {
  const allIssues = useWorkflowStore(s => s.validationIssues);
  const issues    = allIssues.filter(i => i.nodeId === id);
  const hasError  = issues.some(i => i.severity === 'error');
  const hasWarn   = issues.some(i => i.severity === 'warning');

  return (
    <div
      className={`node-card ${hasError ? 'has-error' : hasWarn ? 'has-warning' : ''}`}
      style={{
        borderLeft: '4px solid #10b981',
        minWidth: 180,
        boxShadow: selected ? '0 0 0 2px #10b981, 0 8px 32px rgba(0,0,0,0.6)' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(16,185,129,0.12)' }}>
        <PlayCircle size={15} color="#10b981" />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#10b981' }}>
          Start
        </span>
        {(hasError || hasWarn) && (
          <AlertCircle size={13} color={hasError ? '#ef4444' : '#f59e0b'} className="ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-200 truncate">{data.title || 'Start'}</p>
        {data.metadata.length > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">{data.metadata.length} metadata field{data.metadata.length > 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Issues tooltip */}
      {issues.length > 0 && (
        <div className="px-3 pb-2 space-y-0.5">
          {issues.map(i => (
            <p key={i.id} className="text-xs" style={{ color: i.severity === 'error' ? '#f87171' : '#fbbf24' }}>
              {i.message}
            </p>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
};
