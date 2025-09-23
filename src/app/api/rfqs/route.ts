import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '../suppliers/route';
import {
  Attachment,
  RFQ,
  RFQSupplier,
  Quote,
  QuoteLineItem,
  MaterialRequest,
  MRLineItem,
} from '@/types/procurement';

const materialRequest: MaterialRequest = {
  id: 'mr-1001',
  mrn: 'MR-1001',
  project_id: 'project-1',
  project_name: 'Project Alpha',
  requester_id: 'user-requester',
  requester_name: 'Ayesha Rahman',
  status: 'new_request',
  created_at: '2025-02-10T08:15:00Z',
  updated_at: '2025-02-12T09:30:00Z',
  remarks: 'Urgent structural materials',
  attachments: [],
  line_items: [
    {
      id: 'mr-line-1',
      item_code: 'STL-BEAM-10',
      description: 'Steel Beam 10m',
      uom: 'EA',
      quantity: 10,
      unit_price: 0,
      location: 'Yard A',
      brand_asset: 'ArcelorMittal',
      remarks: 'Hot dipped galvanised',
      serial_chassis_engine_no: undefined,
      model_year: '2024',
    },
    {
      id: 'mr-line-2',
      item_code: 'CON-MIX-50',
      description: 'Concrete Mix 50kg',
      uom: 'BAG',
      quantity: 30,
      unit_price: 0,
      location: 'Batching Plant',
      brand_asset: 'Cemex',
      remarks: 'M35 grade',
      serial_chassis_engine_no: undefined,
      model_year: undefined,
    },
    {
      id: 'mr-line-3',
      item_code: 'REB-16MM',
      description: 'Rebar Steel 16mm',
      uom: 'TON',
      quantity: 3,
      unit_price: 0,
      location: 'Site Laydown',
      brand_asset: 'Emirates Steel',
      remarks: undefined,
      serial_chassis_engine_no: undefined,
      model_year: undefined,
    },
  ],
};

function ensureSupplier(id: string, fallback: () => RFQSupplier['supplier']) {
  const supplier = supplierStore.find((sup) => sup.id === id);
  return supplier ?? fallback();
}

function cloneLineItem(source: MRLineItem): MRLineItem {
  return { ...source };
}

const buildAttachment = (idSuffix: string, filename: string): Attachment => ({
  id: `att-${idSuffix}`,
  filename,
  url: `https://files.example.com/${filename}`,
  file_type: 'application/pdf',
  file_size: 204800,
  uploaded_at: new Date().toISOString(),
});

