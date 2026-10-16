'use client';

import type { ReactNode } from 'react';
import { fmt } from '@/lib/format';
import { series } from '@/lib/series';
import { BarChart, Spark } from '@/components/charts';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { Card, Check, PageHeader, PersonChip, Pill, StPill, Table, ToastBtn, UrlTabs, useGo } from '@/components/ui';

const DEPLOY_T: Record<string, string> = { envs: 'Environments', uat: 'User Acceptance Testing', releases: 'Releases' };

export function Deploy({ tab }: { tab: string | null }) {
  const { db } = usePlatform();
  const { agent, ini, person } = useLookup();
  const go = useGo();
  const t = tab && DEPLOY_T[tab] ? tab : 'envs';
  const lala = db.agents.filter(a => a.cust === 'lala');
  let b: ReactNode = null;

  if (t === 'envs') b = (
    <Card tight>
      <Table cols={['Agent', 'Development', 'UAT', 'Production', 'Hosting']}>
        {lala.map(a => {
          const p = a.env === 'Production', u = a.env === 'UAT';
          return (
            <tr key={a.id} className="click" onClick={() => go(['fde', 'agent', a.id])}>
              <td className="nm">{a.name}</td>
              <td className="mono">{p ? '—' : a.ver.replace(/-rc\d/, '-dev')}</td>
              <td className="mono">{u ? a.ver : '—'}</td>
              <td className="mono">{p ? a.ver : <span className="faint">not deployed</span>}</td>
              <td>{a.hosting}</td>
            </tr>
          );
        })}
      </Table>
    </Card>
  );

  if (t === 'uat') b = (
    <div className="grid g2">
      {['expense', 'freight'].map(id => {
        const a = agent(id)!, i = ini(id)!;
        const sp = person(i.sponsor);
        return (
          <Card key={id} head={<><h2>{a.name}</h2><Pill cls="warn">UAT</Pill><div className="r faint">Go-live {a.golive}</div></>}>
            <dl className="kv">
              <dt>Test cycle</dt><dd>Cycle 2 of 2</dd>
              <dt>Business testers</dt><dd>{sp.n} + 3 analysts</dd>
              <dt>Scenarios</dt><dd className="num">{a.tests?.[0]}/{a.tests?.[1]} passed</dd>
              <dt>Defects open</dt><dd>{id === 'expense' ? '1 minor (receipt rotation)' : 'None'}</dd>
            </dl>
            <div className="hr" />
            {([['Functional sign-off', id === 'freight'], ['Security review', true], ['Runbook handed to ROC', true], ['Customer go-live approval', false]] as [string, boolean][]).map(([n, ok]) => <Check key={n} ok={ok}><span>{n}</span></Check>)}
            <div style={{ marginTop: 10 }}><ToastBtn className="btn sm primary" msg={`Sign-off request sent to ${sp.n} in the Customer Portal`}>Request customer sign-off</ToastBtn></div>
          </Card>
        );
      })}
    </div>
  );

  if (t === 'releases') b = (
    <Card tight>
      <Table cols={['Release', 'Agents', 'Window', 'Type', 'Approver', 'Status']}>
        {([
          ['R-2026.10.3', 'Payroll Exception Agent v2.1.1', 'Oct 16 · 22:00', 'Hotfix', 'Patricia Gómez', <Pill key="s" cls="warn">Pending approval</Pill>],
          ['R-2026.11.1', 'Expense Audit Agent v1.0.0', 'Nov 17 · 07:00', 'Go-live', 'Ricardo Salinas', <Pill key="s" cls="info">Scheduled</Pill>],
          ['R-2026.11.2', 'Freight Invoice Agent v1.0.0', 'Nov 24 · 07:00', 'Go-live', 'Laura Méndez', <Pill key="s" cls="info">Scheduled</Pill>],
          ['R-2026.12.1', 'Vendor Onboarding Agent v1.0.0', 'Dec 1 · 07:00', 'Go-live', 'Héctor Villa', <Pill key="s" cls="info">Planned</Pill>],
          ['R-2026.10.1', 'Invoice Processing Agent v3.4.2', 'Oct 8', 'Minor', 'Laura Méndez', <Pill key="s" cls="ok">Released</Pill>],
        ] as [string, string, string, string, string, ReactNode][]).map(r => (
          <tr key={r[0]}>{r.map((v, i) => <td key={i} className={i === 0 ? 'mono' : ''}>{v}</td>)}</tr>
        ))}
      </Table>
    </Card>
  );

  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Deploy']} title={DEPLOY_T[t]} sub="Promotion from development to production, with customer sign-off recorded on the agent." ly="br" />
      <UrlTabs cur={t} list={[['envs', 'Environments'], ['uat', 'UAT', 2], ['releases', 'Releases']]} />
      {b}
    </>
  );
}

