# ATS Admin Client

This is the admin client for the Application Tracking System (ATS). It provides a web interface for administrators to manage job roles and applications.

## Features

- **Admin Authentication**: Secure login with JWT tokens
- **Dashboard**: Analytics and overview of applications
- **Job Management**: Create, update, and delete job roles
- **Application Management**: View and update non-technical application statuses
- **Real-time Updates**: Live data from the backend API

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**

   - Copy `env.example` to `.env`
   - Update `VITE_API_URL` to point to your backend server

   ```bash
   cp env.example .env
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000)

## API Endpoints Used

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user info
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET /api/admin/job-roles` - Get all job roles
- `POST /api/admin/job-roles` - Create new job role
- `GET /api/admin/non-technical-applications` - Get non-technical applications
- `PATCH /api/admin/applications/:id/update-status` - Update application status

## Notes

- This client is designed for admin users only
- Technical applications are handled by the bot client
- All API calls require JWT authentication
- The client automatically handles token expiration and redirects to login
