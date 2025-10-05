import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('token');

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    // Forward the request to the backend
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';
    const backendUrl = `${API_BASE_URL}/api/admin/performance-pdfs/${id}/replace`;
    
    const formData = await request.formData();
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'token': token,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error replacing PDF:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to replace PDF' },
      { status: 500 }
    );
  }
}
