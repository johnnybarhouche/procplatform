import { NextRequest, NextResponse } from 'next/server';
import { PRAnalytics, AnalyticsFilters } from '@/types/analytics';

// Mock data for PR analytics
const mockPRAnalytics: PRAnalytics = {
  totalPRs: 156,
  pendingPRs: 23,
  approvedPRs: 118,
  rejectedPRs: 15,
  avgProcessingTime: 3.2,
  monthlyTrends: [
    { month: '2024-01', prs: 12, pos: 8, value: 180000, responseRate: 0.85 },
    { month: '2024-02', prs: 15, pos: 11, value: 220000, responseRate: 0.88 },
    { month: '2024-03', prs: 18, pos: 13, value: 280000, responseRate: 0.92 },
    { month: '2024-04', prs: 22, pos: 16, value: 320000, responseRate: 0.89 },
    { month: '2024-05', prs: 19, pos: 14, value: 290000, responseRate: 0.91 },
    { month: '2024-06', prs: 25, pos: 18, value: 350000, responseRate: 0.87 },
    { month: '2024-07', prs: 28, pos: 20, value: 410000, responseRate: 0.93 },
    { month: '2024-08', prs: 17, pos: 9, value: 400000, responseRate: 0.90 }
  ],
  topRequesters: [
    { name: 'John Smith', count: 45, totalValue: 680000 },
    { name: 'Sarah Johnson', count: 38, totalValue: 520000 },
    { name: 'Mike Wilson', count: 32, totalValue: 480000 },
    { name: 'Lisa Brown', count: 28, totalValue: 420000 },
    { name: 'David Lee', count: 13, totalValue: 350000 }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('projectId');

    const filters: AnalyticsFilters = {
      dateRange: {
        start: startDate || '2024-01-01',
        end: endDate || '2024-12-31'
      },
      projectId: projectId || undefined
    };

    // In a real implementation, you would:
    // 1. Query purchase_requisitions table with filters
    // 2. Calculate approval rates and processing times
    // 3. Aggregate by requester and project
    // 4. Apply proper date filtering

    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 150));

    return NextResponse.json({
      success: true,
      data: mockPRAnalytics,
      filters,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('PR analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch PR analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

