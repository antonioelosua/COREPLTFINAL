'use client';

import type { ReactNode } from 'react';
import { fmt } from '@/lib/format';
import { days30, hours, series } from '@/lib/series';
import { BarChart, LineChart, Spark } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { AlsoSeen } from '@/components/shell';
import { Card, Flow, Kpi, Kpis, Meter, Note, PageHeader, Pill, SimpleTable, StPill, Table, ToastBtn, UrlTabs, useGo } from '@/components/ui';

const PERF_T: Record<string, string> = { evals: 'Evaluations', autonomy: 'Autonomy', accuracy: 'Accuracy', cost: 'Cost', kpis: 'Business KPIs' };
const WEEKS = ['W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42'];

export function OpsPerformance({ tab }: { tab: string | null }) {
  const { db } = usePlatform();
  const { cust } = useLookup();
  const go = useGo();
  const t = tab && PERF_T[tab] ? tab : 'evals';
  const prod = db.agents.filter(a => a.env === 'Production');
  let b: ReactNode = null;

  if (t === 'evals') b = (
    <Card tight>
      <Table cols={['Agent', 'Customer', 'Eval score', 'Threshold', 'Labeled cases', 'Trend']}>
        {prod.map(a => (
          <tr key={a.id} className="click" onClick={() => go(['ops', 'agent', a.id])}>
            <td className="nm">{a.name}</td><td>{cust(a.cust)?.name}</td>
            <td className="r num" style={{ color: a.eval < 93 ? 'var(--crit)' : 'inherit' }}>{a.eval}%</td>
            <td className="num">93%</td><td className="num">{fmt(Math.round(a.runs24 * 0.6 + 200))}</td>
            <td><Spark v={series(a.runs24, 12, a.eval, 0.6)} c={a.eval < 93 ? 'var(--crit)' : 'var(--ok)'} w={80} h={20} /></td>
          </tr>
        ))}
      </Table>
    </Card>
  );
  if (t === 'autonomy') b = (
    <Card head={<><h2>Fleet autonomous completion</h2><span className="faint">12 weeks</span></>}>
      <LineChart series={[{ v: [83.1, 83.9, 84.6, 85.2, 85.0, 86.1, 86.9, 87.4, 88.0, 88.3, 88.9, 89.4], c: 'var(--ok)' }]} labels={WEEKS} ymin={80} ymax={92} yfmt={v => v + '%'} />
      <Note style={{ marginTop: 10 }}>HITL decisions feed evaluation sets. As agents learn from reviewed cases, thresholds are raised agent by agent.</Note>
    </Card>
  );
  if (t === 'accuracy') b = (
    <Card tight>
      <Table cols={['Agent', 'Customer', 'Field accuracy', 'Decision accuracy', 'False auto-approvals (30d)']}>
        {prod.slice(0, 10).map(a => (
          <tr key={a.id}><td className="nm">{a.name}</td><td>{cust(a.cust)?.name}</td><td className="r num">{(a.eval + 0.6).toFixed(1)}%</td><td className="r num">{(a.success + 0.5).toFixed(1)}%</td><td className="r num">{a.status === 'ok' ? 0 : a.status === 'warn' ? 2 : 6}</td></tr>
        ))}
      </Table>
    </Card>
  );
  if (t === 'cost') b = (
    <div className="grid g2">
      <Card head={<h2>Cost today by customer</h2>}>
        <BarChart v={[...db.customers.map(c => c.cost), db.fleetOther.cost]} labels={[...db.customers.map(c => c.name), '23 others']} horiz yfmt={v => '$' + fmt(v)} c="var(--run)" />
      </Card>
      <Card head={<><h2>Cost per 1,000 runs</h2><span className="faint">30 days</span></>}>
        <LineChart series={[{ v: series(4, 30, 81, 2.4, -0.25), c: 'var(--run)' }]} labels={days30} yfmt={v => '$' + Math.round(v)} />
      </Card>
    </div>
  );
  if (t === 'kpis') b = (
    <Kpis>
      <Kpi k="Hours returned to customers" v="61,240" d="Last 30 days" />
      <Kpi k="Annualized value delivered" v="$38.6M" d="Across 28 customers" />
      <Kpi k="Transactions processed" v="7.4M" d="Last 30 days" />
      <Kpi k="Cost / value ratio" v="1 : 9.8" />
    </Kpis>
  );

  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Performance']} title={PERF_T[t]} sub="Quality, autonomy and economics of every production agent." ly="r" />
      <UrlTabs cur={t} list={Object.entries(PERF_T).map(([k, l]) => [k, l])} />
      {b}
    </>
  );
}

const REL_T: Record<string, string> = { versions: 'Versions', deploy: 'Deployment', rollback: 'Rollback', improve: 'Improvements' };

