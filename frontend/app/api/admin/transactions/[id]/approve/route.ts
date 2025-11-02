import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/transactions/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error approving transaction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to approve transaction' },
      { status: 500 }
    );
  }
}

