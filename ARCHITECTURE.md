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
        │ User enters name or  │    │ User enters code:    │
        │ accepts "Roommate"   │    │ ROOM001, ROOM002,    │
        │                      │    │ ROOM003, ROOM004     │
        └──────────────────────┘    └──────────────────────┘
                    ↓                             ↓
                    │    ┌──────────────────────┐
                    │    │ Validate Access Code │
                    │    ├─────────────┬────────┤
                    │   VALID        INVALID
                    │    ↓             ↓
                    │    │        Show error
                    │    │        (retry)
                    │    ↓
                    │ ┌─────────────────────────┐
                    │ │ Prefill default name or │
                    │ │ ask for custom name     │
                    │ └─────────────────────────┘
                    │    ↓
                    └──→ ┌─────────────────────────┐
                        │ Store in cookies:       │
                        │ - deviceId              │
                        │ - roommateName         │
                        │ (365 day expiration)    │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │   MAIN APP SCREEN       │
                        ├─────────────────────────┤
                        │ ┌──────────────────────┐ │
                        │ │    Hello, [Name]!    │ │
                        │ │ Plants last watered: │ │
                        │ │   X days ago         │ │
                        │ └──────────────────────┘ │
                        │         ↓                │
                        │    ┌─────────┐           │
                        │    │  🪴     │ (Big)    │
                        │    │ Button  │           │
                        │    └─────────┘           │
                        │ [Logout]                 │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │  User taps button       │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │  Show loading spinner   │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │ Call Server Action:     │
                        │ recordWatering(...)     │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │  Server appends to:     │
                        │  data/watering.csv      │
                        │  device_id, name,       │
                        │  timestamp              │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │ Update counter to:      │
                        │ "0 days ago"            │
                        │ Hide loading spinner    │
                        └─────────────────────────┘
                                    ↓
                        ┌─────────────────────────┐
                        │ Auto-refresh timer:     │
                        │ Every 60 seconds        │
                        │ Check last watering     │
                        │ Update counter          │
                        └─────────────────────────┘
```

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       BROWSER (CLIENT SIDE)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  page.tsx (Main Entry)                                          │
│  ├─ Manages auth state                                          │
│  ├─ Routes to AuthFlow or WateringCounter                       │
│  └─ Passes callbacks down                                       │
│                                                                  │
│  AuthFlow.tsx                                                   │
│  ├─ Checks cookies (lib/cookies.ts)                            │
│  ├─ Calls getMacAddress() (lib/mac-address.ts)                 │
│  ├─ Falls back to access code (lib/access-codes.ts)            │
│  ├─ Validates input                                             │
│  ├─ Stores in cookies                                           │
│  └─ Returns auth credentials                                    │
│                                                                  │
│  WateringCounter.tsx                                            │
│  ├─ Displays UI                                                 │
│  ├─ Calls recordWatering() (server action)                     │
│  ├─ Calls getLastWateringTime() (server action)                │
│  ├─ Updates counter display                                     │
│  ├─ Auto-refresh every 60s                                      │
│  └─ Logout button                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    (Server Action Calls)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (BACKEND SIDE)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  server-actions.ts                                              │
│  ├─ recordWatering(deviceId, name)                              │
│  │  ├─ Ensure data directory exists                            │
│  │  ├─ Ensure CSV header exists                                │
│  │  ├─ Append CSV line with timestamp                          │
│  │  └─ Return success/error                                    │
│  │                                                              │
│  └─ getLastWateringTime(deviceId)                               │
│     ├─ Read watering.csv                                       │
│     ├─ Find latest entry for device                            │
│     └─ Return timestamp                                        │
│                                                                  │
│  Filesystem                                                     │
│  └─ data/watering.csv                                          │
│     ├─ device_id,roommate_name,timestamp                       │
│     ├─ a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T14:30Z             │
│     └─ device_xyz,"Bob",2026-05-28T15:45Z                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: Watering Recording

```
User taps button
        ↓
    (1) recordWatering(deviceId, roommateName)
        ↓
    [Client]                    [Server]
        ├──────────────────────→ recordWatering()
        │                            ↓
        │                    ensureDataDir()
        │                            ↓
        │                    fs.mkdir if needed
        │                            ↓
        │                    ensureCSVHeader()
        │                            ↓
        │                    fs.access watering.csv
        │                            ↓
        │                    if not exists: write header
        │                            ↓
        │                    fs.appendFile(line)
        │                            ↓
        │    ← {success, timestamp}
        ↓
