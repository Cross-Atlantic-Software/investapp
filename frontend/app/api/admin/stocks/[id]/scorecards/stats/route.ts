import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get scorecard statistics for a specific stock
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/admin/stocks/${id}/scorecards/stats`, {
      headers: {
        'token': token,
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scorecard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scorecard statistics' },
      { status: 500 }
    );
  }
}
