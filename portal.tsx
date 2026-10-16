'use client';

import type { ReactNode } from 'react';
import { STAGE_COLOR } from '@/lib/constants';
import { fmt, money } from '@/lib/format';
import { days30, series } from '@/lib/series';
import type { CustomerApproval, Initiative } from '@/lib/types';
import { BarChart, LineChart } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { AlsoSeen } from '@/components/shell';
import { Card, Flow, Kpi, Kpis, Note, PageHeader, Pill, StagePill, Table, UrlTabs, useGo } from '@/components/ui';

function useLalaProd() {
  const { db } = usePlatform();
  return db.agents.filter(a => a.cust === 'lala' && a.env === 'Production');
}
function useCanApprove() {
  return usePlatform().role !== 'cexec';
}
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export function CustHome() {
  const { db } = usePlatform();
  const { ini } = useLookup();
  const go = useGo();
  const prod = useLalaProd();
  const canApprove = useCanApprove();
  const attn = prod.filter(a => a.status !== 'ok').length;
  const tx = series(21, 30, 6100, 700).map((v, i) => v + (i % 7 > 4 ? -1600 : 0));
  const building = ['expense', 'freight', 'vendor', 'collections', 'orderentry'].map(id => ini(id)).filter((i): i is Initiative => !!i);
  const payrollIncident = db.incidents.find(i => i.id === 'INC-2291');
  const incidentOpen = payrollIncident && payrollIncident.status !== 'Resolved';
  const attention: [string, string, string, (() => void) | undefined][] = [
    [`${db.custApprovals.length} approvals`, 'Invoice above $100K, bank change, payroll adjustment', 'hum', canApprove ? () => go(['cust', 'approvals']) : undefined],
    [incidentOpen ? '1 active incident' : 'No active incidents', incidentOpen ? 'Payroll processing delayed by SAP maintenance. Beecker is resolving; no data affected.' : 'All agents are operating normally.', incidentOpen ? 'warn' : 'ok', () => go(['cust', 'agent', 'payroll'])],
    ['7 exceptions', 'Being handled by Beecker or waiting on your teams', 'info', canApprove ? () => go(['cust', 'approvals']) : undefined],
  ];
  return (
    <>
      <PageHeader crumbs={['Customer Portal']} title="Grupo Lala — AI Operations" ly="r" sub="Your AI agents operated by Beecker. Live status, outcomes and decisions that need you."
        actions={<span className="faint" style={{ fontSize: 12 }}>Your Beecker lead: Mariana Ortega</span>} />
      <Kpis>
        <Kpi k="Production agents" v="9" d="3 in development · 2 in discovery" onClick={() => go(['cust', 'agents'])} />
        <Kpi k="Transactions · 30 days" v="184,320" d={<><span className="up">+6.8%</span> vs prior 30</>} />
        <Kpi k="Successful completion" v="97.4%" />
        <Kpi k="Autonomous completion" v="91%" d="9% reviewed by people" />
        <Kpi k="SLA" v="99.95%" d="Target 99.9%" />
        <Kpi k="Annual value generated" v="$742K" d="Estimated, annualized" onClick={() => go(['cust', 'performance'])} />
      </Kpis>
      <div className="grid g3">
        <Card head={<h2>Needs your attention</h2>}>
          <div className="rows">
            {attention.map(([t, d, s, on]) => (
              <div key={t} className={`row ${on ? 'click' : ''}`} style={{ padding: '10px 0' }} onClick={on}>
                <span className={`sev ${s}`} /><div className="grow"><div className="t">{t}</div><div className="d">{d}</div></div>
              </div>
            ))}
          </div>
          {!canApprove && <div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>Approvals are handled by process owners.</div>}
        </Card>
        <Card head={<h2>Agent health</h2>}>
          <div style={{ display: 'flex', gap: 22, marginBottom: 10 }}>
            <div><div className="big" style={{ color: 'var(--ok)' }}>{prod.length - attn}</div><div className="faint">Healthy</div></div>
            <div><div className="big" style={{ color: 'var(--warn)' }}>{attn}</div><div className="faint">Needs attention</div></div>
          </div>
          <div className="rows">
            {prod.map(a => <div key={a.id} className="row click" style={{ padding: '6px 0' }} onClick={() => go(['cust', 'agent', a.id])}><span className={`dot ${a.status}`} /><span className="grow">{a.name}</span><span className="faint num">{a.autonomy}%</span></div>)}
          </div>
        </Card>
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<h2>What Beecker is building</h2>}>
            <div className="rows">{building.map(i => <div key={i.id} className="row" style={{ padding: '7px 0' }}><span className="grow">{i.name}</span><StagePill stage={i.stage} /></div>)}</div>
            <button className="btn sm ghost" style={{ marginTop: 6, paddingLeft: 0 }} onClick={() => go(['cust', 'initiatives'])}>Roadmap →</button>
          </Card>
          <Card head={<h2>Recommended next opportunities</h2>}>
            <div className="rows">
              {['suprec', 'poexc'].map(id => ini(id)).filter((i): i is Initiative => !!i).map(i => (
                <div key={i.id} className="row" style={{ padding: '8px 0' }}>
                  <div className="grow"><div className="t">{i.name}</div><div className="d">Potential value {money(i.value)}/yr · Readiness {i.ready}</div></div>
                  <button className="btn sm" onClick={() => go(['cust', 'opportunities'])}>View</button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <Card head={<><h2>Transactions processed</h2><span className="faint">Last 30 days · all agents</span></>}>
        <BarChart v={tx} labels={days30} c="var(--und)" hl={29} yfmt={v => (v / 1000).toFixed(0) + 'K'} h={220} w={1200} />
      </Card>
    </>
  );
}

export function CustAgents() {
  const go = useGo();
  const prod = useLalaProd();
  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']]]} title="Agents" ly="r"
        sub="Each agent shows whether it is working and what it is worth. Agents built in your AI portfolio are part of Managed AI Services; the others run under your Managed AI Agents subscription." />
      <Card tight>
        <Table cols={['Agent', 'Area', 'Status', 'Transactions (30d)', 'Successful', 'Autonomous', 'Annual value', 'Contract']}>
          {prod.map(a => (
            <tr key={a.id} className="click" onClick={() => go(['cust', 'agent', a.id])}>
              <td className="nm">{a.name}</td><td>{a.fn}</td>
              <td>{a.status === 'ok' ? <Pill cls="ok">Healthy</Pill> : <Pill cls="warn">Needs attention</Pill>}</td>
              <td className="r num">{fmt(a.tx30 ?? 0)}</td><td className="r num">{a.success}%</td><td className="r num">{a.autonomy}%</td>
              <td className="r num">${a.value}K</td><td><span className="chip">{a.contract === 'MAS' ? 'Managed AI Services' : 'Managed AI Agents'}</span></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function ApprovalsList({ list }: { list: CustomerApproval[] }) {
  const { actions } = usePlatform();
  const { agent } = useLookup();
  const canApprove = useCanApprove();
  return (
    <div className="grid">
      {list.map(c => (
        <div key={c.id} className="card" style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="sev hum" style={{ alignSelf: 'stretch' }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
            <div className="muted">{c.detail}</div>
            <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>{agent(c.agent)?.name} · Rule: {c.rule} · waiting {c.wait}</div>
          </div>
          {canApprove ? <>
            <button className="btn ok" onClick={() => actions.approval(c.id, 'Approved')}>Approve</button>
            <button className="btn danger" onClick={() => actions.approval(c.id, 'Rejected')}>Reject</button>
          </> : <span className="faint">View only</span>}
        </div>
      ))}
    </div>
  );
}

export function CustAgent({ param, tab }: { param: string | null; tab: string | null }) {
  const { db, role } = usePlatform();
  const { agent, person } = useLookup();
  const a = agent(param) ?? agent('invoice')!;
  if (a.cust !== 'lala') return <CustAgents />;
  const t = tab || 'overview';
  const tx30 = a.tx30 ?? 0, value = a.value ?? 0, steps = a.steps ?? [];
  const hum = (100 - a.autonomy).toFixed(1);
  const sp = person(a.sponsor);
  const myApprovals = db.custApprovals.filter(c => c.agent === a.id);
  let b: ReactNode = null;

  if (t === 'overview') b = (<>
    <Kpis>
      <Kpi k="Status" v={a.status === 'ok' ? <span style={{ color: 'var(--ok)' }}>Healthy</span> : <span style={{ color: 'var(--warn)' }}>Attention</span>} />
      <Kpi k="Transactions (30d)" v={fmt(tx30)} /><Kpi k="Successful" v={a.success + '%'} /><Kpi k="Autonomous" v={a.autonomy + '%'} />
      <Kpi k="Human review" v={hum + '%'} /><Kpi k="Annualized savings" v={'$' + value + 'K'} /><Kpi k="Avg processing time" v={a.avg} />
    </Kpis>
    <Card head={<><h2>How it works</h2><span className="faint">% of transactions reaching each step</span></>}>
      <Flow steps={steps} pcts={steps.map((s, i) => ' ' + (i === 0 ? '100%' : /approval|review/i.test(s) ? hum + '%' : (100 - ((100 - a.success) * i) / (steps.length - 1)).toFixed(1) + '%'))} />
    </Card>
    {a.status !== 'ok' && <Note cls="warn"><b>Delayed processing:</b>&nbsp;SAP maintenance is slowing payroll exception checks. 17 workflows are delayed and will complete automatically. Beecker expects normal processing by 15:30 CT.</Note>}
    <div className="grid g2">
      <Card head={<h2>This week</h2>}>
        <div className="rows">
          {[['Processed', fmt(Math.round(tx30 / 4.3)) + ' transactions'], ['Sent to your team for review', fmt(Math.round(((tx30 / 4.3) * Number(hum)) / 100))], ['Average time per transaction', `${a.avg} (was 3 days manual)`], ['Improvement shipped', a.id === 'invoice' ? 'Coupa PO fallback (v3.4.2)' : 'Maintenance only']].map(([k, v]) => (
            <div key={k} className="row" style={{ padding: '8px 0' }}><span className="grow muted">{k}</span><b>{v}</b></div>
          ))}
        </div>
      </Card>
      <Card head={<><h2>Autonomy trend</h2><span className="faint">12 weeks</span></>}>
        <LineChart series={[{ v: series(tx30, 12, a.autonomy - 3, 0.8, 0.28), c: 'var(--und)' }]} labels={Array.from({ length: 12 }, (_, i) => 'W' + (31 + i))} h={170} w={460} yfmt={v => Math.round(v) + '%'} />
      </Card>
    </div>
  </>);
  if (t === 'performance') b = (
    <div className="grid g2">
      <Card head={<h2>Daily transactions</h2>}><BarChart v={series(tx30, 30, tx30 / 30, tx30 / 90)} labels={days30} c="var(--und)" /></Card>
      <Card head={<h2>Successful completion</h2>}><LineChart series={[{ v: series(tx30 + 3, 30, a.success, 0.4).map(v => Math.min(99.9, v)), c: 'var(--ok)' }]} labels={days30} ymin={90} ymax={100} yfmt={v => v + '%'} /></Card>
    </div>
  );
  if (t === 'exceptions') {
    const ex: [string, number, string][] = a.id === 'invoice'
      ? [['PO not found', 31, 'Beecker improving: Coupa PO sync'], ['Vendor mismatch', 22, 'Reviewed by Beecker ROC'], ['Price outside tolerance', 12, 'Sent to AP for decision']]
      : [['SAP timeout', 17, 'Beecker resolving incident'], ['Conflicting employee record', 18, 'Sent to HR Ops']];
    b = <Card tight><Table cols={['Exception type', 'Last 30 days', 'How it is handled']}>{ex.map(r => <tr key={r[0]}><td className="nm">{r[0]}</td><td className="num">{r[1]}</td><td>{r[2]}</td></tr>)}</Table></Card>;
  }
  if (t === 'approvals') b = myApprovals.length ? <ApprovalsList list={myApprovals} /> : <div className="card"><div className="empty">No approvals waiting for this agent.</div></div>;
  if (t === 'value') b = (
    <div className="grid g-main">
      <Card head={<><h2>Value generated</h2><span className="faint">Cumulative since go-live</span></>}>
        <LineChart series={[{ v: Array.from({ length: 16 }, (_, i) => Math.round((value / 12) * i * (1 + i / 60))), c: 'var(--und)' }]} labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']} yfmt={v => '$' + Math.round(v) + 'K'} />
      </Card>
      <Card head={<h2>How value is calculated</h2>}>
        <dl className="kv" style={{ gridTemplateColumns: '150px 1fr' }}>
          <dt>Hours returned</dt><dd>{fmt(Math.round((value * 1000) / 42))} hrs/yr</dd>
          <dt>Loaded hourly cost</dt><dd>$42 (agreed Feb 2025)</dd>
          <dt>Early-pay discounts</dt><dd>{a.id === 'invoice' ? '$31K/yr captured' : '—'}</dd>
          <dt>Error reduction</dt><dd>Credit memos down 38%</dd>
        </dl>
        <Note style={{ marginTop: 12 }}>Assumptions signed off by {sp.n}. Updated monthly.</Note>
      </Card>
    </div>
  );

  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']], ['Agents', ['cust', 'agents']], a.name]} title={a.name} ly="r"
        sub={`${a.fn} · Owner ${sp.n} · Live since ${a.golive}`} actions={a.status === 'ok' ? <Pill cls="ok">Healthy</Pill> : <Pill cls="warn">Needs attention</Pill>} />
      {role === 'admin' && <AlsoSeen agentId={a.id} except="cust" />}
      <UrlTabs cur={t} list={[['overview', 'Overview'], ['performance', 'Performance'], ['exceptions', 'Exceptions'], ['approvals', 'Approvals', myApprovals.length], ['value', 'Business Value']]} />
      {b}
    </>
  );
}

export function CustApprovals() {
  const { db } = usePlatform();
  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']]]} title="Approvals & Exceptions" ly="r" sub="Decisions your agents cannot make alone, by policy. Everything else is handled by Beecker." />
      <h2 style={{ marginTop: 4 }}>Waiting for your decision <span className="faint" style={{ fontWeight: 400 }}>· {db.custApprovals.length}</span></h2>
      {db.custApprovals.length ? <ApprovalsList list={db.custApprovals} /> : <div className="card"><div className="empty">All caught up.</div></div>}
      <h2 style={{ marginTop: 8 }}>Open exceptions <span className="faint" style={{ fontWeight: 400 }}>· {db.custExceptions.length + 1}</span></h2>
      <Card tight>
        <Table cols={['Agent', 'What happened', 'Volume', 'Status']}>
          {db.custExceptions.map(r => <tr key={r[0] + r[1]}><td className="nm">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Pill cls={r[4]}>{r[3]}</Pill></td></tr>)}
        </Table>
      </Card>
    </>
  );
}

const GANTT_POS: Record<string, [number, number]> = { expense: [0, 1.5], freight: [0, 1.8], vendor: [0, 1.9], collections: [0, 3.6], credit: [0, 4.1], suprec: [1, 5.5], poexc: [1.5, 6.5], interco: [2.5, 7.5], orderentry: [0, 8], travel: [0, 9], invexc: [0, 5] };

export function CustInitiatives() {
  const { db } = usePlatform();
  const list = db.initiatives.filter(i => i.stage !== 'Production');
  const m = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']]]} title="Initiatives" ly="ub" sub="What Beecker is working on in your AI portfolio and when it reaches production." />
      <Card head={<><h2>Roadmap</h2><span className="faint">Oct 2026 – Jun 2027</span></>}>
        <div className="tw">
          <div className="gantt" style={{ minWidth: 640 }}>
            <div className="faint">Initiative</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)' }} className="faint">{m.map(x => <span key={x}>{x}</span>)}</div>
            {list.map(i => {
              const [s, e] = GANTT_POS[i.id] ?? [0, 6];
              return (
                <div key={i.id} style={{ display: 'contents' }}>
                  <div><div style={{ fontWeight: 600 }}>{i.name}</div><div className="faint" style={{ fontSize: 11.5 }}>{i.stage} · {money(i.value)}/yr</div></div>
                  <div className="gbar"><i style={{ left: `${(s / 9) * 100}%`, width: `${((e - s) / 9) * 100}%`, background: STAGE_COLOR[i.stage], opacity: 0.85 }} /><span className="now" style={{ left: `${(0.45 / 9) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </>
  );
}

export function CustPerformance() {
  const prod = useLalaProd();
  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']]]} title="Performance" ly="r" sub="Outcomes across all your agents." />
      <div className="grid g2">
        <Card head={<><h2>Annualized value</h2><span className="faint">12 months</span></>}><LineChart series={[{ v: [318, 352, 390, 431, 472, 520, 561, 598, 640, 676, 712, 742], c: 'var(--und)' }]} labels={MONTHS} yfmt={v => '$' + Math.round(v) + 'K'} /></Card>
        <Card head={<h2>Value by agent</h2>}><BarChart v={prod.map(a => a.value ?? 0)} labels={prod.map(a => a.short)} horiz yfmt={v => '$' + v + 'K'} c="var(--und)" /></Card>
      </div>
      <div className="grid g2">
        <Card head={<h2>Autonomous completion</h2>}><LineChart series={[{ v: [84, 85, 86, 86.5, 87.4, 88, 88.6, 89.1, 89.7, 90.2, 90.6, 91], c: 'var(--ok)' }]} labels={MONTHS} ymin={80} ymax={95} yfmt={v => v + '%'} /></Card>
        <Card head={<h2>SLA attainment</h2>}><LineChart series={[{ v: [99.93, 99.95, 99.97, 99.96, 99.94, 99.98, 99.97, 99.95, 99.96, 99.97, 99.96, 99.95], c: 'var(--run)' }]} labels={MONTHS} ymin={99.8} ymax={100} yfmt={v => v.toFixed(2) + '%'} refLine={{ v: 99.9, l: 'Target' }} /></Card>
      </div>
    </>
  );
}

export function CustOpportunities() {
  const { db, actions } = usePlatform();
  const { ini } = useLookup();
  return (
    <>
      <PageHeader crumbs={[['Customer Portal', ['cust', 'home']]]} title="Opportunities" ly="u"
        sub="Recommended by your Beecker team using what is already connected and modeled in your environment. Higher reuse means faster delivery." />
      <div className="grid g2">
        {['suprec', 'poexc', 'interco', 'orderentry'].map(id => ini(id)).filter((i): i is Initiative => !!i).map(i => (
          <Card key={i.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div><h2 style={{ fontSize: 15 }}>{i.name}</h2><div className="muted" style={{ marginTop: 3 }}>{db.discovery[i.id]?.problem ?? `${i.fn} automation identified from your process map.`}</div></div>
              <StagePill stage={i.stage} />
            </div>
            <div style={{ display: 'flex', gap: 22, margin: '14px 0', flexWrap: 'wrap' }}>
              <div><div className="faint">Potential value</div><b style={{ fontSize: 18 }}>{money(i.value)}/yr</b></div>
              <div><div className="faint">Readiness</div><b style={{ fontSize: 18 }}>{i.ready}</b></div>
              <div><div className="faint">Already in place</div><b style={{ fontSize: 18 }}>{i.reuse}%</b></div>
            </div>
            <button className={`btn ${i.requested ? '' : 'primary'}`} disabled={i.requested} onClick={() => actions.requestOpp(i.id)}>
              {i.requested ? 'Requested · Mariana Ortega notified' : 'Ask Beecker to start'}
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
