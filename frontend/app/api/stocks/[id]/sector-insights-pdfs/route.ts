import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    const backendUrl = `${API_BASE_URL}/backend/api/public/stocks/${id}/sector-insights-pdfs?is_active=true`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error fetching sector insights PDF:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch sector insights PDF', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
