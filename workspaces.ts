import type { PlatformDb, RoleId, WorkspaceId } from './types';

/** Experience layer: one platform, four role-specific workspaces. */
export const WS: Record<WorkspaceId, {
  name: string; sub: string; ico: string; fg: string; bg: string;
  em: { u: number; b: number; r: number }; desc: string; who: string;
}> = {
  fde: { name: 'FDE Workbench', sub: 'Grupo Lala · Managed AI Services', ico: 'FD', fg: 'var(--bld)', bg: 'var(--bld-weak)', em: { u: 3, b: 3, r: 2 },
    desc: 'Discover, build, deploy and improve a portfolio of AI initiatives inside a customer.', who: 'FDEs · AI Solutions Leads · PMs' },
  ops: { name: 'Agentic Control Tower', sub: 'All customers · ROC', ico: 'CT', fg: '#fff', bg: 'var(--run)', em: { u: 1, b: 1, r: 3 },
    desc: 'Operate every production agent across all customers.', who: 'ROC · Support · Customer Success · Eng leadership' },
  cust: { name: 'Customer Portal', sub: 'Grupo Lala', ico: 'CP', fg: 'var(--und)', bg: 'var(--und-weak)', em: { u: 1, b: 1, r: 3 },
    desc: 'What is live, whether it works, the value created and what needs attention.', who: 'CIO · CFO · VP Shared Services · Process owners' },
  finn: { name: 'Sales Intelligence', sub: 'Beecker-native agent on the platform', ico: 'FN', fg: 'var(--accent-fg)', bg: 'var(--accent-weak)', em: { u: 2, b: 1, r: 2 },
    desc: 'Joins meetings, extracts use cases and turns discovery into AI initiatives.', who: 'AEs · Presales · Sales leadership' },
};
export const WS_IDS = Object.keys(WS) as WorkspaceId[];

export const ROLES: Record<RoleId, { n: string; who: string; i: string; ws: WorkspaceId[]; d: string }> = {
  admin: { n: 'Beecker Admin', who: 'Antonio Elosua', i: 'AE', ws: ['fde', 'ops', 'cust', 'finn'], d: 'All customers · all workspaces' },
  fde: { n: 'FDE', who: 'Diego Ramírez', i: 'DR', ws: ['fde'], d: 'Assigned customers · FDE Workbench · production visibility' },
  roc: { n: 'ROC Operator', who: 'Andrés Pacheco', i: 'AP', ws: ['ops'], d: 'Agentic Control Tower · production systems' },
  cexec: { n: 'Customer Executive', who: 'Ricardo Salinas · CFO', i: 'RS', ws: ['cust'], d: 'Customer Portal · business metrics' },
  cpo: { n: 'Customer Process Owner', who: 'Laura Méndez · VP Shared Services', i: 'LM', ws: ['cust'], d: 'Portal · approvals · exceptions · agent detail' },
  ae: { n: 'Account Executive', who: 'Valeria Núñez', i: 'VN', ws: ['finn'], d: 'FINN · sales accounts · opportunities' },
};
export const isRole = (r: string | undefined): r is RoleId => !!r && r in ROLES;

export const HOME: Record<WorkspaceId, string> = { fde: 'home', ops: 'home', cust: 'home', finn: 'today' };

/** Build the URL for a screen. Route state lives in the URL so every view is linkable. */
export function href(ws: WorkspaceId, route?: string, param?: string | null, tab?: string | null) {
  let p = '/' + ws;
  if (route && route !== HOME[ws]) p += '/' + route;
  if (param) p += '/' + encodeURIComponent(param);
  if (tab) p += '?tab=' + encodeURIComponent(tab);
  return p;
}

export interface NavItem { l: string; r: string; p?: string; t?: string; badge?: [string, string] | null }
export interface NavGroup { h?: string; lt?: 'u' | 'b' | 'r'; items: NavItem[] }

