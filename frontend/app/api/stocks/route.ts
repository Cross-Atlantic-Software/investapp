import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    // Get filter parameters
    const stockMasterIds = searchParams.get('stock_master_ids') || '';
    const sectors = searchParams.get('sectors') || '';
    const subsectors = searchParams.get('subsectors') || '';
    const themes = searchParams.get('themes') || '';
    const valuation = searchParams.get('valuation') || '';

    const params = new URLSearchParams({
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder
    });

    if (search) {
      params.append('search', search);
    }

    // Add filter parameters
    if (stockMasterIds) {
      params.append('stock_master_ids', stockMasterIds);
    }
    if (sectors) {
      params.append('sectors', sectors);
    }
    if (subsectors) {
      params.append('subsectors', subsectors);
    }
    if (themes) {
      params.append('themes', themes);
    }
    if (valuation) {
      params.append('valuation', valuation);
    }

    console.log('🔍 Frontend API - Forwarding params:', params.toString());

    const response = await fetch(`${API_BASE_URL}/backend/api/stocks?${params.toString()}`);
    const data = await response.json();
    
    console.log('🔍 Frontend API - Backend response:', data.success, data.data?.stocks?.length || 0, 'stocks');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
