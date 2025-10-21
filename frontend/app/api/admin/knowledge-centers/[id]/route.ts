import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/backend/api/admin/knowledge-centers/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching knowledge center:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch knowledge center" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/knowledge-centers/${params.id}`, {
      method: "PUT",
      headers: {
        "token": token,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating knowledge center:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update knowledge center" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/backend/api/admin/knowledge-centers/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "token": token,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting knowledge center:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete knowledge center" },
      { status: 500 }
    );
  }
}
