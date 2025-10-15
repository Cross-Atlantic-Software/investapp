import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token required' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort_by') || 'timestamp';
    const sortOrder = searchParams.get('sort_order') || 'DESC';

    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await fetch(`${API_BASE_URL}/backend/api/admin/buy-requests-count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({
        search
      }),
    });

    const countData = await countResult.json();
    const totalCount = countData.success ? countData.data.total : 0;

    // Get buy requests data
    const dataResult = await fetch(`${API_BASE_URL}/backend/api/admin/buy-requests-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify({
        search,
        sortBy,
        sortOrder,
        limit,
        offset
      }),
    });

    const dataResponse = await dataResult.json();

    if (!dataResponse.success) {
      return NextResponse.json({ 
        success: false, 
        message: dataResponse.message || 'Failed to fetch buy requests data' 
      }, { status: 500 });
    }

    const buyRequests = dataResponse.data.buyRequests || [];

    // Transform the data to match frontend expectations
    const transformedBuyRequests = buyRequests.map((request: any) => ({
      userId: request.User.id,
      userName: `${request.User.first_name} ${request.User.last_name}`,
      userEmail: request.User.email,
      stockName: request.stock_name,
      quantity: request.quantity,
      price: request.price,
      totalAmount: request.total_amount,
      timestamp: request.created_at
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return NextResponse.json({
      success: true,
      data: {
        buyRequests: transformedBuyRequests,
        pagination
      }
    });

  } catch (error) {
    console.error('Error in buy requests API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
