import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, reason } = await request.json();

    // Basic validation
    if (!name || !email || !company || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Simulate sending notification to admin (replace with real notification logic)
    console.log('Access request received:', { name, email, company, reason });

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully. You will be notified once approved.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
