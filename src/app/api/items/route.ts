import { NextRequest, NextResponse } from 'next/server';
import { Item } from '@/types/procurement';

// Mock database for items (in a real app, this would be a database)
const items: Item[] = [
  {
    id: '1',
    item_code: 'ITM-001',
    description: 'Steel Reinforcement Bar 12mm',
    category: 'Construction Materials',
    uom: 'Meter',
    brand: 'Emirates Steel',
    model: 'ES-12MM',
    specifications: {
      diameter: '12mm',
      grade: 'B500B',
      length: '12m',
      weight: '0.888 kg/m'
    },
    is_active: true,
    approval_status: 'approved',
    approved_by: 'user1',
    approved_by_name: 'John Smith',
    approval_date: '2025-01-01T00:00:00Z',
    approval_notes: 'Standard construction material',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    created_by: 'user1',
    created_by_name: 'John Smith'
  },
  {
    id: '2',
    item_code: 'ITM-002',
    description: 'Concrete Mix C25/30',
    category: 'Construction Materials',
    uom: 'Cubic Meter',
    brand: 'Ready Mix',
    model: 'RM-C25/30',
    specifications: {
      strength: 'C25/30',
      slump: '150mm',
      aggregate_size: '20mm',
      cement_type: 'OPC'
    },
    is_active: true,
    approval_status: 'approved',
    approved_by: 'user2',
    approved_by_name: 'Sarah Johnson',
    approval_date: '2025-01-02T00:00:00Z',
    approval_notes: 'Standard concrete mix',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    created_by: 'user2',
    created_by_name: 'Sarah Johnson'
  },
  {
    id: '3',
    item_code: 'ITM-003',
    description: 'Electrical Cable 2.5mm²',
    category: 'Electrical Equipment',
    uom: 'Meter',
    brand: 'Ducab',
    model: 'DC-2.5MM',
    specifications: {
      cross_section: '2.5mm²',
      voltage: '1000V',
      conductor: 'Copper',
      insulation: 'PVC'
    },
    is_active: true,
    approval_status: 'pending',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
    created_by: 'user3',
    created_by_name: 'Mike Wilson'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    // const supplier_id = searchParams.get('supplier_id');
    // const price_min = searchParams.get('price_min');
    // const price_max = searchParams.get('price_max');
    const is_active = searchParams.get('is_active');
    const approval_status = searchParams.get('approval_status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredItems = [...items];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.item_code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.model && item.model.toLowerCase().includes(searchLower))
      );
    }

    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (is_active !== null) {
      const activeFilter = is_active === 'true';
      filteredItems = filteredItems.filter(item => item.is_active === activeFilter);
    }

    if (approval_status) {
      filteredItems = filteredItems.filter(item => item.approval_status === approval_status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    // Generate unique item code
    const nextId = items.length + 1;
    const itemCode = body.item_code || `ITM-${String(nextId).padStart(3, '0')}`;

    // Check if item code already exists
    const existingItem = items.find(item => item.item_code === itemCode);
    if (existingItem) {
      return NextResponse.json(
        { error: 'Item code already exists' },
        { status: 400 }
      );
    }

    const newItem: Item = {
      id: nextId.toString(),
      item_code: itemCode,
      description: body.description,
      category: body.category,
      uom: body.uom,
      brand: body.brand,
      model: body.model,
      specifications: body.specifications || {},
      is_active: true,
      approval_status: 'pending',
      created_at: now,
      updated_at: now,
      created_by: body.created_by || 'system',
      created_by_name: body.created_by_name || 'System'
    };

    items.push(newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
