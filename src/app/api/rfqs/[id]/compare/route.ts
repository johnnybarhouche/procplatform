import { NextRequest, NextResponse } from 'next/server';
import { AuditLog, ComparisonSummary } from '@/types/procurement';
import { rfqStore } from '../../route';

type ComparisonEvent = 'selection_saved' | 'selection_changed' | 'exported';

type SelectionChangePayload = {
  rfq_id: string;
  line_item_id: string;
  supplier_id: string;
  previous_supplier_id: string | null;
};

const comparisonSummaries = new Map<string, ComparisonSummary>();
const comparisonAuditLogs: AuditLog[] = [];

function recordAudit(event: ComparisonEvent, rfqId: string, detail: unknown) {
  const audit: AuditLog = {
    id: `audit-${event}-${rfqId}-${Date.now()}`,
    entity_type: 'quote',
    entity_id: rfqId,
    action: `comparison_${event}`,
    actor_id: 'procurement-analyst',
    actor_name: 'Procurement Analyst',
    timestamp: new Date().toISOString(),
    after_data: detail,
  };
  comparisonAuditLogs.push(audit);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { event, summary, payload } = body as {
      event?: ComparisonEvent;
      summary?: ComparisonSummary;
      payload?: SelectionChangePayload;
    };

    if (!event) {
      return NextResponse.json({ error: 'Event type is required.' }, { status: 400 });
    }

    const { id } = await params;

    if (event === 'selection_changed') {
      if (!payload || !payload.line_item_id || !payload.supplier_id) {
        return NextResponse.json({ error: 'Selection change payload incomplete.' }, { status: 400 });
      }

      recordAudit(event, id, payload);
      return NextResponse.json({ ok: true });
    }

    if (!summary) {
      return NextResponse.json({ error: 'Summary data is required for this event.' }, { status: 400 });
    }

    comparisonSummaries.set(id, summary);

    const rfq = rfqStore.find((item) => item.id === id);
    if (rfq) {
      rfq.comparison_summary = summary;
    }

    recordAudit(event, id, summary);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Failed to handle comparison event:', error);
    return NextResponse.json({ error: 'Failed to process comparison event.' }, { status: 500 });
  }
}

export { comparisonAuditLogs };