export const rfqStore: RFQ[] = (() => {
  const supplierA = ensureSupplier('1', () => supplierStore[0]);
  const supplierB = ensureSupplier('2', () => supplierStore[Math.min(1, supplierStore.length - 1)]);
  const supplierC = ensureSupplier('3', () => supplierStore[Math.min(2, supplierStore.length - 1)]);

  const baseLineItems = materialRequest.line_items.map(cloneLineItem);

  const quoteLines = (
    prices: number[],
    leadTimes: number[],
    attachmentsConfig: (Attachment[] | undefined)[] = []
  ): QuoteLineItem[] =>
    baseLineItems.map((item, index) => ({
      id: `${item.id}-quote-${index}`,
      quote_id: 'pending',
      mr_line_item_id: item.id,
      mr_line_item: { ...item },
      unit_price: prices[index],
      quantity: item.quantity,
      total_price: Number((prices[index] * item.quantity).toFixed(2)),
      lead_time_days: leadTimes[index],
      remarks: undefined,
      attachments: attachmentsConfig[index],
    }));

  const quotes: Quote[] = [
    {
      id: 'quote-sup-1',
      rfq_id: 'rfq-1001',
      supplier_id: supplierA.id,
      supplier: supplierA,
      status: 'submitted',
      submitted_at: '2025-02-12T08:00:00Z',
      valid_until: '2025-03-12T08:00:00Z',
      total_amount: 10 * 3950 + 30 * 28 + 3 * 2550,
      currency: 'AED',
      terms_conditions: 'Net 30. Delivery within 7 days after PO.',
      line_items: quoteLines(
        [395, 28, 2550],
        [5, 3, 7],
        [
          [buildAttachment('mr-line-1-sup1', 'beam-structural-cert.pdf')],
          undefined,
          [buildAttachment('mr-line-3-sup1', 'rebar-spec-sheet.pdf')],
        ]
      ).map((line) => ({
        ...line,
        id: `${line.mr_line_item_id}-sup1`,
        quote_id: 'quote-sup-1',
      })),
      attachments: [buildAttachment('quote-sup1', 'supplier-profile.pdf')],
      created_by: 'supplier-1',
      created_by_name: supplierA.name,
    },
    {
      id: 'quote-sup-2',
      rfq_id: 'rfq-1001',
      supplier_id: supplierB.id,
      supplier: supplierB,
      status: 'submitted',
      submitted_at: '2025-02-12T11:30:00Z',
      valid_until: '2025-03-08T08:00:00Z',
      total_amount: 10 * 410 + 30 * 26.5 + 3 * 2480,
      currency: 'AED',
      terms_conditions: 'Net 45. Delivery staged per item availability.',
      line_items: quoteLines(
        [410, 26.5, 2480],
        [4, 4, 9],
        [
          undefined,
          [buildAttachment('mr-line-2-sup2', 'mix-specifications.xlsx')],
          undefined,
        ]
      ).map((line) => ({
        ...line,
        id: `${line.mr_line_item_id}-sup2`,
        quote_id: 'quote-sup-2',
      })),
      attachments: [],
      created_by: 'supplier-2',
      created_by_name: supplierB.name,
    },
    {
      id: 'quote-sup-3',
      rfq_id: 'rfq-1001',
      supplier_id: supplierC.id,
      supplier: supplierC,
      status: 'submitted',
      submitted_at: '2025-02-13T06:45:00Z',
      valid_until: '2025-03-05T08:00:00Z',
      total_amount: 10 * 402 + 30 * 27.5 + 3 * 2430,
      currency: 'AED',
      terms_conditions: 'Net 30. Delivery within 10 days of PO.',
      line_items: quoteLines(
        [402, 27.5, 2430],
        [6, 5, 8],
        [
          undefined,
          undefined,
          [buildAttachment('mr-line-3-sup3', 'rebar-delivery-plan.pdf')],
        ]
      ).map((line) => ({
        ...line,
        id: `${line.mr_line_item_id}-sup3`,
        quote_id: 'quote-sup-3',
      })),
      attachments: [],
      created_by: 'supplier-3',
      created_by_name: supplierC.name,
    },
  ];

  const suppliers: RFQSupplier[] = [
    {
      id: 'rfq-1001-sup1',
      rfq_id: 'rfq-1001',
      supplier_id: supplierA.id,
      supplier: supplierA,
      status: 'responded',
      sent_at: '2025-02-11T07:00:00Z',
      responded_at: '2025-02-12T08:00:00Z',
      portal_link: 'https://portal.example.com/rfq/rfq-1001?supplier=1',
      email_tracking_id: 'track-1001-sup1',
      invitation_type: 'suggested',
    },
    {
      id: 'rfq-1001-sup2',
      rfq_id: 'rfq-1001',
      supplier_id: supplierB.id,
      supplier: supplierB,
      status: 'responded',
      sent_at: '2025-02-11T07:00:00Z',
      responded_at: '2025-02-12T11:30:00Z',
      portal_link: 'https://portal.example.com/rfq/rfq-1001?supplier=2',
      email_tracking_id: 'track-1001-sup2',
      invitation_type: 'suggested',
    },
    {
      id: 'rfq-1001-sup3',
      rfq_id: 'rfq-1001',
      supplier_id: supplierC.id,
      supplier: supplierC,
      status: 'responded',
      sent_at: '2025-02-11T07:00:00Z',
      responded_at: '2025-02-13T06:45:00Z',
      portal_link: 'https://portal.example.com/rfq/rfq-1001?supplier=3',
      email_tracking_id: 'track-1001-sup3',
      invitation_type: 'manual',
    },
  ];

  return [
    {
      id: 'rfq-1001',
      rfq_number: 'RFQ-1001',
      material_request_id: materialRequest.id,
      material_request: materialRequest,
      status: 'quotes_received',
      created_at: '2025-02-11T07:00:00Z',
      updated_at: '2025-02-13T07:00:00Z',
      sent_at: '2025-02-11T07:05:00Z',
      due_date: '2025-02-18',
      terms: 'Net 30 days. Delivery to Project Alpha laydown area.',
      remarks: 'Safety certificates required with delivery.',
      suppliers,
      quotes,
      created_by: 'user-123',
      created_by_name: 'Procurement Officer',
    },
  ];
})();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mrId = searchParams.get('material_request_id');
  const rfqNumber = searchParams.get('rfq_number');

  let results = rfqStore;
  if (mrId) {
    results = results.filter((rfq) => rfq.material_request_id === mrId);
  }
  if (rfqNumber) {
    results = results.filter((rfq) => rfq.rfq_number === rfqNumber);
  }

  return NextResponse.json({ rfqs: results });
}

