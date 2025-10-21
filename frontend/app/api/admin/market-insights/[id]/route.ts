import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/market-insights/${id}`, {
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
    console.error("Error fetching market insight:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch market insight" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/market-insights/${id}`, {
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
    console.error("Error updating market insight:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update market insight" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get('token');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication token missing' }, { status: 401 });
    }

    const { id } = await params;
    
    const response = await fetch(`${API_BASE_URL}/backend/api/admin/market-insights/${id}`, {
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
    console.error("Error deleting market insight:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete market insight" },
      { status: 500 }
    );
  }
}
