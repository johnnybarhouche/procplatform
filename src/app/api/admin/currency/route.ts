import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check for admin role in headers
    const userRole = request.headers.get('x-user-role');
    
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Mock currency configuration data
    const currencyConfig = {
      id: '1',
      default_currency: 'USD',
      supported_currencies: [
        { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
        { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
        { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 }
      ],
      exchange_rate_source: 'api',
      auto_update_rates: true,
      rate_update_frequency: 'daily',
      last_updated: new Date().toISOString()
    };

    return NextResponse.json(currencyConfig);
  } catch (error) {
    console.error('Error fetching currency configuration:', error);
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

    const updatedConfig = await request.json();
    
    // In a real application, you would save this to a database
    console.log('Updated currency configuration:', updatedConfig);
    
    return NextResponse.json({ message: 'Currency configuration updated successfully' });
  } catch (error) {
    console.error('Error updating currency configuration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}