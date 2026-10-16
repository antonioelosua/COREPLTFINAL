import { hitlDecision, type HitlDecision } from '@/lib/mutations';
import { runMutation } from '@/lib/server/http';

/** POST /api/hitl/:id/decision { decision: 'approve' | 'reject' | 'route' | 'escalate' } */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decision } = (await req.json()) as { decision: HitlDecision };
  return runMutation(d => hitlDecision(d, id, decision));
}
