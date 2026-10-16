'use client';

import type { ReactNode } from 'react';
import { days30, rng, series } from '@/lib/series';
import type { IncidentAction } from '@/lib/types';
import { BarChart, LineChart } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { Card, Kpi, Kpis, Note, PageHeader, Pill, SimpleTable, Table, UrlTabs, useGo } from '@/components/ui';

const HEALTH_T: Record<string, string> = { runs: 'Runs', alerts: 'Alerts & Incidents', errors: 'Errors', sla: 'SLA' };

export function OpsHealth({ tab }: { tab: string | null }) {
  const { db } = usePlatform();
  const { agent, cust } = useLookup();
  const go = useGo();
  const t = tab && HEALTH_T[tab] ? tab : 'runs';
  let b: ReactNode = null;

  if (t === 'runs') {
    const r = rng(11);
    const prod = db.agents.filter(x => x.env === 'Production');
    const rows = Array.from({ length: 14 }, (_, k) => {
      const a = prod[Math.floor(r() * prod.length)];
      const st = r() < 0.08 ? 'crit' : r() < 0.18 ? 'hum' : 'ok';
      const dur = (r() * 4 + 0.3).toFixed(1), steps = Math.floor(r() * 6) + 4;
      return (
        <tr key={k} className="click" onClick={() => go(['ops', 'agent', a.id])}>
          <td className="mono">run_{(9348120 - k * 37).toString(36)}</td><td className="nm">{a.short}</td><td>{cust(a.cust)?.name}</td>
          <td>{st === 'ok' ? <Pill cls="ok">Completed</Pill> : st === 'hum' ? <Pill cls="hum">Waiting on human</Pill> : <Pill cls="crit">Failed</Pill>}</td>
          <td className="num">{dur} min</td><td className="num">{steps}</td><td className="mono faint">14:{String(31 - k * 2).padStart(2, '0')}</td>
        </tr>
      );
    });
    b = <Card tight><Table cols={['Run', 'Agent', 'Customer', 'Status', 'Duration', 'Steps', 'Started']}>{rows}</Table></Card>;
  }

  if (t === 'alerts') b = (
    <Card tight>
      <Table cols={['Incident', 'Agent', 'Customer', 'Severity', 'Signal', 'Detected', 'Status', 'Owner']}>
        {db.incidents.map(x => (
          <tr key={x.id} className="click" onClick={() => go(['ops', 'incident', x.id])}>
            <td className="mono">{x.id}</td><td className="nm">{agent(x.agent)?.short}</td><td>{cust(x.cust)?.name}</td>
            <td>{x.sev === 'crit' ? <Pill cls="crit">High</Pill> : <Pill cls="warn">Medium</Pill>}</td>
            <td>{x.title}</td><td>{x.detected}</td><td>{x.status}</td><td>{x.owner}</td>
          </tr>
        ))}
        <tr><td colSpan={8} className="faint">+ 13 low-severity alerts auto-resolving</td></tr>
      </Table>
    </Card>
  );

  if (t === 'errors') {
    const e: [string, string, number, string][] = [['SAP API timeout', 'SAP S/4HANA', 412, 'Payroll Agent, Invoice Agent'], ['Email format change', 'Exchange Online', 388, 'Collections Agent'], ['Image unreadable', 'Claims portal', 201, 'Claims Agent'], ['LLM 429 throttling', 'Azure OpenAI', 96, 'Quote Agent'], ['Missing master data', 'SAP S/4HANA', 74, '7 agents'], ['UiPath robot unavailable', 'Orchestrator', 31, '3 agents']];
    b = (
      <div className="grid g-main">
        <Card head={<><h2>Errors by class</h2><span className="faint">24h</span></>}><BarChart v={e.map(x => x[2])} labels={e.map(x => x[0])} horiz c="var(--crit)" /></Card>
        <Card head={<h2>Where they come from</h2>}>
          <div className="rows">{e.map(x => <div key={x[0]} className="row" style={{ padding: '8px 0' }}><div className="grow"><div className="t">{x[0]}</div><div className="d">{x[1]} · {x[3]}</div></div><b className="num">{x[2]}</b></div>)}</div>
        </Card>
      </div>
    );
  }

  if (t === 'sla') {
    const risk: Record<string, [number, string]> = { femsa: [2, '15:10 · Collections'], heineken: [2, '16:00 · Claims'], lala: [1, '17:30 · Payroll'], celestica: [1, '18:00 · Quote'] };
    b = (
      <div className="grid g-main">
        <Card tight>
          <Table cols={['Customer', 'Target', 'Attained (30d)', 'At risk', 'Next breach window']}>
            {db.customers.map(c => (
              <tr key={c.id}><td className="nm">{c.name}</td><td className="num">99.9%</td>
                <td className="r num" style={{ color: c.sla < 99.9 ? 'var(--crit)' : 'inherit' }}>{c.sla}%</td>
                <td className="num">{risk[c.id]?.[0] ?? 0}</td><td>{risk[c.id]?.[1] ?? '—'}</td></tr>
            ))}
          </Table>
        </Card>
        <Card head={<><h2>Fleet SLA attainment</h2><span className="faint">30 days</span></>}>
          <LineChart series={[{ v: series(9, 30, 99.9, 0.05).map(v => Math.min(99.99, v)), c: 'var(--run)' }]} labels={days30} ymin={99.5} ymax={100} yfmt={v => v.toFixed(1) + '%'} refLine={{ v: 99.9, l: 'Target 99.9%' }} />
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Health']} title={HEALTH_T[t]} sub="Is the work being performed correctly, right now?" ly="r" />
      <UrlTabs cur={t} list={[['runs', 'Runs'], ['alerts', 'Alerts', db.incidents.length + 13], ['errors', 'Errors'], ['sla', 'SLA', 6]]} />
      {b}
    </>
  );
}

const ACTION_LABEL: Record<IncidentAction, string> = {
  escalate: 'Escalated to AI Solutions on-call', pause: 'Agent paused · new runs queued', rollback: 'Rolled back to previous stable version',
  improve: 'Improvement item created in shared backlog', resolve: 'Incident resolved', comms: 'Customer update sent',
};

export function Incident({ param, tab }: { param: string | null; tab: string | null }) {
  const { db, actions } = usePlatform();
  const { agent, cust } = useLookup();
  const go = useGo();
  const x = db.incidents.find(i => i.id === (param || 'INC-2291')) ?? db.incidents[0];
  const a = agent(x.agent)!;
  const t = tab || 'timeline';
  const rolled = x.taken.includes('rollback');
  const exr = [2.1, 2.0, 2.3, 2.1, 2.2, 2.0, 2.1, 2.4, 2.2, 2.1, 2.3, 2.2, 2.1, 2.0, 2.2, 2.4, 3.1, 4.6, 5.8, 6.2, 6.4, ...(rolled ? [4.1, 2.6] : [])];
  const done = (k: IncidentAction) => x.taken.includes(k);
  const Act = ({ k, label, primary }: { k: IncidentAction; label: string; primary?: boolean }) => (
    <button className={`btn ${primary ? 'primary' : ''}`} disabled={done(k)} style={done(k) ? { opacity: 0.5 } : undefined} onClick={() => actions.incident(x.id, k)}>{label}</button>
  );

  let body: ReactNode = null;
  if (t === 'timeline') {
    const items: [string, string, string, string][] = [
      ['13:50', 'info', 'Release R-2026.10.2 deployed', `${a.name} ${a.ver} · raises SAP timeout 30s → 60s`],
      ['13:58', 'warn', 'SAP HCM latency increase', 'p95 1.8s → 24s on /EmployeeCompensation (SAP basis maintenance window)'],
      ['14:04', 'crit', 'Exception rate crossed 4% threshold', 'Alert fired · ROC paged'],
      ['14:06', 'info', 'ROC acknowledged', 'Andrés Pacheco'],
      ['14:12', 'info', 'Root cause hypothesis', 'Timeouts trigger retries that exceed run budget; runs fall to exception path'],
      ...x.taken.map(k => ['now', 'ok', ACTION_LABEL[k], 'Andrés Pacheco · just now'] as [string, string, string, string]),
    ];
    body = <div className="timeline">{items.map((it, k) => <div key={k} className="tl"><span className="tm">{it[0]}</span><span className={`pt ${it[1]}`} /><div><div style={{ fontWeight: 600 }}>{it[2]}</div><div className="faint">{it[3]}</div></div></div>)}</div>;
  }
  if (t === 'logs') body = (
    <div className="logs">
      <span className="i">14:31:02.114</span> run_8f2kq  step=employee_match   <span className="e">ERROR</span> SAPTimeout: /EmployeeCompensation exceeded 60000ms{'\n'}
      <span className="i">14:31:02.116</span> run_8f2kq  step=employee_match   <span className="w">WARN </span> retry 3/3 exhausted → route=exception{'\n'}
      <span className="i">14:30:58.870</span> run_8f2kn  step=policy_check     INFO  variance=3.1% within policy{'\n'}
      <span className="i">14:30:41.002</span> run_8f2km  step=employee_match   <span className="e">ERROR</span> SAPTimeout: /EmployeeCompensation exceeded 60000ms{'\n'}
      <span className="i">14:30:40.995</span> run_8f2km  step=employee_match   <span className="w">WARN </span> retry 2/3 · backoff 0ms{'\n'}
      <span className="i">14:30:12.443</span> run_8f2kj  step=sap_update       INFO  posted 14 records · doc 4900218812
    </div>
  );
  if (t === 'cause') body = (<>
    <Note cls="warn" style={{ marginBottom: 12 }}><b>Likely cause: {x.cause}</b>&nbsp;(confidence 0.86)</Note>
    <dl className="kv">
      <dt>Signal</dt><dd>94% of new exceptions are SAPTimeout on /EmployeeCompensation</dd>
      <dt>Contributing</dt><dd>Retries have no backoff, so all three attempts land inside the same slow window</dd>
      <dt>Not the cause</dt><dd>Model and prompt unchanged since Sep 29 · eval scores stable</dd>
      <dt>Upstream</dt><dd>Grupo Lala SAP basis maintenance 13:55–15:00 (ticket LALA-IT-77812)</dd>
    </dl>
  </>);
  if (t === 'version') body = (
    <dl className="kv">
      <dt>Affected version</dt><dd className="mono">{a.ver}</dd><dt>Previous stable</dt><dd className="mono">v2.0.4 (Sep 29 – Oct 13, 0.0 incidents)</dd>
      <dt>Diff</dt><dd>sap_timeout 30s → 60s · retry policy unchanged</dd><dt>Rollout</dt><dd>100% since Oct 13 13:50</dd>
    </dl>
  );
  if (t === 'deploys') body = <SimpleTable def={{ cols: ['Release', 'Agent', 'When', 'By', 'Result'], rows: [['R-2026.10.2', 'Payroll v2.1.0', 'Oct 13 13:50', 'Sofía Chen', 'warn'], ['R-2026.10.1', 'Invoice v3.4.2', 'Oct 8', 'Diego Ramírez', 'ok'], ['R-2026.09.4', 'Payroll v2.0.4', 'Sep 29', 'Sofía Chen', 'ok']] }} />;
  if (t === 'comms') body = (<>
    <Note style={{ marginBottom: 10 }}>Customer-facing update. Shown in the Customer Portal as “1 active incident” in plain language.</Note>
    <div className="fg">
      <label htmlFor="comms">Message to {cust(x.cust)?.name}</label>
      <textarea id="comms" rows={5} defaultValue="Payroll exception processing is running slower than usual because of the SAP maintenance window that started at 13:55. 17 payroll workflows are delayed; no data is affected. We expect normal processing by 15:30 CT and will confirm once all workflows have completed." />
    </div>
    <div style={{ marginTop: 10 }}><button className="btn primary" disabled={done('comms')} onClick={() => actions.incident(x.id, 'comms')}>{done('comms') ? 'Update sent' : 'Send update'}</button></div>
  </>);
  if (t === 'actions') body = x.taken.length
    ? <div className="rows">{x.taken.map(k => <div key={k} className="row" style={{ padding: '8px 0' }}><span className="dot ok" /><span className="grow">{ACTION_LABEL[k]}</span><span className="faint">just now</span></div>)}</div>
    : <div className="empty">No actions yet. Use the buttons above.</div>;

  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], ['Alerts', ['ops', 'health', null, 'alerts']], x.id]} title={`${a.name} · ${cust(x.cust)?.name}`} ly="r"
        sub={<>{x.sev === 'crit' ? <Pill cls="crit">High severity</Pill> : <Pill cls="warn">Medium severity</Pill>} &nbsp;<Pill cls={x.status === 'Resolved' ? 'ok' : 'info'}>{x.status}</Pill> &nbsp;{x.owner}</>}
        actions={<><Act k="escalate" label="Escalate" /><Act k="pause" label="Pause Agent" /><Act k="rollback" label="Rollback Version" /><Act k="improve" label="Create Improvement Item" /><Act k="resolve" label="Resolve Incident" primary /></>} />
      <Note cls="warn" style={{ fontSize: 14 }}><b>Alert:</b>&nbsp;{x.title}</Note>
      <Kpis>
        <Kpi k="Detected" v={x.detected} />
        <Kpi k="Likely cause" v={<span style={{ fontSize: 17 }}>{x.cause}</span>} />
        <Kpi k="Affected runs" v={x.affected} />
        <Kpi k="Customer impact" v={<span style={{ fontSize: 17 }}>{x.impact}</span>} />
        <Kpi k="SLA risk" v={x.sla} d="Breach window 17:30 CT" />
      </Kpis>
      <div className="grid g-main">
        <Card>
          <div style={{ margin: '-14px -14px 14px' }}>
            <UrlTabs cur={t} list={[['timeline', 'Timeline'], ['logs', 'Logs'], ['cause', 'Root Cause'], ['version', 'Affected Version'], ['deploys', 'Recent Deployments'], ['comms', 'Customer Communication'], ['actions', 'Actions Taken', x.taken.length]]} />
          </div>
          {body}
        </Card>
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<><h2>Exception rate</h2><span className="faint">Last 3 hours</span></>}>
            <LineChart series={[{ v: exr, c: 'var(--crit)' }]} labels={exr.map((_, i) => (i % 4 === 0 ? `-${Math.round((exr.length - i) * 8.5)}m` : ''))} h={170} w={420} yfmt={v => v.toFixed(0) + '%'} ymax={8} refLine={{ v: 4, l: 'Alert threshold 4%' }} />
          </Card>
          <Card head={<h2>Agent</h2>}>
            <dl className="kv" style={{ gridTemplateColumns: '96px 1fr' }}>
              <dt>Customer</dt><dd>{cust(x.cust)?.name}</dd>
              <dt>Contract</dt><dd>{a.contract === 'MAS' ? 'Managed AI Services' : 'Managed AI Agents'}</dd>
              <dt>Version</dt><dd className="mono">{rolled ? 'v2.0.4' : a.ver}</dd>
              <dt>Runs / 24h</dt><dd className="num">{a.runs24.toLocaleString('en-US')}</dd>
              <dt>HITL open</dt><dd>{db.hitl.filter(h => h.agent === a.id).length}</dd>
            </dl>
            <button className="btn sm" style={{ marginTop: 10 }} onClick={() => go(['ops', 'agent', a.id])}>Agent detail</button>
          </Card>
        </div>
      </div>
    </>
  );
}
