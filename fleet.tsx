'use client';

import { fmt } from '@/lib/format';
import { hours, series } from '@/lib/series';
import type { Agent } from '@/lib/types';
import { LineChart } from '@/components/charts';
import { useLookup, usePlatform, type OpsFilters } from '@/components/platform-provider';
import { Card, Kpi, Kpis, PageHeader, Pill, StPill, Table, useGo, type To } from '@/components/ui';

export function useHitlCount() {
  const { db } = usePlatform();
  return db.hitl.length + db.hitlOffset;
}

export function FilterBar() {
  const { db, filters: f, setFilter } = usePlatform();
  const Sel = ({ k, lbl, opts }: { k: keyof OpsFilters; lbl: string; opts: [string, string][] }) => (
    <label className="fsel"><span>{lbl}</span>
      <select id={`f-${k}`} value={f[k]} onChange={e => setFilter(k, e.target.value)}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
  return (
    <div className="filters">
      <Sel k="cust" lbl="Customer" opts={[['all', 'All'], ...db.customers.map(c => [c.id, c.name] as [string, string])]} />
      <input className="fin" id="f-q" placeholder="Agent name…" value={f.q} onChange={e => setFilter('q', e.target.value)} style={{ width: 150 }} />
      <Sel k="env" lbl="Environment" opts={[['all', 'All'], ['Production', 'Production'], ['UAT', 'UAT']]} />
      <Sel k="status" lbl="Status" opts={[['all', 'All'], ['ok', 'Healthy'], ['warn', 'Warning'], ['crit', 'Critical']]} />
      <Sel k="host" lbl="Deployment" opts={[['all', 'All'], ['Beecker-hosted', 'Beecker-hosted'], ['Customer-hosted', 'Customer-hosted']]} />
      <Sel k="period" lbl="Period" opts={[['1h', 'Last hour'], ['24h', 'Last 24h'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days']]} />
    </div>
  );
}

const ORDER = { crit: 0, warn: 1, ok: 2 };
export function useFilteredAgents(): Agent[] {
  const { db, filters: f } = usePlatform();
  return db.agents
    .filter(a => (f.cust === 'all' || a.cust === f.cust) && (f.env === 'all' || a.env === f.env) && (f.status === 'all' || a.status === f.status)
      && (f.host === 'all' || a.hosting === f.host) && (!f.q || a.name.toLowerCase().includes(f.q.toLowerCase())))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status]);
}

export function AgentTable({ list }: { list: Agent[] }) {
  const { filters } = usePlatform();
  const { cust } = useLookup();
  const go = useGo();
  const mult = { '1h': 1 / 24, '24h': 1, '7d': 7, '30d': 30 }[filters.period] ?? 1;
  return (
    <Table cols={['Agent', 'Customer', 'Env', 'Status', 'Runs', 'Success', 'Autonomy', 'Exc. rate', 'p95', 'SLA', 'Cost', 'Version']}
      empty={list.length ? null : <div className="empty">No agents match these filters.</div>}>
      {list.map(a => (
        <tr key={a.id} className="click" onClick={() => go(['ops', 'agent', a.id])}>
          <td className="nm">{a.name}<div className="s2">{a.orch} · {a.hosting}</div></td>
          <td>{cust(a.cust)?.name}</td>
          <td>{a.env === 'UAT' ? <Pill cls="warn">UAT</Pill> : 'Prod'}</td>
          <td><StPill s={a.status} /></td>
          <td className="r num">{fmt(Math.round(a.runs24 * mult))}</td>
          <td className="r num">{a.success}%</td>
          <td className="r num">{a.autonomy}%</td>
          <td className="r num" style={{ color: a.ex > 5 ? 'var(--crit)' : a.ex > 3 ? 'var(--warn)' : 'inherit' }}>{a.ex}%</td>
          <td className="r num">{a.p95}</td>
          <td className="r num">{a.sla}%</td>
          <td className="r num">${fmt(Math.round(a.cost24 * mult))}</td>
          <td className="mono">{a.ver}</td>
        </tr>
      ))}
    </Table>
  );
}

export function OpsHome() {
  const { db, setFilter } = usePlatform();
  const { agent, cust } = useLookup();
  const go = useGo();
  const hitlCount = useHitlCount();
  const list = useFilteredAgents();
  const runs = series(7, 24, 9800, 900).map((v, i) => v + Math.sin(i / 3.8) * 2600 + 2600);
  const oldest = [...db.hitl].sort((a, b) => b.wait - a.wait)[0];
  const needs: { sev: string; t: string; d: string; to: To; b: string }[] = [
    ...db.incidents.slice(0, 3).map(x => ({ sev: x.sev, t: `${agent(x.agent)?.short} · ${cust(x.cust)?.name}`, d: `${x.title} · ${x.detected}`, to: ['ops', 'incident', x.id] as To, b: x.id })),
    { sev: 'hum', t: `${hitlCount} HITL cases waiting`, d: `Oldest: ${oldest?.ref ?? '—'} · ${oldest?.wait ?? 0} min`, to: ['ops', 'hitl'], b: 'Queue' },
    { sev: 'warn', t: '6 SLA risks in next 4 hours', d: 'FEMSA Collections (2), Heineken Claims (2), Grupo Lala Payroll, Celestica Quote', to: ['ops', 'health', null, 'sla'], b: 'SLA' },
  ];
  return (
    <>
      <PageHeader crumbs={['Agentic Control Tower', 'All customers']} title="Mission Control" ly="r"
        sub="Every production agent Beecker operates, across Managed AI Agents and Managed AI Services customers."
        actions={<><span className="faint num" style={{ fontSize: 12 }}>Updated 14:32 CT</span><button className="btn" onClick={() => go(['ops', 'hitl'])}>Open HITL queue</button></>} />
      <Kpis>
        <Kpi k="Production agents" v="312" onClick={() => go(['ops', 'fleet'])} d={<><span className="up">287 healthy</span> · <span style={{ color: 'var(--warn)' }}>18 warning</span> · <span className="dn">7 critical</span></>} />
        <Kpi k="HITL cases" v={hitlCount} d="Median wait 9 min" onClick={() => go(['ops', 'hitl'])} />
        <Kpi k="SLA risks" v="6" d="Next 4 hours" onClick={() => go(['ops', 'health', null, 'sla'])} />
        <Kpi k="Active incidents" v={String(db.incidents.length + 13)} d="3 high severity" onClick={() => go(['ops', 'health', null, 'alerts'])} />
        <Kpi k="Infra cost today" v="$18,412" d={<><span className="up">−4.2%</span> vs 7-day avg</>} onClick={() => go(['ops', 'perf', null, 'cost'])} />
        <Kpi k="Runs / 24h" v="247,930" d="89.4% autonomous" />
      </Kpis>
      <div className="grid g-main">
        <Card tight head={<><h2>Needs intervention</h2><span className="faint">Ordered by customer impact</span></>}>
          <div className="rows">
            {needs.map(n => (
              <div key={n.b} className="row click" onClick={() => go(n.to)}>
                <span className={`sev ${n.sev}`} /><div className="grow"><div className="t">{n.t}</div><div className="d">{n.d}</div></div><span className="chip mono">{n.b}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card tight head={<><h2>Customer fleet</h2><div className="r"><button className="btn sm ghost" onClick={() => go(['ops', 'customers'])}>All 28 →</button></div></>}>
          <div className="rows">
            {db.customers.map(c => {
              const ok = c.prod - c.warn - c.crit;
              return (
                <div key={c.id} className="row click" style={{ padding: '9px 14px' }} onClick={() => { setFilter('cust', c.id); go(['ops', 'fleet']); }}>
                  <div className="grow"><div className="t">{c.name}</div><div className="d">{c.prod} agents · {c.contracts.map(x => (x === 'MAS' ? 'Services' : 'Agents')).join(' + ')}</div></div>
                  <div style={{ width: 90 }}>
                    <div className="meter" style={{ display: 'flex' }}>
                      <i style={{ width: `${(ok / c.prod) * 100}%`, background: 'var(--ok)', borderRadius: 0 }} />
                      <i style={{ width: `${(c.warn / c.prod) * 100}%`, background: 'var(--warn)', borderRadius: 0 }} />
                      <i style={{ width: `${(c.crit / c.prod) * 100}%`, background: 'var(--crit)', borderRadius: 0 }} />
                    </div>
                  </div>
                  <span className={`dot ${c.crit ? 'crit' : c.warn ? 'warn' : 'ok'}`} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <Card tight head={<><h2>Agent health</h2><span className="faint">{list.length} shown of 312</span><div className="r"><FilterBar /></div></>}>
        <AgentTable list={list} />
      </Card>
      <div className="grid g2">
        <Card head={<><h2>Runs per hour</h2><span className="faint">All customers · last 24h</span></>}>
          <LineChart series={[{ v: runs, c: 'var(--run)' }]} labels={hours} yfmt={v => (v / 1000).toFixed(0) + 'K'} />
        </Card>
        <Card head={<><h2>Autonomy vs human review</h2><span className="faint">Fleet · last 24h</span></>}>
          <LineChart series={[{ v: series(3, 24, 89, 1.2).map(v => Math.min(96, v)), c: 'var(--ok)' }, { v: series(5, 24, 10.6, 1.1), c: 'var(--hum)' }]} labels={hours} yfmt={v => Math.round(v) + '%'} ymax={100} area={false} />
          <div className="legend" style={{ marginTop: 6 }}><span><i style={{ background: 'var(--ok)' }} />Autonomous</span><span><i style={{ background: 'var(--hum)' }} />Human-in-the-loop</span></div>
        </Card>
      </div>
    </>
  );
}

export function OpsFleet() {
  const list = useFilteredAgents();
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Fleet']} title="Agents" ly="r" sub="Filter the fleet by customer, environment, status and where the agent is hosted." />
      <div className="card"><div className="card-h"><FilterBar /></div><AgentTable list={list} /></div>
    </>
  );
}

export function OpsCustomers() {
  const { db, setFilter } = usePlatform();
  const go = useGo();
  const o = db.fleetOther;
  return (
    <>
      <PageHeader crumbs={[['Control Tower', ['ops', 'home']], 'Fleet']} title="Customers" ly="r"
        sub="28 customers. Managed AI Agents customers buy specific production workflows; Managed AI Services customers buy an ongoing portfolio delivered by forward-deployed teams." />
      <Card tight>
        <Table cols={['Customer', 'Contract', 'Agents', 'Health', 'HITL', 'SLA', 'Incidents', 'Cost / day', 'Runs / 24h']}>
          {db.customers.map(c => (
            <tr key={c.id} className="click" onClick={() => { setFilter('cust', c.id); go(['ops', 'fleet']); }}>
              <td className="nm">{c.name}<div className="s2">{c.ind} · {c.hq}</div></td>
              <td><div className="chips">{c.contracts.map(x => <span key={x} className="chip">{x === 'MAS' ? 'Managed AI Services' : 'Managed AI Agents'}</span>)}</div></td>
              <td className="r num">{c.prod}</td>
              <td>{c.crit ? <Pill cls="crit">{c.crit} critical</Pill> : c.warn ? <Pill cls="warn">{c.warn} warning</Pill> : <Pill cls="ok">All healthy</Pill>}</td>
              <td className="r num">{c.hitl}</td><td className="r num">{c.sla}%</td><td className="r num">{c.incidents}</td>
              <td className="r num">${fmt(c.cost)}</td><td className="r num">{fmt(c.runs24)}</td>
            </tr>
          ))}
          <tr>
            <td className="faint">+ {o.customers} more customers</td><td /><td className="r num faint">{o.prod}</td><td />
            <td className="r num faint">{o.hitl}</td><td /><td className="r num faint">{o.incidents}</td><td className="r num faint">${fmt(o.cost)}</td><td />
          </tr>
        </Table>
      </Card>
    </>
  );
}
