import { NextRequest, NextResponse } from 'next/server';
import { RFQ, MaterialRequest } from '@/types/procurement';

// Mock database for RFQs
const rfqs: RFQ[] = [];
const materialRequests: MaterialRequest[] = [];

// Initialize with some sample data
const initializeData = () => {
  if (materialRequests.length === 0) {
    materialRequests.push(
      {
        id: '1',
        mrn: 'MR-2025-001',
        project_id: '1',
        project_name: 'DSV Office Renovation',
        requester_id: '1',
        requester_name: 'John Smith',
        status: 'submitted',
        created_at: '2025-01-20T10:00:00Z',
        updated_at: '2025-01-20T10:00:00Z',
        line_items: [
          {
            id: '1',
            item_code: 'CON-001',
            description: 'Steel Beams 6m',
            uom: 'PCS',
            quantity: 10,
            unit_price: 500,
            remarks: 'Grade A steel',
            location: 'Warehouse A',
            brand_asset: 'SteelCorp',
            serial_chassis_engine_no: 'SC-2025-001',
            model_year: '2025'
          }
        ],
        attachments: [],
        remarks: 'Urgent requirement for office renovation'
      }
    );
  }
};

export async function GET(request: NextRequest) {
  try {
    initializeData();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('project_id');

    let filteredRFQs = rfqs;

    if (status) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.status === status);
    }

    if (projectId) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.material_request.project_id === projectId);
    }

    return NextResponse.json(filteredRFQs);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RFQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    initializeData();
    
    const materialRequest = materialRequests.find(mr => mr.id === body.material_request_id);
    if (!materialRequest) {
      return NextResponse.json(
        { error: 'Material Request not found' },
        { status: 404 }
      );
    }

    const newRFQ: RFQ = {
      id: (rfqs.length + 1).toString(),
      rfq_number: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, '0')}`,
      material_request_id: body.material_request_id,
      material_request: materialRequest,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      suppliers: [],
      quotes: [],
      created_by: body.created_by || '1',
      created_by_name: body.created_by_name || 'Procurement Officer'
    };

    rfqs.push(newRFQ);

    return NextResponse.json(newRFQ, { status: 201 });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json(
      { error: 'Failed to create RFQ' },
      { status: 500 }
    );
  }
}
