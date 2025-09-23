import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Simulate authentication (replace with real authentication logic)
    if (username === 'admin' && password === 'admin123') {
      // Generate a mock JWT token (in real implementation, use a proper JWT library)
      const token = Buffer.from(JSON.stringify({
        userId: '1',
        username: 'admin',
        role: 'admin',
        exp: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 1 day
      })).toString('base64');

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: '1',
          username: 'admin',
          role: 'admin',
          name: 'Admin User',
          email: 'admin@company.com'
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
