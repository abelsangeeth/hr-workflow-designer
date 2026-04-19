import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Zap, AlertCircle } from 'lucide-react';
import type { AutomatedNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

const ACTION_LABELS: Record<string, string> = {
  send_email:   'Send Email',
  generate_doc: 'Generate Document',
  slack_notify: 'Slack Notification',
  create_jira:  'Create Jira Ticket',
  upload_s3:    'Upload to S3',
  webhook:      'Call Webhook',
};

export const AutomatedNode: React.FC<NodeProps<AutomatedNodeData>> = ({ id, data, selected }) => {
  const allIssues = useWorkflowStore(s => s.validationIssues);
  const issues    = allIssues.filter(i => i.nodeId === id);
  const hasError  = issues.some(i => i.severity === 'error');
  const hasWarn   = issues.some(i => i.severity === 'warning');
  const paramCount = Object.values(data.actionParams).filter(Boolean).length;

  return (
    <div
      className={`node-card ${hasError ? 'has-error' : hasWarn ? 'has-warning' : ''}`}
      style={{
        borderLeft: '4px solid #8b5cf6',
        minWidth: 210,
        boxShadow: selected ? '0 0 0 2px #8b5cf6, 0 8px 32px rgba(0,0,0,0.6)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} id="in" />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(139,92,246,0.12)' }}>
        <Zap size={15} color="#8b5cf6" />
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>
          Automated
        </span>
        {(hasError || hasWarn) && (
          <AlertCircle size={13} color={hasError ? '#ef4444' : '#f59e0b'} className="ml-auto" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <p className="text-sm font-semibold text-gray-200 truncate">{data.title || 'Automated Step'}</p>
        {data.actionId ? (
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}
          >
            {ACTION_LABELS[data.actionId] ?? data.actionId}
          </span>
        ) : (
          <span className="text-xs text-gray-600 italic">No action selected</span>
        )}
        {paramCount > 0 && (
          <p className="text-xs text-gray-500">{paramCount} param{paramCount > 1 ? 's' : ''} configured</p>
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
