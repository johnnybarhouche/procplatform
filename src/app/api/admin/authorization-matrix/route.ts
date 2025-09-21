import { NextRequest, NextResponse } from 'next/server';
import { AuthorizationMatrix } from '@/types/admin';

// Mock authorization matrix data
const mockAuthorizationMatrix: AuthorizationMatrix[] = [
  {
    id: '1',
    project_id: '1',
    role: 'requester',
    threshold_amount: 0,
    approval_level: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    project_id: '1',
    role: 'procurement_manager',
    threshold_amount: 1000,
    approval_level: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    project_id: '1',
    role: 'department_head',
    threshold_amount: 5000,
    approval_level: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    project_id: '1',
    role: 'finance_director',
    threshold_amount: 10000,
    approval_level: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    project_id: '1',
    role: 'ceo',
    threshold_amount: 50000,
    approval_level: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    project_id: '2',
    role: 'requester',
    threshold_amount: 0,
    approval_level: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    project_id: '2',
    role: 'procurement_manager',
    threshold_amount: 2000,
    approval_level: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    project_id: '2',
    role: 'department_head',
    threshold_amount: 10000,
    approval_level: 3,
    is_active: true,
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let filteredMatrix = mockAuthorizationMatrix;
    if (projectId) {
      filteredMatrix = mockAuthorizationMatrix.filter(item => item.project_id === projectId);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(filteredMatrix);
  } catch (error) {
    console.error('Error fetching authorization matrix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authorization matrix' },
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
    const { matrix } = body;

    // Validate input
    if (!Array.isArray(matrix)) {
      return NextResponse.json(
        { error: 'Invalid input. Matrix must be an array.' },
        { status: 400 }
      );
    }

    // Validate each matrix entry
    for (const entry of matrix) {
      if (!entry.id || !entry.project_id || !entry.role) {
        return NextResponse.json(
          { error: 'Invalid matrix entry. Missing required fields.' },
          { status: 400 }
        );
      }

      if (typeof entry.threshold_amount !== 'number' || entry.threshold_amount < 0) {
        return NextResponse.json(
          { error: 'Invalid matrix entry. threshold_amount must be a non-negative number.' },
          { status: 400 }
        );
      }

      if (typeof entry.approval_level !== 'number' || entry.approval_level < 1) {
        return NextResponse.json(
          { error: 'Invalid matrix entry. approval_level must be a positive number.' },
          { status: 400 }
        );
      }

      if (typeof entry.is_active !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid matrix entry. is_active must be a boolean.' },
          { status: 400 }
        );
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // In a real implementation, this would update the database
    // For now, we'll just return the updated matrix
    const updatedMatrix = matrix.map((entry: AuthorizationMatrix) => ({
      ...entry,
      updated_at: new Date().toISOString()
    }));

    // Log audit trail
    console.log(`Authorization matrix updated by ${userRole} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'Authorization matrix updated successfully',
      matrix: updatedMatrix
    });
  } catch (error) {
    console.error('Error updating authorization matrix:', error);
    return NextResponse.json(
      { error: 'Failed to update authorization matrix' },
      { status: 500 }
    );
  }
}

