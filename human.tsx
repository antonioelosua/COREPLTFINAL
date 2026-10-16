'use client';

import { useLookup, usePlatform } from '@/components/platform-provider';
import { Card, Note, PageHeader, Pill, SimpleTable, Table, useGo } from '@/components/ui';
import { useHitlCount } from './fleet';

export function HitlQueue() {
  const { db, hitlSel, setHitlSel, actions } = usePlatform();
  const { agent, cust } = useLookup();
  const go = useGo();
  const count = useHitlCount();
  const sel = db.hitl.find(h => h.id === hitlSel) ?? db.hitl[0];

  const decide = (d: 'approve' | 'reject' | 'route' | 'escalate') => {
    if (!sel) return;
    const i = db.hitl.findIndex(h => h.id === sel.id);
    const next = db.hitl[i + 1] ?? db.hitl[i - 1];
    actions.hitl(sel.id, d);
    setHitlSel(next?.id ?? null);
  };

  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Human Operations']} title="HITL Queue" ly="r"
        sub={`${count} cases across customers. Beecker ROC resolves operational exceptions; business approvals that need customer authority are routed to the Customer Portal.`} />
      <div className="grid g-main-wide" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)' }}>
        <Card tight head={<><h2>Waiting</h2><span className="faint">{db.hitl.length} shown · sorted by severity</span></>}>
          <div className="rows">
            {db.hitl.length === 0 && <div className="empty">Queue clear</div>}
            {db.hitl.map(h => (
              <div key={h.id} className="row click" style={sel && h.id === sel.id ? { background: 'var(--accent-weak)' } : undefined} onClick={() => setHitlSel(h.id)}>
                <span className={`sev ${h.sev}`} />
                <div className="grow"><div className="t">{h.ref}</div><div className="d">{h.reason} · {cust(h.cust)?.name} · {agent(h.agent)?.short}</div></div>
                <div style={{ textAlign: 'right' }}><div className="num" style={{ fontWeight: 600 }}>{h.conf}%</div><div className="faint num" style={{ fontSize: 11.5 }}>{h.wait} min</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          {!sel ? <div className="empty">Queue clear.</div> : (<>
            <div className="tag">{agent(sel.agent)?.name} · {cust(sel.cust)?.name}</div>
            <h2 style={{ fontSize: 17, margin: '3px 0 4px' }}>{sel.ref}</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Pill cls="warn">{sel.reason}</Pill><Pill cls="nodot">Confidence {sel.conf}%</Pill><Pill cls="nodot">Waiting {sel.wait} min</Pill></div>
            <div className="tag" style={{ margin: '14px 0 6px' }}>Extracted vs system of record</div>
            <div className="diff">
              <div className="h">Field</div><div className="h">Document</div><div className="h">SAP</div>
              {sel.diff.map(([f, a, b]) => (
                <div key={f} style={{ display: 'contents' }}>
                  <div className="faint">{f}</div><div>{a}</div><div className={b !== a && b !== '—' && b !== 'Found' ? 'bad' : ''}>{b}</div>
                </div>
              ))}
            </div>
            <Note cls="info" style={{ marginTop: 12 }}><b>Agent suggestion</b>&nbsp;{sel.suggest}</Note>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
              <button className="btn ok" onClick={() => decide('approve')}>Approve</button>
              <button className="btn danger" onClick={() => decide('reject')}>Reject</button>
              <button className="btn" onClick={() => decide('route')}>Route to customer</button>
              <button className="btn" onClick={() => decide('escalate')}>Escalate</button>
              <button className="btn ghost" onClick={() => go(['ops', 'agent', sel.agent])}>Open Context</button>
            </div>
            <div className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>Decisions are written to the audit trail and become labeled evaluation cases for this agent.</div>
          </>)}
        </Card>
      </div>
    </>
  );
}

export function OpsApprovals() {
  const { db } = usePlatform();
  const { agent } = useLookup();
  const others = [['Credit limit increase', 'FEMSA', 'Collections Agent', 'Limit > $2M MXN', '3 h'], ['Price exception', 'Celestica', 'Quote Agent', 'Discount > 12%', '1 h']];
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Human Operations']} title="Customer Approvals" ly="r"
        sub="Decisions that require the customer’s business authority. Beecker tracks them; the customer decides in their portal." />
      <Card tight>
        <Table cols={['Request', 'Customer', 'Agent', 'Rule', 'Waiting', 'Status']}>
          {db.custApprovals.map(c => (
            <tr key={c.id}><td className="nm">{c.title}<div className="s2">{c.detail}</div></td><td>Grupo Lala</td><td>{agent(c.agent)?.short}</td><td>{c.rule}</td><td className="num">{c.wait}</td><td><Pill cls="hum">Waiting on customer</Pill></td></tr>
          ))}
          {others.map(r => <tr key={r[0]}><td className="nm">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td className="num">{r[4]}</td><td><Pill cls="hum">Waiting on customer</Pill></td></tr>)}
        </Table>
      </Card>
    </>
  );
}

export function Escalations() {
  const { db } = usePlatform();
  const esc = db.incidents.find(i => i.id === 'INC-2291')?.taken.includes('escalate');
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Human Operations']} title="Escalations" ly="r" />
      <Card tight>
        <SimpleTable def={{ cols: ['Escalation', 'Customer', 'From', 'To', 'Age', 'Status'], rows: [['Collections dunning paused', 'FEMSA', 'ROC', 'AI Solutions · FEMSA', '2 h', 'warn'], ['Claims photo format', 'Heineken México', 'ROC', 'FDE on-call', '3 h', 'warn'], ['Payroll SAP timeouts', 'Grupo Lala', 'ROC', 'Sofía Chen', esc ? 'just now' : '—', esc ? 'info' : 'ok']] }} />
      </Card>
    </>
  );
}

export function Support() {
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Human Operations']} title="Support" ly="r" />
      <Card tight>
        <SimpleTable def={{ cols: ['Ticket', 'Customer', 'Subject', 'Priority', 'Owner', 'Status'], rows: [['SUP-4412', 'Grupo Lala', 'Add plant Gómez Palacio to Payroll scope', 'P3', 'Customer Success', 'info'], ['SUP-4409', 'Petco', 'Access for new AP analyst', 'P4', 'Support', 'ok'], ['SUP-4401', 'Celestica', 'Quote Agent latency question', 'P3', 'ROC', 'info'], ['SUP-4398', 'FEMSA', 'Collections report export', 'P3', 'Support', 'info']] }} />
      </Card>
    </>
  );
}
