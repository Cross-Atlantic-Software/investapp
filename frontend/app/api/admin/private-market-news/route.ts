import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    // Temporarily allow requests without token for testing
    // if (!token) {
    //   return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'id';
    const sortOrder = searchParams.get('sort_order') || 'DESC';

    const params = new URLSearchParams({
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/private-market-news?${params.toString()}`, {
      headers: {
        ...(token && { 'token': token }),
      },
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching private market news:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await fetch(`${API_BASE_URL}/api/admin/private-market-news`, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating private market news:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
