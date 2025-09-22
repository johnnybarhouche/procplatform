import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, AuditLog } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';
import {
  purchaseOrders,
  poAuditLogs,
  initializePOMockData,
} from '@/lib/mock-data/pos';

initializePOMockData();

// POST /api/pos/[id]/acknowledge - Record supplier acknowledgment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poId } = await params;
    const body = await request.json();
    const { acknowledged_by, acknowledgment_date, comments, estimated_delivery_date } = body;

    if (!acknowledged_by || !acknowledgment_date) {
      return NextResponse.json(
        { error: 'acknowledged_by and acknowledgment_date are required' },
        { status: 400 }
      );
    }

    const poIndex = purchaseOrders.findIndex((p) => p.id === poId);
    if (poIndex === -1) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    const po = purchaseOrders[poIndex];
    const oldStatus = po.status;

    // Update PO status to 'acknowledged'
    po.status = 'acknowledged';
    po.acknowledged_at = acknowledgment_date;
    po.acknowledged_by = acknowledged_by;
    po.acknowledged_by_name = acknowledged_by;
    if (estimated_delivery_date) {
      po.delivery_date = estimated_delivery_date;
    }
    po.updated_at = new Date().toISOString();

    // Add status history entry
    po.status_history.push({
      id: `posh-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      po_id: poId,
      status: 'acknowledged',
      previous_status: oldStatus,
      changed_by: acknowledged_by,
      changed_by_name: acknowledged_by,
      comments: comments || 'PO acknowledged by supplier',
      changed_at: new Date().toISOString(),
    });

    purchaseOrders[poIndex] = po;

    await notificationService.sendPOSupplierAcknowledgmentNotification(po);

    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${poId}`,
      entity_type: 'purchase_order',
      entity_id: poId,
      action: 'po_acknowledged_by_supplier',
      actor_id: acknowledged_by,
      actor_name: acknowledged_by,
      timestamp: new Date().toISOString(),
      before_data: { status: oldStatus },
      after_data: {
        status: 'acknowledged',
        acknowledged_at: po.acknowledged_at,
        acknowledged_by: po.acknowledged_by,
        delivery_date: po.delivery_date,
      },
    };
    poAuditLogs.push(auditLog);

    const acknowledgmentAudit: AuditLog = {
      id: `audit-${Date.now()}-${poId}-ack-log`,
      entity_type: 'purchase_order',
      entity_id: poId,
      action: 'supplier_acknowledged',
      actor_id: acknowledged_by,
      actor_name: acknowledged_by,
      timestamp: new Date().toISOString(),
      after_data: {
        comments: comments || 'PO acknowledged by supplier',
      },
    };
    poAuditLogs.push(acknowledgmentAudit);

    return NextResponse.json({
      success: true,
      message: 'PO acknowledgment recorded successfully',
      po,
    });
  } catch (error) {
    console.error('Error recording PO acknowledgment:', error);
    return NextResponse.json({ error: 'Failed to record PO acknowledgment' }, { status: 500 });
  }
}
