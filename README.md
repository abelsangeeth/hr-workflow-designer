# SmartRoute HR — Workflow Designer

A visual HR Workflow Designer built with **React + React Flow + TypeScript + Vite + Zustand + Tailwind CSS**.

---

##  How to Run

```bash
cd hr-workflow-designer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

##  Architecture

```
src/
├── api/
│   └── mockApi.ts              # Mock GET /automations + POST /simulate
├── components/
│   ├── canvas/
│   │   ├── WorkflowCanvas.tsx  # React Flow canvas + drag-drop
│   │   ├── NodeSidebar.tsx     # Draggable node palette
│   │   └── CanvasToolbar.tsx   # Validate / Test Run / Export / Import
│   ├── forms/
│   │   ├── NodeFormPanel.tsx   # Dispatcher — renders per-type form
│   │   ├── StartNodeForm.tsx
│   │   ├── TaskNodeForm.tsx
│   │   ├── ApprovalNodeForm.tsx
│   │   ├── AutomatedNodeForm.tsx
│   │   └── EndNodeForm.tsx
│   ├── nodes/
│   │   ├── StartNode.tsx       # Custom React Flow node components
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedNode.tsx
│   │   ├── EndNode.tsx
│   │   └── index.ts            # nodeTypes map represented in ReactFlow.
│   └── sandbox/
│       └── SandboxPanel.tsx    # Slide-up test/simulation panel
├── store/
│   └── workflowStore.ts        # Zustand store (single source of truth)
├── types/
│   └── workflow.ts             # All TypeScript interfaces
└── utils/
    ├── graphUtils.ts           # Colors, default data, ID generation
    └── validators.ts           # Graph validation (cycles, structure)
```

---

##  Design Decisions

### State — Zustand
State: all state is owned by single useWorkflowStore: nodes, edges, selection, validation issues, sandbox toggle.
The change handlers in React Flow are directed to the store, which makes the canvas component slim.
updateNodeData(id, patch) does a shallow merge hence only touches their fields.

### Custom Nodes
Each node kind is a fully isolated React component registered in `nodeTypes`. They:
- Read their `data` from React Flow props
- Filter validation issues from the store by their own `id`
- Render a consistent card with a coloured left border and type-specific header

### Forms
NodeFormPanel sends to the appropriate *NodeForm depending on selectedNodeId. Each form is a fully controlled component calling updateNodeData on every change. AutomatedNodeForm mounts to GET /automations, and dynamically mounts one input per entry of the action of choice in the params list.

### Mock API (`src/api/mockApi.ts`)
- `getAutomations()` — 300 ms simulated latency, 6 typed action definitions
- `simulateWorkflow()` — **Kahn's algorithm** for topological sort + cycle detection. Each node produces a realistic status + message + duration.

### Validation (`src/utils/validators.ts`)
- Exactly one Start node, at least one End node
- No disconnected nodes (warning)
- No outgoing edges from End nodes
- Cycle detection via DFS
- Per-node required fields (Task title, Automated action)

---

## ✅ Completed Features

| Feature | Done |
|---|---|
| Drag-and-drop canvas | ✅ |
| 5 custom node types with colour coding | ✅ |
| Node config forms (all 5 types) | ✅ |
| Dynamic action params (Automated node) | ✅ |
| `GET /automations` mock API | ✅ |
| `POST /simulate` mock API (topological execution) | ✅ |
| Animated step-by-step simulation log | ✅ |
| Workflow validation with node-level badges | ✅ |
| Export / Import workflow JSON | ✅ |
| Delete nodes / edges (Delete key) | ✅ |
| Mini-map + zoom controls | ✅ |
| Dark theme design system | ✅ |

---

##  What I'd Add With More Time

1. **Undo / Redo** — command history stack with `immer`
2. **Auto-layout** — `dagre` for clean arrangement
3. **Conditional edges** — branching with labelled edge conditions
4. **Zustand persist** — LocalStorage sync
5. **Node templates** — save/load named presets
  6. **Multi-select** — shift-click bulk operations

---

##  Tricky Frontend Bug Solved

**The Problem:** 
When the development was underway, the whole React Flow canvas would be blanked out or would result in an infinite re-render loop error.

**The Cause:** 
The trouble was due to the extraction of state out of our Zustand store. Two minor anti-patterns were making React observe a new state with each render tick:
1. Retrieving object literals right in our store hooks. (e.g., `useWorkflowStore(s => ({ x: s.x, y: s.y }))`).
2. Running array methods like `.filter()` directly inside a selector (e.g., `useWorkflowStore(s => s.validationIssues.filter(...))`). Because `.filter()` creates a new array instance in memory every time, Zustand's strict equality check failed, forcing the node components to infinitely re-update.

**The Fix:** 
We re-wrote our component selectors to get stable primitives one at a time. (e.g., `const nodes = useWorkflowStore(s => s.nodes);`), and extracted the `.filter()` operations in the store selector and to the component body. This had the effect of ensuring that the shallow equality checks by Zustand were successful immediately stabilizing the canvas and eliminating the crashes.
---

## Stack

| Tool | Purpose |
|---|---|
| Vite | Build + dev server |
| React 18 + TypeScript | UI + type safety |
| React Flow | Graph canvas |
| Zustand | Global state |
| Tailwind CSS v3 | Styling |
| Lucide React | Icons |