export function OpsReleases({ tab }: { tab: string | null }) {
  const { db } = usePlatform();
  const t = tab && REL_T[tab] ? tab : 'versions';
  const rolled = db.incidents.find(i => i.id === 'INC-2291')?.taken.includes('rollback');
  let b: ReactNode = null;
  if (t === 'versions') b = <Card tight><SimpleTable def={db.buildCat.versions} /></Card>;
  if (t === 'deploy') b = (
    <Card tight>
      <Table cols={['Release', 'Agent', 'Customer', 'Strategy', 'Progress', 'Health gate']}>
        {([['R-2026.10.3', 'Payroll v2.1.1', 'Grupo Lala', 'Canary', 10, 'Pending'], ['R-2026.10.7', 'Order Entry v5.2.1', 'Celestica', 'Canary', 50, 'Passing'], ['R-2026.10.6', 'Vendor Master v2.3.1', 'Petco', 'Blue/green', 100, 'Passing'], ['R-2026.10.5', 'AP Invoice v3.4.1', 'Heineken México', 'Canary', 25, 'Passing']] as [string, string, string, string, number, string][]).map(r => (
          <tr key={r[0]}>
            <td className="mono">{r[0]}</td><td className="nm">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td>
            <td><div className="bar-in"><Meter pct={r[4]} /><span className="num">{r[4]}%</span></div></td>
            <td><Pill cls={r[5] === 'Passing' ? 'ok' : 'warn'}>{r[5]}</Pill></td>
          </tr>
        ))}
      </Table>
    </Card>
  );
  if (t === 'rollback') b = (
    <Card tight>
      <SimpleTable def={{ cols: ['Agent', 'From', 'To', 'When', 'Reason', 'Result'], rows: [...(rolled ? [['Payroll Exception Agent', 'v2.1.0', 'v2.0.4', 'Just now', 'INC-2291 SAP timeouts', 'ok']] : []), ['Collections Agent (FEMSA)', 'v3.0.1', 'v3.0.0', 'Oct 11', 'Eval drift', 'ok'], ['Claims Agent (Heineken)', 'v1.2.1', 'v1.2.0', 'Oct 2', 'Latency regression', 'ok']] }} />
    </Card>
  );
  if (t === 'improve') b = (<>
    <Note>Same backlog the FDE team sees in their workspace. Production signals become build work.</Note>
    <Card tight>
      <Table cols={['Improvement', 'Agent', 'Source', 'Impact', 'Status']}>
        {db.improvements.map(x => <tr key={x.t}><td className="nm">{x.t}</td><td>{x.a}</td><td><span className="chip">{x.src}</span></td><td>{x.imp}</td><td><Pill cls={x.st === 'Done' ? 'ok' : x.st === 'In progress' ? 'info' : 'nodot'}>{x.st}</Pill></td></tr>)}
      </Table>
    </Card>
  </>);
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Releases']} title={REL_T[t]} sub="Controlled rollout and continuous improvement of production agents." ly="br" />
      <UrlTabs cur={t} list={[['versions', 'Versions'], ['deploy', 'Deployment'], ['rollback', 'Rollback'], ['improve', 'Improvements', db.improvements.length]]} />
      {b}
    </>
  );
}

export function OpsAgent({ param }: { param: string | null }) {
  const { db } = usePlatform();
  const { agent, cust } = useLookup();
  const go = useGo();
  const a = agent(param) ?? agent('invoice')!;
  const inc = db.incidents.find(i => i.agent === a.id);
  const runs = series(a.runs24, 24, a.runs24 / 24, a.runs24 / 60).map((v, i) => v * (0.7 + 0.5 * Math.sin((i + 4) / 3.8) ** 2));
  const ex = series(a.runs24 + 1, 24, a.ex, 0.4, a.status === 'warn' ? 0.18 : 0).map(v => Math.max(0.3, v));
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], ['Agents', ['ops', 'fleet']], a.name]} title={a.name} ly="r"
        sub={<>{cust(a.cust)?.name} · {a.contract === 'MAS' ? 'Managed AI Services' : 'Managed AI Agents'} · {a.hosting} · {a.orch} · <span className="mono">{a.ver}</span></>}
        actions={<><StPill s={a.status} /><ToastBtn msg={`${a.short} paused · new runs queued`}>Pause</ToastBtn><button className="btn" onClick={() => go(['ops', 'rel', null, 'rollback'])}>Rollback</button>{inc && <button className="btn primary" onClick={() => go(['ops', 'incident', inc.id])}>Open {inc.id}</button>}</>} />
      <AlsoSeen agentId={a.id} except="ops" />
      <Kpis>
        <Kpi k="Runs / 24h" v={fmt(a.runs24)} /><Kpi k="Success" v={a.success + '%'} /><Kpi k="Autonomous" v={a.autonomy + '%'} />
        <Kpi k="Exception rate" v={a.ex + '%'} /><Kpi k="p95 duration" v={a.p95} /><Kpi k="SLA (30d)" v={a.sla + '%'} />
        <Kpi k="Cost / 24h" v={'$' + a.cost24} /><Kpi k="HITL open" v={db.hitl.filter(h => h.agent === a.id).length} />
      </Kpis>
      <div className="grid g2">
        <Card head={<h2>Runs per hour</h2>}><LineChart series={[{ v: runs, c: 'var(--run)' }]} labels={hours} yfmt={v => String(Math.round(v))} /></Card>
        <Card head={<h2>Exception rate</h2>}><LineChart series={[{ v: ex, c: a.status === 'ok' ? 'var(--ok)' : 'var(--crit)' }]} labels={hours} yfmt={v => v.toFixed(1) + '%'} refLine={{ v: 4, l: 'Alert 4%' }} /></Card>
      </div>
      <Card head={<><h2>Workflow health by step</h2><span className="faint">Last 24h</span></>}>
        {a.steps
          ? <Flow steps={a.steps} pcts={a.steps.map((_, i) => ' · ' + (i === 0 ? '100%' : (100 - (a.ex * i) / a.steps!.length).toFixed(1) + '%'))} />
          : <div className="faint">Step telemetry available in agent run explorer.</div>}
      </Card>
    </>
  );
}
