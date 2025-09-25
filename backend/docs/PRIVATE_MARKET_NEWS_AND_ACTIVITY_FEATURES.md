# Private Market News & Notable Activity Features

This document describes the implementation of the Private Market News and Notable Activity features based on the InvestApp specifications.

## Overview

The system includes two main content management features:

1. **Private Market News** - News items with taxonomy tagging and impact levels
2. **Notable Activity** - Activity updates with type categorization

Both features include complete CRUD operations, admin management panels, and frontend display components.

## Database Schema

### Private Market News Table (`private_market_news`)
- `id` - Primary key
- `title` - News title
- `url` - External URL (opens in new tab)
- `icon` - Display icon/initial
- `taxonomy_tags` - JSON array of taxonomy tags
- `impact_level` - High/Medium/Low Impact
- `status` - active/inactive
- `created_by` / `updated_by` - CMS user references
- `created_at` / `updated_at` - Timestamps

### Notable Activity Table (`notable_activities`)
- `id` - Primary key
- `activity_type` - Type of activity
- `icon` - Display icon/initial
- `description` - Activity description
- `status` - active/inactive
- `created_by` / `updated_by` - CMS user references
- `created_at` / `updated_at` - Timestamps

### Taxonomy Table (`taxonomies`)
- `id` - Primary key
- `name` - Taxonomy name (unique)
- `category` - Primary/Secondary
- `description` - Optional description
- `status` - active/inactive
- `created_by` / `updated_by` - CMS user references
- `created_at` / `updated_at` - Timestamps

### Activity Type Table (`activity_types`)
- `id` - Primary key
- `name` - Activity type name (unique)
- `description` - Optional description
- `status` - active/inactive
- `created_by` / `updated_by` - CMS user references
- `created_at` / `updated_at` - Timestamps

## Backend Implementation

### Models
- `PrivateMarketNews.ts` - Sequelize model for news items
- `NotableActivity.ts` - Sequelize model for activities
- `Taxonomy.ts` - Sequelize model for taxonomy management
- `ActivityType.ts` - Sequelize model for activity type management

### Controllers
- `PrivateMarketNewsManagementController` - CRUD operations for news
- `NotableActivityManagementController` - CRUD operations for activities
- `TaxonomyManagementController` - CRUD operations for taxonomies
- `ActivityTypeManagementController` - CRUD operations for activity types

### API Routes
All routes are protected with admin middleware:

#### Private Market News Routes
- `GET /api/admin/private-market-news` - List news with pagination/search
- `GET /api/admin/private-market-news/:id` - Get specific news item
- `POST /api/admin/private-market-news` - Create new news item
- `PUT /api/admin/private-market-news/:id` - Update news item
- `DELETE /api/admin/private-market-news/:id` - Delete news item
- `GET /api/admin/private-market-news/stats` - Get statistics

#### Notable Activity Routes
- `GET /api/admin/notable-activities` - List activities with pagination/search
- `GET /api/admin/notable-activities/:id` - Get specific activity
- `POST /api/admin/notable-activities` - Create new activity
- `PUT /api/admin/notable-activities/:id` - Update activity
- `DELETE /api/admin/notable-activities/:id` - Delete activity
- `GET /api/admin/notable-activities/stats` - Get statistics

#### Taxonomy Routes
- `GET /api/admin/taxonomies` - List taxonomies with pagination/search
- `GET /api/admin/taxonomies/active` - Get active taxonomies only
- `GET /api/admin/taxonomies/:id` - Get specific taxonomy
- `POST /api/admin/taxonomies` - Create new taxonomy
- `PUT /api/admin/taxonomies/:id` - Update taxonomy
- `DELETE /api/admin/taxonomies/:id` - Delete taxonomy
- `GET /api/admin/taxonomies/stats` - Get statistics

