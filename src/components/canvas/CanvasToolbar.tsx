import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Play, Download, Upload, Trash2, LayoutGrid } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import type { ValidationIssue } from '../../types/workflow';

interface Props {
  onRunValidation: () => void;
}

export const CanvasToolbar: React.FC<Props> = ({ onRunValidation }) => {
  const validationIssues = useWorkflowStore(s => s.validationIssues);
  const openSandbox      = useWorkflowStore(s => s.openSandbox);
  const exportWorkflow   = useWorkflowStore(s => s.exportWorkflow);
  const importWorkflow   = useWorkflowStore(s => s.importWorkflow);
  const clearCanvas      = useWorkflowStore(s => s.clearCanvas);

  const [showValidation, setShowValidation] = useState(false);

  const errors   = validationIssues.filter(i => i.severity === 'error');
  const warnings = validationIssues.filter(i => i.severity === 'warning');

  const handleValidate = () => {
    onRunValidation();
    setShowValidation(true);
  };

  const handleExport = () => {
    const data  = exportWorkflow('my-workflow');
    const blob  = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `${data.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        importWorkflow(data);
      } catch {
        alert('Failed to parse workflow JSON.');
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (window.confirm('Clear all nodes and edges?')) clearCanvas();
  };

  const IssueIcon = ({ issue }: { issue: ValidationIssue }) =>
    issue.severity === 'error'
      ? <XCircle size={13} color="#ef4444" className="flex-shrink-0" />
      : <AlertCircle size={13} color="#f59e0b" className="flex-shrink-0" />;

  return (
    <header
      className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0 relative"
      style={{ background: '#161b22', borderBottom: '1px solid #30363d', zIndex: 10 }}
    >
      {/* Left: branding */}
      <span className="text-sm font-semibold text-gray-300 mr-2 hidden lg:block">Workflow Canvas</span>
      <div className="flex-1" />

      {/* Validate */}
      <button onClick={handleValidate} className="toolbar-btn" title="Validate workflow">
        <CheckCircle size={14} />
        <span>Validate</span>
        {validationIssues.length > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: errors.length ? '#ef444420' : '#f59e0b20', color: errors.length ? '#f87171' : '#fbbf24' }}
          >
            {validationIssues.length}
          </span>
        )}
      </button>

      {/* Simulate */}
      <button
        onClick={() => { onRunValidation(); openSandbox(); }}
        className="toolbar-btn-primary"
        title="Run simulation"
      >
        <Play size={14} />
        <span>Test Run</span>
      </button>

      <div className="w-px h-5 mx-1" style={{ background: '#30363d' }} />

      {/* Export */}
      <button onClick={handleExport} className="toolbar-btn" title="Export workflow as JSON">
        <Download size={14} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Import */}
      <button onClick={handleImport} className="toolbar-btn" title="Import workflow from JSON">
        <Upload size={14} />
        <span className="hidden sm:inline">Import</span>
      </button>

      {/* Auto layout placeholder */}
      <button className="toolbar-btn opacity-50 cursor-not-allowed" title="Auto layout (coming soon)">
        <LayoutGrid size={14} />
      </button>

      {/* Clear */}
      <button onClick={handleClear} className="toolbar-btn hover:text-red-400 hover:bg-red-400/10" title="Clear canvas">
        <Trash2 size={14} />
      </button>

      {/* Validation flyout */}
      {showValidation && validationIssues.length > 0 && (
        <div
          className="absolute top-full right-4 mt-2 w-80 rounded-xl shadow-2xl z-50 animate-fade-in"
          style={{ background: '#1c2333', border: '1px solid #30363d' }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #30363d' }}>
            <span className="text-sm font-semibold text-gray-200">Validation Results</span>
            <button onClick={() => setShowValidation(false)} className="text-gray-600 hover:text-gray-300">×</button>
          </div>
          <ul className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {validationIssues.map(i => (
              <li key={i.id} className="flex items-start gap-2 text-xs text-gray-300">
                <IssueIcon issue={i} />
                <span>{i.message}</span>
              </li>
            ))}
          </ul>
          <div className="px-4 pb-3 flex gap-3 text-xs text-gray-500">
            {errors.length > 0 && <span className="text-red-400">{errors.length} error{errors.length > 1 ? 's' : ''}</span>}
            {warnings.length > 0 && <span className="text-amber-400">{warnings.length} warning{warnings.length > 1 ? 's' : ''}</span>}
          </div>
        </div>
      )}
    </header>
  );
};
