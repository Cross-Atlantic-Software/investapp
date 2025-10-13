import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get news sections for a specific stock (public - no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/backend/api/stocks/${id}/news-sections?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock news sections:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch news sections' },
      { status: 500 }
    );
  }
}
