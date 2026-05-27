import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/backend/api/user-wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error withdrawing from wallet:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to withdraw from wallet' },
      { status: 500 }
    );
  }
}

