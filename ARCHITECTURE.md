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
        │ accepts "Roommate"   │    │ (Validated via Blob) │
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
                        │  Server appends to:     │
                        │  Vercel Blob (CSV)      │
                        └─────────────────────────┘
```

## 🏗️ System Architecture

### Frontend (React 19 / Next.js 16)
- **`WateringCounter.tsx`**: Main dashboard with pulsing animation and real-time counter.
- **`HistoryView.tsx`**: Interactive monthly calendar showing watering days marked with 'X'.
- **`StatsView.tsx`**: Data processing engine that calculates top waterers and watering gaps, rendered with CSS charts.
- **`AdminPanel.tsx`**: Restricted area for managing access codes and admin privileges.

### Backend (Server Actions)
- **`server-actions.ts`**: Handles persistent logging to Vercel Blob and retrieval of history/stats.
- **`access-codes.ts`**: Manages the `access_codes.json` blob with strict cache-busting.
- **`admin-actions.ts`**: Logic for adding, deleting, and updating access codes.

### Storage (Vercel Blob)
- **`watering.csv`**: Append-only (simulated) log for all watering events.
- **`access_codes.json`**: Registry of valid access codes and permissions.
- **Security**: Private access enabled for all blobs; no-cache headers enforced for real-time synchronization.

## 🔄 Data Flow: Watering Recording

```
User taps button
        ↓
    (1) recordWatering(deviceId, roommateName)
        ↓
    [Client]                    [Server]
        ├──────────────────────→ recordWatering()
        │                            ↓
        │                    Fetch current watering.csv (No Cache)
        │                            ↓
        │                    Append new line
        │                            ↓
        │                    Upload to Vercel Blob (Overwrite)
        │                            ↓
        │    ← {success, timestamp}
        ↓
Update counter and refresh global state
```

## 📊 CSV Data Schema
File: `watering.csv` (Private Blob)
Header: `device_id,roommate_name,timestamp`

## 🔌 Environment & Deployment
- **Deployment**: Vercel
- **Persistent Data**: Vercel Blob
- **Local Dev**: Fallback to `/data` folder if no `BLOB_READ_WRITE_TOKEN` is found.
