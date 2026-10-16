/**
 * Shared platform data model.
 * Every workspace (FDE Workbench, Agentic Control Tower, Customer Portal, Sales Intelligence)
 * reads these same objects. When moving to Postgres, each interface maps to a table.
 */

export type WorkspaceId = 'fde' | 'ops' | 'cust' | 'finn';
export type RoleId = 'admin' | 'fde' | 'roc' | 'cexec' | 'cpo' | 'ae';
export type Health = 'ok' | 'warn' | 'crit';
export type Stage = 'Discovery' | 'Business Case' | 'Development' | 'UAT' | 'Production';
export type Contract = 'MAS' | 'MAA'; // Managed AI Services | Managed AI Agents

export interface Person { n: string; r: string; i: string; org: string }

export interface Customer {
  id: string; name: string; ind: string; hq: string; contracts: Contract[];
  prod: number; warn: number; crit: number; hitl: number; sla: number; cost: number; incidents: number; runs24: number;
}

export interface Agent {
  id: string; name: string; short: string; cust: string;
  env: 'Production' | 'UAT'; status: Health; contract: Contract;
  hosting: 'Beecker-hosted' | 'Customer-hosted'; fn: string;
  runs24: number; success: number; autonomy: number; ex: number; p95: string; cost24: number;
  ver: string; orch: string; eval: number; sla?: number;
  // Fields only modeled for Grupo Lala agents
  tx30?: number; avg?: string; model?: string; owner?: string; sponsor?: string; value?: number; golive?: string;
  steps?: string[]; systems?: string[]; tests?: [number, number];
}

export interface Initiative {
  id: string; name: string; stage: Stage; fn: string; lead: string; sponsor: string;
  golive: string; value: number; ready: string; reuse: number; agent?: string;
  fromFinn?: boolean; requested?: boolean;
}

export interface Discovery {
  problem: string; volume: string; systems: string[]; effort: string; value: string; sponsor: string;
  readiness: string; complexity: string; users: string; rules: string; pain: string; exceptions: string;
  feas: string; security: string; deps: string; source: string;
}

export interface Reuse { pct: number; weeks: number; without: number; have: [string, string][]; need: string[] }

export interface MapCol { k: string; t: string; c: string }
export interface MapNode { id: string; col: string; label: string }
export interface MapDetail {
  kind: string; desc: string; go?: [WorkspaceId, string, string];
  systems?: string[]; usedBy?: string[]; actions?: string[]; rules?: string[]; perms?: string[];
  fields?: string; learned?: string; knowledge?: string[];
}

export interface TableDef { cols: string[]; rows: string[][] }

export type NodeType = 'trigger' | 'llm' | 'python' | 'langgraph' | 'uipath' | 'api' | 'human' | 'cond' | 'erp';
export interface WfNode { id: string; t: NodeType; l: string; e: string; x: number; y: number; st?: Health }
export interface Workflow { w: number; h: number; nodes: WfNode[]; edges: [string, string, string?][] }
export interface NodeDetail { cfg: [string, string][]; ctx: string[]; tests: string }

export interface HitlCase {
  id: string; ref: string; agent: string; cust: string; reason: string; conf: number; wait: number;
  sev: 'warn' | 'crit' | 'hum'; diff: [string, string, string][]; suggest: string;
}

export interface CustomerApproval { id: string; title: string; detail: string; agent: string; rule: string; wait: string }

export type IncidentAction = 'escalate' | 'pause' | 'rollback' | 'improve' | 'resolve' | 'comms';
export interface Incident {
  id: string; agent: string; cust: string; sev: 'warn' | 'crit'; title: string; detected: string; cause: string;
  affected: number; impact: string; sla: string; status: string; owner: string; taken: IncidentAction[];
}

export interface Improvement { t: string; a: string; src: string; imp: 'High' | 'Medium' | 'Low'; st: string; who: string }

export interface Meeting {
  id: string; acct: string; title: string; when: string; done: boolean; score: number; ucs: string[];
  summary: string; next: string[]; proposal: string;
}

/** Everything the UI needs, as served by /api/snapshot. */
export interface PlatformDb {
  people: Record<string, Person>;
  customers: Customer[];
  fleetOther: { customers: number; prod: number; warn: number; crit: number; hitl: number; cost: number; incidents: number };
  agents: Agent[];
  initiatives: Initiative[];
  discovery: Record<string, Discovery>;
  reuse: Record<string, Reuse>;
  mapCols: MapCol[]; mapNodes: MapNode[]; mapEdges: [string, string][]; mapDetail: Record<string, MapDetail>; ruleCounts: Record<string, string>;
  catalog: Record<string, TableDef>;
  buildCat: Record<string, TableDef>;
  workflows: Record<string, Workflow>;
  nodeDetail: Record<string, Record<string, NodeDetail>>;
  hitl: HitlCase[]; hitlOffset: number;
  custApprovals: CustomerApproval[];
  custExceptions: [string, string, string, string, string][];
  incidents: Incident[];
  improvements: Improvement[];
  meetings: Meeting[];
  finnUpcoming: [string, string, string, string][];
  opps: string[][];
}