#### Activity Type Routes
- `GET /api/admin/activity-types` - List activity types with pagination/search
- `GET /api/admin/activity-types/active` - Get active activity types only
- `GET /api/admin/activity-types/:id` - Get specific activity type
- `POST /api/admin/activity-types` - Create new activity type
- `PUT /api/admin/activity-types/:id` - Update activity type
- `DELETE /api/admin/activity-types/:id` - Delete activity type
- `GET /api/admin/activity-types/stats` - Get statistics

## Frontend Implementation

### API Routes
- `/api/private-market-news` - Public API for fetching news
- `/api/notable-activities` - Public API for fetching activities
- `/api/admin/private-market-news` - Admin API routes
- `/api/admin/notable-activities` - Admin API routes
- `/api/admin/taxonomies` - Admin API routes
- `/api/admin/activity-types` - Admin API routes

### Components

#### Display Components
- `PrivateMarketNews` - Displays news items with taxonomy tags and impact levels
- `NotableActivity` - Displays activity items with type and description
- `NewsAndActivity` - Combined component showing both sections side by side

#### Admin Components
- `/admin/private-market-news` - Admin page for managing news
- `/admin/notable-activities` - Admin page for managing activities

### Features

#### Private Market News Display
- Shows icon, title, taxonomy tags, impact level, and timestamp
- Links open in new tab
- Responsive design with loading states
- Color-coded impact levels (High=Red, Medium=Yellow, Low=Green)

#### Notable Activity Display
- Shows icon, activity type, description, and timestamp
- Responsive design with loading states
- Color-coded activity types

#### Admin Management
- Full CRUD operations
- Search and filtering
- Sorting by various fields
- Pagination
- Status management (active/inactive)
- Real-time notifications

## Database Setup

### Migration Files
1. `create-private-market-news-table.sql`
2. `create-notable-activities-table.sql`
3. `create-taxonomies-table.sql`
4. `create-activity-types-table.sql`
5. `seed-initial-data.sql`

### Running Migrations
```sql
-- Run each migration file in order
SOURCE create-private-market-news-table.sql;
SOURCE create-notable-activities-table.sql;
SOURCE create-taxonomies-table.sql;
SOURCE create-activity-types-table.sql;
SOURCE seed-initial-data.sql;
```

## Usage Examples

### Adding News Item
```javascript
const newsData = {
  title: "TechCorp raises $50M Series A",
  url: "https://example.com/techcorp-funding",
  icon: "TC",
  taxonomy_tags: JSON.stringify(["Funding", "High Impact"]),
  impact_level: "High Impact"
};
```

### Adding Activity
```javascript
const activityData = {
  activity_type: "Large Trade",
  icon: "LT",
  description: "Institutional buy of ₹2.5M in Tech"
};
```

### Frontend Usage
```jsx
import NewsAndActivity from '@/components/containers/newsAndActivity';

// Display both sections
<NewsAndActivity newsLimit={3} activityLimit={3} />

// Display individual sections
<PrivateMarketNews limit={5} showTitle={true} />
<NotableActivity limit={5} showTitle={true} />
```

## Configuration

### Environment Variables
- `BACKEND_URL` - Backend API URL (default: http://localhost:8888)

### Admin Access
- Requires admin authentication token
- Role-based access control
- Session management

## Future Enhancements

1. **Rich Text Editor** - For news descriptions
2. **Image Upload** - For news icons and activity images
3. **Scheduled Publishing** - For timed news releases
4. **Analytics** - Track news engagement
5. **Email Notifications** - Alert users of new content
6. **API Rate Limiting** - Protect against abuse
7. **Caching** - Improve performance
8. **Search Optimization** - Full-text search capabilities

## Troubleshooting

### Common Issues

1. **Database Connection** - Ensure MySQL is running and configured
2. **Authentication** - Check admin token validity
3. **CORS** - Verify backend CORS settings
4. **File Uploads** - Check S3 configuration for icons

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Support

For issues or questions regarding these features, refer to:
- Backend logs in `/backend/logs`
- Frontend console for client-side errors
- Database logs for query issues
- Admin panel error notifications
