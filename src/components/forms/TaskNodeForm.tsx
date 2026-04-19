import React, { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TaskNodeData, KeyValue } from '../../types/workflow';
import { useWorkflowStore } from '../../store/workflowStore';

interface Props { nodeId: string; data: TaskNodeData; }

export const TaskNodeForm: React.FC<Props> = ({ nodeId, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  const set = useCallback(
    (patch: Partial<TaskNodeData>) => update(nodeId, patch as any),
    [nodeId, update]
  );

  const addField = () =>
    set({ customFields: [...data.customFields, { id: Date.now().toString(), key: '', value: '' }] });

  const removeField = (id: string) =>
    set({ customFields: data.customFields.filter(f => f.id !== id) });

  const updateField = (id: string, field: keyof KeyValue, val: string) =>
    set({ customFields: data.customFields.map(f => f.id === id ? { ...f, [field]: val } : f) });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="form-section">
        <label className="form-label">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          className={`form-input ${!data.title.trim() ? 'border-red-500/60 focus:ring-red-500' : ''}`}
          placeholder="e.g. Collect Documents"
          value={data.title}
          onChange={e => set({ title: e.target.value })}
        />
        {!data.title.trim() && (
          <p className="text-xs text-red-400 mt-1">Title is required.</p>
        )}
      </div>

      {/* Description */}
      <div className="form-section">
        <label className="form-label">Description</label>
        <textarea
          className="form-input resize-none"
          rows={3}
          placeholder="Describe this task..."
          value={data.description}
          onChange={e => set({ description: e.target.value })}
        />
      </div>

      {/* Assignee */}
      <div className="form-section">
        <label className="form-label">Assignee</label>
        <input
          className="form-input"
          placeholder="e.g. HR Team, John Doe"
          value={data.assignee}
          onChange={e => set({ assignee: e.target.value })}
        />
      </div>

      {/* Due Date */}
      <div className="form-section">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          className="form-input"
          value={data.dueDate}
          onChange={e => set({ dueDate: e.target.value })}
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* Custom Fields */}
      <div className="form-section">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Custom Fields</label>
          <button
            onClick={addField}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {data.customFields.length === 0 && (
          <p className="text-xs text-gray-600 italic">No custom fields added.</p>
        )}
        <div className="space-y-2">
          {data.customFields.map(f => (
            <div key={f.id} className="flex gap-2 items-center">
              <input className="form-input flex-1" placeholder="key" value={f.key} onChange={e => updateField(f.id, 'key', e.target.value)} />
              <input className="form-input flex-1" placeholder="value" value={f.value} onChange={e => updateField(f.id, 'value', e.target.value)} />
              <button onClick={() => removeField(f.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
