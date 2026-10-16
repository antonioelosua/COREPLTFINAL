import { incidentAction } from '@/lib/mutations';
import { runMutation } from '@/lib/server/http';
import type { IncidentAction } from '@/lib/types';

/** POST /api/incidents/:id/actions { action: 'escalate' | 'pause' | 'rollback' | 'improve' | 'resolve' | 'comms' } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action } = (await req.json()) as { action: IncidentAction };
  return runMutation(d => incidentAction(d, id, action));
}
