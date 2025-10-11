import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin token required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/shareholder-types/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error toggling shareholder type status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle shareholder type status' },
      { status: 500 }
    );
  }
}
