'use client';

import type { ComponentType } from 'react';
import type { WorkspaceId } from '@/lib/types';
import { FdeHome } from './fde/overview';
import { BusinessCases, DiscoveryScreen, Pipeline } from './fde/discover';
import { Catalog, OperationalMap } from './fde/understand';
import { AgentBuild, AgentsList, BuildCatalog } from './fde/build';
import { Backlog, Deploy, ProdExceptions, ProdHealth } from './fde/deploy-production';
import { OpsCustomers, OpsFleet, OpsHome } from './ops/fleet';
import { Incident, OpsHealth } from './ops/health';
import { Escalations, HitlQueue, OpsApprovals, Support } from './ops/human';
import { OpsAgent, OpsPerformance, OpsReleases } from './ops/performance';
import { CustAgent, CustAgents, CustApprovals, CustHome, CustInitiatives, CustOpportunities, CustPerformance } from './cust/portal';
import { FinnAccounts, FinnCoaching, FinnMeeting, FinnMeetings, FinnOpps, FinnPdds, FinnProposals, FinnToday, FinnUseCases } from './finn/finn';

export interface ScreenProps { param: string | null; tab: string | null }
type Screen = ComponentType<ScreenProps>;

/** Route table: /{workspace}/{route}/{param}?tab= → screen component. */
export const SCREENS: Record<WorkspaceId, Record<string, Screen>> = {
  fde: {
    home: FdeHome, pipeline: Pipeline, discovery: DiscoveryScreen, cases: BusinessCases,
    map: OperationalMap, catalog: Catalog,
    agents: AgentsList, agent: AgentBuild, buildcat: BuildCatalog,
    deploy: Deploy, prodhealth: ProdHealth, prodex: ProdExceptions, backlog: Backlog,
  },
  ops: {
    home: OpsHome, fleet: OpsFleet, customers: OpsCustomers,
    health: OpsHealth, incident: Incident,
    hitl: HitlQueue, approvals: OpsApprovals, escalations: Escalations, support: Support,
    perf: OpsPerformance, rel: OpsReleases, agent: OpsAgent,
  },
  cust: {
    home: CustHome, agents: CustAgents, agent: CustAgent, initiatives: CustInitiatives,
    approvals: CustApprovals, performance: CustPerformance, opportunities: CustOpportunities,
  },
  finn: {
    today: FinnToday, meetings: FinnMeetings, meeting: FinnMeeting, accounts: FinnAccounts, opps: FinnOpps,
    usecases: FinnUseCases, proposals: FinnProposals, pdds: FinnPdds, coaching: FinnCoaching,
  },
};
