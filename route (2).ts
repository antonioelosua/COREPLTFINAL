import { approvalDecision, type ApprovalDecision } from '@/lib/mutations';
import { runMutation } from '@/lib/server/http';

/** POST /api/approvals/:id/decision { decision: 'Approved' | 'Rejected' } — customer business approvals. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { decision } = (await req.json()) as { decision: ApprovalDecision };
  return runMutation(d => approvalDecision(d, id, decision));
}
