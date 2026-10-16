# Beecker Platform

One Beecker Platform, four role-specific workspaces, over a shared **Understand → Build → Run** architecture.

| Workspace | URL | Who |
|---|---|---|
| FDE Workbench | `/fde` | FDEs, AI Solutions Leads, PMs |
| Agentic Control Tower | `/ops` | ROC, Support, Customer Success |
| Customer Portal | `/cust` | Customer executives and process owners |
| Sales Intelligence (FINN) | `/finn` | AEs, Presales |
| Platform architecture | `/{workspace}/platform` | Everyone |

This is **phase 1 of the production path**: the clickable prototype ported to Next.js (App Router, TypeScript, React 19) on a **mock API**. Every screen reads from one shared data model and every action goes through an API route, so swapping the mock store for a real database does not touch the UI.

## Run it

```bash
npm install
cp .env.example .env.local     # set FINN_WEBHOOK_SECRET
npm run dev                    # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

### Deploy to Vercel

Push the repo to GitHub and import it in Vercel (framework preset: Next.js, no extra settings). Add `FINN_WEBHOOK_SECRET` under Project → Settings → Environment Variables. Turn on Deployment Protection while the app shows customer names.

## How it is organized

```
app/
  layout.tsx                     Loads the data snapshot + role cookie, wraps everything in PlatformProvider
  [ws]/[[...slug]]/page.tsx      One route for all screens: /{ws}/{route}/{param}?tab=
  api/
    snapshot/                    GET everything the UI needs (mock)
    hitl/[id]/decision/          POST approve | reject | route | escalate
    incidents/[id]/actions/      POST escalate | pause | rollback | improve | resolve | comms
    approvals/[id]/decision/     POST Approved | Rejected (customer business approvals)
    initiatives/                 POST { fromMeeting } — FINN → AI Initiative handoff
    initiatives/[id]/            PATCH { stage: 'Development' } | { requested: true }
    ingest/finn/                 POST webhook for FINN transcripts (HMAC-verified)
components/
  platform-provider.tsx          Client store: data, role, filters, toasts, optimistic actions
  shell.tsx                      Top bar, workspace switcher, role switcher, sidebar
  ui.tsx, charts.tsx, modals.tsx Shared UI primitives and SVG charts
features/
  fde/ ops/ cust/ finn/ platform/  Screens per workspace
  registry.tsx                   Route table: workspace + route → screen component
lib/
  types.ts                       Shared data model (one interface ≈ one future table)
  data/seed.ts                   Mock data
  mutations.ts                   State transitions shared by API (server) and UI (optimistic)
  server/repo.ts                 Data access layer — the only file that changes for a real DB
  workspaces.ts                  Workspaces, roles, navigation, URL helper
```

### Data flow

1. `app/layout.tsx` reads a snapshot from `lib/server/repo.ts` and hands it to `PlatformProvider`.
2. Screens read from the provider (`usePlatform()`), so all workspaces show the same objects.
3. An action (e.g. *Route to customer* in the HITL queue) applies the mutation from `lib/mutations.ts` locally for instant feedback, then calls the API route, which applies the same mutation to the server store. If the API fails, the UI reloads the snapshot.

### Mock limitations (by design, for this phase)

- **Data store** is in memory. It resets on restart and is not shared between Vercel serverless instances, so changes may not persist between page loads in production.
- **Roles** come from a `bp_role` cookie set by the role switcher. There is no login yet, and access is only checked in the UI.
- **External tools** (GitHub, UiPath, LangGraph, SAP, Teams) are shown as links/toasts only.

## Next phases

1. **Database**: Postgres (Neon, Supabase or Azure Postgres) with Drizzle or Prisma. Create tables from `lib/types.ts`, move `lib/data/seed.ts` into a seed script, and reimplement `getSnapshot`/`mutate` in `lib/server/repo.ts` as queries. Split `/api/snapshot` into per-resource endpoints.
2. **Auth and access**: Microsoft Entra ID SSO for Beecker staff, invited accounts for customers. Enforce role and customer scope on the server (middleware + Postgres row-level security), never only in the UI. Add an audit log for approvals, rollbacks and pauses.
3. **FINN transcripts**: implement the TODOs in `app/api/ingest/finn/route.ts` — store the raw transcript, create the meeting, enqueue extraction with Claude (structured output → discovery context, use cases, score), match to the CRM account.
4. **Run telemetry**: a standard run-event contract (`run.started`, `step.completed`, `exception`, `needs_human`, `run.completed`) that every agent emits regardless of engine (UiPath webhooks, LangSmith, Python SDK). Alerts and incidents are computed from it.
5. **Integrations**: CRM sync, Microsoft Graph (SharePoint knowledge, Teams approvals), GitHub, UiPath Orchestrator, Azure Cost Management.

### FINN webhook contract

```http
POST /api/ingest/finn
x-finn-signature: sha256=<hex HMAC-SHA256 of the raw body with FINN_WEBHOOK_SECRET>
content-type: application/json

{
  "meetingId": "slack-call-123",
  "accountName": "Grupo Lala",
  "title": "AP Automation Discovery",
  "startedAt": "2026-10-15T15:00:00Z",
  "participants": [{ "name": "Laura Méndez", "email": "..." }],
  "transcript": [{ "speaker": "Laura Méndez", "text": "...", "ts": 12.3 }]
}
```

Returns `202 { ok: true, status: "accepted" }`. Test locally:

```bash
BODY='{"meetingId":"m1","transcript":[{"speaker":"a","text":"hi"}]}'
SIG=sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$FINN_WEBHOOK_SECRET" | awk '{print $2}')
curl -X POST localhost:3000/api/ingest/finn -H "x-finn-signature: $SIG" -d "$BODY"
```
