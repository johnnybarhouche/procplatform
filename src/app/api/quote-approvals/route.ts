import { NextRequest, NextResponse } from 'next/server';
import {
  createQuoteApprovalForRFQ,
  getQuoteApprovals,
  logQuoteApprovalAudit,
  seedQuoteApprovals,
} from '@/lib/mock-quote-approvals';

seedQuoteApprovals();

export async function GET() {
  try {
    return NextResponse.json(getQuoteApprovals());
  } catch (error) {
    console.error('Error fetching quote approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch quote approvals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfq_id } = body;

    if (!rfq_id) {
      return NextResponse.json({ error: 'rfq_id is required' }, { status: 400 });
    }

    const newApproval = createQuoteApprovalForRFQ(rfq_id);
    if (!newApproval) {
      return NextResponse.json({ error: 'RFQ not found' }, { status: 404 });
    }

    logQuoteApprovalAudit({
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: newApproval.quote_pack_id,
      action: 'approval_created',
      actor_id: 'system',
      actor_name: 'System',
      timestamp: new Date().toISOString(),
      after_data: { approval_id: newApproval.id, status: 'pending' },
    });

    return NextResponse.json(newApproval, { status: 201 });
  } catch (error) {
    console.error('Error creating quote approval:', error);
    return NextResponse.json({ error: 'Failed to create quote approval' }, { status: 500 });
  }
}
