import type { NodeTone } from './flow-config';

/**
 * Portable Issue Tree shape.
 *
 * This is the JSON that lives in Dexie's `saves` table. The runtime React
 * Flow representation is derived from this on load and serialized back on
 * save, so we can evolve the React Flow side without breaking persistence.
 */

export interface IssueTreeNodePayload {
  id: string;
  label: string;
  /** Optional sub-note shown on hover/expand */
  note?: string;
  /** Visual accent */
  tone?: NodeTone;
  /** Branch id — for case pages, this can link to assumption-driven highlighting */
  branchId?: string;
  /** Collapsed in UI? */
  collapsed?: boolean;
}

export interface IssueTreeEdgePayload {
  id: string;
  source: string;
  target: string;
}

export interface IssueTreeData {
  /** Version of the schema for forward-compat */
  version: 1;
  /** Root node id */
  rootId: string;
  nodes: IssueTreeNodePayload[];
  edges: IssueTreeEdgePayload[];
  /** Optional layout positions, keyed by node id */
  positions?: Record<string, { x: number; y: number }>;
  /** Auto-layout direction — informs export */
  layout?: 'LR' | 'TB';
}

/** Empty tree factory — used for "new tree" + initial scaffolds. */
export function makeEmptyTree(rootLabel = 'Problem'): IssueTreeData {
  return {
    version: 1,
    rootId: 'root',
    nodes: [{ id: 'root', label: rootLabel, tone: 'accent' }],
    edges: [],
    layout: 'LR',
  };
}

/** Generate a fresh node id. */
let _counter = 0;
export function nextNodeId(): string {
  _counter += 1;
  return `n${Date.now().toString(36)}${_counter}`;
}
