import { NextRequest, NextResponse } from 'next/server';
import { PriceTrend } from '@/types/procurement';

// Mock database for item prices (in a real app, this would be a database)
const itemPrices = [
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
    item_id: '1',
    supplier_id: '2',
    supplier_name: 'XYZ Steel Works',
    unit_price: 48.75,
    currency: 'AED',
    valid_from: '2025-04-01',
    valid_to: '2025-06-30',
    lead_time_days: 10,
    minimum_order_qty: 50,
    created_at: '2025-04-01T00:00:00Z'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6months'; // 1month, 3months, 6months, 1year
    const supplier_id = searchParams.get('supplier_id');

    // Filter prices for the specific item
    const { id: itemId } = await params;
    let filteredPrices = itemPrices.filter(price => price.item_id === itemId);

    // Filter by supplier if specified
    if (supplier_id) {
      filteredPrices = filteredPrices.filter(price => price.supplier_id === supplier_id);
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    // Filter prices within the date range
    filteredPrices = filteredPrices.filter(price => {
      const validFrom = new Date(price.valid_from);
      return validFrom >= startDate;
    });

    // Generate price trends data
    const priceTrends: PriceTrend[] = filteredPrices.map(price => ({
      date: price.valid_from,
      price: price.unit_price,
      supplier_name: price.supplier_name,
      currency: price.currency
    }));

    // Sort by date
    priceTrends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate trend statistics
    const prices = priceTrends.map(trend => trend.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate price change percentage
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChangePercent = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    // Group by supplier for comparison
    const supplierTrends = priceTrends.reduce((acc, trend) => {
      if (!acc[trend.supplier_name]) {
        acc[trend.supplier_name] = [];
      }
      acc[trend.supplier_name].push(trend);
      return acc;
    }, {} as Record<string, PriceTrend[]>);

    return NextResponse.json({
      trends: priceTrends,
      statistics: {
        minPrice,
        maxPrice,
        avgPrice: Math.round(avgPrice * 100) / 100,
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        dataPoints: priceTrends.length
      },
      supplierComparison: Object.keys(supplierTrends).map(supplier => ({
        supplier_name: supplier,
        trends: supplierTrends[supplier],
        avgPrice: supplierTrends[supplier].reduce((sum, trend) => sum + trend.price, 0) / supplierTrends[supplier].length
      }))
    });
  } catch (error) {
    console.error('Error fetching price trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price trends' },
      { status: 500 }
    );
  }
}
