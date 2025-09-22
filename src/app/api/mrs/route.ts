import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface MRLineItem {
  id: string;
  itemCode: string;
  description: string;
  uom: string;
  qty: number;
  remarks: string;
  location: string;
  brandAsset: string;
  serialChassisEngineNo: string;
  modelYear: string;
}

interface CreateMRRequest {
  projectId: string;
  lineItems: MRLineItem[];
  attachments?: string[]; // File URLs after upload
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMRRequest = await request.json();
    
    // Validate required fields
    if (!body.projectId || !body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and line items are required' },
        { status: 400 }
      );
    }

    // Validate line items
    for (const item of body.lineItems) {
      if (!item.itemCode || !item.description || !item.uom || item.qty <= 0) {
        return NextResponse.json(
          { error: 'All line items must have itemCode, description, uom, and qty > 0' },
          { status: 400 }
        );
      }
    }

    // Create Material Request using database
    const attachments = body.attachments ?? [];

    const newMR = await db.createMaterialRequest({
      projectId: body.projectId,
      createdBy: 'user-123', // In real app, get from auth context
      lineItems: body.lineItems.map(item => ({
        itemCode: item.itemCode,
        description: item.description,
        uom: item.uom,
        quantity: item.qty,
        remarks: item.remarks,
        location: item.location,
        brandAsset: item.brandAsset,
        serialChassisEngineNo: item.serialChassisEngineNo,
        modelYear: item.modelYear
      })),
      attachments: attachments.map(url => ({
        fileName: url.split('/').pop() || 'unknown',
        fileUrl: url,
        fileType: 'application/octet-stream'
      }))
    });

    return NextResponse.json({
      success: true,
      mrId: newMR.id,
      mrn: newMR.mrn,
      message: 'Material Request created successfully'
    });

  } catch (error) {
    console.error('Error creating MR:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const mrs = await db.getMaterialRequests();

    const detailedMRs = await Promise.all(
      mrs.map(async (mr) => {
        const [project, requester, lineItems, attachments] = await Promise.all([
          db.getProjectById(mr.projectId),
          db.getUserById(mr.createdBy),
          db.getMRLineItems(mr.id),
          db.getMRAttachments(mr.id)
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
            unit_price: (item as { unitPrice?: number }).unitPrice ?? 0,
            remarks: item.remarks,
            location: item.location,
            brand_asset: item.brandAsset,
            serial_chassis_engine_no: item.serialChassisEngineNo,
            model_year: item.modelYear
          })),
          attachments: attachments.map((attachment) => ({
            id: attachment.id,
            filename: attachment.fileName,
            url: attachment.fileUrl,
            file_type: attachment.fileType ?? 'application/octet-stream',
            file_size: attachment.fileSize ?? 0,
            uploaded_at: attachment.uploadedAt
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      mrs: detailedMRs,
      total: detailedMRs.length
    });
  } catch (error) {
    console.error('Error fetching MRs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
