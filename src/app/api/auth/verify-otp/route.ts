import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, otp } = await request.json();

    // Basic validation
    if (!username || !otp) {
      return NextResponse.json(
        { error: 'Username and OTP are required' },
        { status: 400 }
      );
    }

    // Simulate OTP verification (replace with real OTP verification logic)
    if (otp === '123456') {
      // Generate a mock JWT token
      const token = Buffer.from(JSON.stringify({
        userId: '1',
        username,
        role: 'requester',
        exp: Date.now() + 24 * 60 * 60 * 1000 // 1 day
      })).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: '1',
          username,
          role: 'requester',
          name: 'User',
          email: 'user@company.com'
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid OTP' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
