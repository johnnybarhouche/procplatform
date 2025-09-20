import { NextRequest, NextResponse } from 'next/server';
import { PurchaseRequisition, PRApproval, AuditLog } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';

// Mock database - in production this would come from database
const purchaseRequisitions: PurchaseRequisition[] = [];
const auditLogs: AuditLog[] = [];

// POST /api/prs/[id]/reject - Reject a PR
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { approver_id, reason, comments } = body;
    
    if (!approver_id || !reason) {
      return NextResponse.json({ error: 'approver_id and reason are required' }, { status: 400 });
    }
    
    const { id } = await params;
    const prIndex = purchaseRequisitions.findIndex(p => p.id === id);
    
    if (prIndex === -1) {
      return NextResponse.json({ error: 'Purchase Requisition not found' }, { status: 404 });
    }
    
    const pr = purchaseRequisitions[prIndex];
    
    // Create rejection approval record
    const approval: PRApproval = {
      id: `pra-${Date.now()}-reject`,
      pr_id: pr.id,
      approver_id,
      approver_name: 'Approver', // Mock approver name
      approval_level: 0, // Rejection level
      status: 'rejected',
      comments: comments || reason,
      rejected_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Update PR with rejection
    const updatedApprovals = [...pr.approvals, approval];
    const updatedPR: PurchaseRequisition = {
      ...pr,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: approver_id,
      rejected_by_name: approval.approver_name,
      rejection_reason: reason,
      comments: comments || pr.comments,
      approvals: updatedApprovals,
      updated_at: new Date().toISOString()
    };
    
    purchaseRequisitions[prIndex] = updatedPR;
    
    // Log audit trail
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${updatedPR.id}`,
      entity_type: 'purchase_requisition',
      entity_id: updatedPR.id,
      action: 'pr_rejected',
      actor_id: approver_id,
      actor_name: approval.approver_name,
      timestamp: new Date().toISOString(),
      before_data: pr,
      after_data: updatedPR
    };
    auditLogs.push(auditLog);
    
    // Send notification
    await notificationService.sendPRApprovalDecisionNotification(updatedPR, approval);
    
    // Log return to procurement
    const returnToProcurementLog: AuditLog = {
      id: `audit-${Date.now()}-return-to-procurement`,
      entity_type: 'purchase_requisition',
      entity_id: updatedPR.id,
      action: 'returned_to_procurement',
      actor_id: 'system',
      actor_name: 'System',
      timestamp: new Date().toISOString(),
      after_data: { 
        reason: 'PR rejected by approver',
        rejection_reason: reason,
        approver: approval.approver_name
      }
    };
    auditLogs.push(returnToProcurementLog);
    
    return NextResponse.json(updatedPR);
  } catch (error) {
    console.error('Error rejecting PR:', error);
    return NextResponse.json({ error: 'Failed to reject PR' }, { status: 500 });
  }
}
