import { NextRequest, NextResponse } from 'next/server';
import { Quote } from '@/types/procurement';

// Mock database for quotes
const quotes: Quote[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfq_id');
    const supplierId = searchParams.get('supplier_id');
    const status = searchParams.get('status');

    let filteredQuotes = quotes;

    if (rfqId) {
      filteredQuotes = filteredQuotes.filter(quote => quote.rfq_id === rfqId);
    }

    if (supplierId) {
      filteredQuotes = filteredQuotes.filter(quote => quote.supplier_id === supplierId);
    }

    if (status) {
      filteredQuotes = filteredQuotes.filter(quote => quote.status === status);
    }

    return NextResponse.json(filteredQuotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newQuote: Quote = {
      id: (quotes.length + 1).toString(),
      rfq_id: body.rfq_id,
      supplier_id: body.supplier_id,
      supplier: body.supplier || {
        id: body.supplier_id,
        name: 'Unknown Supplier',
        email: '',
        category: '',
        rating: 0,
        quote_count: 0,
        avg_response_time: 0,
        last_quote_date: new Date().toISOString().split('T')[0],
        is_active: true,
        compliance_docs: []
      },
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      valid_until: body.valid_until,
      total_amount: body.line_items.reduce((sum: number, item: { total_price: number }) => sum + item.total_price, 0),
      currency: 'AED',
      terms_conditions: body.terms_conditions || '',
      line_items: body.line_items.map((item: { mr_line_item_id: string; mr_line_item: { id: string; item_code: string; description: string; uom: string; quantity: number; unit_price: number; remarks?: string; location?: string; brand_asset?: string; serial_chassis_engine_no?: string; model_year?: string }; unit_price: number; quantity: number; total_price: number; lead_time_days: number; remarks?: string }) => ({
        id: '',
        quote_id: '',
        mr_line_item_id: item.mr_line_item_id,
        mr_line_item: item.mr_line_item,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
        lead_time_days: item.lead_time_days,
        remarks: item.remarks || ''
      })),
      attachments: body.attachments || [],
      created_by: body.created_by,
      created_by_name: body.created_by_name
    };

    quotes.push(newQuote);

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
