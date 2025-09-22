import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, AuditLog } from '@/types/procurement';
import {
  purchaseOrders,
  poAuditLogs,
  initializePOMockData,
} from '@/lib/mock-data/pos';

initializePOMockData();

// GET /api/pos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poId } = await params;
    const po = purchaseOrders.find(p => p.id === poId);

    if (!po) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    return NextResponse.json(po);
  } catch (error) {
    console.error('Error fetching PO:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase order' }, { status: 500 });
  }
}

// PUT /api/pos/[id] - Update PO details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poId } = await params;
    const body = await request.json();
    const { status, comments, delivery_date, actor_id, actor_name } = body;

    const poIndex = purchaseOrders.findIndex(p => p.id === poId);
    if (poIndex === -1) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    const po = purchaseOrders[poIndex];
    const oldStatus = po.status;

    // Update PO fields
    if (status !== undefined) po.status = status;
    if (comments !== undefined) po.comments = comments;
    if (delivery_date !== undefined) po.delivery_date = delivery_date;
    po.updated_at = new Date().toISOString();

    // Add status history entry if status changed
    if (status && status !== oldStatus) {
      po.status_history.push({
        id: `posh-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        po_id: poId,
        status: status,
        previous_status: oldStatus,
        changed_by: actor_id || 'system',
        changed_by_name: actor_name || 'System',
        changed_at: new Date().toISOString()
      });
    }

    purchaseOrders[poIndex] = po;

    // Log audit
    poAuditLogs.push({
      id: `audit-${Date.now()}-${poId}`,
      entity_type: 'purchase_order',
      entity_id: poId,
      action: 'po_updated',
      actor_id: actor_id || 'system',
      actor_name: actor_name || 'System',
      timestamp: new Date().toISOString(),
      before_data: { status: oldStatus, comments: po.comments, delivery_date: po.delivery_date },
      after_data: { status: po.status, comments: po.comments, delivery_date: po.delivery_date },
    });

    return NextResponse.json(po);
  } catch (error) {
    console.error('Error updating PO:', error);
    return NextResponse.json({ error: 'Failed to update purchase order' }, { status: 500 });
  }
}
