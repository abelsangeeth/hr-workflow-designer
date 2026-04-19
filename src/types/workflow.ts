import type { Node, Edge } from 'reactflow';

// ─── Node variant types ──────────────────────────────────────────
export type NodeKind = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
}

// ─── Per-node data shapes ────────────────────────────────────────
export interface StartNodeData {
  kind: 'start';
  title: string;
  metadata: KeyValue[];
}

export interface TaskNodeData {
  kind: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData {
  kind: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  kind: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  kind: 'end';
  message: string;
  showSummary: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

// ─── React Flow node / edge aliases ─────────────────────────────
export type WorkflowNode = Node<WorkflowNodeData, NodeKind>;
export type WorkflowEdge = Edge;

// ─── Validation ──────────────────────────────────────────────────
export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  edgeId?: string;
  severity: ValidationSeverity;
  message: string;
}

// ─── Mock API types ───────────────────────────────────────────────
export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

// ─── Simulation types ─────────────────────────────────────────────
export type SimStepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface SimStep {
  id: string;
  nodeId: string;
  kind: NodeKind;
  title: string;
  status: SimStepStatus;
  message: string;
  duration?: number; // ms
}

export interface SimulationResult {
  success: boolean;
  steps: SimStep[];
  summary: string;
  errors: string[];
  completedAt: string;
}

// ─── Workflow graph export format ─────────────────────────────────
export interface WorkflowExport {
  version: string;
  name: string;
  createdAt: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
