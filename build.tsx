'use client';

import type { ReactNode } from 'react';
import { NT } from '@/lib/constants';
import type { Agent, NodeDetail, Workflow } from '@/lib/types';
import { useLookup, usePlatform } from '@/components/platform-provider';
import { AlsoSeen } from '@/components/shell';
import { Card, Meter, PageHeader, Pill, SimpleTable, StagePill, Table, ToastBtn, UrlTabs, useGo } from '@/components/ui';

export function AgentsList() {
  const { db } = usePlatform();
  const { agent } = useLookup();
  const go = useGo();
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Build']} title="Agents" ly="b"
        sub="Definitions, versions and quality for every agent Beecker has built for Grupo Lala. Code lives in GitHub; the platform is the system of record around it." />
      <Card tight>
        <Table cols={['Agent', 'Stage', 'Orchestration', 'Model', 'Version', 'Tests', 'Eval score', 'Reuse']}>
          {db.initiatives.filter(i => i.agent).map(i => {
            const a = agent(i.agent)!;
            const [p, t] = a.tests ?? [0, 0];
            return (
              <tr key={a.id} className="click" onClick={() => go(['fde', 'agent', a.id])}>
                <td className="nm">{a.name}<div className="s2">{a.fn}</div></td>
                <td><StagePill stage={i.stage} /></td>
                <td>{a.orch}</td><td>{a.model}</td><td className="mono">{a.ver}</td>
                <td className="num"><span style={{ color: p === t ? 'var(--ok)' : 'var(--warn)' }}>{p}/{t}</span></td>
                <td className="r num">{a.eval}%</td><td className="r num">{i.reuse}%</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}

const BT: Record<string, string> = { workflows: 'Workflows', tools: 'Tools', tests: 'Tests', evals: 'Evaluations', versions: 'Versions' };

export function BuildCatalog({ tab }: { tab: string | null }) {
  const { db } = usePlatform();
  const go = useGo();
  const t = tab && BT[tab] ? tab : 'workflows';
  const agentTab = t === 'tests' ? 'tests' : t === 'evals' ? 'evals' : t === 'versions' ? 'versions' : 'workflow';
  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], 'Build']} title={BT[t]} ly="b" sub="Shared across agents. Anything built once is available to the next initiative." />
      <UrlTabs list={Object.entries(BT).map(([k, l]) => [k, l, db.buildCat[k].rows.length])} cur={t} />
      <Card tight>
        <SimpleTable def={db.buildCat[t]} onRow={r => {
          const a = db.agents.find(x => x.name === r[1] || x.name === r[0]);
          return a && a.cust === 'lala' ? () => go(['fde', 'agent', a.id, agentTab]) : undefined;
        }} />
      </Card>
    </>
  );
}

/** Simple linear workflow for agents without a hand-drawn graph. */
function genWorkflow(a: Agent): Workflow {
  const steps = a.steps ?? ['Start', 'Process', 'Finish'];
  const nodes = steps.map((s, i) => ({
    id: 'n' + (i + 1),
    t: (i === 0 ? 'trigger' : /approval|review/i.test(s) ? 'human' : /SAP|Posting|Update|Sync|Order$/i.test(s) ? 'erp' : i === 1 ? 'llm' : 'python') as Workflow['nodes'][number]['t'],
    l: s, e: '', x: 20 + i * 160, y: 110,
  }));
  return { w: 40 + nodes.length * 160, h: 240, nodes, edges: nodes.slice(1).map((x, i) => [nodes[i].id, x.id]) };
}

