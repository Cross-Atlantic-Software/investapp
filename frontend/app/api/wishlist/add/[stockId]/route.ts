import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stockId: string }> }
) {
  try {
    const { stockId } = await params;
    const token = request.headers.get('token') || '';

    const response = await fetch(`${API_BASE_URL}/backend/api/wishlist/add/${stockId}`, {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to add to wishlist' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
