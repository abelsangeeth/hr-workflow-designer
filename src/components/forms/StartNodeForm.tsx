import React, { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { StartNodeData, KeyValue } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface Props { nodeId: string; data: StartNodeData; }

export const StartNodeForm: React.FC<Props> = ({ nodeId, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);

  const set = useCallback(
    (patch: Partial<StartNodeData>) => update(nodeId, patch as any),
    [nodeId, update]
  );

  const addMeta = () =>
    set({ metadata: [...data.metadata, { id: Date.now().toString(), key: '', value: '' }] });

  const removeMeta = (id: string) =>
    set({ metadata: data.metadata.filter(m => m.id !== id) });

  const updateMeta = (id: string, field: keyof KeyValue, val: string) =>
    set({ metadata: data.metadata.map(m => m.id === id ? { ...m, [field]: val } : m) });

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="form-section">
        <label className="form-label">Start Title</label>
        <input
          className="form-input"
          placeholder="e.g. Begin Onboarding"
          value={data.title}
          onChange={e => set({ title: e.target.value })}
        />
      </div>

      {/* Metadata */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Metadata</label>
          <button
            onClick={addMeta}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {data.metadata.length === 0 && (
          <p className="text-xs text-gray-600 italic">No metadata added.</p>
        )}
        <div className="space-y-2">
          {data.metadata.map(m => (
            <div key={m.id} className="flex gap-2 items-center">
              <input
                className="form-input flex-1"
                placeholder="key"
                value={m.key}
                onChange={e => updateMeta(m.id, 'key', e.target.value)}
              />
              <input
                className="form-input flex-1"
                placeholder="value"
                value={m.value}
                onChange={e => updateMeta(m.id, 'value', e.target.value)}
              />
              <button onClick={() => removeMeta(m.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
