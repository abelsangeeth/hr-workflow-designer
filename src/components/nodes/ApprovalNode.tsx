import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ShieldCheck, AlertCircle, Users } from 'lucide-react';
import type { ApprovalNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

export const ApprovalNode: React.FC<NodeProps<ApprovalNodeData>> = ({ id, data, selected }) => {
  const allIssues = useWorkflowStore(s => s.validationIssues);
  const issues    = allIssues.filter(i => i.nodeId === id);
  const hasError  = issues.some(i => i.severity === 'error');
  const hasWarn   = issues.some(i => i.severity === 'warning');

  return (
    <div
      className={`node-card ${hasError ? 'has-error' : hasWarn ? 'has-warning' : ''}`}
      style={{
        borderLeft: '4px solid #f59e0b',
        minWidth: 200,
        boxShadow: selected ? '0 0 0 2px #f59e0b, 0 8px 32px rgba(0,0,0,0.6)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(245,158,11,0.12)' }}>
        <ShieldCheck size={15} color="#f59e0b" />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
          Approval
        </span>
        {(hasError || hasWarn) && (
          <AlertCircle size={13} color={hasError ? '#ef4444' : '#f59e0b'} className="ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-sm font-semibold text-gray-200 truncate">{data.title || 'Approval Step'}</p>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-gray-500" />
          <span className="text-xs text-gray-400">{data.approverRole || 'Not set'}</span>
        </div>
        {data.autoApproveThreshold > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-canvas-border overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(data.autoApproveThreshold, 100)}%`, background: '#f59e0b' }}
              />
            </div>
            <span className="text-xs text-gray-500">{data.autoApproveThreshold}%</span>
          </div>
        )}
      </div>

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
