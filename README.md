# 🌿 Roomies - Plant Watering Tracker

A modern web app for roommates to track shared plant watering. Features MongoDB Atlas persistence, device-based authentication, interactive history calendar, and detailed statistics.

## ✨ Features

### 🌱 Watering Interface
- **Large Circular Button** - Prominent, easy-to-tap plant watering button with a pulsing animation.
- **Real-time Counter** - Displays last watering time in human-readable format ("X days ago", "X hours ago", "X minutes ago").
- **Instant Feedback** - Button shows loading state and counter updates immediately after watering.
- **Auto-refresh** - Counter automatically updates every minute.

### 🔐 Authentication & Device Identification
- **Admin Panel** - Manage access codes, names, and admin privileges directly in the app.
- **MAC Address Detection** - Automatically reads device MAC address via WebRTC when available.
- **Access Code Fallback** - If MAC detection fails, users enter a secure access code.
- **Persistent Storage** - Credentials stored in browser cookies (no re-authentication needed).

### 📊 Data & Insights
- **Watering History** - Monthly calendar view marking every day someone watered the plants with an 'X'.
- **Statistics & Charts** - Visual charts showing top waterers, average watering periods, and longest gaps without water.
- **Persistent Storage** - All data is stored securely in **MongoDB Atlas**, surviving redeployments and serverless restarts.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas database (for production storage)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd roomies

# Install dependencies
npm install

# Set up environment variables (see below)
# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## ⚙️ Environment Variables

The application requires the following environment variables. Create a `.env.local` file for local development:

| Variable | Description | Required |
| :--- | :--- | :--- |
| `DEFAULT_ACCESS_CODE` | The master key used to initialize the first admin account. | Yes |
| `MONGODB_URI` | MongoDB Atlas connection string, including the database-user password. | Yes |
| `MONGODB_DB` | Database name. Defaults to `roomies`. | No |
| `NEXT_PUBLIC_APP_VERSION` | Optional manual version label for local or non-Vercel deployments. | No |

On Vercel, the admin screen automatically displays the short Git commit SHA and deployment environment. Enable **Automatically expose System Environment Variables** in the project environment settings so `VERCEL_GIT_COMMIT_SHA` and `VERCEL_ENV` are available during the build.

## 📋 How It Works

### Persistent Storage (MongoDB Atlas)
The application uses **MongoDB Atlas** for persistent storage in production.
- **Collections**: `access_codes` stores roommate codes and roles; `watering_events` stores each watering event.
- **Server-only access**: Keep `MONGODB_URI` in Vercel environment variables and never expose it with a `NEXT_PUBLIC_` prefix.
- **Local Fallback**: If `MONGODB_URI` is absent, the app uses the local `data/` folder for development.

### Data Formats
- **Access Codes**: `access_codes` documents containing `code`, `name`, `createdAt`, and `isAdmin`.
- **Watering Log**: `watering_events` documents containing `deviceId`, `accessCode`, and `timestamp`.

## 📁 Project Structure

```
app/
├── admin/              # Admin panel for code management
├── history/            # Watering history calendar
├── stats/              # Statistics & charts
├── layout.tsx          # Root layout
└── page.tsx            # Main watering dashboard

components/
├── AdminPanel.tsx      # Code management UI
├── HistoryView.tsx     # Calendar view logic
├── StatsView.tsx       # Data processing & charts
└── WateringCounter.tsx # Main tracker interface

lib/
├── access-codes.ts     # MongoDB access-code management
├── admin-actions.ts    # Server actions for admin tasks
├── server-actions.ts   # MongoDB server actions for watering & history
└── mac-address.ts      # Device identification logic
```

## 🔐 Security
- **MongoDB credentials**: Database access stays server-side in `MONGODB_URI`.
- **Admin Roles**: Only admin accounts can access the `/admin` panel.
- **Least privilege**: Give the Atlas database user only the access it needs for the `roomies` database.

## 👥 Support
For issues or questions, please open an issue on GitHub or contact your roommate!
