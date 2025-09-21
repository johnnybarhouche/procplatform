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
    const format = searchParams.get('format') || 'csv';
    const category = searchParams.get('category');
    const approval_status = searchParams.get('approval_status');
    const is_active = searchParams.get('is_active');

    let filteredItems = [...items];

    // Apply filters
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (approval_status) {
      filteredItems = filteredItems.filter(item => item.approval_status === approval_status);
    }

    if (is_active !== null) {
      const activeFilter = is_active === 'true';
      filteredItems = filteredItems.filter(item => item.is_active === activeFilter);
    }

    if (format === 'csv') {
      // Generate CSV content
      const headers = [
        'Item Code',
        'Description',
        'Category',
        'UOM',
        'Brand',
        'Model',
        'Specifications',
        'Is Active',
        'Approval Status',
        'Created By',
        'Created At'
      ];

      const csvRows = [headers.join(',')];

      filteredItems.forEach(item => {
        const row = [
          item.item_code,
          `"${item.description}"`,
          item.category,
          item.uom,
          item.brand || '',
          item.model || '',
          `"${JSON.stringify(item.specifications || {})}"`,
          item.is_active ? 'Yes' : 'No',
          item.approval_status,
          item.created_by_name,
          item.created_at
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="items-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'json') {
      return NextResponse.json({
        items: filteredItems,
        exportDate: new Date().toISOString(),
        totalItems: filteredItems.length
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv or json' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error exporting items:', error);
    return NextResponse.json(
      { error: 'Failed to export items' },
      { status: 500 }
    );
  }
}

