import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    const backendUrl = `${API_BASE_URL}/api/admin/stocks/${id}/sector-outlooks/stats`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching Sector & Comapany outlook stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch Sector & Comapany outlook statistics', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
