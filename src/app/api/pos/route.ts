import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrder, PurchaseRequisition, AuditLog, User } from '@/types/procurement';
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

// Helper to generate a unique PO number (mock)
const generatePONumber = (projectId: string) => {
  const count = purchaseOrders.filter(po => po.project_id === projectId).length + 1;
  return `PO-${projectId.substring(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`;
};

// Mock users for created_by, sent_by, etc.
const mockUsers: User[] = [
  { id: 'user-001', name: 'John Doe', email: 'john.doe@example.com', role: 'requester', project_ids: ['1'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'procurement', project_ids: ['1'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-003', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'approver', project_ids: ['1'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-004', name: 'Bob White', email: 'bob.white@example.com', role: 'admin', project_ids: ['1'], is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// GET /api/pos
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const supplierId = searchParams.get('supplier_id');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let filteredPOs = purchaseOrders;

  if (projectId) {
    filteredPOs = filteredPOs.filter(po => po.project_id === projectId);
  }
  if (supplierId) {
    filteredPOs = filteredPOs.filter(po => po.supplier_id === supplierId);
  }
  if (status) {
    filteredPOs = filteredPOs.filter(po => po.status === status);
  }

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedPOs = filteredPOs.slice(startIndex, endIndex);

  return NextResponse.json({
    pos: paginatedPOs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredPOs.length / limit),
      totalItems: filteredPOs.length,
    },
  });
}

// POST /api/pos - Generate POs from approved PRs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pr_id, project_id } = body;

    if (!pr_id || !project_id) {
      return NextResponse.json({ error: 'pr_id and project_id are required' }, { status: 400 });
    }
    const supplier = createMockSupplier({
      id: 'supplier-001',
      supplier_code: 'SUP-001',
      name: 'ABC Construction Supplies',
      email: 'quotes@abc.com',
      phone: '123-456-7890',
      address: '123 Main St',
      category: 'Construction',
      rating: 4.5,
      quote_count: 15,
      avg_response_time: 24,
      last_quote_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      has_been_used: true,
    });

    // Mock: Get approved PR data (in production this would come from database)
    const approvedPR: PurchaseRequisition = {
      id: pr_id,
      pr_number: 'PR-ALPHA-001',
      project_id: project_id,
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
      line_items: [
        {
          id: 'prli-001',
          pr_id: pr_id,
          mr_line_item_id: 'mri-001',
          mr_line_item: {
            id: 'mri-001',
            item_code: 'ITEM-001',
            description: 'Sample Item',
            uom: 'pcs',
            quantity: 10,
            unit_price: 100,
            remarks: 'Sample remarks'
          },
          quote_id: 'q-001',
          quote: {
            id: 'q-001',
            rfq_id: 'rfq-001',
            supplier_id: 'supplier-001',
            supplier,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            total_amount: 15000,
            currency: 'AED',
            terms_conditions: 'Standard terms',
            line_items: [
              {
                id: 'qli-001',
                quote_id: 'q-001',
                mr_line_item_id: 'mri-001',
                mr_line_item: {
                  id: 'mri-001',
                  item_code: 'ITEM-001',
                  description: 'Sample Item',
                  uom: 'pcs',
                  quantity: 10,
                  unit_price: 100,
                  remarks: 'Sample remarks',
                  location: 'Warehouse A',
                  brand_asset: 'Brand X',
                  serial_chassis_engine_no: 'SN-123',
                  model_year: '2024',
                },
                unit_price: 100,
                quantity: 10,
                total_price: 1000,
                lead_time_days: 7,
                remarks: 'Quote line item remarks',
              },
            ],
            attachments: [],
            created_by: 'supplier-001',
            created_by_name: 'ABC Construction Supplies'
          },
          quantity: 10,
          unit_price: 100,
          total_price: 1000,
          lead_time_days: 7,
          remarks: 'PR line item remarks'
        }
      ],
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
    };
    
    // Group line items by supplier (in this case, all from same supplier)
    const supplierGroups = new Map<string, typeof approvedPR.line_items>();
    approvedPR.line_items.forEach(lineItem => {
      const supplierId = lineItem.quote.supplier_id;
      if (!supplierGroups.has(supplierId)) {
        supplierGroups.set(supplierId, []);
      }
      supplierGroups.get(supplierId)!.push(lineItem);
    });

    const generatedPOs: PurchaseOrder[] = [];

    for (const [supplierId, lineItems] of supplierGroups.entries()) {
      const totalValue = lineItems.reduce((sum, item) => sum + item.total_price, 0);
      const poNumber = generatePONumber(project_id);

      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        po_number: poNumber,
        project_id: project_id,
        project_name: approvedPR.project_name,
        supplier_id: supplierId,
        supplier: lineItems[0].quote.supplier,
        status: 'draft',
        total_value: totalValue,
        currency: approvedPR.currency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user-002', // Procurement user
        created_by_name: 'Jane Smith',
        payment_terms: 'Net 30',
        delivery_address: 'Project Alpha Site, Dubai',
        line_items: lineItems.map(lineItem => ({
          id: `poli-${Date.now()}-${lineItem.id}`,
          po_id: '', // Will be set after PO is created
          pr_line_item_id: lineItem.id,
          pr_line_item: lineItem,
          quantity: lineItem.quantity,
          unit_price: lineItem.unit_price,
          total_price: lineItem.total_price,
          delivery_date: new Date(Date.now() + lineItem.lead_time_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remarks: lineItem.remarks,
          created_at: new Date().toISOString()
        })),
        status_history: [{
          id: `posh-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          po_id: '', // Will be set after PO is created
          status: 'draft',
          changed_by: 'user-002',
          changed_by_name: 'Jane Smith',
          changed_at: new Date().toISOString()
        }],
        attachments: [],
        pr_id: pr_id,
        pr: approvedPR
      };

      // Set the po_id for line items and status history
      newPO.line_items.forEach(item => item.po_id = newPO.id);
      newPO.status_history.forEach(history => history.po_id = newPO.id);

      purchaseOrders.push(newPO);
      generatedPOs.push(newPO);

      // Send notification
      await notificationService.sendPOCreatedNotification(newPO);

      auditLogs.push({
        id: `audit-${Date.now()}-${newPO.id}`,
        entity_type: 'purchase_order',
        entity_id: newPO.id,
        action: 'po_created',
        actor_id: newPO.created_by,
        actor_name: newPO.created_by_name,
        timestamp: new Date().toISOString(),
        after_data: newPO,
      });
    }

    return NextResponse.json(generatedPOs, { status: 201 });
  } catch (error) {
    console.error('Error generating POs:', error);
    return NextResponse.json({ error: 'Failed to generate purchase orders' }, { status: 500 });
  }
}

