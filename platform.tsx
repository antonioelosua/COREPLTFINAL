'use client';

import { HOME, ROLES, WS, WS_IDS } from '@/lib/workspaces';
import type { RoleId, WorkspaceId } from '@/lib/types';
import { LineChart } from '@/components/charts';
import { useLoc, usePlatform } from '@/components/platform-provider';
import { WsIcon } from '@/components/shell';
import { Card, Note, PageHeader } from '@/components/ui';

const Lvl = ({ n, c }: { n: number; c: string }) => (
  <span className="lvl">{[1, 2, 3].map(i => <i key={i} style={{ background: i <= n ? c : 'var(--surface-3)' }} />)}</span>
);

function Layer({ cls, name, q, items, stat, sl }: { cls: string; name: string; q: string; items: string[]; stat: string; sl: string }) {
  return (
    <div className={`arch-layer ${cls}`}>
      <div><div className="ln">{name}</div><div className="lq">{q}</div></div>
      <div className="chips">{items.map(x => <span key={x} className="chip">{x}</span>)}</div>
      <div className="stat"><b className="num">{stat}</b>{sl}</div>
    </div>
  );
}

const OBJECTS: [string, string, [string, string][]][] = [
  ['Understand', 'und', [['Customer', 'FOCN'], ['System', 'FO'], ['Entity', 'F'], ['Process', 'FC'], ['Action', 'F'], ['Rule', 'FC'], ['Permission', 'FO'], ['Knowledge', 'FN']]],
  ['Build', 'bld', [['Initiative', 'FCN'], ['Opportunity', 'N'], ['Agent', 'FOCN'], ['Workflow', 'FOC'], ['Evaluation', 'FO'], ['Version', 'FO'], ['Deployment', 'FOC']]],
  ['Run', 'run', [['Run', 'FOC'], ['Exception', 'FOC'], ['Approval', 'FOC'], ['Incident', 'FOC'], ['Business KPI', 'FOCN']]],
];
const WS_KEY: Record<string, WorkspaceId> = { F: 'fde', O: 'ops', C: 'cust', N: 'finn' };

