import type { WorkflowNode } from '../types/workflow';

/**
 * Returns a position that snaps to grid (24px)
 */
export function snapToGrid(x: number, y: number, gridSize = 24): [number, number] {
  return [
    Math.round(x / gridSize) * gridSize,
    Math.round(y / gridSize) * gridSize,
  ];
}

/**
 * Generates an id prefix based on the node kind
 */
export function makeNodeId(kind: string): string {
  return `${kind}-${Date.now().toString(36)}`;
}

/**
 * Returns the display label for each node kind
 */
export const NODE_LABELS: Record<string, string> = {
  start:     'Start',
  task:      'Task',
  approval:  'Approval',
  automated: 'Automated Step',
  end:       'End',
};

/**
 * Returns the accent color for each node kind
 */
export const NODE_COLORS: Record<string, string> = {
  start:     '#10b981',
  task:      '#3b82f6',
  approval:  '#f59e0b',
  automated: '#8b5cf6',
  end:       '#ef4444',
};

/**
 * Returns the background color for node header
 */
export const NODE_BG: Record<string, string> = {
  start:     'rgba(16,185,129,0.12)',
  task:      'rgba(59,130,246,0.12)',
  approval:  'rgba(245,158,11,0.12)',
  automated: 'rgba(139,92,246,0.12)',
  end:       'rgba(239,68,68,0.12)',
};

/**
 * Returns the default data payload for each node kind
 */
export function getDefaultNodeData(kind: string): WorkflowNode['data'] {
  switch (kind) {
    case 'start':
      return { kind: 'start', title: 'Start', metadata: [] };
    case 'task':
      return { kind: 'task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] };
    case 'approval':
      return { kind: 'approval', title: 'Approval', approverRole: 'Manager', autoApproveThreshold: 0 };
    case 'automated':
      return { kind: 'automated', title: 'Automated Step', actionId: '', actionParams: {} };
    case 'end':
      return { kind: 'end', message: 'Workflow complete', showSummary: false };
    default:
      return { kind: 'task', title: 'Node', description: '', assignee: '', dueDate: '', customFields: [] };
  }
}
