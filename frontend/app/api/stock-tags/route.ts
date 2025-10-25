import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/backend/api/stock-tags`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stock tags:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stock tags" },
      { status: 500 }
    );
  }
}
