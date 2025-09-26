import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'createdAt';
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

    const response = await fetch(`${BACKEND_URL}/api/admin/taxonomies?${params.toString()}`, {
      headers: {
        'token': token,
      },
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching taxonomies:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/admin/taxonomies`, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating taxonomy:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
