import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { notificationService } from '@/lib/notification-service';
import { supplierStore } from '../suppliers/route';
import { createMockSupplier } from '@/lib/mock-suppliers';
import { MaterialRequest, RFQ, RFQSupplier, Supplier } from '@/types/procurement';

interface CreateRFQSupplierInput {
  supplier_id?: string;
  name?: string;
  email?: string;
  category?: string;
}

interface CreateRFQRequest {
  material_request_id: string;
  line_item_ids: string[];
  suppliers: CreateRFQSupplierInput[];
  due_date?: string;
  terms?: string;
  remarks?: string;
}

const rfqStore: RFQ[] = [];

async function buildMaterialRequest(mrId: string): Promise<MaterialRequest | null> {
  const mr = await db.getMaterialRequestById(mrId);
  if (!mr) {
    return null;
  }

  const [project, requester, lineItems, attachments] = await Promise.all([
    db.getProjectById(mr.projectId),
    db.getUserById(mr.createdBy),
    db.getMRLineItems(mr.id),
    db.getMRAttachments(mr.id),
  ]);

  return {
    id: mr.id,
    mrn: mr.mrn,
    project_id: mr.projectId,
    project_name: project?.name ?? 'Unknown Project',
    requester_id: mr.createdBy,
    requester_name: requester?.name ?? 'Unknown Requester',
    status: mr.status,
    created_at: mr.createdAt,
    updated_at: mr.updatedAt,
    line_items: lineItems.map((item) => ({
      id: item.id,
      item_code: item.itemCode,
      description: item.description,
      uom: item.uom,
      quantity: item.quantity,
      unit_price: 0,
      remarks: item.remarks,
      location: item.location,
      brand_asset: item.brandAsset,
      serial_chassis_engine_no: item.serialChassisEngineNo,
      model_year: item.modelYear,
    })),
    attachments: attachments.map((attachment) => ({
      id: attachment.id,
      filename: attachment.fileName,
      url: attachment.fileUrl,
      file_type: attachment.fileType ?? 'application/octet-stream',
      file_size: attachment.fileSize ?? 0,
      uploaded_at: attachment.uploadedAt,
    })),
    remarks: undefined,
  };
}

function resolveSupplier(input: CreateRFQSupplierInput): Supplier {
  if (input.supplier_id) {
    const existing = supplierStore.find((supplier) => supplier.id === input.supplier_id);
    if (existing) {
      return existing;
    }
  }

  const supplierId = input.supplier_id ?? `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const supplier = createMockSupplier({
    id: supplierId,
    name: input.name ?? 'RFQ Supplier',
    email: input.email ?? 'supplier@example.com',
    category: input.category ?? 'General Supplies',
    has_been_used: true,
    status: 'approved',
    is_active: true,
  });

  supplierStore.push(supplier);
  return supplier;
}

export async function GET() {
  return NextResponse.json({ rfqs: rfqStore });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRFQRequest;

    if (!body.material_request_id) {
      return NextResponse.json({ error: 'material_request_id is required' }, { status: 400 });
    }

    if (!body.line_item_ids || body.line_item_ids.length === 0) {
      return NextResponse.json({ error: 'Select at least one line item' }, { status: 400 });
    }

    if (!body.suppliers || body.suppliers.length === 0) {
      return NextResponse.json({ error: 'Select at least one supplier' }, { status: 400 });
    }

    const materialRequest = await buildMaterialRequest(body.material_request_id);
    if (!materialRequest) {
      return NextResponse.json({ error: 'Material Request not found' }, { status: 404 });
    }

    const selectedLineItems = materialRequest.line_items.filter((item) =>
      body.line_item_ids.includes(item.id)
    );

    if (selectedLineItems.length === 0) {
      return NextResponse.json({ error: 'No valid line items selected' }, { status: 400 });
    }

    const rfqNumber = `RFQ-${Date.now()}`;
    const now = new Date().toISOString();

    const suppliers = body.suppliers.map(resolveSupplier);

    const rfqSuppliers: RFQSupplier[] = suppliers.map((supplier) => ({
      id: `${rfqNumber}-${supplier.id}`,
      rfq_id: rfqNumber,
      supplier_id: supplier.id,
      supplier,
      status: 'pending',
      sent_at: now,
      responded_at: undefined,
      portal_link: `https://portal.example.com/rfq/${rfqNumber}?supplier=${supplier.id}`,
      email_tracking_id: `track-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));

    const rfq: RFQ = {
      id: rfqNumber,
      rfq_number: rfqNumber,
      material_request_id: materialRequest.id,
      material_request: {
        ...materialRequest,
        line_items: selectedLineItems,
      },
      status: 'sent',
      created_at: now,
      updated_at: now,
      sent_at: now,
      due_date: body.due_date,
      terms: body.terms,
      remarks: body.remarks,
      suppliers: rfqSuppliers,
      quotes: [],
      created_by: 'user-123',
      created_by_name: 'Procurement Officer',
    };

    rfqStore.push(rfq);

    await Promise.all(
      rfqSuppliers.map((supplier) =>
        notificationService.sendRFQDispatchNotification(rfq, supplier, {
          lineItemCount: selectedLineItems.length,
          dueDate: body.due_date,
          terms: body.terms,
        })
      )
    );

    return NextResponse.json(rfq, { status: 201 });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 });
  }
}
