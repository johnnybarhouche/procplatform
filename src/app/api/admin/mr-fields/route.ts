import { NextRequest, NextResponse } from 'next/server';
import { MRFieldConfig } from '@/types/admin';

// Mock MR field configuration data
const mockMRFields: MRFieldConfig[] = [
  {
    id: '1',
    field_name: 'project_id',
    field_label: 'Project',
    is_visible: true,
    is_required: true,
    display_order: 1,
    field_type: 'select',
    validation_rules: { required: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    field_name: 'requested_by',
    field_label: 'Requested By',
    is_visible: true,
    is_required: true,
    display_order: 2,
    field_type: 'text',
    validation_rules: { required: true, maxLength: 100 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    field_name: 'department',
    field_label: 'Department',
    is_visible: true,
    is_required: true,
    display_order: 3,
    field_type: 'select',
    validation_rules: { required: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    field_name: 'priority',
    field_label: 'Priority',
    is_visible: true,
    is_required: false,
    display_order: 4,
    field_type: 'select',
    validation_rules: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    field_name: 'justification',
    field_label: 'Justification',
    is_visible: true,
    is_required: true,
    display_order: 5,
    field_type: 'textarea',
    validation_rules: { required: true, minLength: 10 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    field_name: 'delivery_date',
    field_label: 'Required Delivery Date',
    is_visible: true,
    is_required: false,
    display_order: 6,
    field_type: 'date',
    validation_rules: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    field_name: 'budget_code',
    field_label: 'Budget Code',
    is_visible: true,
    is_required: false,
    display_order: 7,
    field_type: 'text',
    validation_rules: { maxLength: 50 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    field_name: 'attachments',
    field_label: 'Attachments',
    is_visible: true,
    is_required: false,
    display_order: 8,
    field_type: 'file',
    validation_rules: { maxFileSize: '10MB', allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check for admin role
    const userRole = request.headers.get('x-user-role') || 'admin';
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockMRFields);
  } catch (error) {
    console.error('Error fetching MR field configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MR field configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for admin role
    const userRole = request.headers.get('x-user-role') || 'admin';
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fields } = body;

    // Validate input
    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Invalid input. Fields must be an array.' },
        { status: 400 }
      );
    }

    // Validate each field
    for (const field of fields) {
      if (!field.id || !field.field_name || !field.field_label) {
        return NextResponse.json(
          { error: 'Invalid field configuration. Missing required fields.' },
          { status: 400 }
        );
      }

      if (typeof field.is_visible !== 'boolean' || typeof field.is_required !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid field configuration. is_visible and is_required must be boolean.' },
          { status: 400 }
        );
      }

      if (typeof field.display_order !== 'number' || field.display_order < 1) {
        return NextResponse.json(
          { error: 'Invalid field configuration. display_order must be a positive number.' },
          { status: 400 }
        );
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // In a real implementation, this would update the database
    // For now, we'll just return the updated fields
    const updatedFields = fields.map((field: MRFieldConfig) => ({
      ...field,
      updated_at: new Date().toISOString()
    }));

    // Log audit trail
    console.log(`MR field configuration updated by ${userRole} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'MR field configuration updated successfully',
      fields: updatedFields
    });
  } catch (error) {
    console.error('Error updating MR field configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update MR field configuration' },
      { status: 500 }
    );
  }
}

