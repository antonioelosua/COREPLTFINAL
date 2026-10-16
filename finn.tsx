'use client';

import type { ReactNode } from 'react';
import { usePlatform } from '@/components/platform-provider';
import { Card, Check, Kpi, Kpis, Meter, Note, PageHeader, Pill, SimpleTable, Table, useGo, type To } from '@/components/ui';

export function FinnToday() {
  const { db } = usePlatform();
  const go = useGo();
  const recs: [string, string, To][] = [
    ['Create AI initiative for Grupo Lala AP exceptions', 'Discovery is complete enough (82). Hand off to the delivery team.', ['finn', 'meeting', 'lala-ap']],
    ['Ask FEMSA who owns budget', 'Economic buyer unknown after 2 meetings.', ['finn', 'coaching']],
    ['Reuse Celestica Order Entry pattern', 'Lala Order Entry discovery matches 64%.', ['finn', 'usecases']],
  ];
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Today" ly="ur" sub="Good afternoon, Valeria. FINN joined 1 meeting this morning and prepared your next steps."
        actions={<span className="pill info nodot">FINN runs on Beecker Platform</span>} />
      <Kpis>
        <Kpi k="Upcoming meetings" v="3" onClick={() => go(['finn', 'meetings'])} />
        <Kpi k="Proposals due" v="2" d="Celestica Fri · Lala draft" onClick={() => go(['finn', 'proposals'])} />
        <Kpi k="PDD awaiting review" v="1" d="Grupo Lala AP" onClick={() => go(['finn', 'pdds'])} />
        <Kpi k="Follow-ups" v="4" />
        <Kpi k="Need discovery" v="2" d="Petco · Bimbo" onClick={() => go(['finn', 'opps'])} />
      </Kpis>
      <div className="grid g-main">
        <Card tight head={<h2>Recent meetings</h2>}>
          <div className="rows">
            {db.meetings.map(m => (
              <div key={m.id} className="row click" style={{ alignItems: 'flex-start' }} onClick={() => go(['finn', 'meeting', m.id])}>
                <div className="grow">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><span className="t">{m.acct} — {m.title}</span><span className="faint">{m.when}</span></div>
                  <div className="d" style={{ marginTop: 4 }}>{m.summary}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {m.ucs.map(u => <span key={u} className="chip">{u}</span>)}
                    <span className="chip">Next: {m.next[0]}</span><span className="chip">Proposal: {m.proposal}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', flex: 'none' }}>
                  <div className="big" style={{ fontSize: 22, color: m.score > 75 ? 'var(--ok)' : m.score > 65 ? 'var(--warn)' : 'var(--crit)' }}>{m.score}</div>
                  <div className="faint" style={{ fontSize: 11 }}>Discovery<br />score</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<h2>Upcoming</h2>}>
            <div className="rows">
              {db.finnUpcoming.map(u => (
                <div key={u[0]} className="row" style={{ padding: '8px 0' }}>
                  <span className="mono faint" style={{ width: 40 }}>{u[0]}</span>
                  <div className="grow"><div className="t">{u[1]}</div><div className="d">{u[2]}</div></div>
                  <span className="pill info nodot">FINN joins</span>
                </div>
              ))}
            </div>
          </Card>
          <Card head={<h2>FINN recommends</h2>}>
            <div className="rows">
              {recs.map(r => <div key={r[0]} className="row click" style={{ padding: '9px 0' }} onClick={() => go(r[2])}><span className="sev info" /><div className="grow"><div className="t">{r[0]}</div><div className="d">{r[1]}</div></div></div>)}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function FinnMeetings() {
  const { db } = usePlatform();
  const go = useGo();
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Meetings" ly="u" />
      <Card tight>
        <Table cols={['Meeting', 'When', 'Discovery score', 'Use cases', 'Proposal']}>
          {db.meetings.map(m => <tr key={m.id} className="click" onClick={() => go(['finn', 'meeting', m.id])}><td className="nm">{m.acct} — {m.title}</td><td>{m.when}</td><td className="r num">{m.score}</td><td>{m.ucs.join(', ')}</td><td>{m.proposal}</td></tr>)}
          {db.finnUpcoming.map(u => <tr key={u[0]}><td className="nm">{u[1]} — {u[2]}</td><td>Today · {u[0]}</td><td className="r faint">—</td><td className="faint">FINN will join</td><td /></tr>)}
        </Table>
      </Card>
    </>
  );
}

export function FinnMeeting({ param }: { param: string | null }) {
  const { db, canOpen, setModal } = usePlatform();
  const go = useGo();
  const m = db.meetings.find(x => x.id === (param || 'lala-ap')) ?? db.meetings[0];
  const lala = m.id === 'lala-ap';
  const sent = db.initiatives.some(i => i.fromFinn);
  const ctx: [string, string][] = lala
    ? [['Customer', 'Grupo Lala'], ['Function', 'Finance · Accounts Payable'], ['System', 'SAP S/4HANA (+ Coupa)'], ['Volume', '70K invoices/month'], ['Pain point', 'Manual exception handling (4 analysts)'], ['Sponsor', 'Laura Méndez · VP Shared Services'], ['Potential use case', 'Invoice Exception Agent — extends Invoice Processing Agent'], ['Estimated value', '$480K/yr (range $410K–$560K)'], ['Platform match', 'Invoice Processing Agent live · 74% reusable']]
    : [['Customer', m.acct], ['Use cases', m.ucs.join(', ')]];
  const sc: [string, number][] = [['Pain', 9], ['Volume / value', 9], ['Systems', 8], ['Sponsor', 8], ['Decision process', 6], ['Timeline', 7]];
  const transcript: [string, ReactNode][] = [
    ['Laura Méndez', <>We receive about <mark>70,000 invoices a month</mark>. The agent handles the clean ones well, but <mark>exceptions still go to four people</mark>.</>],
    ['Valeria Núñez', 'Which exceptions take the most time?'],
    ['Laura Méndez', <><mark>PO not found and price variance</mark>. And month-end, when we reconcile supplier statements by hand.</>],
    ['Héctor Villa', <>Most POs come from <mark>Coupa</mark>; sync to SAP runs overnight.</>],
    ['Laura Méndez', <>If we can cut exception handling in half, <mark>I can sponsor it this quarter</mark>.</>],
  ];
  const handoff = () => setModal({ kind: 'handoff', step: 0 });

  return (
    <>
      <PageHeader crumbs={[['FINN', ['finn', 'today']], ['Meetings', ['finn', 'meetings']], m.acct]} title={`${m.acct} — ${m.title}`} ly="u"
        sub={`${m.when} · Recorded and transcribed by FINN · 4 participants`}
        actions={lala ? (sent
          ? <button className="btn" disabled={!canOpen('fde')} onClick={() => go(['fde', 'discovery', 'invexc'])}>Initiative created ✓</button>
          : <button className="btn primary lg" onClick={handoff}>Create AI Initiative in Beecker Platform</button>) : undefined} />
      <div className="grid g-main-wide">
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<h2>Summary</h2>}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{m.summary}</p>
            <div className="tag" style={{ margin: '14px 0 6px' }}>Next steps</div>
            {m.next.map(n => <Check key={n} ok={false}><span>{n}</span></Check>)}
          </Card>
          <Card head={<><h2>Transcript highlights</h2><span className="faint">Spanish · auto-translated</span></>}>
            <div className="transcript">{transcript.map(([w, t], i) => <div key={i} className="ln"><span className="who">{w}</span><span>{t}</span></div>)}</div>
          </Card>
        </div>
        <div className="grid" style={{ alignContent: 'start' }}>
          <Card head={<><h2>Extracted context</h2><span className="faint">Linked to Beecker Platform</span></>}>
            <dl className="kv" style={{ gridTemplateColumns: '118px 1fr' }}>
              {ctx.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd style={{ fontWeight: 500 }}>{v}</dd></div>)}
            </dl>
            {lala && !sent && <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14, height: 36 }} onClick={handoff}>Create AI Initiative in Beecker Platform</button>}
          </Card>
          <Card head={<><h2>Discovery score</h2><span className="r big" style={{ fontSize: 20 }}>{m.score}</span></>}>
            {sc.map(([k, v]) => <div key={k} className="score"><span>{k}</span><Meter pct={v * 10} color={v >= 8 ? 'var(--ok)' : v >= 7 ? 'var(--accent)' : 'var(--warn)'} /><b className="num">{v}</b></div>)}
            <Note style={{ marginTop: 10 }}><b>Coaching:</b>&nbsp;Ask who signs above $250K. Decision process is the weakest area.</Note>
          </Card>
        </div>
      </div>
    </>
  );
}

