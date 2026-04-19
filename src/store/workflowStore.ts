import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import type { NodeChange, EdgeChange, Connection } from 'reactflow';
import type { WorkflowNode, WorkflowEdge, WorkflowNodeData, ValidationIssue, WorkflowExport } from '../types/workflow';
import { validateWorkflow } from '../utils/validators';
import { v4 as uuid } from 'uuid';

interface WorkflowStore {
  // ── State ──────────────────────────────────────────────────────
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  validationIssues: ValidationIssue[];
  isSandboxOpen: boolean;

  // ── Node/Edge mutations triggered by React Flow ────────────────
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // ── Direct mutations ───────────────────────────────────────────
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (id: string) => void;

  // ── Selection ──────────────────────────────────────────────────
  selectNode: (id: string | null) => void;
  getSelectedNode: () => WorkflowNode | undefined;

  // ── Validation ─────────────────────────────────────────────────
  runValidation: () => ValidationIssue[];

  // ── Sandbox ────────────────────────────────────────────────────
  openSandbox: () => void;
  closeSandbox: () => void;

  // ── Export / Import ────────────────────────────────────────────
  exportWorkflow: (name?: string) => WorkflowExport;
  importWorkflow: (data: WorkflowExport) => void;
  clearCanvas: () => void;
}

// ─── Initial demo workflow ────────────────────────────────────────
const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 80, y: 200 },
    data: { kind: 'start', title: 'Begin Onboarding', metadata: [] },
  },
  {
    id: 'task-1',
    type: 'task',
    position: { x: 320, y: 100 },
    data: {
      kind: 'task',
      title: 'Collect Documents',
      description: 'Gather ID, degree certs, and bank details',
      assignee: 'HR Team',
      dueDate: '2025-05-01',
      customFields: [],
    },
  },
  {
    id: 'approval-1',
    type: 'approval',
    position: { x: 320, y: 300 },
    data: { kind: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 },
  },
  {
    id: 'automated-1',
    type: 'automated',
    position: { x: 580, y: 200 },
    data: { kind: 'automated', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'new.hire@company.com', subject: 'Welcome!' } },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 820, y: 200 },
    data: { kind: 'end', message: 'Onboarding complete!', showSummary: true },
  },
];

const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'e1', source: 'start-1', target: 'task-1', animated: true },
  { id: 'e2', source: 'start-1', target: 'approval-1', animated: true },
  { id: 'e3', source: 'task-1', target: 'automated-1', animated: true },
  { id: 'e4', source: 'approval-1', target: 'automated-1', animated: true },
  { id: 'e5', source: 'automated-1', target: 'end-1', animated: true },
];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: null,
  validationIssues: [],
  isSandboxOpen: false,

  // ── React Flow onChange handlers ────────────────────────────────
  onNodesChange: (changes) => {
    set(s => ({ nodes: applyNodeChanges(changes, s.nodes) as WorkflowNode[] }));
  },
  onEdgesChange: (changes) => {
    set(s => ({ edges: applyEdgeChanges(changes, s.edges) }));
  },
  onConnect: (connection) => {
    set(s => ({
      edges: addEdge({ ...connection, animated: true, id: uuid() }, s.edges),
    }));
  },

  // ── Direct mutations ────────────────────────────────────────────
  addNode: (node) => set(s => ({ nodes: [...s.nodes, node] })),

  updateNodeData: (id, data) => {
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData } : n
      ),
    }));
  },

  deleteNode: (id) => {
    set(s => ({
      nodes: s.nodes.filter(n => n.id !== id),
      edges: s.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  // ── Selection ───────────────────────────────────────────────────
  selectNode: (id) => set({ selectedNodeId: id }),
  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find(n => n.id === selectedNodeId);
  },

  // ── Validation ──────────────────────────────────────────────────
  runValidation: () => {
    const issues = validateWorkflow(get().nodes, get().edges);
    set({ validationIssues: issues });
    return issues;
  },

  // ── Sandbox ─────────────────────────────────────────────────────
  openSandbox: () => set({ isSandboxOpen: true }),
  closeSandbox: () => set({ isSandboxOpen: false }),

  // ── Export / Import ─────────────────────────────────────────────
  exportWorkflow: (name = 'workflow') => ({
    version: '1.0.0',
    name,
    createdAt: new Date().toISOString(),
    nodes: get().nodes,
    edges: get().edges,
  }),

  importWorkflow: (data) => {
    set({
      nodes: data.nodes,
      edges: data.edges,
      selectedNodeId: null,
      validationIssues: [],
    });
  },

  clearCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null, validationIssues: [] }),
}));
