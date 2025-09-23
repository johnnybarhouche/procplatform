import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check for admin role in headers
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Mock admin dashboard data
    const dashboardData = {
      system_health: 'healthy',
      total_users: 45,
      active_users: 38,
      total_projects: 3,
      system_stats: {
        total_mrs: 127,
        pending_approvals: 8,
        completed_this_month: 23
      },
      recent_activity: [
        {
          id: '1',
          action: 'User created new MR',
          details: 'Material Request #MR-2024-001 created for Project Alpha',
          actor: 'John Smith',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: '2',
          action: 'RFQ sent to suppliers',
          details: 'RFQ #RFQ-2024-003 sent to 5 suppliers',
          actor: 'Sarah Johnson',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        },
        {
          id: '3',
          action: 'Quote approved',
          details: 'Quote #Q-2024-002 approved for $15,000',
          actor: 'Mike Wilson',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
        },
        {
          id: '4',
          action: 'PO generated',
          details: 'Purchase Order #PO-2024-001 generated',
          actor: 'System',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        },
        {
          id: '5',
          action: 'New user registered',
          details: 'Emily Davis registered and assigned to Project Beta',
          actor: 'System',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
        }
      ]
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}