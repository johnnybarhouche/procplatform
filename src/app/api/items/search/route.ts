import { NextRequest, NextResponse } from 'next/server';
import { Item, ItemSearchFilters } from '@/types/procurement';

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

export async function POST(request: NextRequest) {
  try {
    const filters: ItemSearchFilters = await request.json();
    let filteredItems = [...items];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.item_code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.model && item.model.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category) {
      filteredItems = filteredItems.filter(item => item.category === filters.category);
    }

    // Apply active status filter
    if (filters.is_active !== undefined) {
      filteredItems = filteredItems.filter(item => item.is_active === filters.is_active);
    }

    // Apply approval status filter
    if (filters.approval_status) {
      filteredItems = filteredItems.filter(item => item.approval_status === filters.approval_status);
    }

    // Apply supplier filter (this would require joining with supplier capabilities)
    if (filters.supplier_id) {
      // In a real implementation, this would join with supplier_item_capability table
      // For now, we'll return all items if supplier filter is applied
      // This is a simplified implementation
    }

    // Apply price range filter (this would require joining with pricing data)
    if (filters.price_min !== undefined || filters.price_max !== undefined) {
      // In a real implementation, this would join with item_supplier_pricing table
      // For now, we'll return all items if price filter is applied
      // This is a simplified implementation
    }

    // Sort results
    filteredItems.sort((a, b) => {
      // Sort by approval status first (approved items first)
      if (a.approval_status === 'approved' && b.approval_status !== 'approved') return -1;
      if (a.approval_status !== 'approved' && b.approval_status === 'approved') return 1;
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Get unique categories for filter options
    const categories = [...new Set(items.map(item => item.category))];

    return NextResponse.json({
      items: filteredItems,
      filters: {
        categories,
        totalItems: items.length,
        filteredCount: filteredItems.length
      }
    });
  } catch (error) {
    console.error('Error searching items:', error);
    return NextResponse.json(
      { error: 'Failed to search items' },
      { status: 500 }
    );
  }
}
