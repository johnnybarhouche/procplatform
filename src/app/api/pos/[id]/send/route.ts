import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, AuditLog } from '@/types/procurement';
import { createMockSupplier } from '@/lib/mock-suppliers';
import { notificationService } from '@/lib/notification-service';

// Mock database for POs - in production this would come from database
const purchaseOrders: PurchaseOrder[] = [];
const auditLogs: AuditLog[] = [];

// Initialize with sample data
const initializeData = () => {
  if (purchaseOrders.length === 0) {
    const supplier = createMockSupplier({
      id: 'supplier-001',
      supplier_code: 'SUP-001',
      name: 'ABC Construction Supplies',
      email: 'quotes@abc.com',
      phone: '123-456-7890',
      address: '123 Main St',
      category: 'Construction',
      rating: 4.5,
      quote_count: 10,
      avg_response_time: 24,
      last_quote_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      has_been_used: true,
    });

    const samplePO: PurchaseOrder = {
      id: 'po-001',
      po_number: 'PO-ALPHA-001',
      project_id: '1',
      project_name: 'Project Alpha',
      supplier_id: 'supplier-001',
      supplier,
      status: 'draft',
      total_value: 15000,
      currency: 'AED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-002',
      created_by_name: 'Jane Smith',
      payment_terms: 'Net 30',
      delivery_address: 'Project Alpha Site, Dubai',
      line_items: [],
      status_history: [],
      attachments: [],
      pr_id: 'pr-001',
      pr: {
        id: 'pr-001',
        pr_number: 'PR-ALPHA-001',
        project_id: '1',
        project_name: 'Project Alpha',
        supplier_id: 'supplier-001',
        supplier,
        status: 'approved',
        total_value: 15000,
        currency: 'AED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        created_by: 'user-002',
        created_by_name: 'Jane Smith',
        line_items: [],
        approvals: [],
        quote_approval_id: 'qa-001',
        quote_approval: {
          id: 'qa-001',
          quote_pack_id: 'qp-001',
          quote_pack: {
            id: 'qp-001',
            rfq_id: 'rfq-001',
            status: 'approved',
            rfq: {
              id: 'rfq-001',
              rfq_number: 'RFQ-001',
              material_request_id: 'mr-001',
              material_request: {
                id: 'mr-001',
                project_id: '1',
                project_name: 'Project Alpha',
                mrn: 'MR-001',
                status: 'approved',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                requester_id: 'user-001',
                requester_name: 'John Doe',
                line_items: [],
                attachments: []
              },
              suppliers: [],
              quotes: [],
              due_date: new Date().toISOString(),
              status: 'sent',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'user-002',
              created_by_name: 'Jane Smith'
            },
            quotes: [],
            comparison_data: {
              total_savings: 0,
              recommended_suppliers: [],
              key_differences: [],
              risk_assessment: 'Low risk'
            },
            created_at: new Date().toISOString(),
            created_by: 'user-002',
            created_by_name: 'Jane Smith'
          },
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          approved_by: 'end-user',
          approved_by_name: 'End User',
          comments: 'All items approved',
          line_item_decisions: []
        }
      }
    };
    purchaseOrders.push(samplePO);
  }
};
initializeData();

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
    auditLogs.push({
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
