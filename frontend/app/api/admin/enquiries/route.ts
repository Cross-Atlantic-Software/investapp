import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/api/admin/enquiries?${queryString}`, {
      headers: {
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}