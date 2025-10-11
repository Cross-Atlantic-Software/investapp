import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get subsectors by sector ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/sectors/${id}/subsectors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subsectors by sector ID:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subsectors by sector ID' },
      { status: 500 }
    );
  }
}