const NODE_W = 140;
function WorkflowCanvas({ wf }: { wf: Workflow }) {
  const { nodeSel, setNodeSel } = usePlatform();
  const pos = Object.fromEntries(wf.nodes.map(n => [n.id, n]));
  return (
    <div className="canvas">
      <div className="canvas-in" style={{ width: wf.w, height: wf.h }}>
        <svg className="edges" width={wf.w} height={wf.h}>
          {wf.edges.map(([a, b, l], k) => {
            const p = pos[a], q = pos[b];
            const vertical = q.x <= p.x + 20;
            const x1 = vertical ? p.x + 70 : p.x + NODE_W, y1 = vertical ? p.y + 76 : p.y + 34;
            const x2 = vertical ? q.x + 70 : q.x, y2 = vertical ? q.y : q.y + 34;
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const d = vertical ? `M${x1} ${y1} C${x1} ${my},${x2} ${my},${x2} ${y2}` : `M${x1} ${y1} C${mx} ${y1},${mx} ${y2},${x2} ${y2}`;
            const hot = nodeSel === a || nodeSel === b;
            return (
              <g key={k}>
                <path className={hot ? 'hot' : ''} d={d} />
                {l && <text x={vertical ? x1 + 6 : mx} y={vertical ? my : my - 6} textAnchor={vertical ? 'start' : 'middle'}>{l}</text>}
              </g>
            );
          })}
        </svg>
        {wf.nodes.map(n => {
          const t = NT[n.t];
          return (
            <button key={n.id} className={`wnode ${nodeSel === n.id ? 'on' : ''}`} style={{ left: n.x, top: n.y }} onClick={() => setNodeSel(n.id)}>
              <div className="nt"><span className="ico" style={{ background: t.c }}>{t.a}</span>{t.l}</div>
              <div className="nl">{n.l}</div>
              {n.e && <div className="ne">{n.e}</div>}
              {n.st && <span className={`st dot ${n.st}`} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PassFail = ({ v }: { v: string }) => v === 'ok' ? <Pill cls="ok">Passing</Pill> : v === 'crit' ? <Pill cls="crit">Failing</Pill> : <>{v}</>;

export function AgentBuild({ param, tab }: { param: string | null; tab: string | null }) {
  const { db, nodeSel } = usePlatform();
  const { agent, ini, person } = useLookup();
  const go = useGo();
  const id = param || 'vendor';
  const a = agent(id);
  if (!a || a.cust !== 'lala') return <Card><div className="empty">This agent is not part of the Grupo Lala delivery workspace.</div></Card>;
  const i = ini(id) ?? { stage: 'Production' as const, reuse: 40 };
  const t = tab || 'workflow';
  const wf = db.workflows[id] ?? genWorkflow(a);
  const nsel = wf.nodes.find(n => n.id === nodeSel) ?? wf.nodes[0];
  const ndet: NodeDetail = db.nodeDetail[id]?.[nsel.id] ?? { cfg: [['Engine', NT[nsel.t].l], ['Owner', person(a.owner).n]], ctx: [], tests: '—' };
  const [passed, total] = a.tests ?? [0, 0];
  const isVendor = id === 'vendor';
  const sp = person(a.sponsor);

  const kvi = (k: string, v: ReactNode) => <div><div className="k">{k}</div><div>{v}</div></div>;
  let body: ReactNode = null;

  if (t === 'workflow') body = (
    <div className="grid" style={{ gap: 0, gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
      <div style={{ minWidth: 0, borderRight: '1px solid var(--border)' }}>
        <div className="card-h" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="legend">{Object.values(NT).map(n => <span key={n.a}><span className="ico" style={{ background: n.c }}>{n.a}</span>{n.l}</span>)}</div>
        </div>
        <WorkflowCanvas wf={wf} />
        <div className="note" style={{ margin: 12, borderRadius: 6 }}>Orchestration-agnostic. Each node runs on its own engine (LangGraph, UiPath, Python, an API or a person). The platform records the definition, versions it and links it to the operational map.</div>
      </div>
      <div className="card-b">
        <div className="tag">{NT[nsel.t].l} node</div>
        <h2 style={{ fontSize: 16, margin: '3px 0 10px' }}>{nsel.l}</h2>
        <dl className="kv" style={{ gridTemplateColumns: '100px minmax(0,1fr)' }}>
          {ndet.cfg.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}
          <dt>Tests</dt><dd className="num">{ndet.tests}</dd>
        </dl>
        {ndet.ctx.length > 0 && <>
          <div className="tag" style={{ margin: '14px 0 6px' }}>Linked context</div>
          <div className="chips">{ndet.ctx.map(c => <span key={c} className="chip click" onClick={() => go(['fde', 'map'])}>{c}</span>)}</div>
        </>}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          <ToastBtn className="btn sm" msg={`Opened ${nsel.l} in VS Code via GitHub link`}>Open in code</ToastBtn>
          <ToastBtn className="btn sm" msg={`Running ${ndet.tests} test cases for ${nsel.l}`}>Run node tests</ToastBtn>
        </div>
      </div>
    </div>
  );

  if (t === 'context') body = (
    <div className="card-b"><div className="grid g3">
      {([['Entities', ['Vendor', 'Purchase Order', 'Invoice'], 'Operational map'], ['Processes', ['Vendor Onboarding', 'Procure-to-Pay'], 'Operational map'], ['Knowledge', ['Vendor Onboarding PDD v2', 'SOP-PRC-014', 'Approval matrix v4'], 'Document knowledge']] as [string, string[], string][]).map(([h, l, s]) => (
        <div key={h}>
          <div className="tag" style={{ marginBottom: 8 }}>{h} <span className="faint">· {s}</span></div>
          <div className="rows">{l.map(x => <div key={x} className="row click" style={{ padding: '8px 0' }} onClick={() => go(['fde', 'map'])}><span className="dot info" /><span className="grow">{x}</span><span className="faint">reused</span></div>)}</div>
        </div>
      ))}
    </div></div>
  );

  if (t === 'tools') body = <SimpleTable def={{ cols: ['Tool', 'Kind', 'System', 'Owner', 'Reused from'], rows: [['sat_rfc_validator', 'Python service', 'SAT Web Service', 'Sofía Chen', 'Tax Compliance Agent'], ['sap_bp_read', 'API', 'SAP S/4HANA', 'Platform', 'Invoice Processing Agent'], ['sap_bp_create', 'UiPath process', 'SAP S/4HANA', 'Diego Ramírez', 'New'], ['hitl_request', 'Beecker HITL', 'Teams', 'Platform', 'Shared'], ['vendor_extract', 'LLM prompt', 'Azure OpenAI', 'Diego Ramírez', 'New']] }} />;

  if (t === 'rules') body = <SimpleTable def={{ cols: ['Rule', 'Type', 'Enforced in', 'Source'], rows: db.catalog.rules.rows.filter(r => /Vendor|Tax|Bank/.test(r[0] + r[2])).map(r => [r[0], r[1], r[3], r[4]]).concat([['Duplicate on RFC + CLABE blocks create', 'Deterministic', 'Check Duplicate (API)', 'PDD v2']]) }} />;

  if (t === 'permissions') body = <SimpleTable def={{ cols: ['Principal', 'Action', 'Scope', 'Condition', 'Human required'], rows: db.catalog.permissions.rows.filter(r => r[0].startsWith('Vendor') || (!isVendor && r[0].startsWith(a.short.split(' ')[0]))) }} />;

  if (t === 'tests') {
    const rows: [string, string, string, string][] = [['New vendor, valid RFC', 'Validate Tax ID', 'pass', 'ok'], ['RFC with invalid checksum', 'Validate Tax ID', 'reject', 'ok'], ['Duplicate by RFC', 'Check Duplicate', 'block', 'ok'], ['Duplicate by CLABE with spaces', 'Check Duplicate', 'block', isVendor ? 'crit' : 'ok'], ['Duplicate by CLABE with dashes', 'Check Duplicate', 'block', isVendor ? 'crit' : 'ok'], ['Bank data present → approval', 'Condition', 'route to human', 'ok'], ['Approved → SAP create', 'Create Vendor', 'created', 'ok'], ['Legal name with accents', 'Check Duplicate', 'block', isVendor ? 'crit' : 'ok'], ['Legacy vendor in Coupa only', 'Check Duplicate', 'block', isVendor ? 'crit' : 'ok']];
    body = (<>
      <div className="card-h"><b className="num">{passed}/{total} passing</b><span className="faint">Suite {id}.e2e · GitHub Actions</span><div className="r"><ToastBtn className="btn sm primary" msg="Suite queued in GitHub Actions · run #1842">Run suite</ToastBtn></div></div>
      <Table cols={['Case', 'Node', 'Expected', 'Result']}>{rows.map(r => <tr key={r[0]}><td className="nm">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><PassFail v={r[3]} /></td></tr>)}</Table>
    </>);
  }

  if (t === 'evals') body = (
    <div className="card-b"><div className="grid g2">
      {([['Field extraction accuracy', a.eval, 95], ['Duplicate detection recall', isVendor ? 89.6 : 97.2, 98], ['Correct routing to human', 98.1, 97], ['End-to-end success (UAT)', a.success, 95]] as [string, number, number][]).map(([n, v, th]) => (
        <div key={n}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{n}</span><b className="num" style={{ color: v >= th ? 'var(--ok)' : 'var(--warn)' }}>{v}%</b></div>
          <div style={{ position: 'relative', marginTop: 6 }}><Meter pct={v} color={v >= th ? 'var(--ok)' : 'var(--warn)'} /><span style={{ position: 'absolute', left: `${th}%`, top: -3, height: 12, width: 2, background: 'var(--fg)' }} /></div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 4 }}>Threshold {th}% · 412 labeled cases (shared finance suite)</div>
        </div>
      ))}
    </div></div>
  );

  if (t === 'versions') body = <SimpleTable def={{ cols: ['Version', 'Change', 'Author', 'Environment', 'Date'], rows: [[a.ver, isVendor ? 'Duplicate check on CLABE + RFC' : 'Current release', person(a.owner).n, a.env, 'Oct 14'], ['v0.8.3', 'Teams approval card in Spanish', 'Sofía Chen', 'UAT', 'Oct 6'], ['v0.8.0', 'UiPath BP_Create v1.3', 'Diego Ramírez', 'Dev', 'Sep 29'], ['v0.7.0', 'First end-to-end run', 'Diego Ramírez', 'Dev', 'Sep 15']] }} />;

  if (t === 'links') body = (
    <div className="card-b">
      <div className="note" style={{ marginBottom: 14 }}>Engineers keep working in their own tools. Beecker Platform links them to the agent record so context, versions and production data stay together.</div>
      <div className="grid g3">
        {[['GitHub', `beecker-ai/lala-${id}`, 'main · 3 open PRs · last commit 12 min ago'], ['Azure', 'rg-lala-ai-uat', 'Container Apps · Key Vault · Azure OpenAI'], ['UiPath Orchestrator', 'LALA / Procurement', 'BP_Create v1.3 · BP_Change v1.1'], ['LangGraph Platform', `${id}-uat`, 'Deployment rev 42'], ['CI/CD', 'GitHub Actions', 'e2e on every PR · deploy on tag'], ['Architecture', 'ADR-007 Vendor creation path', 'UiPath until SAP OData BP enabled']].map(([k, v, d]) => (
          <div key={k} className="card" style={{ padding: 12 }}>
            <div className="tag">{k}</div><div style={{ fontWeight: 600, marginTop: 3 }} className="mono">{v}</div>
            <div className="faint" style={{ fontSize: 12, marginTop: 3 }}>{d}</div>
            <ToastBtn className="btn sm" style={{ marginTop: 10 }} msg={`Opens ${k} in a new tab`}>Open</ToastBtn>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader crumbs={[['FDE Workbench', ['fde', 'home']], ['Build', ['fde', 'agents']], a.name]} title={a.name} sub={`${a.fn} · ${a.orch} · ${a.model}`} ly="ub"
        actions={<><button className="btn" onClick={() => go(['fde', 'deploy', null, 'uat'])}>Promote to UAT</button><ToastBtn className="btn primary" msg={`Draft saved as ${a.ver}+1 · diff pushed to GitHub branch`}>Save version</ToastBtn></>} />
      <AlsoSeen agentId={id} except="fde" />
      <Card>
        <div className="kv4">
          {kvi('Project stage', <StagePill stage={i.stage} />)}
          {kvi('Customer owner', <>{sp.n}<div className="faint" style={{ fontSize: 11.5 }}>{sp.r}</div></>)}
          {kvi('Beecker owner', person(a.owner).n)}
          {kvi('Target go-live', a.golive)}
          {kvi('Environment', <><Pill cls={a.env === 'Production' ? 'ok' : 'warn'}>{a.env}</Pill> <span className="mono faint">{a.ver}</span></>)}
          {kvi('Systems', (a.systems ?? []).join(' · '))}
          {kvi('Dependencies', isVendor ? 'Coupa API (UAT) · Approval matrix v4 · SAT RFC service' : 'SAP service user · HITL approvers')}
        </div>
      </Card>
      <Card>
        <div style={{ margin: '-14px -14px 0', padding: '0 8px' }}>
          <UrlTabs cur={t} list={[['workflow', 'Workflow'], ['context', 'Context'], ['tools', 'Tools'], ['rules', 'Rules'], ['permissions', 'Permissions'], ['tests', 'Tests', `${passed}/${total}`], ['evals', 'Evaluations'], ['versions', 'Versions'], ['links', 'Engineering Links']]} />
        </div>
        <div style={{ margin: '0 -14px -14px' }}>{body}</div>
      </Card>
    </>
  );
}
