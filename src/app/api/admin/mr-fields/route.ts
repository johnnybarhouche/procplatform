import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check for admin role in headers
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Mock MR field configuration data
    const mrFields = [
      {
        id: '1',
        field_name: 'project_id',
        display_name: 'Project',
        field_type: 'select',
        required: true,
        order: 1,
        options: [
          { value: '1', label: 'Project Alpha' },
          { value: '2', label: 'Project Beta' },
          { value: '3', label: 'Project Gamma' }
        ],
        validation_rules: {
          required: true
        }
      },
      {
        id: '2',
        field_name: 'requested_by',
        display_name: 'Requested By',
        field_type: 'text',
        required: true,
        order: 2,
        validation_rules: {
          required: true,
          min_length: 2
        }
      },
      {
        id: '3',
        field_name: 'department',
        display_name: 'Department',
        field_type: 'select',
        required: true,
        order: 3,
        options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'operations', label: 'Operations' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'safety', label: 'Safety' }
        ],
        validation_rules: {
          required: true
        }
      },
      {
        id: '4',
        field_name: 'priority',
        display_name: 'Priority',
        field_type: 'select',
        required: true,
        order: 4,
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ],
        validation_rules: {
          required: true
        }
      },
      {
        id: '5',
        field_name: 'delivery_date',
        display_name: 'Required Delivery Date',
        field_type: 'date',
        required: true,
        order: 5,
        validation_rules: {
          required: true,
          min_date: 'today'
        }
      },
      {
        id: '6',
        field_name: 'justification',
        display_name: 'Justification',
        field_type: 'textarea',
        required: false,
        order: 6,
        validation_rules: {
          max_length: 500
        }
      }
    ];

    return NextResponse.json(mrFields);
  } catch (error) {
    console.error('Error fetching MR field configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Check for admin role in headers
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updatedFields = await request.json();
    
    // In a real application, you would save this to a database
    console.log('Updated MR field configuration:', updatedFields);
    
    return NextResponse.json({ message: 'MR field configuration updated successfully' });
  } catch (error) {
    console.error('Error updating MR field configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}