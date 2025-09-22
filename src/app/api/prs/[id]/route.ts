import { NextRequest, NextResponse } from 'next/server';
import { AuditLog, PurchaseRequisition } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';
import {
  purchaseRequisitions,
  prAuditLogs,
  initializePRMockData,
} from '@/lib/mock-data/prs';

initializePRMockData();

// GET /api/prs/[id] - Retrieve specific PR details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pr = purchaseRequisitions.find(p => p.id === id);
    
    if (!pr) {
      return NextResponse.json({ error: 'Purchase Requisition not found' }, { status: 404 });
    }
    
    return NextResponse.json(pr);
  } catch (error) {
    console.error('Error fetching PR:', error);
    return NextResponse.json({ error: 'Failed to fetch PR' }, { status: 500 });
  }
}

// PUT /api/prs/[id] - Update PR status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status, comments } = body;
    
    const { id } = await params;
    const prIndex = purchaseRequisitions.findIndex(p => p.id === id);
    
    if (prIndex === -1) {
      return NextResponse.json({ error: 'Purchase Requisition not found' }, { status: 404 });
    }
    
    const oldPR = { ...purchaseRequisitions[prIndex] };
    const updatedPR: PurchaseRequisition = {
      ...purchaseRequisitions[prIndex],
      status: status || purchaseRequisitions[prIndex].status,
      comments: comments || purchaseRequisitions[prIndex].comments,
      updated_at: new Date().toISOString()
    };
    
    purchaseRequisitions[prIndex] = updatedPR;
    
    // Log audit trail
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${updatedPR.id}`,
      entity_type: 'purchase_requisition',
      entity_id: updatedPR.id,
      action: 'pr_updated',
      actor_id: 'user',
      actor_name: 'User',
      timestamp: new Date().toISOString(),
      before_data: oldPR,
      after_data: updatedPR
    };
    prAuditLogs.push(auditLog);
    
    // Send notification if status changed
    if (status && status !== oldPR.status) {
      await notificationService.sendPRStatusChangeNotification(updatedPR, oldPR.status);
    }
    
    return NextResponse.json(updatedPR);
  } catch (error) {
    console.error('Error updating PR:', error);
    return NextResponse.json({ error: 'Failed to update PR' }, { status: 500 });
  }
}
