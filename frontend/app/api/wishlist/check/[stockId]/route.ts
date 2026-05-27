import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stockId: string }> }
) {
  try {
    const { stockId } = await params;
    const token = request.headers.get('token') || '';

    const response = await fetch(`${API_BASE_URL}/backend/api/wishlist/check/${stockId}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to check wishlist status' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check wishlist status' },
      { status: 500 }
    );
  }
}
