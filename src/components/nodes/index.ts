export { StartNode }    from './StartNode';
export { TaskNode }     from './TaskNode';
export { ApprovalNode } from './ApprovalNode';
export { AutomatedNode } from './AutomatedNode';
export { EndNode }      from './EndNode';

import { StartNode }    from './StartNode';
import { TaskNode }     from './TaskNode';
import { ApprovalNode } from './ApprovalNode';
import { AutomatedNode } from './AutomatedNode';
import { EndNode }      from './EndNode';

/** nodeTypes map passed to <ReactFlow nodeTypes={nodeTypes} /> */
export const nodeTypes = {
  start:     StartNode,
  task:      TaskNode,
  approval:  ApprovalNode,
  automated: AutomatedNode,
  end:       EndNode,
};
