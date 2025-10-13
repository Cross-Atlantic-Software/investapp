import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

// Upload banner image for news section (admin)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Admin token required' },
        { status: 401 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/news-sections/upload-banner`, {
      method: 'POST',
      headers: {
        'token': token,
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload banner' },
      { status: 500 }
    );
  }
}
