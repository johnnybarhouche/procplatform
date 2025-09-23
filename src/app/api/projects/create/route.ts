import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, description, logo } = await request.json();

    // Basic validation
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Simulate project creation (replace with real project creation logic)
    const project = {
      id: Date.now().toString(),
      name,
      description,
      logo,
      createdAt: new Date().toISOString()
    };

    console.log('Project created:', project);

    return NextResponse.json({
      success: true,
      project
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
