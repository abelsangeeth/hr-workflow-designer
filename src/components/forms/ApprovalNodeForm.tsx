import React, { useCallback } from 'react';
import type { ApprovalNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

const ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'CEO', 'Legal', 'Finance'];

interface Props { nodeId: string; data: ApprovalNodeData; }

export const ApprovalNodeForm: React.FC<Props> = ({ nodeId, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  const set = useCallback(
    (patch: Partial<ApprovalNodeData>) => update(nodeId, patch as any),
    [nodeId, update]
  );

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="form-section">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="e.g. Manager Approval"
          value={data.title}
          onChange={e => set({ title: e.target.value })}
        />
      </div>

      {/* Approver Role */}
      <div className="form-section">
        <label className="form-label">Approver Role</label>
        <select
          className="form-input"
          value={data.approverRole}
          onChange={e => set({ approverRole: e.target.value })}
          style={{ backgroundColor: '#0d1117', color: '#e6edf3' }}
        >
          <option value="">Select role...</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          <option value="custom">Custom...</option>
        </select>
        {data.approverRole === 'custom' && (
          <input
            className="form-input mt-2"
            placeholder="Enter custom role"
            onChange={e => set({ approverRole: e.target.value })}
          />
        )}
      </div>

      {/* Auto Approve Threshold */}
      <div className="form-section">
        <label className="form-label">
          Auto-Approve Threshold
          <span className="text-gray-600 ml-1 normal-case font-normal">(0 = manual, 1–100 = %)</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={data.autoApproveThreshold}
            onChange={e => set({ autoApproveThreshold: Number(e.target.value) })}
            className="flex-1 accent-amber-400"
          />
          <span className="text-sm font-mono text-amber-400 w-10 text-right">
            {data.autoApproveThreshold === 0 ? 'Off' : `${data.autoApproveThreshold}%`}
          </span>
        </div>
        {data.autoApproveThreshold > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Requests below {data.autoApproveThreshold}% threshold will be auto-approved.
          </p>
        )}
      </div>
    </div>
  );
};
