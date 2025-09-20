import { NextRequest, NextResponse } from 'next/server';
import { QuoteApproval, AuditLog, LineItemDecision } from '@/types/procurement';

// Mock data - in production this would come from database
const quoteApprovals: QuoteApproval[] = [];
const auditLogs: AuditLog[] = [];

// GET /api/quote-approvals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const approval = quoteApprovals.find(a => a.id === id);
    
    if (!approval) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    return NextResponse.json(approval);
  } catch (error) {
    console.error('Error fetching quote approval:', error);
    return NextResponse.json({ error: 'Failed to fetch quote approval' }, { status: 500 });
  }
}

// POST /api/quote-approvals/[id] - Submit approval decision
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { decision, line_item_decisions, comments } = body;

    const { id } = await params;
    const approvalIndex = quoteApprovals.findIndex(a => a.id === id);
    
    if (approvalIndex === -1) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    // Update approval
    const updatedApproval: QuoteApproval = {
      ...quoteApprovals[approvalIndex],
      status: decision,
      updated_at: new Date().toISOString(),
      approved_at: decision === 'approved' ? new Date().toISOString() : undefined,
      approved_by: decision === 'approved' ? 'end-user' : undefined,
      approved_by_name: decision === 'approved' ? 'End User' : undefined,
      comments,
      line_item_decisions: line_item_decisions || []
    };

    quoteApprovals[approvalIndex] = updatedApproval;

    // Log the decision
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: quoteApprovals[approvalIndex].quote_pack_id,
      action: `approval_${decision}`,
      actor_id: 'end-user',
      actor_name: 'End User',
      timestamp: new Date().toISOString(),
      before_data: { status: 'pending' },
      after_data: { 
        status: decision, 
        line_item_decisions: line_item_decisions?.length || 0,
        comments 
      }
    };
    auditLogs.push(auditLog);

    // If approved, trigger PR creation workflow
    if (decision === 'approved') {
      // This would trigger the PR creation workflow
      console.log('Triggering PR creation workflow for approved items');
      
      // Log PR creation trigger
      const prTriggerLog: AuditLog = {
        id: `audit-${Date.now() + 1}`,
        entity_type: 'quote_pack',
        entity_id: quoteApprovals[approvalIndex].quote_pack_id,
        action: 'pr_creation_triggered',
        actor_id: 'system',
        actor_name: 'System',
        timestamp: new Date().toISOString(),
        after_data: { 
          approved_items: line_item_decisions?.filter((d: LineItemDecision) => d.decision === 'approved').length || 0,
          total_value: line_item_decisions?.reduce((sum: number, d: LineItemDecision) => {
            if (d.decision === 'approved' && d.selected_quote) {
              return sum + (d.selected_quote.total_amount || 0);
            }
            return sum;
          }, 0) || 0
        }
      };
      auditLogs.push(prTriggerLog);
    }

    // If rejected, return items to procurement
    if (decision === 'rejected') {
      console.log('Returning rejected items to procurement for re-quoting');
      
      // Log rejection workflow
      const rejectionLog: AuditLog = {
        id: `audit-${Date.now() + 1}`,
        entity_type: 'quote_pack',
        entity_id: quoteApprovals[approvalIndex].quote_pack_id,
        action: 'returned_to_procurement',
        actor_id: 'system',
        actor_name: 'System',
        timestamp: new Date().toISOString(),
        after_data: { 
          rejected_items: line_item_decisions?.filter((d: LineItemDecision) => d.decision === 'rejected').length || 0,
          reason: 'End user rejection'
        }
      };
      auditLogs.push(rejectionLog);
    }

    return NextResponse.json(updatedApproval);
  } catch (error) {
    console.error('Error updating quote approval:', error);
    return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
  }
}

// PUT /api/quote-approvals/[id] - Update approval
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { line_item_decisions, comments } = body;

    const { id } = await params;
    const approvalIndex = quoteApprovals.findIndex(a => a.id === id);
    
    if (approvalIndex === -1) {
      return NextResponse.json({ error: 'Quote approval not found' }, { status: 404 });
    }

    // Update approval
    const updatedApproval: QuoteApproval = {
      ...quoteApprovals[approvalIndex],
      updated_at: new Date().toISOString(),
      line_item_decisions: line_item_decisions || quoteApprovals[approvalIndex].line_item_decisions,
      comments: comments || quoteApprovals[approvalIndex].comments
    };

    quoteApprovals[approvalIndex] = updatedApproval;

    // Log the update
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: quoteApprovals[approvalIndex].quote_pack_id,
      action: 'approval_updated',
      actor_id: 'end-user',
      actor_name: 'End User',
      timestamp: new Date().toISOString(),
      after_data: { 
        line_item_decisions: line_item_decisions?.length || 0,
        comments: comments ? 'Updated' : 'No change'
      }
    };
    auditLogs.push(auditLog);

    return NextResponse.json(updatedApproval);
  } catch (error) {
    console.error('Error updating quote approval:', error);
    return NextResponse.json({ error: 'Failed to update quote approval' }, { status: 500 });
  }
}
