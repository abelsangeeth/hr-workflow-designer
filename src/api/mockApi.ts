import type { AutomationAction, SimStep, SimulationResult, WorkflowNode, WorkflowEdge } from '../types/workflow';

// ─── Simulated network latency ───────────────────────────────────
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─── GET /automations ─────────────────────────────────────────────
const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    params: ['to', 'subject', 'body'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    params: ['template', 'recipient', 'outputFormat'],
  },
  {
    id: 'slack_notify',
    label: 'Slack Notification',
    params: ['channel', 'message'],
  },
  {
    id: 'create_jira',
    label: 'Create Jira Ticket',
    params: ['project', 'summary', 'priority'],
  },
  {
    id: 'upload_s3',
    label: 'Upload to S3',
    params: ['bucket', 'key', 'contentType'],
  },
  {
    id: 'webhook',
    label: 'Call Webhook',
    params: ['url', 'method', 'payload'],
  },
];

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return [...MOCK_AUTOMATIONS];
}

export function getAutomationById(id: string): AutomationAction | undefined {
  return MOCK_AUTOMATIONS.find(a => a.id === id);
}

// ─── POST /simulate ───────────────────────────────────────────────
// Builds topological order and simulates step execution
export async function simulateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): Promise<SimulationResult> {
  await delay(600); // simulate network round trip

  const errors: string[] = [];
  const steps: SimStep[] = [];

  if (nodes.length === 0) {
    return {
      success: false,
      steps: [],
      summary: 'No nodes in workflow.',
      errors: ['Workflow is empty.'],
      completedAt: new Date().toISOString(),
    };
  }

  // ── Build adjacency for topological sort ──────────────────────
  const adjList = new Map<string, string[]>();
  const inDegree  = new Map<string, number>();
  nodes.forEach(n => { adjList.set(n.id, []); inDegree.set(n.id, 0); });
  edges.forEach(e => {
    adjList.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  });

  // ── Detect cycles via Kahn's algorithm ────────────────────────
  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });
  const sorted: string[] = [];
  while (queue.length) {
    const curr = queue.shift()!;
    sorted.push(curr);
    adjList.get(curr)?.forEach(next => {
      const d = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, d);
      if (d === 0) queue.push(next);
    });
  }

  if (sorted.length !== nodes.length) {
    errors.push('Cycle detected in workflow graph.');
    return {
      success: false,
      steps: [],
      summary: 'Simulation aborted: cycle detected.',
      errors,
      completedAt: new Date().toISOString(),
    };
  }

  // ── Validate start/end ────────────────────────────────────────
  const startNodes = nodes.filter(n => n.type === 'start');
  const endNodes   = nodes.filter(n => n.type === 'end');
  if (startNodes.length === 0) errors.push('Workflow must have a Start node.');
  if (startNodes.length > 1)  errors.push('Workflow must have exactly one Start node.');
  if (endNodes.length === 0)   errors.push('Workflow must have an End node.');

  if (errors.length > 0) {
    return { success: false, steps: [], summary: 'Validation failed.', errors, completedAt: new Date().toISOString() };
  }

  // ── Simulate each step ─────────────────────────────────────────
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  for (const id of sorted) {
    const node = nodeMap.get(id);
    if (!node) continue;
    const data = node.data;
    const title = (('title' in data ? (data as any).title : '') || node.type || 'node') as string;
    const kind = (node.type ?? 'task') as string;

    // simulate random duration
    const duration = Math.floor(Math.random() * 800) + 200;
    await delay(0); // allow UI to update between steps in real usage

    let status: SimStep['status'] = 'success';
    let message = '';

    switch (kind) {
      case 'start':
        message = `Workflow started: "${(data as any).title || 'Untitled'}"`;
        break;
      case 'task':
        message = `Task assigned to "${(data as any).assignee || 'unassigned'}" — due ${(data as any).dueDate || 'TBD'}`;
        break;
      case 'approval': {
        const threshold = (data as any).autoApproveThreshold ?? 0;
        const role = (data as any).approverRole || 'Manager';
        if (threshold > 0 && threshold <= 100) {
          message = `Auto-approved by threshold (${threshold}%) — role: ${role}`;
        } else {
          message = `Pending approval from ${role}`;
          status = 'success'; // simulate approved
        }
        break;
      }
      case 'automated': {
        const actionId = (data as any).actionId || 'unknown';
        const params   = (data as any).actionParams ?? {};
        const paramStr = Object.entries(params).map(([k, v]) => `${k}="${v}"`).join(', ');
        message = `Executed: ${actionId}(${paramStr})`;
        break;
      }
      case 'end':
        message = (data as any).message || 'Workflow completed successfully.';
        if ((data as any).showSummary) message += ' [Summary generated]';
        break;
      default:
        message = `Processed node "${title}"`;
    }

    steps.push({
      id: `step-${id}`,
      nodeId: id,
      kind: kind as any,
      title,
      status,
      message,
      duration,
    });
  }

  const allSuccess = steps.every(s => s.status === 'success');
  return {
    success: allSuccess,
    steps,
    summary: allSuccess
      ? `Workflow completed — ${steps.length} steps executed.`
      : `Workflow completed with issues.`,
    errors,
    completedAt: new Date().toISOString(),
  };
}
