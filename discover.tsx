'use client';

import { STAGES, STAGE_COLOR } from '@/lib/constants';
import { money } from '@/lib/format';
import type { Discovery, Reuse } from '@/lib/types';
import { Ring } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { Avatar, Card, Check, Kpi, Kpis, Note, PageHeader, Pill, StagePill, Table, Tag, ToastBtn, useGo } from '@/components/ui';
import { iniTo } from './overview';

export function Pipeline() {
  const { db, setModal } = usePlatform();
  const go = useGo();
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Discover']} title="Opportunity Pipeline" ly="ub"
        sub="Every initiative at Grupo Lala, from first conversation to production. Cards created by FINN arrive in Discovery with context already attached."
        actions={<button className="btn primary" onClick={() => setModal({ kind: 'newini' })}>New initiative</button>} />
      <div className="kanban">
        {STAGES.map(s => {
          const list = db.initiatives.filter(i => i.stage === s);
          return (
            <div key={s} className="kcol">
              <div className="kcol-h"><i style={{ width: 9, height: 9, borderRadius: 2, background: STAGE_COLOR[s] }} />{s}<span className="c">{list.length}</span></div>
              {list.map(i => (
                <div key={i.id} className={`kcard ${i.fromFinn ? 'new' : ''}`} onClick={() => go(iniTo(i))}>
                  {i.fromFinn && <Pill cls="info">From FINN</Pill>}
                  <div className="t">{i.name}</div>
                  <div className="m"><span>{i.fn}</span><Avatar id={i.lead} size={20} /></div>
                  <div className="m"><span className="num">{money(i.value)}/yr</span><span className="num">Reuse {i.reuse}%</span></div>
                  {i.stage !== 'Production' && <div className="m"><span>Go-live</span><span>{i.golive}</span></div>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Field({ label, id, value, rows }: { label: string; id: string; value: string; rows?: number }) {
  return (
    <div className="fg">
      <label htmlFor={`d-${id}`}>{label}</label>
      {rows ? <textarea id={`d-${id}`} rows={rows} defaultValue={value} /> : <input id={`d-${id}`} defaultValue={value} />}
    </div>
  );
}

export function DiscoveryScreen({ param }: { param: string | null }) {
  const { db, actions, go: goRaw } = usePlatform();
  const { ini, person } = useLookup();
  const go = useGo();
  const i = ini(param || 'suprec') ?? ini('suprec')!;
  const d: Discovery = db.discovery[i.id] ?? {
    problem: `${i.name} — discovery notes pending.`, volume: '—', systems: ['SAP S/4HANA'], effort: '—', value: money(i.value) + '/year', sponsor: i.sponsor,
    readiness: i.ready, complexity: 'Medium', users: '', rules: '', pain: '', exceptions: '', feas: '', security: '', deps: '', source: 'Captured by ' + person(i.lead).n,
  };
  const R: Reuse = db.reuse[i.id] ?? { pct: i.reuse, weeks: 8, without: 14, have: [['SAP S/4HANA integration', '14 actions'], ['Approval matrix', 'v4']], need: ['Workflow', 'Rules', 'Exception logic'] };
  const sp = person(d.sponsor);
  const life: [string, string][] = ([
    ['FINN discovery', i.fromFinn ? 'done' : 'skip'], ['Discovery', 'now'], ['Business case', i.stage === 'Business Case' ? 'now' : ''],
    ['Build', ''], ['Deploy', ''], ['Operate', ''], ['Expand', ''],
  ] as [string, string][]).filter(x => x[1] !== 'skip');

  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], ['Discover', ['fde', 'pipeline']], i.name]} title={i.name} ly="u"
        sub={<><StagePill stage={i.stage} /> &nbsp;{i.fn} · Lead {person(i.lead).n} · {d.source}</>}
        actions={<>
          <ToastBtn msg={`Business case generated from discovery and reuse data · shared with ${sp.n}`}>Generate business case</ToastBtn>
          <button className="btn primary" onClick={() => { actions.moveToBuild(i.id); goRaw('fde', 'pipeline'); }}>Approve &amp; start build</button>
        </>} />
      {i.fromFinn && <Note cls="info"><b>Created by FINN</b>&nbsp;from the “Grupo Lala — AP Automation Discovery” meeting today. Context, volume and sponsor were extracted from the transcript and linked to the Procure-to-Pay map.</Note>}
      <Kpis>
        <Kpi k="Transaction volume" v={d.volume} />
        <Kpi k="Manual effort" v={d.effort} />
        <Kpi k="Estimated value" v={d.value} />
        <Kpi k="AI readiness" v={d.readiness} />
        <Kpi k="Complexity" v={d.complexity} />
        <Kpi k="Sponsor" v={<span style={{ fontSize: 15 }}>{sp.n}</span>} d={sp.r} />
      </Kpis>
      <div className="grid g-main-wide">
        <Card head={<><h2>Discovery capture</h2><span className="faint">Saved to the shared initiative record</span><div className="r"><ToastBtn className="btn sm" msg="Draft saved · visible to FINN, FDE team and Customer Portal (Initiatives)">Save</ToastBtn></div></>}>
          {/* key resets the uncontrolled fields when switching initiatives */}
          <div className="form" key={i.id}>
            <div className="fg"><label>Business problem</label><div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{d.problem}</div></div>
            <Field label="Process description" id="proc" value={d.problem} rows={3} />
            <div className="f2"><Field label="Users" id="users" value={d.users} /><Field label="Transaction volume" id="vol" value={d.volume} /></div>
            <div className="fg">
              <label>Systems</label>
              <div className="chips">
                {d.systems.map(s => <span key={s} className="chip click" onClick={() => go(['fde', 'catalog', null, 'systems'])}>{s} <span className="pill ok nodot" style={{ height: 16, fontSize: 10 }}>modeled</span></span>)}
                <span className="chip faint">+ Add system</span>
              </div>
            </div>
            <Field label="Business rules" id="rules" value={d.rules} rows={2} />
            <div className="f2"><Field label="Pain points" id="pain" value={d.pain} rows={2} /><Field label="Exceptions" id="exc" value={d.exceptions} rows={2} /></div>
            <div className="f3"><Field label="Manual effort" id="eff" value={d.effort} /><Field label="Expected value" id="val" value={d.value} /><Field label="Technical feasibility" id="feas" value={d.feas} /></div>
            <div className="f2"><Field label="Security constraints" id="sec" value={d.security} rows={2} /><Field label="Dependencies" id="deps" value={d.deps} rows={2} /></div>
          </div>
        </Card>
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<h2>Reusable capabilities detected</h2>}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Ring p={R.pct} c="var(--ok)" />
              <div><div className="faint">Estimated implementation</div><div className="big">{R.weeks} weeks</div><div className="faint">vs {R.without} weeks without reuse</div></div>
            </div>
            <div className="hr" />
            <Tag style={{ marginBottom: 4 }}>Already on the platform</Tag>
            {R.have.map(h => <Check key={h[0]} ok><div><div style={{ fontWeight: 500 }}>{h[0]}</div><div className="faint" style={{ fontSize: 11.5 }}>{h[1]}</div></div></Check>)}
            <Tag style={{ margin: '10px 0 4px' }}>Needs to be created</Tag>
            {R.need.map(h => <Check key={h} ok={false}><div style={{ fontWeight: 500 }}>{h}</div></Check>)}
          </Card>
          <Card head={<h2>Lifecycle</h2>}>
            <div className="rows">
              {life.map(([n, s]) => (
                <div key={n} className="row" style={{ padding: '6px 0' }}>
                  <span className={`dot ${s === 'done' ? 'ok' : s === 'now' ? 'info' : ''}`} />
                  <span className={`grow ${s ? '' : 'faint'}`}>{n}</span>
                  {s === 'now' && <Pill cls="info">Current</Pill>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function BusinessCases() {
  const { db } = usePlatform();
  const { person } = useLookup();
  const go = useGo();
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Discover']} title="Business Cases" sub="Value, effort and reuse for initiatives awaiting customer approval." ly="u" />
      <Card tight>
        <Table cols={['Initiative', 'Sponsor', 'Value / yr', 'Build cost', 'Payback', 'Reuse', 'Est. weeks', 'Status']}>
          {db.initiatives.filter(i => ['Business Case', 'Discovery'].includes(i.stage)).map(i => {
            const R = db.reuse[i.id];
            const wk = R ? R.weeks : Math.round(14 * (1 - i.reuse / 100) + 3);
            const cost = Math.round(wk * 11);
            return (
              <tr key={i.id} className="click" onClick={() => go(['fde', 'discovery', i.id])}>
                <td className="nm">{i.name}{i.fromFinn && <> <Pill cls="info">From FINN</Pill></>}</td>
                <td>{person(i.sponsor).n}</td>
                <td className="r num">{money(i.value)}</td>
                <td className="num">${cost}K</td>
                <td className="num">{((cost / i.value) * 12).toFixed(1)} months</td>
                <td className="r num">{i.reuse}%</td>
                <td className="num">{wk}</td>
                <td>{i.stage === 'Business Case' ? <Pill cls="warn">Awaiting sponsor</Pill> : <Pill cls="info">In discovery</Pill>}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
