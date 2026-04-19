import React, { useCallback } from 'react';
import type { EndNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface Props { nodeId: string; data: EndNodeData; }

export const EndNodeForm: React.FC<Props> = ({ nodeId, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  const set = useCallback(
    (patch: Partial<EndNodeData>) => update(nodeId, patch as any),
    [nodeId, update]
  );

  return (
    <div className="space-y-4">
      {/* End Message */}
      <div className="form-section">
        <label className="form-label">End Message</label>
        <input
          className="form-input"
          placeholder="e.g. Onboarding complete!"
          value={data.message}
          onChange={e => set({ message: e.target.value })}
        />
      </div>

      {/* Show Summary toggle */}
      <div className="form-section">
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#161b22', border: '1px solid #30363d' }}>
          <div>
            <p className="text-sm font-medium text-gray-200">Generate Summary</p>
            <p className="text-xs text-gray-500 mt-0.5">Automatically generate a workflow summary report at completion.</p>
          </div>
          <label className="toggle-switch ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={data.showSummary}
              onChange={e => set({ showSummary: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </div>
  );
};
