import { NextRequest, NextResponse } from 'next/server';
import { QuoteApproval, QuotePack, AuditLog } from '@/types/procurement';
import { createMockSupplier } from '@/lib/mock-suppliers';

// Mock data - in production this would come from database
const quoteApprovals: QuoteApproval[] = [];
const auditLogs: AuditLog[] = [];

// Initialize with sample data
const initializeData = () => {
  if (quoteApprovals.length === 0) {
    // Create sample quote pack and approval
    const supplier = createMockSupplier({
      id: 'supplier-001',
      supplier_code: 'SUP-001',
      name: 'ABC Construction Supplies',
      email: 'quotes@abc.com',
      category: 'Construction',
      rating: 4.5,
      quote_count: 15,
      avg_response_time: 24,
      last_quote_date: new Date().toISOString().split('T')[0],
      status: 'approved',
      has_been_used: true,
    });

    const sampleQuotePack: QuotePack = {
      id: 'qp-001',
      rfq_id: 'rfq-001',
      rfq: {
        id: 'rfq-001',
        rfq_number: 'RFQ-2025-001',
        material_request_id: 'mr-001',
        material_request: {
          id: 'mr-001',
          mrn: 'MR-2025-001',
          project_id: '1',
          project_name: 'Project Alpha',
          requester_id: 'user-001',
          requester_name: 'John Doe',
          status: 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          line_items: [],
          attachments: []
        },
        status: 'quotes_received',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        suppliers: [],
        quotes: [],
        created_by: 'procurement-user',
        created_by_name: 'Procurement Team'
      },
      status: 'sent',
      created_at: new Date().toISOString(),
      quotes: [
        {
          id: 'q-001',
          rfq_id: 'rfq-001',
          supplier_id: 'supplier-001',
          supplier,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 15000,
          currency: 'AED',
          line_items: [
            {
              id: 'qli-001',
              quote_id: 'q-001',
              mr_line_item_id: 'mrli-001',
              mr_line_item: {
                id: 'mrli-001',
                item_code: 'CONC-001',
                description: 'Concrete Mix C25/30',
                uom: 'm3',
                quantity: 10,
                unit_price: 1500,
                remarks: 'Standard grade concrete'
              },
              unit_price: 1500,
              quantity: 10,
              total_price: 15000,
              lead_time_days: 7
            }
          ],
          attachments: [],
          created_by: 'supplier-001',
          created_by_name: 'ABC Construction Supplies'
        }
      ],
      comparison_data: {
        total_savings: 0,
        recommended_suppliers: ['supplier-001'],
        key_differences: ['Price variation'],
        risk_assessment: 'Low risk'
      },
      created_by: 'procurement-user',
      created_by_name: 'Procurement Team'
    };

    const sampleApproval: QuoteApproval = {
      id: 'qa-001',
      quote_pack_id: 'qp-001',
      quote_pack: sampleQuotePack,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      line_item_decisions: []
    };

    quoteApprovals.push(sampleApproval);
  }
};

// GET /api/quote-approvals
export async function GET() {
  try {
    initializeData();
    return NextResponse.json(quoteApprovals);
  } catch (error) {
    console.error('Error fetching quote approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch quote approvals' }, { status: 500 });
  }
}

// POST /api/quote-approvals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote_pack_id, comments } = body;

    if (!quote_pack_id) {
      return NextResponse.json({ error: 'quote_pack_id is required' }, { status: 400 });
    }

    const newApproval: QuoteApproval = {
      id: `qa-${Date.now()}`,
      quote_pack_id,
      quote_pack: {} as QuotePack, // Would be populated from database
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments,
      line_item_decisions: []
    };

    quoteApprovals.push(newApproval);

    // Log the creation
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      entity_type: 'quote_pack',
      entity_id: quote_pack_id,
      action: 'approval_created',
      actor_id: 'system',
      actor_name: 'System',
      timestamp: new Date().toISOString(),
      after_data: { approval_id: newApproval.id, status: 'pending' }
    };
    auditLogs.push(auditLog);

    return NextResponse.json(newApproval, { status: 201 });
  } catch (error) {
    console.error('Error creating quote approval:', error);
    return NextResponse.json({ error: 'Failed to create quote approval' }, { status: 500 });
  }
}
