import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/admin/subscribers/${id}`, {
      method: 'DELETE',
      headers: {
        'token': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete subscriber' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in admin delete subscriber API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
