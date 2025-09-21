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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const item = items.find(i => i.id === itemId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: itemId } = await params;
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const item = items[itemIndex];

    // Check if item is approved and user is trying to modify critical fields
    if (item.approval_status === 'approved' && body.approval_status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Cannot modify approved item',
          details: 'This item has been approved and cannot be modified'
        },
        { status: 400 }
      );
    }

    // Update item with new data
    const updatedItem: Item = {
      ...item,
      ...body,
      id: itemId, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };

    items[itemIndex] = updatedItem;

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const item = items[itemIndex];

    // Check if item is approved
    if (item.approval_status === 'approved') {
      return NextResponse.json(
        {
          error: 'Cannot delete approved item',
          details: 'This item has been approved and cannot be deleted'
        },
        { status: 400 }
      );
    }

    // Soft delete - set is_active to false
    items[itemIndex] = {
      ...item,
      is_active: false,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Item deactivated successfully',
      item: items[itemIndex]
    });
  } catch (error) {
    console.error('Error deactivating item:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate item' },
      { status: 500 }
    );
  }
}
