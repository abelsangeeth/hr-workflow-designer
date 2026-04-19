import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { AutomatedNodeData, AutomationAction } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';
import { getAutomations } from '../../api/mockApi';

interface Props { nodeId: string; data: AutomatedNodeData; }

export const AutomatedNodeForm: React.FC<Props> = ({ nodeId, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  const set = useCallback(
    (patch: Partial<AutomatedNodeData>) => update(nodeId, patch as any),
    [nodeId, update]
  );

  const [actions, setActions]   = useState<AutomationAction[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAutomations().then(a => { if (!cancelled) { setActions(a); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const selectedAction = actions.find(a => a.id === data.actionId);

  const handleActionChange = (id: string) => {
    const action = actions.find(a => a.id === id);
    // Reset params when action changes
    const freshParams: Record<string, string> = {};
    action?.params.forEach(p => { freshParams[p] = data.actionParams[p] ?? ''; });
    set({ actionId: id, actionParams: freshParams });
  };

  const setParam = (key: string, val: string) =>
    set({ actionParams: { ...data.actionParams, [key]: val } });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="form-section">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          placeholder="e.g. Send Welcome Email"
          value={data.title}
          onChange={e => set({ title: e.target.value })}
        />
      </div>

      {/* Action selector */}
      <div className="form-section">
        <label className="form-label">
          Action <span className="text-red-400">*</span>
          <span className="text-gray-600 ml-1 font-normal normal-case">(from /automations API)</span>
        </label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" /> Loading automations…
          </div>
        ) : (
          <select
            className="form-input"
            value={data.actionId}
            onChange={e => handleActionChange(e.target.value)}
            style={{ backgroundColor: '#0d1117', color: '#e6edf3' }}
          >
            <option value="">Select action…</option>
            {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        )}
      </div>

      {/* Dynamic params */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="form-section">
          <label className="form-label">Action Parameters</label>
          <div className="space-y-2 p-3 rounded-lg" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
            {selectedAction.params.map(param => (
              <div key={param}>
                <label className="block text-xs text-purple-300/70 mb-1 font-mono">{param}</label>
                <input
                  className="form-input"
                  placeholder={`Enter ${param}…`}
                  value={data.actionParams[param] ?? ''}
                  onChange={e => setParam(param, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.actionId && !loading && (
        <p className="text-xs text-red-400">An action must be selected.</p>
      )}
    </div>
  );
};
