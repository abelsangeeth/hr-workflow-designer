import type { WorkflowNode, WorkflowEdge, ValidationIssue } from '../types/workflow';

let issueCounter = 0;
const makeIssue = (
  partial: Omit<ValidationIssue, 'id'>
): ValidationIssue => ({ id: `vi-${issueCounter++}`, ...partial });

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationIssue[] {
  issueCounter = 0;
  const issues: ValidationIssue[] = [];

  const startNodes  = nodes.filter(n => n.type === 'start');
  const endNodes    = nodes.filter(n => n.type === 'end');

  // ── Global structural rules ────────────────────────────────────
  if (startNodes.length === 0)
    issues.push(makeIssue({ severity: 'error', message: 'Workflow must have at least one Start node.' }));
  if (startNodes.length > 1)
    issues.push(makeIssue({ severity: 'error', message: 'Workflow must have exactly one Start node.' }));
  if (endNodes.length === 0)
    issues.push(makeIssue({ severity: 'error', message: 'Workflow must have at least one End node.' }));

  // ── Disconnected nodes ─────────────────────────────────────────
  const connectedIds = new Set<string>();
  edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target); });
  nodes.forEach(n => {
    if (!connectedIds.has(n.id) && nodes.length > 1) {
      issues.push(makeIssue({ nodeId: n.id, severity: 'warning', message: `Node "${(n.data as any).title || n.type}" is disconnected.` }));
    }
  });

  // ── Outgoing edges from End node ───────────────────────────────
  endNodes.forEach(n => {
    const outgoing = edges.filter(e => e.source === n.id);
    if (outgoing.length > 0)
      issues.push(makeIssue({ nodeId: n.id, severity: 'error', message: 'End node must not have outgoing connections.' }));
  });

  // ── Start node must have outgoing edges ───────────────────────
  startNodes.forEach(n => {
    const outgoing = edges.filter(e => e.source === n.id);
    if (outgoing.length === 0)
      issues.push(makeIssue({ nodeId: n.id, severity: 'warning', message: 'Start node has no outgoing connections.' }));
  });

  // ── Per-node data validation ────────────────────────────────────
  nodes.forEach(n => {
    const d = n.data as any;
    switch (n.type) {
      case 'task':
        if (!d.title?.trim())
          issues.push(makeIssue({ nodeId: n.id, severity: 'error', message: 'Task node requires a title.' }));
        break;
      case 'approval':
        if (!d.approverRole?.trim())
          issues.push(makeIssue({ nodeId: n.id, severity: 'warning', message: 'Approval node: approver role is not set.' }));
        break;
      case 'automated':
        if (!d.actionId)
          issues.push(makeIssue({ nodeId: n.id, severity: 'error', message: 'Automated node must have an action selected.' }));
        break;
    }
  });

  // ── Cycle detection (DFS) ──────────────────────────────────────
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => adj.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const stack   = new Set<string>();
  let cycleFound = false;

  const dfs = (id: string) => {
    if (stack.has(id)) { cycleFound = true; return; }
    if (visited.has(id)) return;
    visited.add(id);
    stack.add(id);
    adj.get(id)?.forEach(dfs);
    stack.delete(id);
  };
  nodes.forEach(n => { if (!visited.has(n.id)) dfs(n.id); });
  if (cycleFound)
    issues.push(makeIssue({ severity: 'error', message: 'Cycle detected in workflow. Please remove circular connections.' }));

  return issues;
}
