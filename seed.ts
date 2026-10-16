import type {
  Agent, Customer, CustomerApproval, Discovery, HitlCase, Improvement, Incident, Initiative, MapCol, MapDetail,
  MapNode, Meeting, NodeDetail, Person, PlatformDb, Reuse, TableDef, Workflow,
} from '../types';

/**
 * Mock seed data for the Beecker Platform.
 * In production this is replaced by the database (see lib/server/repo.ts).
 * Returns fresh objects on every call so the in-memory repo can be reset.
 */
export function createSeed(): PlatformDb {
/* ================= SHARED PLATFORM DATA =================
   One object graph. Every workspace reads from it. */

  const PEOPLE: Record<string, Person> = {
  mariana:{n:'Mariana Ortega',r:'AI Solutions Lead',i:'MO',org:'Beecker'},
  diego:{n:'Diego Ramírez',r:'Forward-Deployed Engineer',i:'DR',org:'Beecker'},
  sofia:{n:'Sofía Chen',r:'Forward-Deployed Engineer',i:'SC',org:'Beecker'},
  luis:{n:'Luis Herrera',r:'Delivery PM',i:'LH',org:'Beecker'},
  valeria:{n:'Valeria Núñez',r:'Account Executive',i:'VN',org:'Beecker'},
  laura:{n:'Laura Méndez',r:'VP Shared Services',i:'LM',org:'Grupo Lala'},
  ricardo:{n:'Ricardo Salinas',r:'CFO',i:'RS',org:'Grupo Lala'},
  patricia:{n:'Patricia Gómez',r:'HR Operations Director',i:'PG',org:'Grupo Lala'},
  javier:{n:'Javier Torres',r:'Commercial Director',i:'JT',org:'Grupo Lala'},
  carmen:{n:'Carmen Ruiz',r:'CIO',i:'CR',org:'Grupo Lala'},
  hector:{n:'Héctor Villa',r:'Procurement Manager',i:'HV',org:'Grupo Lala'},
};

  const CUSTOMERS: Customer[] = [
  {id:'lala',name:'Grupo Lala',ind:'Food & Beverage',hq:'Torreón, MX',contracts:['MAS','MAA'],prod:9,warn:1,crit:0,hitl:9,sla:99.95,cost:1840,incidents:1,runs24:6140},
  {id:'celestica',name:'Celestica',ind:'Electronics Manufacturing',hq:'Toronto, CA',contracts:['MAA'],prod:38,warn:2,crit:0,hitl:6,sla:99.97,cost:2410,incidents:2,runs24:21880},
  {id:'femsa',name:'FEMSA',ind:'Retail & Beverage',hq:'Monterrey, MX',contracts:['MAS','MAA'],prod:47,warn:4,crit:2,hitl:11,sla:99.61,cost:3120,incidents:5,runs24:28410},
  {id:'heineken',name:'Heineken México',ind:'Beverage',hq:'Monterrey, MX',contracts:['MAA'],prod:29,warn:1,crit:1,hitl:5,sla:99.90,cost:1760,incidents:2,runs24:14220},
  {id:'petco',name:'Petco',ind:'Specialty Retail',hq:'San Diego, US',contracts:['MAS'],prod:22,warn:3,crit:0,hitl:4,sla:99.88,cost:1390,incidents:2,runs24:9870},
];
  const FLEET_OTHER: PlatformDb['fleetOther'] = {customers:23,prod:167,warn:7,crit:4,hitl:8,cost:7892,incidents:6};

/* Agents — the same object is rendered three ways (FDE / Ops / Customer). */
  const AGENTS: Agent[] = [
  {id:'invoice',name:'Invoice Processing Agent',short:'Invoice Agent',cust:'lala',env:'Production',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Finance · AP',
   runs24:2310,tx30:48230,success:97.3,autonomy:94.1,ex:2.7,p95:'3.1 min',avg:'2.4 min',cost24:412,ver:'v3.4.2',orch:'LangGraph + UiPath',model:'GPT-4.1 (Azure OpenAI)',owner:'diego',sponsor:'laura',value:187,golive:'Jun 2025',
   steps:['Invoice','Vendor Match','PO Match','Validation','Approval if needed','SAP Posting'],systems:['SAP S/4HANA','SharePoint','Coupa'],eval:96.8,tests:[142,142]},
  {id:'payroll',name:'Payroll Exception Agent',short:'Payroll Agent',cust:'lala',env:'Production',status:'warn',contract:'MAS',hosting:'Beecker-hosted',fn:'HR · Payroll',
   runs24:880,tx30:21410,success:93.6,autonomy:86.2,ex:6.4,p95:'7.8 min',avg:'4.1 min',cost24:168,ver:'v2.1.0',orch:'Python + LangGraph',model:'GPT-4.1 (Azure OpenAI)',owner:'sofia',sponsor:'patricia',value:96,golive:'Aug 2025',
   steps:['Payroll Run','Variance Detection','Employee Match','Policy Check','HR Review if needed','SAP HCM Update'],systems:['SuccessFactors','SAP S/4HANA'],eval:91.2,tests:[88,90]},
  {id:'bankrec',name:'Bank Reconciliation Agent',short:'Bank Rec Agent',cust:'lala',env:'Production',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Finance · Treasury',
   runs24:640,tx30:19020,success:98.8,autonomy:96.4,ex:1.2,p95:'1.2 min',avg:'0.8 min',cost24:71,ver:'v1.8.0',orch:'Python',model:'GPT-4.1 mini',owner:'diego',sponsor:'ricardo',value:121,golive:'Oct 2025',
   steps:['Bank Statement','Line Matching','Rule Check','Exception Review','Clearing in SAP'],systems:['SAP S/4HANA','Azure Data Lake'],eval:98.1,tests:[64,64]},
  {id:'cmd',name:'Customer Master Data Agent',short:'Customer MD Agent',cust:'lala',env:'Production',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Commercial',
   runs24:310,tx30:8840,success:97.9,autonomy:92.0,ex:2.1,p95:'2.2 min',avg:'1.5 min',cost24:44,ver:'v1.3.1',orch:'UiPath + LLM',model:'GPT-4.1 mini',owner:'sofia',sponsor:'javier',value:58,golive:'Feb 2026',
   steps:['Change Request','Extraction','Duplicate Check','Approval if needed','Salesforce + SAP Sync'],systems:['Salesforce','SAP S/4HANA'],eval:97.4,tests:[51,51]},
  {id:'creditnote',name:'Credit Note Agent',short:'Credit Note Agent',cust:'lala',env:'Production',status:'ok',contract:'MAA',hosting:'Customer-hosted',fn:'Finance · AR',
   runs24:520,tx30:15600,success:98.2,autonomy:93.5,ex:1.8,p95:'1.9 min',avg:'1.1 min',cost24:38,ver:'v4.0.3',orch:'UiPath',model:'—',owner:'diego',sponsor:'ricardo',value:74,golive:'2024',
   steps:['Claim','Validation','Credit Note Draft','Approval if needed','SAP Posting'],systems:['SAP S/4HANA'],eval:97.9,tests:[40,40]},
  {id:'onboard',name:'Employee Onboarding Agent',short:'Onboarding Agent',cust:'lala',env:'Production',status:'ok',contract:'MAA',hosting:'Customer-hosted',fn:'HR',
   runs24:90,tx30:2610,success:99.1,autonomy:95.2,ex:0.9,p95:'4.0 min',avg:'2.8 min',cost24:12,ver:'v2.2.0',orch:'Power Automate + LLM',model:'GPT-4.1 mini',owner:'sofia',sponsor:'patricia',value:41,golive:'2024',
   steps:['New Hire','Document Check','Account Provisioning','Welcome Pack'],systems:['SuccessFactors','SharePoint'],eval:98.4,tests:[33,33]},
  {id:'salesorder',name:'Sales Order Validation Agent',short:'Sales Order Agent',cust:'lala',env:'Production',status:'ok',contract:'MAA',hosting:'Beecker-hosted',fn:'Commercial',
   runs24:1210,tx30:36420,success:97.8,autonomy:90.4,ex:2.2,p95:'0.9 min',avg:'0.5 min',cost24:96,ver:'v3.1.0',orch:'UiPath + LLM',model:'GPT-4.1 mini',owner:'diego',sponsor:'javier',value:88,golive:'2024',
   steps:['Order','Price Check','Credit Check','Approval if needed','SAP Order'],systems:['SAP S/4HANA','Salesforce'],eval:96.9,tests:[72,72]},
  {id:'fixedasset',name:'Fixed Asset Agent',short:'Fixed Asset Agent',cust:'lala',env:'Production',status:'ok',contract:'MAA',hosting:'Customer-hosted',fn:'Finance · R2R',
   runs24:60,tx30:1790,success:99.4,autonomy:97.0,ex:0.6,p95:'1.4 min',avg:'0.9 min',cost24:9,ver:'v1.5.2',orch:'UiPath',model:'—',owner:'diego',sponsor:'ricardo',value:33,golive:'2024',
   steps:['Asset Request','Classification','Capitalization','SAP Posting'],systems:['SAP S/4HANA'],eval:99.0,tests:[28,28]},
  {id:'taxcomp',name:'Tax Compliance Agent',short:'Tax Agent',cust:'lala',env:'Production',status:'ok',contract:'MAA',hosting:'Beecker-hosted',fn:'Finance · Tax',
   runs24:120,tx30:30400,success:98.6,autonomy:95.8,ex:1.4,p95:'0.6 min',avg:'0.3 min',cost24:21,ver:'v2.0.4',orch:'Python',model:'GPT-4.1 mini',owner:'sofia',sponsor:'ricardo',value:44,golive:'2025',
   steps:['CFDI Received','SAT Validation','Match to Invoice','Exception Review'],systems:['SAP S/4HANA','SAT Web Service'],eval:98.7,tests:[46,46]},
  {id:'vendor',name:'Vendor Onboarding Agent',short:'Vendor Agent',cust:'lala',env:'UAT',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Procurement',
   runs24:42,tx30:610,success:95.1,autonomy:81.0,ex:4.9,p95:'5.6 min',avg:'3.9 min',cost24:7,ver:'v0.9.0-rc2',orch:'LangGraph + UiPath',model:'GPT-4.1 (Azure OpenAI)',owner:'diego',sponsor:'hector',value:96,golive:'Dec 1, 2026',
   steps:['Vendor Request','Extract Information','Validate Tax ID','Check Duplicate','Human Approval','Create Vendor in SAP'],systems:['SAP S/4HANA','Coupa','SharePoint'],eval:92.4,tests:[54,58]},
  {id:'expense',name:'Expense Audit Agent',short:'Expense Agent',cust:'lala',env:'UAT',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Finance · T&E',
   runs24:130,tx30:2400,success:96.2,autonomy:88.0,ex:3.8,p95:'1.8 min',avg:'1.2 min',cost24:14,ver:'v1.0.0-rc1',orch:'LangGraph',model:'GPT-4.1 mini',owner:'sofia',sponsor:'ricardo',value:64,golive:'Nov 17, 2026',
   steps:['Expense Report','Receipt Extraction','Policy Check','Manager Review if needed','Reimbursement'],systems:['SAP Concur','SAP S/4HANA'],eval:95.0,tests:[61,62]},
  {id:'freight',name:'Freight Invoice Agent',short:'Freight Agent',cust:'lala',env:'UAT',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Logistics',
   runs24:88,tx30:1900,success:96.8,autonomy:89.5,ex:3.2,p95:'2.6 min',avg:'1.7 min',cost24:10,ver:'v1.0.0-rc3',orch:'LangGraph + UiPath',model:'GPT-4.1 mini',owner:'diego',sponsor:'laura',value:72,golive:'Nov 24, 2026',
   steps:['Carrier Invoice','Extraction','Rate Check','Shipment Match','SAP Posting'],systems:['SAP S/4HANA','SAP TM'],eval:95.6,tests:[48,48]},
  /* other customers */
  {id:'orderentry-cel',name:'Order Entry Agent',short:'Order Entry Agent',cust:'celestica',env:'Production',status:'ok',contract:'MAA',hosting:'Customer-hosted',fn:'Order-to-Cash',runs24:3820,success:98.4,autonomy:93.1,ex:1.6,p95:'1.1 min',cost24:288,ver:'v5.2.0',orch:'UiPath + LLM',sla:99.98,eval:97.7},
  {id:'quote-cel',name:'Quote-to-Order Agent',short:'Quote Agent',cust:'celestica',env:'Production',status:'warn',contract:'MAA',hosting:'Customer-hosted',fn:'Sales Ops',runs24:1450,success:95.2,autonomy:84.0,ex:4.8,p95:'3.4 min',cost24:131,ver:'v2.0.1',orch:'LangGraph',sla:99.80,eval:93.5},
  {id:'collections-femsa',name:'Collections Agent',short:'Collections Agent',cust:'femsa',env:'Production',status:'crit',contract:'MAS',hosting:'Beecker-hosted',fn:'Finance · AR',runs24:2240,success:88.3,autonomy:71.4,ex:11.7,p95:'9.2 min',cost24:356,ver:'v3.0.0',orch:'LangGraph + API',sla:98.90,eval:86.1},
  {id:'treasury-femsa',name:'Treasury Positions Agent',short:'Treasury Agent',cust:'femsa',env:'Production',status:'warn',contract:'MAS',hosting:'Beecker-hosted',fn:'Treasury',runs24:420,success:96.0,autonomy:90.2,ex:4.0,p95:'2.0 min',cost24:62,ver:'v1.4.0',orch:'Python',sla:99.70,eval:94.0},
  {id:'invoice-hk',name:'AP Invoice Agent',short:'AP Invoice Agent',cust:'heineken',env:'Production',status:'ok',contract:'MAA',hosting:'Beecker-hosted',fn:'Finance · AP',runs24:4010,success:97.9,autonomy:94.6,ex:2.1,p95:'2.2 min',cost24:470,ver:'v3.4.0',orch:'LangGraph + UiPath',sla:99.95,eval:97.0},
  {id:'claims-hk',name:'Customer Claims Agent',short:'Claims Agent',cust:'heineken',env:'Production',status:'crit',contract:'MAA',hosting:'Beecker-hosted',fn:'Customer Service',runs24:960,success:89.9,autonomy:76.0,ex:10.1,p95:'6.5 min',cost24:140,ver:'v1.2.0',orch:'LLM + API',sla:99.10,eval:88.0},
  {id:'vendor-petco',name:'Vendor Master Agent',short:'Vendor Master Agent',cust:'petco',env:'Production',status:'ok',contract:'MAS',hosting:'Beecker-hosted',fn:'Procurement',runs24:310,success:98.1,autonomy:91.8,ex:1.9,p95:'2.4 min',cost24:41,ver:'v2.3.0',orch:'LangGraph + UiPath',sla:99.96,eval:97.2},
  {id:'forecast-petco',name:'Demand Forecast Review Agent',short:'Forecast Agent',cust:'petco',env:'Production',status:'warn',contract:'MAS',hosting:'Beecker-hosted',fn:'Supply Chain',runs24:180,success:94.4,autonomy:87.0,ex:5.6,p95:'5.1 min',cost24:77,ver:'v1.1.0',orch:'Python + LLM',sla:99.75,eval:92.3},
];

/* Grupo Lala AI portfolio (Managed AI Services) */
  const INITIATIVES: Initiative[] = [
  {id:'invoice',name:'Invoice Processing Agent',stage:'Production',fn:'Finance · AP',lead:'diego',sponsor:'laura',golive:'Live · Jun 2025',value:187,ready:'Live',reuse:12,agent:'invoice'},
  {id:'payroll',name:'Payroll Exception Agent',stage:'Production',fn:'HR · Payroll',lead:'sofia',sponsor:'patricia',golive:'Live · Aug 2025',value:96,ready:'Live',reuse:34,agent:'payroll'},
  {id:'bankrec',name:'Bank Reconciliation Agent',stage:'Production',fn:'Finance · Treasury',lead:'diego',sponsor:'ricardo',golive:'Live · Oct 2025',value:121,ready:'Live',reuse:41,agent:'bankrec'},
  {id:'cmd',name:'Customer Master Data Agent',stage:'Production',fn:'Commercial',lead:'sofia',sponsor:'javier',golive:'Live · Feb 2026',value:58,ready:'Live',reuse:52,agent:'cmd'},
  {id:'expense',name:'Expense Audit Agent',stage:'UAT',fn:'Finance · T&E',lead:'sofia',sponsor:'ricardo',golive:'Nov 17, 2026',value:64,ready:'94%',reuse:58,agent:'expense'},
  {id:'freight',name:'Freight Invoice Agent',stage:'UAT',fn:'Logistics',lead:'diego',sponsor:'laura',golive:'Nov 24, 2026',value:72,ready:'91%',reuse:63,agent:'freight'},
  {id:'vendor',name:'Vendor Onboarding Agent',stage:'Development',fn:'Procurement',lead:'diego',sponsor:'hector',golive:'Dec 1, 2026',value:96,ready:'78%',reuse:61,agent:'vendor'},
  {id:'collections',name:'Collections Copilot',stage:'Development',fn:'Finance · AR',lead:'sofia',sponsor:'ricardo',golive:'Jan 19, 2027',value:144,ready:'52%',reuse:47},
  {id:'credit',name:'Credit Check Agent',stage:'Development',fn:'Commercial',lead:'sofia',sponsor:'javier',golive:'Feb 2, 2027',value:52,ready:'40%',reuse:55},
  {id:'suprec',name:'Supplier Reconciliation',stage:'Business Case',fn:'Finance · AP',lead:'mariana',sponsor:'laura',golive:'Mar 2027',value:210,ready:'High',reuse:68},
  {id:'poexc',name:'PO Exception Agent',stage:'Business Case',fn:'Procurement',lead:'mariana',sponsor:'hector',golive:'Apr 2027',value:190,ready:'High',reuse:72},
  {id:'interco',name:'Intercompany Reconciliation',stage:'Business Case',fn:'Finance · R2R',lead:'mariana',sponsor:'ricardo',golive:'May 2027',value:135,ready:'Medium',reuse:49},
  {id:'orderentry',name:'Order Entry Agent',stage:'Discovery',fn:'Order-to-Cash',lead:'mariana',sponsor:'javier',golive:'Q2 2027',value:160,ready:'Medium',reuse:64},
  {id:'travel',name:'Travel Policy Agent',stage:'Discovery',fn:'Finance · T&E',lead:'sofia',sponsor:'ricardo',golive:'Q3 2027',value:38,ready:'Low',reuse:51},
];

/* Discovery records */
  const DISCOVERY: Record<string, Discovery> = {
  suprec:{problem:'6 analysts manually reconcile supplier balances across SAP and spreadsheets every month-end. Statement formats differ by supplier; discrepancies are chased by email.',
    volume:'14,000/month',systems:['SAP S/4HANA','SharePoint'],effort:'1,900 hours/year',value:'$210K/year',sponsor:'laura',readiness:'High',complexity:'Medium',
    users:'AP analysts (6), AP supervisor, Treasury',rules:'Tolerance ±0.5% or $1,000 MXN; open items >60 days escalate; credit notes must reference original invoice',
    pain:'Month-end close delayed 2–3 days; 11% of supplier statements arrive as scanned PDF; no audit trail of resolution',
    exceptions:'Missing credit notes, duplicate payments, FX differences, unposted invoices',feas:'High — SAP vendor ledger already modeled; statements in SharePoint',
    security:'Read-only SAP FI access; no payment creation; data stays in Lala Azure tenant',deps:'SAP FI read API (exists), SharePoint statement library (exists), AP supervisor as approver',
    source:'Captured by Mariana Ortega · Sep 22 workshop with Laura Méndez'},
  orderentry:{problem:'Customer service reps re-key ~9,000 emailed and faxed orders per month into SAP SD. Error rate drives credit memos.',
    volume:'9,000/month',systems:['SAP S/4HANA','Salesforce','Outlook'],effort:'3,400 hours/year',value:'$160K/year',sponsor:'javier',readiness:'Medium',complexity:'Medium',
    users:'Customer service (11 reps)',rules:'Price list validity; credit limit check; minimum order quantity',pain:'Order cycle time 26h; 3.1% keying errors',exceptions:'Unknown SKU, price mismatch, blocked customer',
    feas:'Medium — Celestica Order Entry pattern applies; SAP SD not yet modeled',security:'Write to SAP SD sales orders only',deps:'SAP SD BAPI access; Outlook shared mailbox',source:'Captured by Mariana Ortega · Oct 6'},
};
/* Reuse detection results */
  const REUSE: Record<string, Reuse> = {
  suprec:{pct:68,weeks:6,without:14,have:[['SAP S/4HANA integration','Built for Invoice Processing Agent · 14 actions'],['Vendor entity','SAP BP + Coupa · used by 3 agents'],['Invoice entity','Used by Invoice Processing Agent'],['Payment entity','Used by Bank Reconciliation Agent'],['Procurement permissions','Approval matrix v4 · signed by Lala Procurement'],['Evaluation framework','Finance accuracy suite · 412 labeled cases'],['Document extraction tool','Supplier statement parser · 38 layouts']],
    need:['Reconciliation workflow','Reconciliation rules (tolerance, aging)','Exception logic and routing']},
  orderentry:{pct:64,weeks:7,without:15,have:[['Order-to-Cash process model','Pattern from Celestica Order Entry Agent (no customer data)'],['Customer entity','Built for Customer Master Data Agent'],['Salesforce integration','4 actions in production'],['Email intake tool','Shared mailbox listener v2'],['Pricing rules','Sales Order Validation Agent']],
    need:['SAP SD order actions','Order extraction prompts and eval set','Credit block exception routing']},
  invexc:{pct:74,weeks:5,without:13,have:[['Invoice Processing Agent workflow','v3.4.2 in production'],['Vendor, Invoice, PO entities','Operational map · Procure-to-Pay'],['SAP posting actions','Post Invoice, Match PO'],['HITL queue + approval matrix','Invoices > $100K route to AP supervisor'],['Finance evaluation suite','412 labeled cases']],
    need:['Exception classification model','Resolution playbooks per exception type','Vendor communication templates']},
};

/* ---------- UNDERSTAND: operational map ---------- */
  const MAP_COLS: MapCol[] = [
  {k:'sys',t:'Systems',c:'#6E6980'},
  {k:'ent',t:'Entities',c:'#E0707A'},
  {k:'proc',t:'Processes',c:'#B49CF2'},
  {k:'act',t:'Actions',c:'#8458E0'},
  {k:'agt',t:'Agents',c:'#5B2FC4'},
];
  const MAP_NODES: MapNode[] = [
  ['sap','sys','SAP S/4HANA'],['coupa','sys','Coupa'],['sf','sys','SuccessFactors'],['sfdc','sys','Salesforce'],['sp','sys','SharePoint'],['adl','sys','Azure Data Lake'],
  ['vendor','ent','Vendor'],['invoice','ent','Invoice'],['po','ent','Purchase Order'],['payment','ent','Payment'],['employee','ent','Employee'],['customer','ent','Customer'],
  ['vonb','proc','Vendor Onboarding'],['p2p','proc','Procure-to-Pay'],['o2c','proc','Order-to-Cash'],['h2r','proc','Hire-to-Retire'],['r2r','proc','Record-to-Report'],
  ['readv','act','Read Vendor'],['valv','act','Validate Vendor'],['createv','act','Create Vendor'],['updv','act','Update Vendor'],['matchpo','act','Match PO'],['postinv','act','Post Invoice'],['reqapp','act','Request Approval'],['createpay','act','Create Payment'],['reademp','act','Read Employee'],['readbal','act','Read Customer Balance'],
  ['a-vendor','agt','Vendor Onboarding Agent'],['a-invoice','agt','Invoice Processing Agent'],['a-suprec','agt','Supplier Reconciliation'],['a-bankrec','agt','Bank Reconciliation Agent'],['a-payroll','agt','Payroll Exception Agent'],['a-coll','agt','Collections Copilot'],
].map(([id, col, label]) => ({ id, col, label }));
  const MAP_EDGES: [string, string][] = [
  ['sap','vendor'],['coupa','vendor'],['sap','invoice'],['sp','invoice'],['sap','po'],['coupa','po'],['sap','payment'],['adl','payment'],['sf','employee'],['sap','employee'],['sfdc','customer'],['sap','customer'],
  ['vendor','vonb'],['vendor','p2p'],['invoice','p2p'],['po','p2p'],['payment','p2p'],['payment','r2r'],['invoice','r2r'],['employee','h2r'],['customer','o2c'],['payment','o2c'],
  ['vonb','readv'],['vonb','valv'],['vonb','createv'],['vonb','updv'],['vonb','reqapp'],['p2p','readv'],['p2p','matchpo'],['p2p','postinv'],['p2p','reqapp'],['p2p','createpay'],['h2r','reademp'],['h2r','reqapp'],['o2c','readbal'],['r2r','createpay'],
  ['readv','a-vendor'],['valv','a-vendor'],['createv','a-vendor'],['updv','a-vendor'],['reqapp','a-vendor'],
  ['readv','a-invoice'],['matchpo','a-invoice'],['postinv','a-invoice'],['reqapp','a-invoice'],
  ['readv','a-suprec'],['createpay','a-bankrec'],['matchpo','a-suprec'],
  ['reademp','a-payroll'],['reqapp','a-payroll'],['readbal','a-coll'],
];
  const MAP_DETAIL: Record<string, MapDetail> = {
  vendor:{kind:'Entity',desc:'A supplier of goods or services to Grupo Lala. Golden record lives in SAP Business Partner; Coupa holds onboarding requests.',
    systems:['SAP S/4HANA','Coupa'],usedBy:['Invoice Processing Agent','Vendor Onboarding Agent','Supplier Reconciliation'],
    actions:['Read Vendor','Validate Vendor','Create Vendor','Update Vendor'],
    rules:['Tax ID (RFC) required and validated against SAT','Bank account changes require procurement approval','Duplicate check on RFC + bank CLABE before create'],
    perms:['Vendor Agent may create vendor records','Invoice Agent may read vendor (no write)','Bank changes require human authorization'],
    fields:'vendor_id · rfc · legal_name · bank_clabe · payment_terms · status · risk_score',
    learned:'First modeled for Invoice Processing Agent (Mar 2025) · reused by 3 agents',
    knowledge:['PDD — Vendor Onboarding v2','SOP-PRC-014 Alta de proveedores','SAP BP schema (auto-imported)']},
  invoice:{kind:'Entity',desc:'Supplier invoice (CFDI) received by email, portal or EDI, posted to SAP FI.',systems:['SAP S/4HANA','SharePoint'],usedBy:['Invoice Processing Agent','Supplier Reconciliation'],
    actions:['Read Invoice','Match PO','Post Invoice','Request Approval'],rules:['Invoice variance < 2% vs PO','Invoices > $100K require approval','CFDI must be valid in SAT'],
    perms:['Invoice Agent may post validated invoices','Posting above $100K requires AP supervisor'],fields:'uuid_cfdi · vendor_id · po_number · amount · currency · due_date',learned:'Modeled Mar 2025 · 48K transactions/month',knowledge:['PDD — AP Automation v3','SOP-FIN-022 Registro de facturas']},
  sap:{kind:'System',desc:'Core ERP. Connected via SAP BTP OData APIs and UiPath for legacy transactions.',systems:[],usedBy:['Invoice Processing Agent','Vendor Onboarding Agent','Bank Reconciliation Agent','Payroll Exception Agent','+6 more'],
    actions:['Read Vendor','Create Vendor','Match PO','Post Invoice','Create Payment','Read Employee'],rules:['Writes only through approved service users','No direct table access'],perms:['svc_beecker_ai (FI, MM, BP scopes)','UAT and Prod tenants isolated'],fields:'Tenant LAL-PRD-100 · OData v4 · 14 modeled actions',learned:'Connected Feb 2025',knowledge:['Integration runbook','Service user matrix']},
  'a-vendor':{kind:'Agent',desc:'Development · target go-live Dec 1, 2026',go:['fde','agent','vendor']},
  'a-invoice':{kind:'Agent',desc:'Production · v3.4.2 · 2,310 runs in the last 24h',go:['fde','agent','invoice']},
  'a-suprec':{kind:'Initiative',desc:'Business Case · 68% reusable capabilities detected',go:['fde','discovery','suprec']},
  createv:{kind:'Action',desc:'Creates a vendor in SAP Business Partner via UiPath process BP_Create (OData not enabled for this tenant).',systems:['SAP S/4HANA'],usedBy:['Vendor Onboarding Agent'],actions:[],rules:['Requires validated RFC','Requires duplicate check pass'],perms:['Vendor Agent: allowed','Bank fields: human authorization'],fields:'Write · risk: high · idempotent key: rfc',learned:'Built Oct 2026',knowledge:['SOP-PRC-014']},
};
  const RULE_COUNTS: Record<string, string> = {vendor:'3 rules',invoice:'3 rules',payment:'2 rules',employee:'2 rules',createv:'2 perms',postinv:'2 perms',createpay:'2 perms',reqapp:'matrix'};

/* Understand catalogs */
  const CATALOG: Record<string, TableDef> = {
  systems:{cols:['System','Type','Connection','Envs','Entities','Agents','Status'],rows:[
    ['SAP S/4HANA','ERP','OData v4 + UiPath','Dev · UAT · Prod','Vendor, Invoice, PO, Payment, Employee, Customer','10','ok'],
    ['SuccessFactors','HCM','REST API','UAT · Prod','Employee','2','ok'],
    ['Salesforce','CRM','REST API','Prod','Customer, Opportunity','2','ok'],
    ['SharePoint','Documents','Graph API','Prod','Invoice, Statement, SOP','4','ok'],
    ['Azure Data Lake','Data','Synapse SQL','Prod','Payment, Ledger','2','ok'],
    ['Coupa','Procurement','REST API','UAT · Prod','Vendor, PO','2','warn'],
    ['SAP Concur','T&E','REST API','UAT','Expense Report','1','ok']]},
  entities:{cols:['Entity','Systems','Key fields','Used by','Rules','Permissions'],rows:[
    ['Vendor','SAP · Coupa','rfc, bank_clabe, payment_terms','3 agents','3','3'],
    ['Invoice','SAP · SharePoint','uuid_cfdi, po_number, amount','2 agents','3','2'],
    ['Purchase Order','SAP · Coupa','po_number, lines, tolerance','2 agents','1','1'],
    ['Payment','SAP · Azure Data Lake','doc_number, amount, value_date','2 agents','2','2'],
    ['Employee','SuccessFactors · SAP','employee_id, cost_center, pay_group','2 agents','2','2'],
    ['Customer','Salesforce · SAP','customer_id, credit_limit, segment','3 agents','2','1']]},
  processes:{cols:['Process','Owner','Variants','Steps modeled','Agents','Automated'],rows:[
    ['Procure-to-Pay','Laura Méndez','4','31','Invoice, Vendor, Supplier Rec.','62%'],
    ['Vendor Onboarding','Héctor Villa','2','12','Vendor Onboarding Agent','In build'],
    ['Order-to-Cash','Javier Torres','3','27','Sales Order, Customer MD, Collections','41%'],
    ['Hire-to-Retire','Patricia Gómez','3','22','Payroll, Onboarding','38%'],
    ['Record-to-Report','Ricardo Salinas','2','18','Bank Rec, Fixed Asset, Tax','47%']]},
  knowledge:{cols:['Document','Type','Linked to','Source','Indexed','Status'],rows:[
    ['AP Automation PDD v3','PDD','Procure-to-Pay','SharePoint /AP','Oct 2','ok'],
    ['Vendor Onboarding PDD v2','PDD','Vendor Onboarding','Generated by FINN, edited by FDE','Oct 9','ok'],
    ['SOP-PRC-014 Alta de proveedores','SOP','Vendor','SharePoint /Procurement','Sep 18','ok'],
    ['SOP-FIN-022 Registro de facturas','SOP','Invoice','SharePoint /Finance','Aug 30','ok'],
    ['Approval matrix v4','Policy','Request Approval','Signed PDF','Sep 1','ok'],
    ['Payroll calendar 2026','Reference','Hire-to-Retire','SuccessFactors','Oct 1','warn']]},
  rules:{cols:['Rule','Type','Applies to','Enforced in','Source'],rows:[
    ['Invoice variance < 2% vs PO','Deterministic','Invoice · Match PO','Validation node (Python)','AP Automation PDD v3'],
    ['Invoices > $100K require approval','Approval','Invoice · Post Invoice','Human Approval node','Approval matrix v4'],
    ['Bank account changes require procurement approval','Approval','Vendor · Update Vendor','Human Approval node','SOP-PRC-014'],
    ['Tax ID (RFC) must be valid in SAT','Deterministic','Vendor · Create Vendor','Validate Tax ID (Python)','SOP-PRC-014'],
    ['Payroll variance > 8% routes to HR','Threshold','Employee · Payroll run','Policy Check node','HR policy 2026'],
    ['Supplier balance tolerance ±0.5%','Deterministic','Payment · Reconciliation','Draft — Supplier Rec.','Sep 22 workshop']]},
  actions:{cols:['Action','System','Method','Type','Risk','Used by'],rows:[
    ['Read Vendor','SAP S/4HANA','OData A_BusinessPartner','Read','Low','3 agents'],
    ['Validate Vendor','SAT Web Service','REST','Read','Low','1 agent'],
    ['Create Vendor','SAP S/4HANA','UiPath BP_Create','Write','High','1 agent'],
    ['Update Vendor','SAP S/4HANA','UiPath BP_Change','Write','High','1 agent'],
    ['Match PO','SAP S/4HANA','OData A_PurchaseOrder','Read','Low','2 agents'],
    ['Post Invoice','SAP S/4HANA','OData A_SupplierInvoice','Write','Medium','1 agent'],
    ['Request Approval','Beecker HITL','Teams adaptive card','Human','—','5 agents'],
    ['Create Payment','SAP S/4HANA','F110 via UiPath','Write','High','1 agent']]},
  permissions:{cols:['Principal','Action','Scope','Condition','Human required'],rows:[
    ['Invoice Agent','Post Invoice','Company codes 1000, 1200','Validated, variance < 2%','Above $100K'],
    ['Invoice Agent','Read Vendor','All','—','No'],
    ['Vendor Agent','Create Vendor','Purchasing org LA01','RFC valid, no duplicate','Bank fields'],
    ['Vendor Agent','Update Vendor','Purchasing org LA01','Non-bank fields only','Bank fields'],
    ['Payroll Agent','Read Employee','Pay groups MX01–MX04','—','No'],
    ['Bank Rec Agent','Create Payment','Clearing only','Matched lines','Write-offs']]},
};
  const BUILDCAT: Record<string, TableDef> = {
  workflows:{cols:['Workflow','Agent','Engines','Nodes','Version','Status'],rows:[
    ['invoice_processing','Invoice Processing Agent','LangGraph · UiPath · Python','8','v3.4.2','ok'],
    ['vendor_onboarding','Vendor Onboarding Agent','LangGraph · UiPath · Python','8','v0.9.0-rc2','info'],
    ['payroll_exceptions','Payroll Exception Agent','Python · LangGraph','7','v2.1.0','warn'],
    ['bank_reconciliation','Bank Reconciliation Agent','Python','6','v1.8.0','ok'],
    ['expense_audit','Expense Audit Agent','LangGraph','6','v1.0.0-rc1','info'],
    ['collections_copilot','Collections Copilot','LangGraph · API','5','v0.3.0','info']]},
  tools:{cols:['Tool','Kind','System','Used by','Owner'],rows:[
    ['cfdi_extractor','Document extraction','SharePoint','Invoice, Freight, Supplier Rec.','Diego Ramírez'],
    ['sat_rfc_validator','Python service','SAT Web Service','Vendor, Tax','Sofía Chen'],
    ['sap_bp_create','UiPath process','SAP S/4HANA','Vendor','Diego Ramírez'],
    ['sap_invoice_post','API','SAP S/4HANA','Invoice, Freight','Diego Ramírez'],
    ['hitl_request','Beecker Platform','Teams','6 agents','Platform'],
    ['statement_parser','Document extraction','SharePoint','Supplier Rec. (planned)','Mariana Ortega']]},
  tests:{cols:['Suite','Agent','Cases','Passing','Last run'],rows:[
    ['vendor_onboarding.e2e','Vendor Onboarding Agent','58','54','12 min ago'],
    ['invoice_processing.regression','Invoice Processing Agent','142','142','2 h ago'],
    ['payroll.variance_cases','Payroll Exception Agent','90','88','Yesterday'],
    ['expense_audit.uat','Expense Audit Agent','62','61','3 h ago'],
    ['freight.uat','Freight Invoice Agent','48','48','5 h ago']]},
  evals:{cols:['Evaluation','Agent','Metric','Score','Threshold','Trend'],rows:[
    ['Finance extraction accuracy','Invoice Processing Agent','Field-level F1','96.8%','95%','up'],
    ['Vendor data completeness','Vendor Onboarding Agent','Exact match','92.4%','95%','up'],
    ['Payroll variance classification','Payroll Exception Agent','Accuracy','91.2%','93%','down'],
    ['Expense policy decisions','Expense Audit Agent','Agreement w/ auditors','95.0%','94%','up'],
    ['Bank line matching','Bank Reconciliation Agent','Precision','98.1%','97%','flat']]},
  versions:{cols:['Agent','Version','Change','Author','Environment','Date'],rows:[
    ['Vendor Onboarding Agent','v0.9.0-rc2','Duplicate check on CLABE + RFC','Diego Ramírez','UAT','Oct 14'],
    ['Payroll Exception Agent','v2.1.0','SAP timeout raised 30s → 60s','Sofía Chen','Production','Oct 13'],
    ['Invoice Processing Agent','v3.4.2','Coupa PO fallback','Diego Ramírez','Production','Oct 8'],
    ['Expense Audit Agent','v1.0.0-rc1','Policy 2026 update','Sofía Chen','UAT','Oct 7'],
    ['Freight Invoice Agent','v1.0.0-rc3','Rate table from SAP TM','Diego Ramírez','UAT','Oct 3']]},
};

/* Workflows for node builder */
  const WORKFLOWS: Record<string, Workflow> = {
  vendor:{w:1010,h:290,nodes:[
    {id:'n1',t:'trigger',l:'Vendor Request',e:'SharePoint form · Coupa webhook',x:20,y:110},
    {id:'n2',t:'llm',l:'Extract Information',e:'GPT-4.1 · prompt vendor_extract v7',x:160,y:110},
    {id:'n3',t:'python',l:'Validate Tax ID',e:'sat_rfc_validator',x:300,y:110},
    {id:'n4',t:'api',l:'Check Duplicate',e:'SAP A_BusinessPartner',x:440,y:110,st:'warn'},
    {id:'n5',t:'cond',l:'Bank data or risk > 0.3?',e:'Rule: bank changes need approval',x:580,y:110},
    {id:'n6',t:'human',l:'Human Approval',e:'Procurement · Teams card',x:720,y:20},
    {id:'n7',t:'erp',l:'Create Vendor in SAP',e:'UiPath BP_Create',x:860,y:110},
    {id:'n8',t:'api',l:'Notify Requester',e:'Outlook · Coupa status',x:860,y:210},
  ],edges:[['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6','yes'],['n5','n7','no'],['n6','n7','approved'],['n7','n8']]},
  invoice:{w:1010,h:290,nodes:[
    {id:'n1',t:'trigger',l:'Invoice Intake',e:'Mailbox + SAT CFDI feed',x:20,y:110},
    {id:'n2',t:'llm',l:'Document Extraction',e:'cfdi_extractor · GPT-4.1',x:160,y:110},
    {id:'n3',t:'python',l:'Vendor Matching',e:'Read Vendor · fuzzy RFC',x:300,y:110},
    {id:'n4',t:'langgraph',l:'PO Matching',e:'3-way match graph',x:440,y:110},
    {id:'n5',t:'cond',l:'Business Rule Validation',e:'Variance < 2% · > $100K',x:580,y:110},
    {id:'n6',t:'human',l:'Human Approval',e:'AP supervisor · HITL',x:720,y:20},
    {id:'n7',t:'uipath',l:'SAP Posting',e:'sap_invoice_post',x:860,y:110},
    {id:'n8',t:'api',l:'Confirmation',e:'Vendor portal + audit log',x:860,y:200},
  ],edges:[['n1','n2'],['n2','n3'],['n3','n4'],['n4','n5'],['n5','n6','needs approval'],['n5','n7','pass'],['n6','n7','approved'],['n7','n8']]},
};
  const NODE_DETAIL: Record<string, Record<string, NodeDetail>> = {
  vendor:{
    n1:{cfg:[['Engine','Beecker trigger'],['Sources','SharePoint list "Alta Proveedores", Coupa supplier request webhook'],['Volume','~45 requests/week']],ctx:['Vendor'],tests:'6/6'},
    n2:{cfg:[['Engine','LLM · Azure OpenAI GPT-4.1'],['Prompt','vendor_extract v7 (repo: prompts/vendor_extract.md)'],['Output schema','Vendor (operational map)'],['Temperature','0']],ctx:['Vendor','SOP-PRC-014'],tests:'14/14'},
    n3:{cfg:[['Engine','Python 3.11 · Azure Functions'],['Tool','sat_rfc_validator'],['Reused from','Tax Compliance Agent']],ctx:['Rule: Tax ID required'],tests:'9/9'},
    n4:{cfg:[['Engine','API · SAP OData A_BusinessPartner'],['Match keys','RFC, CLABE, legal name (fuzzy ≥ 0.92)'],['Status','4 failing tests on CLABE normalization']],ctx:['Action: Read Vendor'],tests:'8/12'},
    n5:{cfg:[['Engine','Deterministic condition'],['Expression','has_bank_data OR risk_score > 0.3'],['Source rule','Bank account changes require procurement approval']],ctx:['Rule','Permission'],tests:'7/7'},
    n6:{cfg:[['Engine','Beecker HITL'],['Approver','Lala Procurement (Héctor Villa)'],['Channel','Teams adaptive card'],['SLA','4 business hours']],ctx:['Permission: bank changes require human'],tests:'5/5'},
    n7:{cfg:[['Engine','UiPath · Orchestrator folder LALA/Procurement'],['Process','BP_Create v1.3'],['Action','Create Vendor (high risk)']],ctx:['Action: Create Vendor','Permission: Vendor Agent may create'],tests:'4/4'},
    n8:{cfg:[['Engine','API · Microsoft Graph + Coupa'],['Template','vendor_created_es.html']],ctx:[],tests:'1/1'},
  }
};

/* ---------- RUN ---------- */
  const HITL: HitlCase[] = [
  {id:'h1',ref:'Invoice #48302',agent:'invoice',cust:'lala',reason:'Vendor mismatch',conf:71,wait:12,sev:'warn',
   diff:[['Vendor RFC','LDN980512KJ3','LDN980512KJ8'],['Legal name','Lácteos del Norte SA de CV','Lácteos del Norte, S.A. de C.V.'],['Amount','$84,210.00 MXN','—'],['PO','4500912233','4500912233']],
   suggest:'Likely OCR error on last RFC digit. Vendor matched on name, PO and bank account. Suggest approve with corrected RFC.'},
  {id:'h2',ref:'Invoice #48294',agent:'invoice',cust:'lala',reason:'PO not found',conf:64,wait:8,sev:'warn',
   diff:[['PO number','4500918871','No match in SAP'],['Vendor','Envases Plásticos de Durango','Found'],['Amount','$212,400.00 MXN','—']],
   suggest:'PO may have been created in Coupa after SAP sync. Suggest route to AP for PO confirmation.'},
  {id:'h3',ref:'Payroll #2203',agent:'payroll',cust:'lala',reason:'Conflicting employee record',conf:58,wait:4,sev:'hum',
   diff:[['Employee ID','100482','100482'],['Cost center','MX-TOR-412','MX-GDL-207'],['Source','SuccessFactors','SAP HCM']],
   suggest:'Transfer effective Oct 1 not yet replicated to SAP HCM. Suggest hold and route to HR Ops.'},
  {id:'h4',ref:'Collection case C-77120',agent:'collections-femsa',cust:'femsa',reason:'Dispute language detected',conf:62,wait:19,sev:'crit',diff:[['Customer','Abarrotes La Esperanza','—'],['Balance','$41,880 MXN','—']],suggest:'Customer email mentions a pricing dispute. Suggest pause dunning and route to AR specialist.'},
  {id:'h5',ref:'Claim #CL-5512',agent:'claims-hk',cust:'heineken',reason:'Low extraction confidence',conf:55,wait:16,sev:'crit',diff:[['Product','Indio 355ml x24','—'],['Qty damaged','unclear','—']],suggest:'Photo attachment unreadable. Suggest request new photo from distributor.'},
  {id:'h6',ref:'Quote Q-20931',agent:'quote-cel',cust:'celestica',reason:'Price outside band',conf:74,wait:6,sev:'warn',diff:[['Unit price','$4.12','band $4.40–$4.95']],suggest:'Contract pricing may apply. Suggest route to pricing desk.'},
  {id:'h7',ref:'Forecast SKU 88213',agent:'forecast-petco',cust:'petco',reason:'Promotion not in calendar',conf:69,wait:3,sev:'warn',diff:[['Forecast delta','+38%','—']],suggest:'Suggest approve; promotion confirmed in merchandising email.'},
];
  const HITL_TOTAL_OFFSET: number = 36; /* 43 shown in headline = queue + cases outside the demo list */

  const CUST_APPROVALS: CustomerApproval[] = [
  {id:'c1',title:'Invoice #48311 above $100K',detail:'Lácteos del Norte · $142,800 MXN · 3-way match passed',agent:'invoice',rule:'Invoices > $100K require approval',wait:'26 min'},
  {id:'c2',title:'Vendor bank account change',detail:'Transportes Laguna · new CLABE ending 4471',agent:'vendor',rule:'Bank account changes require procurement approval',wait:'2 h'},
  {id:'c3',title:'Payroll adjustment over threshold',detail:'Plant Gómez Palacio · 14 employees · variance 9.2%',agent:'payroll',rule:'Payroll variance > 8% routes to HR',wait:'41 min'},
];
  const CUST_EXCEPTIONS: PlatformDb['custExceptions'] = [
  ['Payroll Exception Agent','SAP timeout — run delayed','17 workflows','Beecker resolving','warn'],
  ['Invoice Processing Agent','Vendor mismatch','1 invoice','Beecker ROC reviewing','info'],
  ['Invoice Processing Agent','PO not found','1 invoice','Beecker ROC reviewing','info'],
  ['Sales Order Validation Agent','Customer on credit block','2 orders','Waiting on Credit team','info'],
  ['Bank Reconciliation Agent','Unmatched bank line','1 line','Auto-retry tomorrow','info'],
  ['Credit Note Agent','Missing original invoice','1 claim','Waiting on Commercial','info'],
];

  const INCIDENTS: Omit<Incident, 'taken'>[] = [
  {id:'INC-2291',agent:'payroll',cust:'lala',sev:'warn',title:'Exception rate increased from 2.1% to 6.4%',detected:'42 minutes ago',cause:'SAP API timeout',affected:312,impact:'17 workflows delayed',sla:'Medium',status:'Investigating',owner:'ROC · Andrés Pacheco'},
  {id:'INC-2288',agent:'collections-femsa',cust:'femsa',sev:'crit',title:'Autonomy dropped below 75%',detected:'2 h ago',cause:'Upstream email format change',affected:640,impact:'Dunning paused for 3 regions',sla:'High',status:'Mitigating',owner:'ROC · Paula Ibarra'},
  {id:'INC-2286',agent:'claims-hk',cust:'heineken',sev:'crit',title:'Extraction confidence degraded',detected:'3 h ago',cause:'New distributor photo format',affected:210,impact:'Claims backlog +18%',sla:'High',status:'Investigating',owner:'ROC · Paula Ibarra'},
  {id:'INC-2284',agent:'quote-cel',cust:'celestica',sev:'warn',title:'p95 latency above 3 min',detected:'5 h ago',cause:'LLM provider throttling',affected:96,impact:'Quotes delayed',sla:'Low',status:'Monitoring',owner:'ROC · Andrés Pacheco'},
  {id:'INC-2280',agent:'forecast-petco',cust:'petco',sev:'warn',title:'Eval drift on promo SKUs',detected:'Yesterday',cause:'Promotion calendar missing',affected:58,impact:'Manual review increased',sla:'Low',status:'Improvement queued',owner:'AI Solutions · Petco'},
];

  const IMPROVEMENTS: Improvement[] = [
  {t:'Retry with backoff on SAP HCM timeouts',a:'Payroll Exception Agent',src:'Incident INC-2291',imp:'High',st:'New',who:'sofia'},
  {t:'CLABE normalization in duplicate check',a:'Vendor Onboarding Agent',src:'Failing tests',imp:'High',st:'In progress',who:'diego'},
  {t:'Coupa PO sync before PO match',a:'Invoice Processing Agent',src:'HITL pattern: PO not found (31 cases/mo)',imp:'Medium',st:'Planned',who:'diego'},
  {t:'Add transfer-date check to employee match',a:'Payroll Exception Agent',src:'HITL pattern: conflicting records',imp:'Medium',st:'Planned',who:'sofia'},
  {t:'Raise autonomy threshold to 0.82 for known vendors',a:'Invoice Processing Agent',src:'Eval: 0 errors in 2,140 cases',imp:'Medium',st:'Proposed',who:'mariana'},
  {t:'Spanish-language vendor notification templates',a:'Vendor Onboarding Agent',src:'Customer feedback',imp:'Low',st:'Done',who:'luis'},
];

/* FINN */
  const MEETINGS: Meeting[] = [
  {id:'lala-ap',acct:'Grupo Lala',title:'AP Automation Discovery',when:'Today · 9:00–10:00',done:true,score:82,ucs:['Invoice Exception Agent','Supplier Reconciliation'],
   summary:'Laura Méndez described 70K invoices/month with manual exception handling as the main bottleneck. Invoice Processing Agent handles the happy path; exceptions still take 4 analysts. Interest in extending to exception resolution and supplier statement reconciliation.',
   next:['Send exception-volume data request to AP supervisor','Book technical session with Carmen Ruiz (CIO) on Coupa API','Draft expansion proposal under existing Managed AI Services SOW'],proposal:'Draft ready'},
  {id:'cel-oe',acct:'Celestica',title:'Order Entry Agent — Expansion to EMEA',when:'Yesterday · 14:00',done:true,score:74,ucs:['Order Entry Agent (EMEA)'],
   summary:'Celestica wants the Order Entry Agent extended to 3 EMEA sites. German-language order forms and a separate SAP client are the main changes.',next:['Confirm SAP client access for EMEA','Price as Managed AI Agents add-on'],proposal:'Due Fri'},
  {id:'femsa-fin',acct:'FEMSA',title:'Finance Automation Roadmap',when:'Oct 13 · 11:00',done:true,score:61,ucs:['Intercompany Reconciliation','Treasury Forecast Copilot'],
   summary:'FEMSA finance leadership open to a portfolio engagement. Budget owner not yet confirmed; current Collections Agent incident came up and needs a clear remediation story.',next:['Confirm economic buyer','Share Collections Agent remediation plan from Operations'],proposal:'Not started'},
];
  const FINN_UPCOMING: PlatformDb['finnUpcoming'] = [
  ['11:30','Heineken México','Customer Claims — quarterly review','Valeria Núñez'],
  ['13:00','Petco','Vendor Master — expansion to Canada','Valeria Núñez'],
  ['16:00','Bimbo','First meeting — Shared Services','Valeria Núñez'],
];
  const OPPS: string[][] = [
  ['Grupo Lala','AP Exception Expansion','Discovery','$480K','Managed AI Services','Dec 12','Send data request'],
  ['Celestica','Order Entry EMEA','Proposal','$310K','Managed AI Agents','Nov 28','Proposal due Fri'],
  ['FEMSA','Finance Portfolio','Qualification','$1.2M','Managed AI Services','Feb 27','Confirm economic buyer'],
  ['Heineken México','Claims Agent v2','Negotiation','$190K','Managed AI Agents','Oct 31','Legal review'],
  ['Petco','Vendor Master Canada','Discovery','$140K','Managed AI Agents','Jan 15','Discovery call today'],
  ['Bimbo','Shared Services Automation','Prospecting','—','Managed AI Services','—','First meeting today'],
];

  AGENTS.forEach(a => { if (a.sla == null) a.sla = a.status === 'warn' ? 99.82 : 99.96; });

  return {
    people: PEOPLE, customers: CUSTOMERS, fleetOther: FLEET_OTHER, agents: AGENTS, initiatives: INITIATIVES,
    discovery: DISCOVERY, reuse: REUSE,
    mapCols: MAP_COLS, mapNodes: MAP_NODES, mapEdges: MAP_EDGES, mapDetail: MAP_DETAIL, ruleCounts: RULE_COUNTS,
    catalog: CATALOG, buildCat: BUILDCAT, workflows: WORKFLOWS, nodeDetail: NODE_DETAIL,
    hitl: HITL, hitlOffset: HITL_TOTAL_OFFSET, custApprovals: CUST_APPROVALS, custExceptions: CUST_EXCEPTIONS,
    incidents: INCIDENTS.map(i => ({ ...i, taken: [] })), improvements: IMPROVEMENTS,
    meetings: MEETINGS, finnUpcoming: FINN_UPCOMING, opps: OPPS,
  };
}
