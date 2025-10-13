import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const token = request.headers.get('token') || '';

    const response = await fetch(`${API_BASE_URL}/backend/api/wishlist/user/${userId}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to get user wishlist' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting user wishlist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user wishlist' },
      { status: 500 }
    );
  }
}
