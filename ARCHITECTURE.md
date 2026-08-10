# User Flow & Architecture Guide

## 🎬 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ROOMIES PLANT WATERING TRACKER                  │
└─────────────────────────────────────────────────────────────────────┘

                            START: User opens app
                                    ↓
                      ┌─────────────────────────────┐
                      │  Check for existing auth    │
                      │   cookies in browser        │
                      └─────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │ Cookies found? → SKIP to Main │
                    │ No cookies?  → Continue...    │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │ Attempt MAC Address Detection │
                    │ (WebRTC - ~1 second timeout)  │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │  MAC found?                   │
                    ├─────────────────────────────┬─┤
                   YES                           NO
                    ↓                             ↓
        ┌──────────────────────┐    ┌──────────────────────┐
        │ Show "Enter Name"    │    │ Show "Enter Access   │
        │ Screen (prefill skip)│    │ Code" Screen         │
        └──────────────────────┘    └──────────────────────┘
                    ↓                             ↓
        ┌──────────────────────┐    ┌──────────────────────┐
        │ User enters name or  │    │ User enters code     │
        │ accepts "Roommate"   │    │ (Validated via Atlas)│
        └──────────────────────┘    └──────────────────────┘
                    ↓                             ↓
                    └──→ ┌─────────────────────────┐
                        │ Store in cookies:       │
                        │ - deviceId              │
                        │ - roommateName         │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │   MAIN APP SCREEN       │
                        ├─────────────────────────┤
                        │ ┌──────────────────────┐ │
                        │ │   Watering Counter   │ │
                        │ │  [History] [Stats]   │ │
                        │ └──────────────────────┘ │
                        │         ↓                │
                        │    ┌─────────┐           │
                        │    │  🪴 Pulse│ (Big)    │
                        │    │ Button  │           │
                        │    └─────────┘           │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │ Call Server Action:     │
                        │ recordWatering(...)     │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │ Server inserts an event │
                        │ into MongoDB Atlas      │
                        └─────────────────────────┘
```

## 🏗️ System Architecture

### Frontend (React 19 / Next.js 16)
- **`WateringCounter.tsx`**: Main dashboard with pulsing animation and real-time counter.
- **`HistoryView.tsx`**: Interactive monthly calendar showing watering days marked with 'X'.
- **`StatsView.tsx`**: Data processing engine that calculates top waterers and watering gaps, rendered with CSS charts.
- **`AdminPanel.tsx`**: Restricted area for managing access codes and admin privileges.

### Backend (Server Actions)
- **`server-actions.ts`**: Inserts watering events into MongoDB Atlas and retrieves history and statistics.
- **`access-codes.ts`**: Manages Atlas access-code documents and initializes the default admin code.
- **`admin-actions.ts`**: Logic for adding, deleting, and updating access codes.
- **`mongodb.ts`**: Creates and reuses the MongoDB client connection and selects the configured database.

### Storage (MongoDB Atlas)
- **`watering_events` collection**: One document per watering event, with `deviceId`, `accessCode`, and an ISO 8601 `timestamp`.
- **`access_codes` collection**: Access-code registry with `code`, `name`, `createdAt`, and optional `isAdmin` fields.
- **Indexes**: The app creates a descending `timestamp` index for watering events and a unique `code` index for access codes.
- **Security**: The Atlas connection string remains server-only in `MONGODB_URI`; scope the database user to the application database.

## 🔄 Data Flow: Watering Recording

```
User taps button
        ↓
    (1) recordWatering(deviceId, accessCode)
        ↓
    [Client]                    [Server]
        ├──────────────────────→ recordWatering()
        │                            ↓
        │                    Insert one document in
        │                    watering_events
        │                            ↓
        │    ← {success, timestamp}
        ↓
Update counter and refresh global state
```

## 📊 Watering Event Schema

Collection: `watering_events`

```json
{
  "deviceId": "device_abc123",
  "accessCode": "ROOMMATE01",
  "timestamp": "2026-08-10T14:30:00.000Z"
}
```

## 🔌 Environment & Deployment
- **Deployment**: Vercel
- **Persistent Data**: MongoDB Atlas
- **Required**: Set `MONGODB_URI` to the Atlas connection string. Set `MONGODB_DB` to override the default `roomies` database.
- **Local Dev**: If `MONGODB_URI` is absent, the app uses the `/data` folder as a file-based fallback.
