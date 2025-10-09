import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Bulk delete news sections (admin)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');
    const body = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin token required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/backend/api/admin/news-sections/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error bulk deleting news sections:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to bulk delete news sections' },
      { status: 500 }
    );
  }
}
