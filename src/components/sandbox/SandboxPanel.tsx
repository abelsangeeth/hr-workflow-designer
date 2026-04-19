import React, { useState, useCallback } from 'react';
import {
  X, Play, CheckCircle2, XCircle, Clock, Loader2,
  ChevronRight, AlertTriangle, BarChart2, Zap,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { simulateWorkflow } from '../../api/mockApi';
import type { SimStep, SimulationResult } from '../../types/workflow';
import { NODE_COLORS } from '../../utils/graphUtils';

const STATUS_ICON: Record<SimStep['status'], React.ReactNode> = {
  pending:  <Clock      size={14} className="text-gray-500" />,
  running:  <Loader2   size={14} className="animate-spin text-blue-400" />,
  success:  <CheckCircle2 size={14} color="#10b981" />,
  failed:   <XCircle   size={14} color="#ef4444" />,
  skipped:  <ChevronRight size={14} className="text-gray-600" />,
};

const STATUS_BG: Record<SimStep['status'], string> = {
  pending:  '#21262d',
  running:  'rgba(59,130,246,0.1)',
  success:  'rgba(16,185,129,0.08)',
  failed:   'rgba(239,68,68,0.08)',
  skipped:  '#161b22',
};

export const SandboxPanel: React.FC = () => {
  const nodes            = useWorkflowStore(s => s.nodes);
  const edges            = useWorkflowStore(s => s.edges);
  const closeSandbox     = useWorkflowStore(s => s.closeSandbox);
  const validationIssues = useWorkflowStore(s => s.validationIssues);
  const runValidation    = useWorkflowStore(s => s.runValidation);

  const [result, setResult]   = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [steps, setSteps]     = useState<SimStep[]>([]);

  const handleRun = useCallback(async () => {
    // Re-validate before running
    const issues = runValidation();
    const blockers = issues.filter(i => i.severity === 'error');
    if (blockers.length > 0) {
      setResult({
        success: false,
        steps: [],
        summary: 'Cannot simulate: workflow has errors.',
        errors: blockers.map(i => i.message),
        completedAt: new Date().toISOString(),
      });
      return;
    }

    setRunning(true);
    setResult(null);
    setSteps([]);

    // Animate steps appearing one-by-one for UX
    const sim = await simulateWorkflow(nodes, edges);
    for (let i = 0; i < sim.steps.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      setSteps(prev => [...prev, sim.steps[i]]);
    }

    setResult(sim);
    setRunning(false);
  }, [nodes, edges, runValidation]);

  const handleReset = () => { setResult(null); setSteps([]); };

  const errors   = validationIssues.filter(i => i.severity === 'error');
  const warnings = validationIssues.filter(i => i.severity === 'warning');

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeSandbox(); }}
    >
      <div
        className="w-full max-w-3xl animate-slide-in-up rounded-t-2xl overflow-hidden"
        style={{ background: '#161b22', border: '1px solid #30363d', borderBottom: 'none', maxHeight: '75vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #30363d' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <Zap size={14} color="white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Workflow Sandbox</p>
              <p className="text-xs text-gray-500">Simulate &amp; validate your workflow</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 ml-6">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{nodes.length}</p>
              <p className="text-xs text-gray-600">Nodes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{edges.length}</p>
              <p className="text-xs text-gray-600">Edges</p>
            </div>
            {errors.length > 0 && (
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{errors.length}</p>
                <p className="text-xs text-gray-600">Errors</p>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: running ? '#21262d' : 'linear-gradient(135deg,#7c3aed,#a855f7)',
              color: running ? '#484f58' : 'white',
              cursor: running ? 'not-allowed' : 'pointer',
            }}
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Running…' : 'Run Simulation'}
          </button>

          {result && (
            <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2">
              Reset
            </button>
          )}

          <button onClick={closeSandbox} className="p-2 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Validation issues banner ───────────────────────────── */}
        {(errors.length > 0 || warnings.length > 0) && !running && !result && (
          <div
            className="flex items-start gap-3 px-6 py-3 flex-shrink-0"
            style={{ background: errors.length ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)', borderBottom: '1px solid #30363d' }}
          >
            <AlertTriangle size={15} color={errors.length ? '#f87171' : '#fbbf24'} className="mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              {errors.map(e => <p key={e.id} className="text-red-400">{e.message}</p>)}
              {warnings.map(w => <p key={w.id} className="text-amber-400">{w.message}</p>)}
            </div>
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Empty state */}
          {!running && !result && steps.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click <strong className="text-gray-400">Run Simulation</strong> to execute your workflow step by step.</p>
              <p className="text-xs mt-1">The workflow will be serialized, validated, and executed in topological order.</p>
            </div>
          )}

          {/* Step-by-step log */}
          {steps.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                Execution Log
              </p>
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="sim-step flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    background: STATUS_BG[step.status],
                    border: `1px solid ${step.status === 'success' ? '#10b98130' : step.status === 'failed' ? '#ef444430' : '#30363d'}`,
                  }}
                >
                  {/* Step number */}
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: NODE_COLORS[step.kind] + '25', color: NODE_COLORS[step.kind] }}
                  >
                    {idx + 1}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-200">{step.title}</p>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: NODE_COLORS[step.kind] + '20', color: NODE_COLORS[step.kind] }}
                      >
                        {step.kind}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{step.message}</p>
                    {step.duration && (
                      <p className="text-xs text-gray-700 mt-1 font-mono">{step.duration}ms</p>
                    )}
                  </div>

                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {STATUS_ICON[step.status]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Result summary */}
          {result && !running && (
            <div
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? '#10b98140' : '#ef444440'}`,
              }}
            >
              {result.success
                ? <CheckCircle2 size={20} color="#10b981" className="flex-shrink-0 mt-0.5" />
                : <XCircle      size={20} color="#ef4444" className="flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-semibold" style={{ color: result.success ? '#10b981' : '#f87171' }}>
                  {result.success ? 'Simulation Passed' : 'Simulation Failed'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{result.summary}</p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-400">• {e}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-gray-700 mt-2 font-mono">
                  Completed: {new Date(result.completedAt).toLocaleTimeString()}
                  {' · '}{result.steps.length} step{result.steps.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
