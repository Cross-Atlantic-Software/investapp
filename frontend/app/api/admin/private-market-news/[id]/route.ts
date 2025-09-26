import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8888';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/private-market-news/${params.id}`, {
      headers: {
        'token': token,
      },
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching private market news:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await fetch(`${BACKEND_URL}/api/admin/private-market-news/${params.id}`, {
      method: 'PUT',
      headers: {
        'token': token,
      },
      body: formData,
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating private market news:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/private-market-news/${params.id}`, {
      method: 'DELETE',
      headers: {
        'token': token,
      },
    });
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting private market news:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