export function navFor(ws: WorkspaceId, db: PlatformDb, role: RoleId): NavGroup[] {
  const finnSent = db.initiatives.some(i => i.fromFinn);
  if (ws === 'fde') return [
    { items: [{ l: 'Overview', r: 'home' }] },
    { h: 'Discover', items: [{ l: 'Opportunity Pipeline', r: 'pipeline' }, { l: 'Discovery', r: 'discovery', p: 'suprec', badge: finnSent ? ['1 new', 'new'] : null }, { l: 'Business Cases', r: 'cases' }] },
    { h: 'Understand', lt: 'u', items: [{ l: 'Operational Map', r: 'map' }, { l: 'Systems', r: 'catalog', t: 'systems' }, { l: 'Entities', r: 'catalog', t: 'entities' }, { l: 'Workflows', r: 'catalog', t: 'processes' }, { l: 'Knowledge', r: 'catalog', t: 'knowledge' }, { l: 'Rules', r: 'catalog', t: 'rules' }, { l: 'Actions', r: 'catalog', t: 'actions' }, { l: 'Permissions', r: 'catalog', t: 'permissions' }] },
    { h: 'Build', lt: 'b', items: [{ l: 'Agents', r: 'agents' }, { l: 'Workflows', r: 'buildcat', t: 'workflows' }, { l: 'Tools', r: 'buildcat', t: 'tools' }, { l: 'Tests', r: 'buildcat', t: 'tests', badge: ['4 failing', 'warn'] }, { l: 'Evaluations', r: 'buildcat', t: 'evals' }, { l: 'Versions', r: 'buildcat', t: 'versions' }] },
    { h: 'Deploy', lt: 'b', items: [{ l: 'Environments', r: 'deploy', t: 'envs' }, { l: 'UAT', r: 'deploy', t: 'uat', badge: ['2', ''] }, { l: 'Releases', r: 'deploy', t: 'releases' }] },
    { h: 'Production', lt: 'r', items: [{ l: 'Agent Health', r: 'prodhealth', badge: ['1', 'warn'] }, { l: 'Exceptions', r: 'prodex' }, { l: 'Improvement Backlog', r: 'backlog' }] },
  ];
  if (ws === 'ops') {
    const inc = db.incidents.length + 13;
    return [
      { items: [{ l: 'Overview', r: 'home' }] },
      { h: 'Fleet', items: [{ l: 'Customers', r: 'customers' }, { l: 'Agents', r: 'fleet' }] },
      { h: 'Health', lt: 'r', items: [{ l: 'Runs', r: 'health', t: 'runs' }, { l: 'Alerts', r: 'health', t: 'alerts', badge: [String(inc), 'crit'] }, { l: 'Errors', r: 'health', t: 'errors' }, { l: 'SLA', r: 'health', t: 'sla', badge: ['6', 'warn'] }] },
      { h: 'Human Operations', lt: 'r', items: [{ l: 'HITL', r: 'hitl', badge: [String(db.hitl.length + db.hitlOffset), ''] }, { l: 'Approvals', r: 'approvals' }, { l: 'Escalations', r: 'escalations' }, { l: 'Support', r: 'support' }] },
      { h: 'Performance', lt: 'r', items: [{ l: 'Evaluations', r: 'perf', t: 'evals' }, { l: 'Autonomy', r: 'perf', t: 'autonomy' }, { l: 'Accuracy', r: 'perf', t: 'accuracy' }, { l: 'Cost', r: 'perf', t: 'cost' }, { l: 'Business KPIs', r: 'perf', t: 'kpis' }] },
      { h: 'Releases', lt: 'b', items: [{ l: 'Versions', r: 'rel', t: 'versions' }, { l: 'Deployment', r: 'rel', t: 'deploy' }, { l: 'Rollback', r: 'rel', t: 'rollback' }, { l: 'Improvements', r: 'rel', t: 'improve' }] },
    ];
  }
  if (ws === 'cust') {
    const g: NavItem[] = [{ l: 'Overview', r: 'home' }, { l: 'Agents', r: 'agents' }, { l: 'Initiatives', r: 'initiatives' }];
    if (role !== 'cexec') g.push({ l: 'Approvals', r: 'approvals', badge: db.custApprovals.length ? [String(db.custApprovals.length), 'warn'] : null });
    g.push({ l: 'Performance', r: 'performance' }, { l: 'Opportunities', r: 'opportunities' });
    return [{ items: g }];
  }
  return [{ items: [{ l: 'Today', r: 'today' }, { l: 'Meetings', r: 'meetings' }, { l: 'Accounts', r: 'accounts' }, { l: 'Opportunities', r: 'opps' }, { l: 'Use Cases', r: 'usecases' }, { l: 'Proposals', r: 'proposals', badge: ['2', 'warn'] }, { l: 'PDDs', r: 'pdds', badge: ['1', ''] }, { l: 'Coaching', r: 'coaching' }] }];
}

/** Which nav item is highlighted for detail pages. */
export function isNavActive(it: NavItem, ws: WorkspaceId, route: string, tab: string | null) {
  if (route === it.r && (it.t == null || tab === it.t || (tab == null && false))) return true;
  if (it.r === 'discovery' && route === 'discovery') return true;
  if (it.r === 'agents' && route === 'agent' && ws !== 'ops') return true;
  if (it.r === 'fleet' && route === 'agent' && ws === 'ops') return true;
  if (it.r === 'meetings' && route === 'meeting') return true;
  if (it.r === 'health' && it.t === 'alerts' && route === 'incident') return true;
  return false;
}
