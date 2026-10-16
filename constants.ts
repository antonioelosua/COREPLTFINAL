import type { NodeType, Stage } from './types';

export const STAGES: Stage[] = ['Discovery','Business Case','Development','UAT','Production'];
export const STAGE_COLOR: Record<Stage, string> = {Discovery:'#9A94AB','Business Case':'#E9767C',Development:'#A68AEE',UAT:'#8458E0',Production:'#5B2FC4'};

/** Workflow node types — the platform is orchestration-agnostic. */
export const NT: Record<NodeType, { l: string; a: string; c: string }> = {
  trigger:{l:'Trigger',a:'TR',c:'#6E6980'}, llm:{l:'LLM',a:'AI',c:'#7A4FE0'}, python:{l:'Python',a:'PY',c:'#57536A'},
  langgraph:{l:'LangGraph',a:'LG',c:'#9C7BEA'}, uipath:{l:'UiPath',a:'UI',c:'#E0707A'}, api:{l:'API',a:'API',c:'#3F3A52'},
  human:{l:'Human Approval',a:'HU',c:'#C9484E'}, cond:{l:'Condition',a:'IF',c:'#A68AEE'}, erp:{l:'ERP Action',a:'ERP',c:'#5B2FC4'},
};
