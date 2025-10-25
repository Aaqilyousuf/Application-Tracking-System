# ATS Bot Client

This is the bot client for the Application Tracking System (ATS). It provides automated processing of technical applications through a web interface.

## Features

- **Bot Authentication**: Secure login with JWT tokens for bot users
- **Automated Processing**: Trigger automated workflow for technical applications
- **Real-time Monitoring**: View technical applications and bot activity logs
- **Auto Mode**: Schedule automatic processing at regular intervals
- **Manual Triggers**: One-click manual automation triggers

## Automation Workflow

The bot automatically processes technical applications through the following workflow:

1. **Applied** → **Reviewed**: Automatic review after application submission
2. **Reviewed** → **Interview**: Schedule interview automatically
3. **Interview** → **Offer/Rejected**: Random decision (70% offer, 30% reject)

Each status change includes:

- Automated comments with timestamps
- Activity logs for tracking
- Real-time updates to the database

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

- `POST /api/auth/login` - Bot login
- `GET /api/auth/me` - Get current user info
- `GET /api/bot/technical-applications` - Get all technical applications
- `POST /api/bot/trigger` - Trigger automation process
- `GET /api/bot/logs` - Get bot activity logs

## Usage

1. **Login**: Use bot credentials to access the panel
2. **Manual Trigger**: Click "Trigger Automation" to process applications once
3. **Auto Mode**: Enable automatic processing every 30 seconds
4. **Monitor**: View applications and activity logs in real-time

## Notes

- This client is designed for bot users only (role: 'bot')
- Only processes technical applications (isTechnical: true)
- Non-technical applications are handled by admin users
- All automation includes proper logging and timestamps
- Auto mode can be toggled on/off as needed
