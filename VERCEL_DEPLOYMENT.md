# Vercel Deployment Guide

This guide will help you deploy your Overnatihaven application to Vercel with Vercel Postgres.

## What Was Changed

Your application has been converted to work with Vercel Serverless Functions and Vercel Postgres:

### 1. Database Migration
- **Before**: SQLite (better-sqlite3) - local file-based database
- **After**: Vercel Postgres - cloud-based PostgreSQL database
- All repository files have been updated to use async/await Postgres queries
- SQLite backups are available in `*.sqlite.ts` files

### 2. API Architecture
- **Before**: Standalone Express server
- **After**: Express app wrapped as a Vercel serverless function in `/api/index.ts`
- All API routes now run as serverless functions

### 3. Configuration Files Added
- `vercel.json` - Vercel deployment configuration
- `server/db/schema.postgres.sql` - Postgres database schema
- `server/db/database.postgres.ts` - Postgres database utilities

## Deployment Steps

### Step 1: Set Up Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your project (or create a new one)
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **Postgres**
6. Follow the prompts to create your database
7. Once created, Vercel will automatically set up environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Step 2: Initialize Database Schema

After creating the database, you need to run the schema to create tables:

1. In your Vercel project dashboard, go to **Storage** → **Postgres** → **Query**
2. Copy the contents of `server/db/schema.postgres.sql`
3. Paste and execute the SQL in the Vercel Postgres query editor

Alternatively, you can use the Vercel CLI:
```bash
vercel env pull .env.local
npx tsx -e "import {sql} from '@vercel/postgres'; import fs from 'fs'; const schema = fs.readFileSync('server/db/schema.postgres.sql', 'utf8'); await sql.query(schema);"
```

### Step 3: Set Environment Variables

In your Vercel project settings, add these environment variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS Configuration (your frontend URL)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Frontend API URL (optional, for local dev)
VITE_API_URL=https://your-vercel-app.vercel.app
```

### Step 4: Deploy to Vercel

#### Option A: Deploy via GitHub
1. Push this branch to your GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically deploy when you push changes

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Step 5: Verify Deployment

After deployment:

1. Check the deployment logs for any errors
2. Test the health endpoint: `https://your-app.vercel.app/api/health`
3. Test the gallery endpoint: `https://your-app.vercel.app/api/gallery`
4. Try logging in to the admin panel (default credentials from schema.sql)

## Troubleshooting

### Database Connection Issues
- Ensure your database is created and environment variables are set
- Check that the schema has been initialized
- Verify database connection in Vercel deployment logs

### API Not Working
- Check that `/api` routes are accessible
- Verify `vercel.json` is in the root directory
- Check serverless function logs in Vercel dashboard

### CORS Errors
- Update `CORS_ORIGIN` environment variable with your frontend URL
- Ensure frontend is using the correct `VITE_API_URL`

### Build Errors
- Ensure all dependencies are installed
- Check that TypeScript compiles without errors: `npm run build`
- Review build logs in Vercel dashboard

## Local Development

To run locally with Vercel Postgres:

1. Pull environment variables:
```bash
vercel env pull .env.local
```

2. Run the dev server:
```bash
npm run dev
```

3. The API will connect to your Vercel Postgres database

## Reverting to SQLite (if needed)

If you need to go back to SQLite for local development:

1. Restore the original files:
```bash
cp server/repositories/*.sqlite.ts server/repositories/*.ts
cp server/services/authService.sqlite.ts server/services/authService.ts
```

2. Update package.json to include better-sqlite3
3. Use the original database.ts

## Important Notes

- **Admin Password**: The default admin credentials are set in `schema.postgres.sql`. Change them after first login!
- **File Uploads**: Image uploads are stored as URLs in the database. For file storage, consider using Vercel Blob Storage
- **Database Backups**: Set up regular backups of your Vercel Postgres database
- **Environment Variables**: Never commit `.env.local` or expose your JWT_SECRET

## Next Steps

1. Change the default admin password
2. Set up custom domain in Vercel
3. Configure email service for contact forms
4. Set up monitoring and error tracking
5. Consider Vercel Blob Storage for image uploads

## Support

For issues:
- Check Vercel deployment logs
- Review Vercel Postgres documentation
- Check serverless function logs in Vercel dashboard
