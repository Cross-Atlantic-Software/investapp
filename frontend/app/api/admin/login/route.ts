import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Call your backend admin login API
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8888'}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        token: data.token,
        user: data.user
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Login failed'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
