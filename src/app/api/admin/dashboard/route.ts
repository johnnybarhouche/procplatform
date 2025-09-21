import { NextRequest, NextResponse } from 'next/server';
import { AdminDashboardData, AdminActivity } from '@/types/admin';

// Mock admin dashboard data
const mockAdminDashboardData: AdminDashboardData = {
  total_users: 25,
  active_users: 22,
  total_projects: 8,
  system_health: 'healthy',
  recent_activity: [
    {
      id: '1',
      action: 'User Role Updated',
      actor: 'admin@company.com',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: 'Updated role for john.doe@company.com to procurement_manager'
    },
    {
      id: '2',
      action: 'Authorization Matrix Updated',
      actor: 'admin@company.com',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      details: 'Updated approval thresholds for Project Alpha'
    },
    {
      id: '3',
      action: 'Currency Rate Updated',
      actor: 'admin@company.com',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      details: 'Updated USD to AED rate to 3.6725'
    },
    {
      id: '4',
      action: 'System Settings Updated',
      actor: 'admin@company.com',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      details: 'Updated email notification settings'
    }
  ],
  system_stats: {
    total_mrs: 156,
    total_prs: 89,
    total_pos: 67,
    total_suppliers: 23
  }
};

export async function GET(request: NextRequest) {
  try {
    // Check for admin role (in real implementation, this would be from JWT/session)
    const userRole = request.headers.get('x-user-role') || 'admin';
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockAdminDashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    );
  }
}

