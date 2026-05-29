# Roomies - Plant Watering Tracker

A simple shared plant watering tracker app for roommates. Features device identification via MAC address with access code fallback, user name storage in cookies, and a CSV-based watering log.

## Features

- 🌿 **Big Circular Watering Button** - Large green button with plant emoji for easy tapping
- 📊 **Watering Counter** - Displays "X days ago" format for last watering time
- 🔐 **Device Authentication**
  - Attempts to read MAC address from browser (when available)
  - Falls back to access code verification (e.g., ROOM001, ROOM002, etc.)
  - Access codes are permanent and stored in cookies
- 📝 **CSV Logging** - All watering events logged to `data/watering.csv`
- 👤 **User Names** - Roommate names stored in cookies for personalization

## Setup

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Configuration

Edit access codes in `lib/access-codes.ts`:

```typescript
export const VALID_ACCESS_CODES = ["ROOM001", "ROOM002", "ROOM003", "ROOM004"];
```

Each access code is associated with a default name (Roommate 1, 2, etc.) but users can customize their name on first login.

## How It Works

### First-Time Access

1. User opens the app
2. Browser attempts to retrieve MAC address via WebRTC
3. If successful, user is prompted to enter their name
4. If unsuccessful, user is prompted to enter an access code
5. After entering name/code, credentials are stored in cookies (persist indefinitely)

### Watering

1. User taps the big circular plant button
2. Current timestamp is recorded to `data/watering.csv`
3. Counter updates to show "0 days ago"
4. Counter auto-refreshes every minute

### CSV Format

The watering log is stored in `data/watering.csv` with the following format:

```
device_id,roommate_name,timestamp
a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T14:30:00.000Z
device_abc123,"Bob",2026-05-28T15:45:00.000Z
```

## Logout

Click the "Logout" button in the top right to clear cookies and return to the authentication screen.

## Project Structure

```
app/
  layout.tsx          # Root layout
  page.tsx            # Main page with auth flow
components/
  AuthFlow.tsx        # Authentication UI
  WateringCounter.tsx # Watering counter UI
lib/
  server-actions.ts   # Server-side watering logging
  mac-address.ts      # MAC address retrieval
  access-codes.ts     # Access code validation
  cookies.ts          # Cookie utility functions
data/
  watering.csv        # Generated watering log (created on first run)
```

## Customization

- Modify colors in components to match your theme (currently using green/emerald)
- Change the plant emoji (🪴) to something else in `WateringCounter.tsx`
- Add more access codes in `lib/access-codes.ts`

## Notes

- MAC address retrieval doesn't work on all browsers/systems due to privacy restrictions
- The fallback access code system ensures all devices can authenticate
- All data is stored locally - no external API calls or data transmission
- The app uses Tailwind CSS for styling
