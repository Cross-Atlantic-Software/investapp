import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { searchParams } = new URL(request.url);
    
    const params = new URLSearchParams();
    if (searchParams.get('search')) params.append('search', searchParams.get('search')!);
    if (searchParams.get('page')) params.append('page', searchParams.get('page')!);
    if (searchParams.get('limit')) params.append('limit', searchParams.get('limit')!);

    const response = await fetch(
      `${API_BASE_URL}/backend/api/admin/themes?${params.toString()}`,
      {
        headers: { 'token': token }
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/backend/api/admin/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating theme:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

