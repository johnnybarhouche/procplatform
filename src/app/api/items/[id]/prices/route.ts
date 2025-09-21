import { NextRequest, NextResponse } from 'next/server';
import { ItemPrice } from '@/types/procurement';

// Mock database for item prices (in a real app, this would be a database)
const itemPrices: ItemPrice[] = [
  {
    id: '1',
    item_id: '1',
    supplier_id: '1',
    supplier_name: 'ABC Construction Supplies',
    unit_price: 45.50,
    currency: 'AED',
    valid_from: '2025-01-01',
    valid_to: '2025-03-31',
    lead_time_days: 7,
    minimum_order_qty: 100,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    item_id: '1',
    supplier_id: '2',
    supplier_name: 'XYZ Steel Works',
    unit_price: 47.25,
    currency: 'AED',
    valid_from: '2025-01-01',
    valid_to: '2025-03-31',
    lead_time_days: 10,
    minimum_order_qty: 50,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    item_id: '1',
    supplier_id: '1',
    supplier_name: 'ABC Construction Supplies',
    unit_price: 46.00,
    currency: 'AED',
    valid_from: '2025-04-01',
    valid_to: '2025-06-30',
    lead_time_days: 7,
    minimum_order_qty: 100,
    created_at: '2025-04-01T00:00:00Z'
  },
  {
    id: '4',
    item_id: '2',
    supplier_id: '1',
    supplier_name: 'ABC Construction Supplies',
    unit_price: 350.00,
    currency: 'AED',
    valid_from: '2025-01-01',
    valid_to: '2025-03-31',
    lead_time_days: 3,
    minimum_order_qty: 1,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    item_id: '2',
    supplier_id: '3',
    supplier_name: 'DEF Industrial Parts',
    unit_price: 365.00,
    currency: 'AED',
    valid_from: '2025-01-01',
    valid_to: '2025-03-31',
    lead_time_days: 5,
    minimum_order_qty: 1,
    created_at: '2025-01-01T00:00:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const supplier_id = searchParams.get('supplier_id');
    const valid_from = searchParams.get('valid_from');
    const valid_to = searchParams.get('valid_to');

    const { id: itemId } = await params;
    let filteredPrices = itemPrices.filter(price => price.item_id === itemId);

    // Apply filters
    if (supplier_id) {
      filteredPrices = filteredPrices.filter(price => price.supplier_id === supplier_id);
    }

    if (valid_from) {
      filteredPrices = filteredPrices.filter(price => price.valid_from >= valid_from);
    }

    if (valid_to) {
      filteredPrices = filteredPrices.filter(price => 
        price.valid_to === null || price.valid_to === undefined || price.valid_to <= valid_to
      );
    }

    // Sort by valid_from date (most recent first)
    filteredPrices.sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime());

    return NextResponse.json(filteredPrices);
  } catch (error) {
    console.error('Error fetching item prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item prices' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();

    const newPrice: ItemPrice = {
      id: (itemPrices.length + 1).toString(),
      item_id: (await params).id,
      supplier_id: body.supplier_id,
      supplier_name: body.supplier_name,
      unit_price: body.unit_price,
      currency: body.currency || 'AED',
      valid_from: body.valid_from,
      valid_to: body.valid_to,
      lead_time_days: body.lead_time_days,
      minimum_order_qty: body.minimum_order_qty,
      created_at: now
    };

    itemPrices.push(newPrice);

    return NextResponse.json(newPrice, { status: 201 });
  } catch (error) {
    console.error('Error creating item price:', error);
    return NextResponse.json(
      { error: 'Failed to create item price' },
      { status: 500 }
    );
  }
}