export function ProdHealth() {
  const { db, canOpen } = usePlatform();
  const go = useGo();
  const lala = db.agents.filter(a => a.cust === 'lala' && a.env === 'Production');
  const opsOk = canOpen('ops');
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Production']} title="Agent Health" ly="r"
        sub="Production visibility for the delivery team. Operated by Beecker ROC in the Agentic Control Tower."
        actions={opsOk ? <button className="btn" onClick={() => go(['ops', 'home'])}>Open Control Tower</button> : undefined} />
      <div className="grid g3">
        {lala.map(a => (
          <div key={a.id} className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => go([opsOk ? 'ops' : 'fde', 'agent', a.id])}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className={`dot ${a.status}`} /><b>{a.name}</b><span style={{ marginLeft: 'auto' }}><StPill s={a.status} /></span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
              <div className="num" style={{ fontSize: 12, lineHeight: 1.7 }}>
                <div>{fmt(a.runs24)} runs / 24h</div>
                <div>{a.success}% success · {a.autonomy}% autonomous</div>
                <div className="faint">{a.contract === 'MAS' ? 'Managed AI Services' : 'Managed AI Agents'} · {a.ver}</div>
              </div>
              <Spark v={series(a.tx30 || a.runs24, 20, a.ex, 0.7, a.status === 'warn' ? 0.25 : 0)} c={a.status === 'warn' ? 'var(--warn)' : 'var(--ok)'} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ProdExceptions() {
  const cats: [string, number][] = [['PO not found', 31], ['Vendor mismatch', 22], ['Conflicting employee record', 18], ['SAP timeout', 17], ['Price outside tolerance', 12], ['Missing credit note reference', 7]];
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Production']} title="Exceptions" sub="Patterns from production that should change what we build next. Last 30 days, Grupo Lala." ly="r" />
      <div className="grid g-main">
        <Card head={<><h2>Exceptions by cause</h2><span className="faint">107 cases · 30 days</span></>}>
          <BarChart v={cats.map(c => c[1])} labels={cats.map(c => c[0])} horiz c="var(--bld)" hl={0} />
        </Card>
        <Card head={<h2>Turn into improvements</h2>}>
          <div className="rows">
            {cats.slice(0, 4).map(c => (
              <div key={c[0]} className="row" style={{ padding: '9px 0' }}>
                <div className="grow"><div className="t">{c[0]}</div><div className="d">{c[1]} cases · {/employee|SAP/.test(c[0]) ? 'Payroll Exception Agent' : 'Invoice Processing Agent'}</div></div>
                <ToastBtn className="btn sm" msg={`Improvement item created for “${c[0]}” · added to backlog`}>Create item</ToastBtn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

export function Backlog() {
  const { db } = usePlatform();
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Production']} title="Improvement Backlog" ly="br"
        sub="Production learns, the build layer changes. Items come from incidents, HITL patterns, evaluations and customer feedback, and are shared with the Control Tower." />
      <Card tight>
        <Table cols={['Improvement', 'Agent', 'Source', 'Impact', 'Owner', 'Status']}>
          {db.improvements.map(x => (
            <tr key={x.t}>
              <td className="nm">{x.t}</td><td>{x.a}</td><td><span className="chip">{x.src}</span></td>
              <td><Pill cls={x.imp === 'High' ? 'crit' : x.imp === 'Medium' ? 'warn' : 'nodot'}>{x.imp}</Pill></td>
              <td><PersonChip id={x.who} /></td>
              <td><Pill cls={x.st === 'Done' ? 'ok' : x.st === 'In progress' ? 'info' : 'nodot'}>{x.st}</Pill></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
