import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Bulk create scorecards for a specific stock
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const token = request.headers.get('token') || '';
    
    const response = await fetch(`${API_BASE_URL}/api/admin/stocks/${id}/scorecards/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error bulk creating scorecards:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to bulk create scorecards' },
      { status: 500 }
    );
  }
}