Update counter to "0 days ago"
```

## 🔐 Authentication Data Flow

```
Browser Storage
    ↓
┌─────────────────────────────┐
│    Browser Cookies          │
├─────────────────────────────┤
│ deviceId: "a1:b2:c3:..."    │  365-day expiration
│ roommateName: "Alice"      │
└─────────────────────────────┘

Session Flow:
    ├─ Page load → Check cookies
    ├─ Cookies exist → Load app immediately
    ├─ No cookies → Initialize auth flow
    │   ├─ Try MAC detection (lib/mac-address.ts)
    │   │   └─ WebRTC → RTCPeerConnection → ICE candidates
    │   ├─ If MAC found → Show name entry
    │   ├─ If MAC not found → Show access code entry
    │   └─ Validate & store in cookies
    └─ Page refresh → Same flow, cookies persist
```

## 📊 CSV Data Schema

```
File: data/watering.csv

Header Row:
device_id,roommate_name,timestamp

Example Data Rows:
a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T14:30:12.456Z
device_3609f452,"Bob",2026-05-28T15:45:30.123Z
a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T18:20:45.789Z

Column Details:
- device_id: MAC address or generated device fingerprint
- roommate_name: Quoted string (escaping for CSV)
- timestamp: ISO 8601 format (sortable, timezone-aware)

Properties:
✓ Append-only (never edited, only appended)
✓ Human-readable (can open in any text editor)
✓ Excel/Sheets compatible (import directly)
✓ Machine-parseable (standard CSV format)
✓ Timestamped (for analysis and trending)
```

## 🎨 UI Component Hierarchy

```
<RootLayout>
    └─ <Home> (page.tsx)
        ├─ State: isAuthenticated, deviceId, roommateName
        ├─ Conditional rendering:
        │
        ├─ (Not authenticated)
        │  └─ <AuthFlow>
        │     ├─ Check cookies
        │     ├─ Attempt MAC detection
        │     ├─ Show auth screens (code/name entry)
        │     └─ Call onAuth() callback
        │
        └─ (Authenticated)
           └─ <WateringCounter>
               ├─ Display counter
               ├─ Show watering button
               ├─ Handle watering action
               ├─ Fetch last watering time
               ├─ Auto-refresh timer
               └─ Logout button
```

## 🔌 Server Actions API

```
recordWatering(deviceId: string, roommateName: string)
├─ Input: Device ID and roommate name
├─ Action: Append to CSV with current timestamp
└─ Return: {success: boolean, timestamp?: string}

getLastWateringTime(deviceId: string)
├─ Input: Device ID
├─ Action: Read CSV and find latest entry for device
└─ Return: ISO 8601 timestamp or null
```

## 🌐 Environment & Deployment

```
Development:
  npm run dev → http://localhost:3000

Production:
  npm run build → npm start

File Structure Preserved:
  data/watering.csv ← Created at runtime
  Never checked into git (.gitignore)
  Persists across deployments (mount volume)
```

## 🎯 Key Decision Points

| Decision        | Choice         | Reason                                                |
| --------------- | -------------- | ----------------------------------------------------- |
| ID Detection    | MAC + Fallback | MAC prevents casual access, fallback ensures coverage |
| Auth Storage    | Cookies        | Persists across sessions, HTTPS-friendly              |
| Data Storage    | CSV            | Simple, portable, auditable                           |
| Timestamp       | ISO 8601       | Standard, sortable, timezone-aware                    |
| Frontend        | React 19       | Latest, better performance                            |
| Styling         | Tailwind       | Already in dependencies                               |
| Device Fallback | Fingerprint    | Works without network access                          |
| Auto-refresh    | 60 seconds     | Balances freshness vs server load                     |

---

This architecture ensures:
✅ Simplicity - Easy to understand and modify
✅ Reliability - No external dependencies
✅ Privacy - All data stays local
✅ Scalability - Can add features without major refactoring
