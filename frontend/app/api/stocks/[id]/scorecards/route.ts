import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Get scorecards for a specific stock (public route)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/api/admin/stocks/${id}/scorecards`, {
      headers: {
        'token': '', // No token needed for public access
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scorecards:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch scorecards' },
      { status: 500 }
    );
  }
}
