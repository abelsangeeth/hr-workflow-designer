import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ClipboardList, AlertCircle, User, Calendar } from 'lucide-react';
import type { TaskNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

export const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ id, data, selected }) => {
  const allIssues = useWorkflowStore(s => s.validationIssues);
  const issues    = allIssues.filter(i => i.nodeId === id);
  const hasError  = issues.some(i => i.severity === 'error');
  const hasWarn   = issues.some(i => i.severity === 'warning');

  return (
    <div
      className={`node-card ${hasError ? 'has-error' : hasWarn ? 'has-warning' : ''}`}
      style={{
        borderLeft: '4px solid #3b82f6',
        minWidth: 210,
        boxShadow: selected ? '0 0 0 2px #3b82f6, 0 8px 32px rgba(0,0,0,0.6)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(59,130,246,0.12)' }}>
        <ClipboardList size={15} color="#3b82f6" />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3b82f6' }}>
          Task
        </span>
        {(hasError || hasWarn) && (
          <AlertCircle size={13} color={hasError ? '#ef4444' : '#f59e0b'} className="ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-sm font-semibold text-gray-200 truncate">{data.title || 'Untitled Task'}</p>
        {data.description && (
          <p className="text-xs text-gray-400 line-clamp-2">{data.description}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {data.assignee && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <User size={10} /> {data.assignee}
            </span>
          )}
          {data.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={10} /> {data.dueDate}
            </span>
          )}
        </div>
        {data.customFields.length > 0 && (
          <p className="text-xs text-gray-600">{data.customFields.length} custom field{data.customFields.length > 1 ? 's' : ''}</p>
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