export function FinnAccounts() {
  const { db } = usePlatform();
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Accounts" ly="ur" sub="FINN reads live platform data, so expansion conversations start from what is already running." />
      <Card tight>
        <Table cols={['Account', 'Industry', 'Live agents', 'Value delivered', 'Health', 'Open opportunities']}>
          {db.customers.map(c => (
            <tr key={c.id}><td className="nm">{c.name}</td><td>{c.ind}</td><td className="r num">{c.prod}</td><td className="num">{c.id === 'lala' ? '$742K/yr' : '—'}</td>
              <td>{c.crit ? <Pill cls="crit">Incident open</Pill> : c.warn ? <Pill cls="warn">Watch</Pill> : <Pill cls="ok">Healthy</Pill>}</td>
              <td className="num">{db.opps.filter(o => o[0] === c.name).length}</td></tr>
          ))}
          <tr><td className="nm">Bimbo</td><td>Food</td><td className="r num">0</td><td>—</td><td><Pill cls="nodot">Prospect</Pill></td><td>1</td></tr>
        </Table>
      </Card>
    </>
  );
}

export function FinnOpps() {
  const { db } = usePlatform();
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Opportunities" ly="u" />
      <Card tight>
        <Table cols={['Account', 'Opportunity', 'Stage', 'Amount', 'Offering', 'Close', 'Next step']}>
          {db.opps.map(o => <tr key={o[1]}><td className="nm">{o[0]}</td><td>{o[1]}</td><td><Pill cls="info">{o[2]}</Pill></td><td className="r num">{o[3]}</td><td><span className="chip">{o[4]}</span></td><td>{o[5]}</td><td>{o[6]}</td></tr>)}
        </Table>
      </Card>
    </>
  );
}

