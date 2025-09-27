import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/admin/taxonomies/status/active`, {
      headers: {
        'token': token,
      },
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching active taxonomies:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
