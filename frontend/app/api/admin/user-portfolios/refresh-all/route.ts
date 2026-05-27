import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/backend/api/admin/user-portfolios/refresh-all`, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error refreshing all portfolios:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
