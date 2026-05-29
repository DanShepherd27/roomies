# 🌿 Roomies - Plant Watering Tracker

A modern web app for roommates to track shared plant watering. Features a large circular watering button, device-based authentication, and persistent CSV logging.

## ✨ Features

### 🌱 Watering Interface

- **Large Circular Button** - Prominent, easy-to-tap plant watering button
- **Real-time Counter** - Displays last watering time in human-readable format ("X days ago", "X hours ago", "X minutes ago")
- **Instant Feedback** - Button shows loading state and counter updates immediately after watering
- **Auto-refresh** - Counter automatically updates every minute

### 🔐 Authentication & Device Identification

- **MAC Address Detection** - Automatically reads device MAC address via WebRTC when available
- **Access Code Fallback** - If MAC detection fails, users enter a secure access code (e.g., ROOM001, ROOM002)
- **Persistent Storage** - Credentials stored in browser cookies (no re-authentication needed)
- **Roommate Names** - Customize display name after authentication

### 📊 Data Logging

- **CSV Storage** - All watering events logged to `data/watering.csv`
- **Timestamp Records** - Precise ISO 8601 timestamps for each watering event
- **Device Tracking** - Links watering events to specific device identifiers
- **Roommate Attribution** - Records which roommate watered the plants

### 🎨 User Experience

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Beautiful UI** - Green gradient theme with smooth animations
- **Loading States** - Visual feedback during operations
- **Easy Logout** - One-click logout button in top right

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to the repository
cd roomies

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## ⚙️ Configuration

### Adding/Modifying Access Codes

Edit `lib/access-codes.ts`:

```typescript
export const VALID_ACCESS_CODES = [
  "ROOM001", // Roommate 1
  "ROOM002", // Roommate 2
  "ROOM003", // Roommate 3
  "ROOM004", // Roommate 4
];
```

Users can customize their name after entering a valid access code.

## 📋 How It Works

### First-Time Login Flow

```
User visits app
    ↓
Browser attempts MAC address retrieval (WebRTC)
    ├─ Success → User prompted for custom name
    └─ Failure → User prompted for access code
            ↓
        User enters access code (ROOM001, etc)
            ↓
        User enters custom name
            ↓
        Credentials stored in cookies
            ↓
        App ready to use
```

### Watering Flow

```
User taps circular button
    ↓
Request sent to server action
    ↓
Timestamp recorded in CSV file
    ↓
Counter updates to "0 days ago"
    ↓
Auto-refresh timer resets
```

### CSV Log Format

File: `data/watering.csv`

```csv
device_id,roommate_name,timestamp
a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T14:30:00.000Z
device_abc123,"Bob",2026-05-28T15:45:00.000Z
```

## 📁 Project Structure

```
app/
├── layout.tsx          # Root layout with Tailwind CSS
├── page.tsx            # Main page with authentication flow
├── globals.css         # Global styles

components/
├── AuthFlow.tsx        # Authentication & device identification UI
└── WateringCounter.tsx # Main watering counter interface

lib/
├── server-actions.ts   # Server-side watering logging & CSV recording
├── mac-address.ts      # MAC address retrieval via WebRTC
├── access-codes.ts     # Access code validation & defaults
└── cookies.ts          # Browser cookie utilities

public/                # Static assets

data/                  # Generated watering log (created at runtime)
└── watering.csv       # CSV file with all watering records
```

## 🔧 Customization

### Change Colors

Edit Tailwind color classes in components:

- `from-green-50 to-emerald-50` - Background gradient
- `bg-green-600 hover:bg-green-700` - Button colors

### Change Plant Emoji

In `components/WateringCounter.tsx`, change `🪴` to your preferred emoji:

```tsx
<div className="text-7xl animate-pulse">🌱</div> {/* or 🌿, 🪻, 🌸, etc */}
```

### Customize App Title

Edit `app/layout.tsx` metadata:

```typescript
export const metadata: Metadata = {
  title: "Your App Title",
  description: "Your description",
};
```

## 📱 Responsive Design

The app works seamlessly on:

- 📱 Mobile phones (portrait & landscape)
- 📱 Tablets
- 💻 Desktop browsers

The circular button and counter resize appropriately based on screen size.

## 🔐 Security Notes

- **No External API** - All data stays local, no cloud services
- **Device-Based** - MAC address provides device-level access control
- **Access Codes** - Simple codes prevent unauthorized access
- **Cookie Storage** - Secure by default in HTTPS environments
- **CSV Backup** - All data in plaintext CSV for easy export

## 🐛 Troubleshooting

### MAC Address Not Detected

This is normal! Many browsers/systems restrict MAC address access for privacy. The app automatically falls back to the access code system.

### CSV File Not Created

The `data/` folder and `watering.csv` file are created automatically on first use. Ensure the app has write permissions to the directory.

### Cookies Not Persisting

- Check browser cookie settings
- Ensure not in private/incognito mode
- Check that cookies are enabled for the domain

### Button Not Responding

- Check browser console for errors
- Ensure server is running (`npm run dev`)
- Try refreshing the page

## 📊 Viewing Watering History

The CSV file at `data/watering.csv` can be imported into:

- Excel/Google Sheets for charting
- Any data analysis tool
- Custom scripts for processing

## 🎓 Technical Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: CSV file (server-side)
- **Auth**: Browser cookies + access codes
- **Device ID**: MAC address (WebRTC) or device fingerprint

## 📝 License

Add your license here

## 👥 Support

For issues or questions, please open an issue on GitHub or contact your roommate!
