import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, AuditLog } from '@/types/procurement';

// Mock database for POs - in production this would come from database
const purchaseOrders: PurchaseOrder[] = [];
const auditLogs: AuditLog[] = [];

// Initialize with sample data
const initializeData = () => {
  if (purchaseOrders.length === 0) {
    const samplePO: PurchaseOrder = {
      id: 'po-001',
      po_number: 'PO-ALPHA-001',
      project_id: '1',
      project_name: 'Project Alpha',
      supplier_id: 'supplier-001',
      supplier: {
        id: 'supplier-001',
        supplier_code: 'ABC-001',
        name: 'ABC Construction Supplies',
        email: 'quotes@abc.com',
        phone: '123-456-7890',
        address: '123 Main St',
        category: 'Construction',
        rating: 4.5,
        quote_count: 10,
        avg_response_time: 24,
        last_quote_date: new Date().toISOString(),
        is_active: true,
        status: 'approved',
        contacts: [],
        performance_metrics: {
          id: 'perf-001',
          supplier_id: 'supplier-001',
          total_quotes: 10,
          successful_quotes: 8,
          avg_response_time_hours: 24,
          on_time_delivery_rate: 0.9,
          quality_rating: 4.5,
          communication_rating: 4.3,
          last_updated: '2025-01-01T00:00:00Z'
        },
        compliance_docs: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        created_by: 'user1',
        created_by_name: 'John Smith',
        has_been_used: false
      },
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
      supplier: {
        id: 'supplier-001',
        supplier_code: 'ABC-001',
        name: 'ABC Construction Supplies',
        email: 'quotes@abc.com',
        phone: '123-456-7890',
        address: '123 Main St',
        category: 'Construction',
        rating: 4.5,
        quote_count: 10,
        avg_response_time: 24,
        last_quote_date: new Date().toISOString(),
        is_active: true,
        status: 'approved',
        contacts: [],
        performance_metrics: {
          id: 'perf-001',
          supplier_id: 'supplier-001',
          total_quotes: 10,
          successful_quotes: 8,
          avg_response_time_hours: 24,
          on_time_delivery_rate: 0.9,
          quality_rating: 4.5,
          communication_rating: 4.3,
          last_updated: '2025-01-01T00:00:00Z'
        },
        compliance_docs: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        created_by: 'user1',
        created_by_name: 'John Smith',
        has_been_used: false
      },
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
    auditLogs.push({
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
