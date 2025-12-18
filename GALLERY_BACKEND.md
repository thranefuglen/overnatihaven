# Gallery Backend Implementation

Backend implementation for gallery administration system with authentication and file upload capabilities.

## Features Implemented

### 1. Database Setup
- ✅ `gallery_images` table with proper indexes
- ✅ `admin_users` table for authentication
- ✅ Database migration and seeding scripts
- ✅ Sample data creation

### 2. Authentication System
- ✅ JWT token generation and validation
- ✅ Password hashing with bcrypt
- ✅ Authentication middleware
- ✅ Login/logout endpoints
- ✅ Token validation

### 3. Gallery API Endpoints
- ✅ `GET /api/gallery` - Public active images
- ✅ `GET /api/gallery/admin` - All images (admin)
- ✅ `POST /api/gallery/admin` - Create image
- ✅ `PUT /api/gallery/admin/:id` - Update image
- ✅ `DELETE /api/gallery/admin/:id` - Delete image
- ✅ `PUT /api/gallery/admin/reorder` - Reorder images
- ✅ `PUT /api/gallery/admin/:id/toggle` - Toggle active status

### 4. File Upload System
- ✅ Multer middleware for file uploads
- ✅ File type and size validation
- ✅ Upload directory management
- ✅ Static file serving

### 5. Error Handling & Validation
- ✅ Zod schema validation
- ✅ Consistent error responses
- ✅ Comprehensive logging
- ✅ Input sanitization

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/users` - Create admin user

### Gallery (Public)
- `GET /api/gallery` - Get active images

### Gallery (Admin - Protected)
- `GET /api/gallery/admin` - Get all images
- `GET /api/gallery/admin/:id` - Get image by ID
- `POST /api/gallery/admin` - Create image (with file upload)
- `PUT /api/gallery/admin/:id` - Update image (with file upload)
- `DELETE /api/gallery/admin/:id` - Delete image
- `PUT /api/gallery/admin/reorder` - Reorder images
- `PUT /api/gallery/admin/:id/toggle` - Toggle active status

## Database Schema

### gallery_images
```sql
CREATE TABLE gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  file_path VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### admin_users
```sql
CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=overnatihaven

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
UPLOAD_DIR=./uploads/gallery
```

### 2. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed initial data
npx tsx server/db/seed.ts
```

### 3. Start Backend Server
```bash
npm run dev:backend
```

## Default Admin User
After seeding, a default admin user is created:
- Username: `admin`
- Password: `admin123`
- Email: `admin@overnatihaven.dk`

⚠️ **Remember to change the default password in production!**

## File Upload
- Images are uploaded to `./uploads/gallery/`
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Files are served at `/uploads/gallery/filename`

## Testing
Use `test-gallery-api.html` to test all API endpoints:
1. Start the backend server
2. Open `test-gallery-api.html` in browser
3. Login with default credentials
4. Test various endpoints

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- Request rate limiting
- CORS protection
- Input validation with Zod
- SQL injection prevention (parameterized queries)

## Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Success responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Logging
Comprehensive logging with Winston:
- Request logging
- Error logging
- Authentication events
- Database operations

## Next Steps
1. Set up MySQL database
2. Configure environment variables
3. Run migrations and seeding
4. Test API endpoints
5. Integrate with frontend admin panel