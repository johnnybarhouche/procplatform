import { NextRequest, NextResponse } from 'next/server';
import { CurrencyConfig } from '@/types/admin';

// Mock currency configuration data
const mockCurrencyConfig: CurrencyConfig = {
  id: '1',
  base_currency: 'AED',
  usd_rate: 3.6725,
  last_updated: new Date().toISOString(),
  updated_by: 'admin@company.com'
};

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

    return NextResponse.json(mockCurrencyConfig);
  } catch (error) {
    console.error('Error fetching currency configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency configuration' },
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
    const { usd_rate } = body;

    // Validate input
    if (typeof usd_rate !== 'number' || usd_rate <= 0) {
      return NextResponse.json(
        { error: 'Invalid USD rate. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Validate reasonable range (AED to USD should be around 3.6-3.7)
    if (usd_rate < 3.0 || usd_rate > 4.0) {
      return NextResponse.json(
        { error: 'USD rate seems unreasonable. Please verify the rate.' },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // In a real implementation, this would update the database
    const updatedConfig: CurrencyConfig = {
      ...mockCurrencyConfig,
      usd_rate,
      last_updated: new Date().toISOString(),
      updated_by: userRole
    };

    // Log audit trail
    console.log(`Currency configuration updated by ${userRole} at ${new Date().toISOString()}. New USD rate: ${usd_rate}`);

    return NextResponse.json({
      message: 'Currency configuration updated successfully',
      currency: updatedConfig
    });
  } catch (error) {
    console.error('Error updating currency configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update currency configuration' },
      { status: 500 }
    );
  }
}