export function FinnUseCases() {
  const rows = [['Invoice Processing', 'Finance · AP', '14', '6', '62%', 'Lala, Heineken, Petco'], ['Order Entry', 'Order-to-Cash', '9', '7', '58%', 'Celestica'], ['Vendor Onboarding', 'Procurement', '7', '6', '61%', 'Petco, Lala (in build)'], ['Collections', 'Finance · AR', '6', '9', '47%', 'FEMSA, Lala (in build)'], ['Payroll Exceptions', 'HR', '4', '8', '44%', 'Lala'], ['Supplier Reconciliation', 'Finance · AP', '3', '6', '66%', 'Lala (business case)']];
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Use Cases" ly="ub" sub="Library of use cases Beecker has delivered. FINN matches new conversations to proven patterns and estimates reuse." />
      <Card tight>
        <Table cols={['Use case', 'Function', 'Deployments', 'Median weeks', 'Typical reuse', 'Related']}>
          {rows.map(r => <tr key={r[0]}><td className="nm">{r[0]}</td><td>{r[1]}</td><td className="r num">{r[2]}</td><td className="num">{r[3]}</td><td className="r num">{r[4]}</td><td>{r[5]}</td></tr>)}
        </Table>
      </Card>
    </>
  );
}

export function FinnProposals() {
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Proposals" ly="u" />
      <Card tight><SimpleTable def={{ cols: ['Proposal', 'Account', 'Offering', 'Generated from', 'Due', 'Status'], rows: [['AP Exception Expansion', 'Grupo Lala', 'Managed AI Services', 'Meeting today + platform data', 'Oct 22', 'info'], ['Order Entry EMEA', 'Celestica', 'Managed AI Agents', 'Meeting Oct 14', 'Fri', 'warn'], ['Claims Agent v2', 'Heineken México', 'Managed AI Agents', 'QBR + incident history', 'Sent', 'ok']] }} /></Card>
    </>
  );
}

export function FinnPdds() {
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Process Design Documents" ly="u" sub="FINN drafts PDDs from meetings. Once approved they become knowledge in the customer’s operational map." />
      <Card tight>
        <SimpleTable def={{ cols: ['PDD', 'Account', 'Process', 'Steps', 'Draft by', 'Status'], rows: [['AP Exception Handling v1', 'Grupo Lala', 'Procure-to-Pay', '18', 'FINN', 'warn'], ['Vendor Onboarding v2', 'Grupo Lala', 'Vendor Onboarding', '12', 'FINN + Diego Ramírez', 'ok'], ['Order Entry EMEA', 'Celestica', 'Order-to-Cash', '15', 'FINN', 'info']] }}
          labels={{ warn: <Pill cls="warn">Awaiting review</Pill>, ok: <Pill cls="ok">Approved</Pill>, info: <Pill cls="info">Drafting</Pill> }} />
      </Card>
    </>
  );
}

export function FinnCoaching() {
  return (
    <>
      <PageHeader crumbs={['FINN']} title="Coaching" ly="u" sub="Based on the last 30 recorded meetings." />
      <div className="grid g3">
        {[['Talk ratio', '38%', 'Target 30–40% · good'], ['Discovery score (avg)', '72', 'Up from 64 in August'], ['Next step agreed', '81%', 'of meetings end with a dated next step']].map(([k, v, d]) => (
          <Card key={k}><div className="faint">{k}</div><div className="big">{v}</div><div className="muted">{d}</div></Card>
        ))}
      </div>
      <Card head={<h2>Focus areas</h2>}>
        <div className="rows">
          {[['Decision process', 'Ask who approves above $250K and how procurement is involved.', 'FEMSA, Grupo Lala'], ['Quantify volume early', 'Meetings with volume captured in the first 15 minutes score 18 points higher.', 'Petco'], ['Bring production proof', 'Accounts with live agents convert 2.4× faster when live metrics are shown.', 'Celestica']].map(r => (
            <div key={r[0]} className="row" style={{ padding: '10px 0' }}><span className="sev info" /><div className="grow"><div className="t">{r[0]}</div><div className="d">{r[1]}</div></div><span className="chip">{r[2]}</span></div>
          ))}
        </div>
      </Card>
    </>
  );
}