interface CreateRFQRequest {
  material_request_id: string;
  line_item_ids: string[];
  due_date?: string;
  terms?: string;
  remarks?: string;
  suppliers: Array<{
    supplier_id: string;
    name?: string;
    email?: string;
    category?: string;
  }>;
  line_suppliers?: Array<{
    line_item_id: string;
    suppliers: Array<{
      supplier_id: string;
      type?: 'suggested' | 'manual';
      name?: string;
      email?: string;
      category?: string;
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRFQRequest;

    if (!body.material_request_id || !Array.isArray(body.line_item_ids) || body.line_item_ids.length === 0) {
      return NextResponse.json({ error: 'Material request and at least one line item are required.' }, { status: 400 });
    }

    if (!Array.isArray(body.suppliers) || body.suppliers.length === 0) {
      return NextResponse.json({ error: 'Select at least one supplier before dispatch.' }, { status: 400 });
    }

    const rfqId = `rfq-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const dueDate = body.due_date ?? createdAt.slice(0, 10);

    const selectedLineItems = materialRequest.line_items.filter((line) => body.line_item_ids.includes(line.id));
    const effectiveLineItems = selectedLineItems.length > 0 ? selectedLineItems : materialRequest.line_items;

    const supplierRecords: RFQSupplier[] = body.suppliers.map((entry, index) => {
      const existingSupplier = supplierStore.find((sup) => sup.id === entry.supplier_id);
      const supplierFallbackId = entry.supplier_id || `manual-${index}-${Date.now()}`;
      const now = new Date().toISOString();
      const supplierDetails = existingSupplier ?? {
        id: supplierFallbackId,
        supplier_code: supplierFallbackId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'MANUAL',
        name: entry.name ?? 'Manual Supplier',
        email: entry.email ?? 'manual@example.com',
        phone: '+000-000-0000',
        address: 'Not provided',
        category: entry.category ?? 'General Supplies',
        rating: 0,
        quote_count: 0,
        avg_response_time: 0,
        last_quote_date: now.slice(0, 10),
        is_active: true,
        status: 'pending',
        has_been_used: false,
        contacts: [],
        performance_metrics: {
          id: `perf-${supplierFallbackId}`,
          supplier_id: supplierFallbackId,
          total_quotes: 0,
          successful_quotes: 0,
          avg_response_time_hours: 0,
          on_time_delivery_rate: 0,
          quality_rating: 0,
          communication_rating: 0,
          last_updated: now,
        },
        compliance_docs: [],
        created_at: now,
        updated_at: now,
        created_by: 'system',
        created_by_name: 'System',
      };

      return {
        id: `${rfqId}-supplier-${index}`,
        rfq_id: rfqId,
        supplier_id: supplierDetails.id,
        supplier: supplierDetails,
        status: 'pending',
        sent_at: createdAt,
        portal_link: `https://portal.example.com/rfq/${rfqId}?supplier=${supplierDetails.id}`,
        email_tracking_id: `track-${rfqId}-${index}`,
        invitation_type: existingSupplier ? 'suggested' : 'manual',
      } satisfies RFQSupplier;
    });

    const responseMaterialRequest: MaterialRequest = {
      ...materialRequest,
      status: 'rfq_sent',
      rfq_sent_at: createdAt,
    };

    const rfq: RFQ = {
      id: rfqId,
      rfq_number: `RFQ-${Date.now()}`,
      material_request_id: materialRequest.id,
      material_request: {
        ...responseMaterialRequest,
        line_items: effectiveLineItems,
      },
      status: 'sent',
      created_at: createdAt,
      updated_at: createdAt,
      sent_at: createdAt,
      due_date: dueDate,
      terms: body.terms,
      remarks: body.remarks,
      suppliers: supplierRecords,
      quotes: [],
      created_by: 'user-123',
      created_by_name: 'Procurement Officer',
      line_suppliers: body.line_suppliers?.map((entry) => ({
        line_item_id: entry.line_item_id,
        suppliers: entry.suppliers.map((supplier) => ({
          supplier_id: supplier.supplier_id,
          type: supplier.type ?? 'suggested',
          name: supplier.name,
          email: supplier.email,
          category: supplier.category,
        })),
      })),
    };

    rfqStore.unshift(rfq);

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error('Failed to create RFQ:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}
