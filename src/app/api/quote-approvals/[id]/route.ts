import { NextRequest, NextResponse } from 'next/server';
import {
  buildLineItemDecision,
  getQuoteApproval,
  logQuoteApprovalAudit,
  seedQuoteApprovals,
  updateQuoteApproval,
} from '@/lib/mock-quote-approvals';
import { LineItemDecision, QuoteApproval } from '@/types/procurement';

seedQuoteApprovals();

function computeSavingsForLine(approval: QuoteApproval, decision: LineItemDecision) {
  const lineId = decision.mr_line_item_id;
  const quotesForLine = approval.quote_pack.quotes
    .map((quote) => {
      const lineItem = quote.line_items.find((item) => item.mr_line_item_id === lineId);
      return lineItem ? { quote, lineItem } : undefined;
    })
    .filter(Boolean) as { quote: typeof approval.quote_pack.quotes[number]; lineItem: typeof approval.quote_pack.quotes[number]['line_items'][number] }[];

  if (!quotesForLine.length) {
    return 0;
  }

  const lowest = quotesForLine.reduce((min, current) =>
    current.lineItem.total_price < min.lineItem.total_price ? current : min
  );
  const selected = quotesForLine.find((entry) => entry.quote.id === decision.selected_quote_id);
  if (!selected) return 0;
  return Number((lowest.lineItem.total_price - selected.lineItem.total_price).toFixed(2));
}

function buildComparisonSummary(approval: QuoteApproval, decisions: LineItemDecision[]) {
  const rfq = approval.quote_pack.rfq;
  return {
    rfq_id: rfq.id,
    rfq_number: rfq.rfq_number,
    material_request: {
      id: rfq.material_request.id,
      mrn: rfq.material_request.mrn,
      project_name: rfq.material_request.project_name,
    },
    selections: decisions.map((decision) => {
      const quote = decision.selected_quote;
      const lineItem = quote?.line_items.find((item) => item.mr_line_item_id === decision.mr_line_item_id);
      return {
        line_item_id: decision.mr_line_item_id,
        line_description: decision.mr_line_item.description,
        supplier_id: quote?.supplier_id ?? '',
        supplier_name: quote?.supplier.name ?? 'Unknown Supplier',
        unit_price: lineItem?.unit_price ?? 0,
        total_price: lineItem?.total_price ?? 0,
        savings: computeSavingsForLine(approval, decision),
      };
    }),
    generated_at: new Date().toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const approval = getQuoteApproval(id);
    if (!approval) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error fetching quote approval:', error);
    return NextResponse.json({ error: 'Failed to fetch quote approval' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { decision, line_item_decisions, comments } = body as {
      decision: 'approved' | 'rejected';
      line_item_decisions?: Array<{ mr_line_item_id: string; selected_quote_id: string; comments?: string; decision?: 'approved' | 'rejected' }>;
      comments?: string;
    };

    if (!decision) {
      return NextResponse.json({ error: 'Decision is required.' }, { status: 400 });
    }

    const { id } = await params;
    const approval = getQuoteApproval(id);
    if (!approval) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    const rfq = approval.quote_pack.rfq;

    let decisions: LineItemDecision[] = [];
    if (decision === 'approved') {
      const payload = Array.isArray(line_item_decisions) ? line_item_decisions : [];
      decisions = payload
        .map((entry) =>
          buildLineItemDecision(
            approval,
            entry.mr_line_item_id,
            entry.selected_quote_id,
            entry.decision ?? 'approved',
            entry.comments,
          )
        )
        .filter(Boolean) as LineItemDecision[];

      const requiredLines = rfq.material_request.line_items.filter((line) => {
        const availableQuotes = approval.quote_pack.quotes.some((quote) =>
          quote.line_items.some((item) => item.mr_line_item_id === line.id)
        );
        return availableQuotes;
      });

      if (decisions.length !== requiredLines.length) {
        return NextResponse.json({ error: 'All lines with supplier quotes must have a selected supplier before approval.' }, { status: 400 });
      }
    }

    const updatedApproval = updateQuoteApproval(id, (existing) => {
      const now = new Date().toISOString();
      const next: QuoteApproval = {
        ...existing,
        status: decision,
        updated_at: now,
        approved_at: decision === 'approved' ? now : undefined,
        approved_by: decision === 'approved' ? 'end-user' : existing.approved_by,
        approved_by_name: decision === 'approved' ? 'End User' : existing.approved_by_name,
        comments,
        line_item_decisions: decision === 'approved' ? decisions : [],
      };

      next.quote_pack.status = decision === 'approved' ? 'approved' : 'rejected';
      next.quote_pack.rfq.status = decision === 'approved' ? 'approved' : 'comparison_ready';
      next.quote_pack.rfq.updated_at = now;

      if (decision === 'approved' && decisions.length) {
        next.quote_pack.rfq.comparison_summary = buildComparisonSummary(next, decisions);
        next.quote_pack.comparison_data.recommended_suppliers = decisions.map((entry) => entry.selected_quote?.supplier_id ?? '');
        next.quote_pack.comparison_data.total_savings = decisions.reduce((sum, entry) => sum + computeSavingsForLine(next, entry), 0);
      }

      return next;
    });

    if (!updatedApproval) {
      return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
    }

    logQuoteApprovalAudit({
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: updatedApproval.quote_pack_id,
      action: `approval_${decision}`,
      actor_id: 'end-user',
      actor_name: 'End User',
      timestamp: new Date().toISOString(),
      after_data: {
        status: decision,
        line_item_decisions: updatedApproval.line_item_decisions.length,
        comments: comments ? 'provided' : 'none',
      },
    });

    if (decision === 'approved') {
      logQuoteApprovalAudit({
        id: `audit-${Date.now() + 1}`,
        entity_type: 'quote_pack',
        entity_id: updatedApproval.quote_pack_id,
        action: 'pr_creation_triggered',
        actor_id: 'system',
        actor_name: 'System',
        timestamp: new Date().toISOString(),
        after_data: {
          approved_items: updatedApproval.line_item_decisions.length,
        },
      });
    }

    return NextResponse.json(updatedApproval);
  } catch (error) {
    console.error('Error updating quote approval:', error);
    return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { line_item_decisions, comments } = body as {
      line_item_decisions?: Array<{ mr_line_item_id: string; selected_quote_id: string; comments?: string; decision?: 'approved' | 'rejected' }>;
      comments?: string;
    };

    const { id } = await params;
    const approval = getQuoteApproval(id);
    if (!approval) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    let decisions = approval.line_item_decisions;
    if (Array.isArray(line_item_decisions)) {
      decisions = line_item_decisions
        .map((entry) =>
          buildLineItemDecision(approval, entry.mr_line_item_id, entry.selected_quote_id, entry.decision ?? 'approved', entry.comments)
        )
        .filter(Boolean) as LineItemDecision[];
    }

    const updatedApproval = updateQuoteApproval(id, (existing) => ({
      ...existing,
      updated_at: new Date().toISOString(),
      line_item_decisions: decisions,
      comments: comments ?? existing.comments,
    }));

    if (!updatedApproval) {
      return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
    }

    logQuoteApprovalAudit({
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: updatedApproval.quote_pack_id,
      action: 'approval_updated',
      actor_id: 'end-user',
      actor_name: 'End User',
      timestamp: new Date().toISOString(),
      after_data: {
        line_item_decisions: updatedApproval.line_item_decisions.length,
        comments: comments ? 'updated' : 'unchanged',
      },
    });

    return NextResponse.json(updatedApproval);
  } catch (error) {
    console.error('Error updating quote approval:', error);
    return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
  }
}
