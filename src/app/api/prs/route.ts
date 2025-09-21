import { NextRequest, NextResponse } from 'next/server';
import { PurchaseRequisition, QuoteApproval, AuditLog, LineItemDecision, MRLineItem } from '@/types/procurement';
import { notificationService } from '@/lib/notification-service';
import { createMockSupplier } from '@/lib/mock-suppliers';

const sampleSupplierOverrides = {
  id: 'supplier-001',
  supplier_code: 'SUP-001',
  name: 'ABC Construction Supplies',
  email: 'quotes@abc.com',
  category: 'Construction',
  rating: 4.5,
  quote_count: 15,
  avg_response_time: 24,
  last_quote_date: '2025-01-15',
  status: 'approved' as const,
  has_been_used: true,
};

const buildSampleSupplier = () => createMockSupplier(sampleSupplierOverrides);

// Mock database for PRs - in production this would come from database
const purchaseRequisitions: PurchaseRequisition[] = [];
const auditLogs: AuditLog[] = [];

// Initialize with sample data
const initializeData = () => {
  if (purchaseRequisitions.length === 0) {
    // Create sample PR from approved quote approval
    const baseSupplier = buildSampleSupplier();

    const samplePR: PurchaseRequisition = {
      id: 'pr-001',
      pr_number: 'PR-2025-001',
      project_id: '1',
      project_name: 'Project Alpha',
      supplier_id: 'supplier-001',
      supplier: baseSupplier,
      status: 'draft',
      total_value: 15000,
      currency: 'AED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'procurement-user',
      created_by_name: 'Procurement Team',
      line_items: [
        {
          id: 'prli-001',
          pr_id: 'pr-001',
          mr_line_item_id: 'mri-001',
          mr_line_item: {
            id: 'mri-001',
            item_code: 'ITEM-001',
            description: 'Safety Helmet',
            uom: 'Pcs',
            quantity: 10,
            unit_price: 1000,
          },
          quote_id: 'q-001',
          quote: {
            id: 'q-001',
            rfq_id: 'rfq-001',
            supplier_id: 'supplier-001',
            supplier: baseSupplier,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            total_amount: 15000,
            currency: 'AED',
            line_items: [],
            attachments: [],
            created_by: 'supplier-001',
            created_by_name: 'ABC Sales'
          },
          quantity: 10,
          unit_price: 1000,
          total_price: 10000,
          lead_time_days: 7,
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
        line_item_decisions: []
      }
    };
    purchaseRequisitions.push(samplePR);
  }
};

initializeData();

// GET /api/prs - Retrieve PRs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const supplierId = searchParams.get('supplier_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let filteredPRs = [...purchaseRequisitions];
    
    // Apply filters
    if (projectId) {
      filteredPRs = filteredPRs.filter(pr => pr.project_id === projectId);
    }
    if (supplierId) {
      filteredPRs = filteredPRs.filter(pr => pr.supplier_id === supplierId);
    }
    if (status) {
      filteredPRs = filteredPRs.filter(pr => pr.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPRs = filteredPRs.slice(startIndex, endIndex);
    
    return NextResponse.json({
      prs: paginatedPRs,
      pagination: {
        page,
        limit,
        total: filteredPRs.length,
        totalPages: Math.ceil(filteredPRs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
  }
}

// POST /api/prs - Generate new PRs from approved quote packs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote_approval_id, project_id } = body;
    
    if (!quote_approval_id || !project_id) {
      return NextResponse.json({ error: 'quote_approval_id and project_id are required' }, { status: 400 });
    }

    const baseSupplier = buildSampleSupplier();

    // Mock: Get quote approval data (in production this would come from database)
    const quoteApproval: QuoteApproval = {
      id: quote_approval_id,
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
      line_item_decisions: [
        {
          id: 'lid-001',
          quote_approval_id: 'qa-001',
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
          selected_quote_id: 'q-001',
          decision: 'approved' as const,
          comments: 'Approved for purchase',
          created_at: new Date().toISOString(),
          selected_quote: {
            id: 'q-001',
            rfq_id: 'rfq-001',
            supplier_id: 'supplier-001',
            supplier: baseSupplier,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            total_amount: 15000,
            currency: 'AED',
            terms_conditions: 'Standard terms',
            line_items: [],
            attachments: [],
            created_by: 'supplier-001',
            created_by_name: 'ABC Construction Supplies'
          }
        }
      ]
    };
    
    // Group line items by supplier
    const supplierGroups = new Map<string, LineItemDecision[]>();
    quoteApproval.line_item_decisions.forEach(decision => {
      if (decision.decision === 'approved') {
        const supplierId = decision.selected_quote.supplier_id;
        if (!supplierGroups.has(supplierId)) {
          supplierGroups.set(supplierId, []);
        }
        supplierGroups.get(supplierId)!.push(decision);
      }
    });
    
    const generatedPRs: PurchaseRequisition[] = [];
    
    // Create PR for each supplier
    for (const [supplierId, decisions] of supplierGroups) {
      const supplier = decisions[0].selected_quote.supplier;
      const totalValue = decisions.reduce((sum, decision) => sum + decision.selected_quote.total_amount, 0);
      
      const newPR: PurchaseRequisition = {
        id: `pr-${Date.now()}-${supplierId}`,
        pr_number: `PR-${new Date().getFullYear()}-${String(purchaseRequisitions.length + 1).padStart(3, '0')}`,
        project_id,
        project_name: 'Project Alpha', // Mock project name
        supplier_id: supplierId,
        supplier,
        status: 'draft',
        total_value: totalValue,
        currency: decisions[0].selected_quote.currency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        created_by_name: 'System',
        line_items: decisions.map(decision => ({
          id: `prli-${Date.now()}-${decision.mr_line_item_id}`,
          pr_id: `pr-${Date.now()}-${supplierId}`,
          mr_line_item_id: decision.mr_line_item_id,
          mr_line_item: decision.mr_line_item,
          quote_id: decision.selected_quote_id,
          quote: decision.selected_quote,
          quantity: decision.mr_line_item.quantity,
          unit_price: decision.selected_quote.line_items.find(li => li.mr_line_item_id === decision.mr_line_item_id)?.unit_price || 0,
          total_price: decision.selected_quote.line_items.find(li => li.mr_line_item_id === decision.mr_line_item_id)?.total_price || 0,
          lead_time_days: decision.selected_quote.line_items.find(li => li.mr_line_item_id === decision.mr_line_item_id)?.lead_time_days || 7,
          remarks: decision.comments,
        })),
        approvals: [],
        quote_approval_id,
        quote_approval: quoteApproval as QuoteApproval
      };
      
      purchaseRequisitions.push(newPR);
      generatedPRs.push(newPR);
      
      // Log audit trail
      const auditLog: AuditLog = {
        id: `audit-${Date.now()}-${newPR.id}`,
        entity_type: 'purchase_requisition',
        entity_id: newPR.id,
        action: 'pr_created',
        actor_id: 'system',
        actor_name: 'System',
        timestamp: new Date().toISOString(),
        after_data: newPR
      };
      auditLogs.push(auditLog);
      
      // Send notification
      await notificationService.sendPRCreatedNotification(newPR);
    }
    
    return NextResponse.json(generatedPRs, { status: 201 });
  } catch (error) {
    console.error('Error creating PRs:', error);
    return NextResponse.json({ error: 'Failed to create PRs' }, { status: 500 });
  }
}
