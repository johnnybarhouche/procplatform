import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check for admin role in headers
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    // Mock authorization matrix data
    const authorizationMatrix = [
      {
        id: '1',
        project_id: projectId || '1',
        role: 'requester',
        can_create_mr: true,
        can_view_mr: true,
        can_edit_mr: true,
        can_delete_mr: true,
        can_create_rfq: false,
        can_view_rfq: true,
        can_edit_rfq: false,
        can_delete_rfq: false,
        can_approve_pr: false,
        can_approve_po: false,
        can_manage_suppliers: false,
        can_manage_items: false,
        can_view_analytics: false,
        can_manage_users: false,
        can_configure_system: false
      },
      {
        id: '2',
        project_id: projectId || '1',
        role: 'procurement',
        can_create_mr: true,
        can_view_mr: true,
        can_edit_mr: true,
        can_delete_mr: true,
        can_create_rfq: true,
        can_view_rfq: true,
        can_edit_rfq: true,
        can_delete_rfq: true,
        can_approve_pr: false,
        can_approve_po: false,
        can_manage_suppliers: true,
        can_manage_items: true,
        can_view_analytics: true,
        can_manage_users: false,
        can_configure_system: false
      },
      {
        id: '3',
        project_id: projectId || '1',
        role: 'approver',
        can_create_mr: true,
        can_view_mr: true,
        can_edit_mr: false,
        can_delete_mr: false,
        can_create_rfq: false,
        can_view_rfq: true,
        can_edit_rfq: false,
        can_delete_rfq: false,
        can_approve_pr: true,
        can_approve_po: true,
        can_manage_suppliers: false,
        can_manage_items: false,
        can_view_analytics: true,
        can_manage_users: false,
        can_configure_system: false
      },
      {
        id: '4',
        project_id: projectId || '1',
        role: 'admin',
        can_create_mr: true,
        can_view_mr: true,
        can_edit_mr: true,
        can_delete_mr: true,
        can_create_rfq: true,
        can_view_rfq: true,
        can_edit_rfq: true,
        can_delete_rfq: true,
        can_approve_pr: true,
        can_approve_po: true,
        can_manage_suppliers: true,
        can_manage_items: true,
        can_view_analytics: true,
        can_manage_users: true,
        can_configure_system: true
      }
    ];

    return NextResponse.json(authorizationMatrix);
  } catch (error) {
    console.error('Error fetching authorization matrix:', error);
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

    const updatedMatrix = await request.json();
    
    // In a real application, you would save this to a database
    console.log('Updated authorization matrix:', updatedMatrix);
    
    return NextResponse.json({ message: 'Authorization matrix updated successfully' });
  } catch (error) {
    console.error('Error updating authorization matrix:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}