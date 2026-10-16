import type { IncidentAction, PlatformDb } from './types';

/**
 * Pure state transitions on the shared data model.
 * Used by the API routes (server, authoritative) and by the client store (optimistic UI),
 * so both sides always agree on what an action does.
 * Each function receives a draft it may mutate and returns a user-facing message.
 */

export type HitlDecision = 'approve' | 'reject' | 'route' | 'escalate';
export type ApprovalDecision = 'Approved' | 'Rejected';

export function hitlDecision(d: PlatformDb, id: string, decision: HitlDecision): string {
  const i = d.hitl.findIndex(x => x.id === id);
  if (i < 0) throw new Error('HITL case not found');
  const h = d.hitl[i];
  const agent = d.agents.find(a => a.id === h.agent);
  const cust = d.customers.find(c => c.id === h.cust);
  d.hitl.splice(i, 1);
  if (decision === 'route' && h.cust === 'lala') {
    d.custApprovals.unshift({ id: 'r' + h.id, title: `${h.ref} — ${h.reason}`, detail: h.suggest, agent: h.agent, rule: 'Routed by Beecker ROC', wait: 'just now' });
  }
  return {
    approve: `${h.ref} approved · posted by ${agent?.short} · added to eval set`,
    reject: `${h.ref} rejected · requester notified`,
    route: `${h.ref} routed to ${cust?.name} · now in their Customer Portal approvals`,
    escalate: `${h.ref} escalated to AI Solutions on-call`,
  }[decision];
}

export function incidentAction(d: PlatformDb, id: string, action: IncidentAction): string {
  const inc = d.incidents.find(x => x.id === id);
  if (!inc) throw new Error('Incident not found');
  if (!inc.taken.includes(action)) inc.taken.push(action);
  if (action === 'resolve') inc.status = 'Resolved';
  else if (action === 'rollback' || action === 'pause') inc.status = 'Mitigating';
  const agent = d.agents.find(a => a.id === inc.agent);
  if (action === 'improve' && !d.improvements.some(x => x.src === `Incident ${inc.id} (ROC)`)) {
    d.improvements.unshift({ t: 'Exponential backoff + circuit breaker on SAP HCM calls', a: agent?.name ?? inc.agent, src: `Incident ${inc.id} (ROC)`, imp: 'High', st: 'New', who: 'sofia' });
  }
  if (action === 'resolve' && agent) { agent.status = 'ok'; agent.ex = 2.3; }
  return {
    escalate: 'Escalated to Sofía Chen (AI Solutions on-call)',
    pause: `${agent?.short} paused · ${inc.affected} runs queued, none lost`,
    rollback: 'Rolled back to the previous stable version · exception rate recovering',
    improve: 'Improvement item created · visible in FDE Workbench backlog',
    resolve: `${inc.id} resolved · Customer Portal updated`,
    comms: 'Customer update sent · shown in Customer Portal',
  }[action];
}

export function approvalDecision(d: PlatformDb, id: string, decision: ApprovalDecision): string {
  const c = d.custApprovals.find(x => x.id === id);
  if (!c) throw new Error('Approval not found');
  d.custApprovals = d.custApprovals.filter(x => x.id !== id);
  const agent = d.agents.find(a => a.id === c.agent);
  return `${decision}: ${c.title} · ${agent?.short} will continue`;
}

/** FINN → AI Initiative handoff. In production the extracted fields come from the transcript pipeline. */
export function createInitiativeFromMeeting(d: PlatformDb, meetingId: string): string {
  if (meetingId !== 'lala-ap') throw new Error('Only the Grupo Lala AP meeting is modeled in the mock');
  if (d.initiatives.some(i => i.id === 'invexc')) return 'Initiative already exists';
  d.initiatives.push({ id: 'invexc', name: 'Invoice Exception Agent', stage: 'Discovery', fn: 'Finance · AP', lead: 'mariana', sponsor: 'laura', golive: 'Feb 2027', value: 480, ready: 'High', reuse: 74, fromFinn: true });
  d.discovery.invexc = {
    problem: '70K invoices/month. The Invoice Processing Agent handles the happy path, but exceptions (PO not found, price variance) are still resolved manually by 4 analysts.',
    volume: '70,000/month', systems: ['SAP S/4HANA', 'Coupa', 'SharePoint'], effort: '7,600 hours/year', value: '$480K/year', sponsor: 'laura', readiness: 'High', complexity: 'Medium',
    users: 'AP exception analysts (4), AP supervisor', rules: 'Invoice variance < 2%; invoices > $100K require approval', pain: 'Manual exception handling; overnight Coupa → SAP PO sync',
    exceptions: 'PO not found, price variance, vendor mismatch', feas: 'High — extends Invoice Processing Agent v3.4.2', security: 'Same SAP service user and approval matrix as Invoice Agent',
    deps: 'Coupa API access (Carmen Ruiz)', source: 'Created by FINN from Valeria Núñez’s meeting · today 10:04',
  };
  return 'Invoice Exception Agent created in FDE Workbench → Discover';
}

export function moveToBuild(d: PlatformDb, id: string): string {
  const i = d.initiatives.find(x => x.id === id);
  if (!i) throw new Error('Initiative not found');
  if (!['Discovery', 'Business Case'].includes(i.stage)) return 'Already in build';
  i.stage = 'Development';
  i.golive = i.id === 'suprec' ? 'Mar 2, 2027' : 'Q2 2027';
  i.ready = '12%';
  return `${i.name} moved to Development · build workspace created with ${i.reuse}% reused capabilities`;
}

export function requestOpportunity(d: PlatformDb, id: string): string {
  const i = d.initiatives.find(x => x.id === id);
  if (!i) throw new Error('Initiative not found');
  i.requested = true;
  return 'Request sent · Mariana Ortega will schedule discovery';
}
