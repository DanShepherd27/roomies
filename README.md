# 🌿 Roomies - Plant Watering Tracker

A modern web app for roommates to track shared plant watering. Features a persistent Vercel Blob storage, device-based authentication, interactive history calendar, and detailed statistics.

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
- **Persistent Storage** - All data is stored securely in **Vercel Blob** storage, surviving redeployments and serverless restarts.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Vercel account (for production storage)

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
| `BLOB_READ_WRITE_TOKEN` | Token for Vercel Blob storage access. | Yes |
| `VERCEL_BLOB_TOKEN` | (Optional) Duplicate of `BLOB_READ_WRITE_TOKEN` for some SDK versions. | No |

## 📋 How It Works

### Persistent Storage (Vercel Blob)
The application uses **Vercel Blob** for persistent storage in production. 
- **Private Access**: All blobs are stored with `access: 'private'` for security.
- **Real-time Sync**: Caching is disabled (`useCache: false`) on all operations to ensure all devices see updates instantly.
- **Local Fallback**: If no blob token is provided, the app falls back to the local `data/` folder for development.

### Data Formats
- **Access Codes**: JSON format (`access_codes.json`)
- **Watering Log**: CSV format (`watering.csv`)
  - Format: `device_id,roommate_name,timestamp`

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
├── access-codes.ts     # Vercel Blob management for codes
├── admin-actions.ts    # Server actions for admin tasks
├── server-actions.ts   # Server actions for watering & history
└── mac-address.ts      # Device identification logic
```

## 🔐 Security
- **Private Blobs**: Data is not accessible via public URLs.
- **Admin Roles**: Only admin accounts can access the `/admin` panel.
- **Token Authentication**: Server-side communication with Vercel Blob is authenticated via tokens.

## 👥 Support
For issues or questions, please open an issue on GitHub or contact your roommate!
