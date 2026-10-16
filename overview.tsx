'use client';

import { STAGES, STAGE_COLOR } from '@/lib/constants';
import { fmt, money } from '@/lib/format';
import { series } from '@/lib/series';
import type { Initiative } from '@/lib/types';
import { LineChart, Spark } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { Avatar, Card, Dot, Meter, PageHeader, PersonChip, Pill, ReadinessCell, StagePill, Table, useGo, type To } from '@/components/ui';

/** Where an initiative opens: discovery for early stages, the build view once an agent exists. */
export function iniTo(i: Initiative): To {
  if (['Discovery', 'Business Case'].includes(i.stage) || !i.agent) return ['fde', 'discovery', i.id];
  return ['fde', 'agent', i.agent];
}

export function FdeHome() {
  const { db, setModal } = usePlatform();
  const { ini, agent, person } = useLookup();
  const go = useGo();
  const counts = STAGES.map(s => db.initiatives.filter(i => i.stage === s).length);
  const total = db.initiatives.length;
  const totalVal = db.initiatives.reduce((a, i) => a + i.value, 0);
  const finnSent = db.initiatives.some(i => i.fromFinn);
  const active = ['invoice', 'vendor', 'payroll', 'collections', 'suprec', 'orderentry'];
  if (finnSent) active.unshift('invexc');

  const next: [string, string, string, To][] = [
    ...(finnSent ? [['info', 'New from FINN: Invoice Exception Agent', 'Valeria Núñez’s discovery call created this initiative. Review extracted context and confirm reuse.', ['fde', 'discovery', 'invexc']] as [string, string, string, To]] : []),
    ['warn', 'Vendor Onboarding Agent · 4 failing tests', 'Duplicate check fails on CLABE normalization. Blocks UAT entry on Oct 28.', ['fde', 'agent', 'vendor', 'tests']],
    ['crit', 'Payroll Exception Agent · incident from ROC', 'Exception rate 6.4%. ROC created an improvement item for retry on SAP HCM timeouts.', ['fde', 'backlog']],
    ['info', 'Supplier Reconciliation · business case sign-off', '68% reusable. Laura Méndez to approve before build kickoff.', ['fde', 'discovery', 'suprec']],
  ];

  return (
    <>
      <PageHeader crumbs={['FDE Workbench', 'Grupo Lala']} title="Grupo Lala — Delivery Workspace" ly="ubr"
        sub="Managed AI Services engagement since Feb 2025. Beecker discovers, builds, deploys and improves a portfolio of AI initiatives with Grupo Lala’s Shared Services teams."
        actions={<><button className="btn" onClick={() => go(['fde', 'map'])}>Operational map</button><button className="btn primary" onClick={() => go(['fde', 'pipeline'])}>Open pipeline</button></>} />

      <div className="grid g-main">
        <Card head={<><h2>AI Portfolio</h2><span className="faint">{total} initiatives · {money(totalVal)} expected annual value</span><div className="r"><button className="btn sm ghost" onClick={() => go(['fde', 'pipeline'])}>Pipeline →</button></div></>}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', marginBottom: 14, flexWrap: 'wrap' }}>
            <div><div className="big">{total}</div><div className="faint">total initiatives</div></div>
            {STAGES.map((s, i) => (
              <div key={s}>
                <div style={{ fontSize: 20, fontWeight: 600 }} className="num">{counts[i]}</div>
                <div className="faint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><i style={{ width: 8, height: 8, borderRadius: 2, background: STAGE_COLOR[s], display: 'inline-block' }} />{s}</div>
              </div>
            ))}
          </div>
          <div className="stagebar">
            {STAGES.map((s, i) => counts[i] ? <div key={s} style={{ flex: counts[i], background: STAGE_COLOR[s] }} title={s} onClick={() => go(['fde', 'pipeline'])}>{counts[i]}</div> : null)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}><span>Discover · Understand</span><span>Build</span><span>Run · Improve</span></div>
          <div className="hr" style={{ margin: '16px 0 10px' }} />
          <div className="tag" style={{ marginBottom: 8 }}>Expected annual value by stage</div>
          {STAGES.map(s => {
            const v = db.initiatives.filter(i => i.stage === s).reduce((a, i) => a + i.value, 0);
            return <div key={s} className="score" style={{ gridTemplateColumns: '110px 1fr 60px' }}><span>{s}</span><Meter pct={v / 6} color={STAGE_COLOR[s]} /><b className="num" style={{ textAlign: 'right' }}>{money(v)}</b></div>;
          })}
        </Card>
        <Card head={<><h2>What to build next</h2><span className="faint">{next.length} items</span></>}>
          <div className="rows">
            {next.map(n => (
              <div key={n[1]} className="row click" style={{ padding: '10px 0' }} onClick={() => go(n[3])}>
                <span className={`sev ${n[0]}`} /><div className="grow"><div className="t">{n[1]}</div><div className="d">{n[2]}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card tight head={<><h2>Active initiatives</h2><span className="faint">Outcomes and delivery, not hours</span><div className="r"><button className="btn sm" onClick={() => go(['fde', 'pipeline'])}>View all {total}</button><button className="btn sm" onClick={() => setModal({ kind: 'newini' })}>New initiative</button></div></>}>
        <Table cols={['Initiative', 'Stage', 'Business function', 'Beecker lead', 'Customer sponsor', 'Target go-live', 'Value / yr', 'Technical readiness', 'Reuse']}>
          {active.map(id => ini(id)).filter((i): i is Initiative => !!i).map(i => (
            <tr key={i.id} className={`click ${i.fromFinn ? 'hl' : ''}`} onClick={() => go(iniTo(i))}>
              <td><div className="nm">{i.name}</div>{i.fromFinn && <div className="s2">Created by FINN · today</div>}</td>
              <td><StagePill stage={i.stage} /></td>
              <td>{i.fn}</td>
              <td><PersonChip id={i.lead} /></td>
              <td>{person(i.sponsor).n}<div className="s2">{person(i.sponsor).r}</div></td>
              <td className="num">{i.golive}</td>
              <td className="r num">{money(i.value)}</td>
              <td><ReadinessCell ready={i.ready} /></td>
              <td className="r num"><b>{i.reuse}%</b></td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="grid g3">
        <Card head={<><h2>Beecker team</h2><span className="faint">Forward-deployed at Grupo Lala</span></>}>
          <div className="rows">
            {['mariana', 'diego', 'sofia', 'luis'].map(p => (
              <div key={p} className="row" style={{ padding: '8px 0' }}>
                <Avatar id={p} size={30} />
                <div className="grow"><div className="t">{person(p).n}</div><div className="d">{person(p).r}</div></div>
                <span className="faint">{db.initiatives.filter(i => i.lead === p && i.stage !== 'Production').length || '—'} active</span>
              </div>
            ))}
          </div>
        </Card>
        <Card head={<h2>Each deployment makes the next faster</h2>}>
          <LineChart series={[{ v: [0, 12, 34, 41, 52, 58, 61, 63, 68], c: 'var(--bld)' }]} labels={['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9']} h={160} w={420} yfmt={v => Math.round(v) + '%'} ymax={100} />
          <div style={{ display: 'flex', gap: 18, marginTop: 6, fontSize: 12 }}>
            <span><b className="num">0% → 68%</b> <span className="faint">reuse at kickoff</span></span>
            <span><b className="num">16 → 6 wks</b> <span className="faint">to production</span></span>
          </div>
        </Card>
        <Card head={<><h2>In production</h2><span className="faint">Operated by Beecker ROC</span></>}>
          <div className="rows">
            {db.initiatives.filter(i => i.stage === 'Production').map(i => {
              const a = agent(i.agent);
              if (!a) return null;
              return (
                <div key={i.id} className="row click" style={{ padding: '8px 0' }} onClick={() => go(['fde', 'prodhealth'])}>
                  <Dot s={a.status} />
                  <div className="grow"><div className="t">{a.name}</div><div className="d num">{fmt(a.runs24)} runs/24h · {a.autonomy}% autonomous</div></div>
                  <Spark v={series(a.runs24, 14, a.ex, 0.8, a.status === 'warn' ? 0.3 : 0)} c={a.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} w={70} h={22} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

