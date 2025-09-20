import { NextRequest, NextResponse } from 'next/server';
import { QuotePack, RFQ } from '@/types/procurement';

// Mock database for quote packs
const quotePacks: QuotePack[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rfqId = searchParams.get('rfq_id');
    const status = searchParams.get('status');

    let filteredQuotePacks = quotePacks;

    if (rfqId) {
      filteredQuotePacks = filteredQuotePacks.filter(pack => pack.rfq_id === rfqId);
    }

    if (status) {
      filteredQuotePacks = filteredQuotePacks.filter(pack => pack.status === status);
    }

    return NextResponse.json(filteredQuotePacks);
  } catch (error) {
    console.error('Error fetching quote packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote packs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newQuotePack: QuotePack = {
      id: (quotePacks.length + 1).toString(),
      rfq_id: body.rfq_id,
      rfq: body.rfq || {} as RFQ, // Mock RFQ object
      status: 'sent',
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      quotes: body.quotes || [],
      comparison_data: body.comparison_data,
      created_by: body.created_by,
      created_by_name: body.created_by_name
    };

    quotePacks.push(newQuotePack);

    // Log audit trail
    console.log(`Quote pack created: ${newQuotePack.id} for RFQ: ${newQuotePack.rfq_id}`);

    return NextResponse.json(newQuotePack, { status: 201 });
  } catch (error) {
    console.error('Error creating quote pack:', error);
    return NextResponse.json(
      { error: 'Failed to create quote pack' },
      { status: 500 }
    );
  }
}
