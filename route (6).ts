import { moveToBuild, requestOpportunity } from '@/lib/mutations';
import { runMutation } from '@/lib/server/http';

/** PATCH /api/initiatives/:id { stage: 'Development' } | { requested: true } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { stage?: string; requested?: boolean };
  if (body.stage === 'Development') return runMutation(d => moveToBuild(d, id));
  if (body.requested) return runMutation(d => requestOpportunity(d, id));
  return Response.json({ ok: false, error: 'Unsupported change' }, { status: 400 });
}