export function PlatformArchitecture() {
  const { role, go, canOpen } = usePlatform();
  const loc = useLoc();
  const r = ROLES[role];
  return (
    <>
      <PageHeader crumbs={['Beecker Platform']} title="One Beecker Platform. Multiple role-specific workspaces." ly="ubr"
        sub="A shared Understand → Build → Run architecture underneath every experience. FDEs, the ROC, customers and FINN work on the same customers, agents, runs and approvals, each through a workspace designed for their job." />
      <div className="arch">
        <div className="arch-exp">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="tag" style={{ fontWeight: 600, color: 'var(--fg-2)' }}>Experience layer</div>
            <span className="faint">Who interacts with the system. Click to open a workspace.</span>
          </div>
          <div className="arch-tiles">
            {WS_IDS.map(k => {
              const ok = canOpen(k);
              return (
                <button key={k} className={`arch-tile ${k === loc.ws ? 'on' : ''}`} disabled={!ok} style={ok ? undefined : { opacity: 0.55, cursor: 'not-allowed' }} onClick={() => go(k, HOME[k])}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><WsIcon ws={k} /><b>{WS[k].name}</b></div>
                  <div className="muted" style={{ fontSize: 12 }}>{WS[k].desc}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{WS[k].who}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="arch-arrow">shared data and services</div>
        <Layer cls="run" name="RUN" q="Is the work actually being performed correctly?" items={['Execution', 'HITL', 'Approvals', 'Observability', 'Audit', 'SLA', 'Support', 'Evaluations', 'Releases', 'Cost', 'Business KPIs']} stat="1.9M" sl="runs / month" />
        <Layer cls="bld" name="BUILD" q="How do we make an AI agent perform the work?" items={['Agents', 'Workflows', 'Tools', 'Prompts', 'Models', 'Tests', 'Versions', 'Deployment', 'GitHub · Azure · UiPath · LangGraph links']} stat="418" sl="agent versions shipped" />
        <Layer cls="und" name="UNDERSTAND" q="What does the business mean and how does it work?" items={['Systems', 'Entities', 'Relationships', 'Processes', 'Knowledge', 'Rules', 'Actions', 'Permissions']} stat="2,140" sl="modeled elements · 28 customers" />
      </div>

      <div className="grid g2">
        <Card head={<><h2>Commercial offerings, same architecture</h2><span className="faint">Different emphasis, not different stacks</span></>}>
          <div className="tw">
            <table className="tbl matrix">
              <thead><tr><th /><th>Understand</th><th>Build</th><th>Run</th></tr></thead>
              <tbody>
                {([['Managed AI Services', 'Portfolio of initiatives delivered by FDE teams', 3, 3, 2, 'Medium'], ['Managed AI Agents', 'Specific production workflows, operated', 2, 2, 3, 'High'], ['AI Professional Services', 'One-time projects', 3, 3, 1, 'Low / handoff']] as [string, string, number, number, number, string][]).map(([n, d, u, b, rr, rl]) => (
                  <tr key={n}>
                    <td><div className="nm">{n}</div><div className="s2">{d}</div></td>
                    <td><Lvl n={u} c="var(--und)" /><div className="s2">{u === 3 ? 'High' : 'Medium'}</div></td>
                    <td><Lvl n={b} c="var(--bld)" /><div className="s2">{b === 3 ? 'High' : 'Medium'}</div></td>
                    <td><Lvl n={rr} c="var(--run)" /><div className="s2">{rl}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid g2" style={{ marginTop: 12, gap: 10 }}>
            <Note><span><b style={{ color: 'var(--fg)' }}>Services:</b> Understand, discover, prioritize, build, deploy, govern, improve.</span></Note>
            <Note><span><b style={{ color: 'var(--fg)' }}>Agents:</b> Run, operate, monitor, evaluate, support, govern, improve.</span></Note>
          </div>
        </Card>
        <Card head={<><h2>Every deployment compounds</h2><span className="faint">Grupo Lala, in order of kickoff</span></>}>
          <LineChart series={[{ v: [0, 12, 34, 41, 52, 58, 61, 63, 68], c: 'var(--und)' }, { v: [100, 88, 75, 69, 56, 50, 50, 44, 38], c: 'var(--fg-3)', dash: true }]}
            labels={['Invoice', 'Payroll', 'Bank Rec', 'Cust MD', 'Expense', 'Vendor', 'Freight', 'Order Entry', 'Supplier Rec']} ymax={100} yfmt={v => Math.round(v) + '%'} />
          <div className="legend" style={{ marginTop: 6 }}><span><i style={{ background: 'var(--und)' }} />Capabilities reused at kickoff</span><span><i style={{ background: 'var(--fg-3)' }} />Build effort vs first agent</span></div>
        </Card>
      </div>

      <Card head={<h2>From conversation to production to expansion</h2>}>
        <div className="journey">
          {([['FINN', 'Sales Intelligence', 'finn'], ['Discovery', 'FDE Workbench', 'fde'], ['AI Initiative', 'Shared object', 'fde'], ['Understand', 'Operational map', 'fde'], ['Build', 'FDE Workbench', 'fde'], ['Deploy', 'UAT + releases', 'fde'], ['Operate', 'Agentic Control Tower', 'ops'], ['Value', 'Customer Portal', 'cust'], ['Expand', 'FINN + FDE', 'finn']] as [string, string, WorkspaceId][]).map(([n, w, k]) => (
            <div key={n} className="jstep" style={{ borderTop: `3px solid ${WS[k].fg === '#fff' ? WS[k].bg : WS[k].fg}` }}><div className="n">{n}</div><div className="w">{w}</div></div>
          ))}
        </div>
      </Card>

      <Card head={<><h2>Same agent, three experiences</h2><span className="faint">Invoice Processing Agent · Grupo Lala</span></>}>
        <div className="grid g3">
          {([['fde', 'FDE sees', 'Workflow · rules · actions · permissions · evaluations · versions', 'workflow'], ['ops', 'Control Tower sees', 'Runs · errors · SLA · incidents · HITL · cost', null], ['cust', 'Customer sees', 'Health · transactions · autonomy · business value · approvals', null]] as [WorkspaceId, string, string, string | null][]).map(([k, t, d, tab]) => (
            <div key={k} className="card" style={{ padding: 14, borderTop: `3px solid ${WS[k].fg === '#fff' ? WS[k].bg : WS[k].fg}` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><WsIcon ws={k} size={24} /><b>{t}</b></div>
              <div className="muted" style={{ margin: '8px 0 12px' }}>{d}</div>
              {canOpen(k) ? <button className="btn sm" onClick={() => go(k, 'agent', 'invoice', tab)}>Open in {WS[k].name}</button> : <span className="faint">Locked for {r.n}</span>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid g2">
        <Card head={<><h2>Shared data model</h2><span className="faint">Which workspaces read each object</span></>}>
          {OBJECTS.map(([L, c, list]) => (
            <div key={L} style={{ marginBottom: 12 }}>
              <div className="tag" style={{ color: `var(--${c})`, marginBottom: 6 }}>{L}</div>
              <div className="chips">
                {list.map(([o, w]) => (
                  <span key={o} className="chip">{o}
                    <span style={{ display: 'inline-flex', gap: 2, marginLeft: 3 }}>
                      {w.split('').map(x => <i key={x} title={WS[WS_KEY[x]].name} style={{ width: 6, height: 6, borderRadius: '50%', background: WS[WS_KEY[x]].fg === '#fff' ? WS[WS_KEY[x]].bg : WS[WS_KEY[x]].fg }} />)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="legend">{WS_IDS.map(k => <span key={k}><i style={{ background: WS[k].fg === '#fff' ? WS[k].bg : WS[k].fg, borderRadius: '50%' }} />{WS[k].name}</span>)}</div>
        </Card>
        <Card head={<><h2>Role-based access</h2><span className="faint">Switch role from the top-right menu</span></>}>
          <div className="tw">
            <table className="tbl">
              <thead><tr><th>Role</th>{WS_IDS.map(k => <th key={k}>{WS[k].ico}</th>)}<th>Scope</th></tr></thead>
              <tbody>
                {(Object.keys(ROLES) as RoleId[]).map(k => (
                  <tr key={k} className={k === role ? 'hl' : ''}>
                    <td className="nm">{ROLES[k].n}</td>
                    {WS_IDS.map(w => <td key={w}>{ROLES[k].ws.includes(w) ? <span style={{ color: 'var(--ok)' }}>●</span> : <span className="faint">—</span>}</td>)}
                    <td className="s2">{ROLES[k].d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
