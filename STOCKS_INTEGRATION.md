# Stocks Integration Documentation

## Overview
This document describes the integration of real stocks data into the invest page of the InvestApp frontend.

## Changes Made

### Backend Changes

1. **Created Public Stocks API Route** (`backend/src/routes/stock-routes.ts`)
   - Added public endpoint `/api/stocks` that doesn't require authentication
   - Reuses existing stock management controllers

2. **Updated Main Routes** (`backend/src/routes/index.ts`)
   - Added public stock routes to the main router
   - Routes are accessible at `/api/stocks`

3. **Created Stock Seeding Script** (`backend/src/scripts/seedStocks.ts`)
   - Script to populate database with sample stock data
   - Includes the TCS stock data provided by user
   - Run with: `npm run seed`

### Frontend Changes

1. **Created Frontend API Route** (`frontend/app/api/stocks/route.ts`)
   - Proxies requests to backend stocks API
   - Handles query parameters for pagination, search, and sorting

2. **Updated Invest Page** (`frontend/app/(site)/invest/page.tsx`)
   - Replaced hardcoded PRODUCTS array with real API data
   - Added data mapping from backend format to frontend ProductItem format
   - Implemented loading and error states
   - Added search functionality with debouncing
   - Maintained existing UI/UX

## Data Mapping

The backend Product model is mapped to the frontend ProductItem interface:

| Backend Field | Frontend Field | Transformation |
|---------------|----------------|----------------|
| `id` | `id` | Convert to string |
| `title` | `name` | Direct mapping |
| `company_name` | `symbol` | First 4 characters, uppercase |
| `icon` | `logoUrl` | Direct mapping |
| `price_per_share` | `priceINR` | Parse and convert to number |
| `percentage_change` | `changePct` | Parse and convert to number |
| N/A | `sector` | Default to "Technology" |
| N/A | `description` | Generated description |
| N/A | `volumeThousands` | Random generated value |
| N/A | `graphImg` | Based on price change direction |

## API Endpoints

### Public Stocks API
- **GET** `/api/stocks` - Get all stocks with pagination and search
- **GET** `/api/stocks/:id` - Get stock by ID

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for stock title
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction (default: DESC)

## Usage

1. **Seed the database** with sample data:
   ```bash
   cd backend
   npm run seed
   ```

2. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend server**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Visit the invest page** at `http://localhost:3000/invest`

## Features

- ✅ Real-time stock data from database
- ✅ Search functionality with debouncing
- ✅ Loading and error states
- ✅ Responsive design maintained
- ✅ Pagination support
- ✅ Data mapping and transformation
- ✅ TypeScript type safety

## Sample Data

The seeding script includes:
- TCS (TATA) - Based on provided data
- Apple Inc.
- Microsoft Corporation
- Google (Alphabet)
- Tesla Inc.

Each stock includes realistic pricing, valuation, and change data in INR format.
