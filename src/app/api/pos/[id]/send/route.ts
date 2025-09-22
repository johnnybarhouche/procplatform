import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, AuditLog } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';
import {
  purchaseOrders,
  poAuditLogs,
  initializePOMockData,
} from '@/lib/mock-data/pos';

initializePOMockData();

// POST /api/pos/[id]/send - Send PO to supplier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poId } = await params;
    const body = await request.json();
    const { supplier_email, message, sender_id, sender_name } = body;

    const poIndex = purchaseOrders.findIndex(p => p.id === poId);
    if (poIndex === -1) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    const po = purchaseOrders[poIndex];
    const oldStatus = po.status;

    // Update PO status to 'sent'
    po.status = 'sent';
    po.sent_at = new Date().toISOString();
    po.sent_by = sender_id || 'system';
    po.sent_by_name = sender_name || 'System';
    po.updated_at = new Date().toISOString();

    // Add status history entry
    po.status_history.push({
      id: `posh-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      po_id: poId,
      status: 'sent',
      previous_status: oldStatus,
      changed_by: sender_id || 'system',
      changed_by_name: sender_name || 'System',
      comments: message || 'PO sent to supplier',
      changed_at: new Date().toISOString()
    });

    purchaseOrders[poIndex] = po;

    // Send notification to supplier
    await notificationService.sendPOSentToSupplierNotification(po);

    // Log audit
    poAuditLogs.push({
      id: `audit-${Date.now()}-${poId}`,
      entity_type: 'purchase_order',
      entity_id: poId,
      action: 'po_sent_to_supplier',
      actor_id: sender_id || 'system',
      actor_name: sender_name || 'System',
      timestamp: new Date().toISOString(),
      before_data: { status: oldStatus },
      after_data: { status: 'sent', sent_at: po.sent_at, sent_by: po.sent_by },
    });

    return NextResponse.json({
      success: true,
      message: 'PO sent to supplier successfully',
      po: po
    });
  } catch (error) {
    console.error('Error sending PO to supplier:', error);
    return NextResponse.json({ error: 'Failed to send PO to supplier' }, { status: 500 });
  }
}
