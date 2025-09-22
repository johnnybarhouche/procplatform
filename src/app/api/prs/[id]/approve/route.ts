import { NextRequest, NextResponse } from 'next/server';
import { PurchaseRequisition, PRApproval, AuditLog } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';
import { getNextApprovalLevel, isPRFullyApproved } from '@/lib/authorization-matrix';
import {
  purchaseRequisitions,
  prAuditLogs,
  initializePRMockData,
} from '@/lib/mock-data/prs';

initializePRMockData();

// POST /api/prs/[id]/approve - Approve a PR
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: prId } = await params;
    const body = await request.json();
    const { approver_id, comments } = body;
    
    if (!approver_id) {
      return NextResponse.json({ error: 'approver_id is required' }, { status: 400 });
    }
    
    const prIndex = purchaseRequisitions.findIndex(p => p.id === prId);
    
    if (prIndex === -1) {
      return NextResponse.json({ error: 'Purchase Requisition not found' }, { status: 404 });
    }
    
    const pr = purchaseRequisitions[prIndex];
    const nextLevel = getNextApprovalLevel(pr);
    
    if (nextLevel === 0) {
      return NextResponse.json({ error: 'No approval required or all approvals completed' }, { status: 400 });
    }
    
    // Create approval record
    const approval: PRApproval = {
      id: `pra-${Date.now()}-${nextLevel}`,
      pr_id: pr.id,
      approver_id,
      approver_name: 'Approver', // Mock approver name
      approval_level: nextLevel,
      status: 'approved',
      comments,
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Update PR with new approval
    const updatedApprovals = [...pr.approvals, approval];
    const updatedPR: PurchaseRequisition = {
      ...pr,
      approvals: updatedApprovals,
      updated_at: new Date().toISOString()
    };
    
    // Check if PR is fully approved
    if (isPRFullyApproved(updatedPR)) {
      updatedPR.status = 'approved';
      updatedPR.approved_at = new Date().toISOString();
      updatedPR.approved_by = approver_id;
      updatedPR.approved_by_name = approval.approver_name;
    } else {
      updatedPR.status = 'under_review';
    }
    
    purchaseRequisitions[prIndex] = updatedPR;
    
    // Log audit trail
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${updatedPR.id}`,
      entity_type: 'purchase_requisition',
      entity_id: updatedPR.id,
      action: 'pr_approved',
      actor_id: approver_id,
      actor_name: approval.approver_name,
      timestamp: new Date().toISOString(),
      before_data: pr,
      after_data: updatedPR
    };
    prAuditLogs.push(auditLog);
    
    // Send notification
    await notificationService.sendPRApprovalDecisionNotification(updatedPR, approval);
    
    // If fully approved, trigger PO generation
    if (updatedPR.status === 'approved') {
      const poTriggerLog: AuditLog = {
        id: `audit-${Date.now()}-po-trigger`,
        entity_type: 'purchase_requisition',
        entity_id: updatedPR.id,
        action: 'po_generation_triggered',
        actor_id: 'system',
        actor_name: 'System',
        timestamp: new Date().toISOString(),
        after_data: { 
          pr_id: updatedPR.id,
          total_value: updatedPR.total_value,
          supplier: updatedPR.supplier.name
        }
      };
      prAuditLogs.push(poTriggerLog);
    }
    
    return NextResponse.json(updatedPR);
  } catch (error) {
    console.error('Error approving PR:', error);
    return NextResponse.json({ error: 'Failed to approve PR' }, { status: 500 });
  }
}
