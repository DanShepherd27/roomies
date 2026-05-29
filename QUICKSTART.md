# ⚡ Quick Start Guide

## 🚀 Get Running in 30 Seconds

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open Browser

```
http://localhost:3000
```

**Done!** 🎉 The app is running.

---

## 📱 First Time Setup

1. **First Visit**: Browser will attempt MAC address detection (~1 second)
2. **If MAC Detected** (some systems):
   - You'll see: "What's your name?"
   - Enter your name
   - Click "Continue"
3. **If MAC Not Detected** (most systems):
   - You'll see: "Enter Access Code"
   - Codes available: `ROOM001`, `ROOM002`, `ROOM003`, `ROOM004`
   - Enter your code
   - Then enter your name
   - Click "Continue"

4. **You're In!**
   - See the big green button with plant emoji
   - Counter shows "Never" (first time)
   - Tap button to water plants!

---

## 🌿 Using the App

### Watering Plants

1. Tap the big **🪴** button
2. Wait for confirmation
3. Counter updates to **"0 days ago"**
4. Data saved to CSV

### Counter Updates

- Auto-refreshes every 60 seconds
- Shows: "X days/hours/minutes ago"
- Last watering timestamp displayed at bottom

### Logout

- Click **"Logout"** button (top-right)
- Browser cookies cleared
- Next visit requires authentication again

---

## 🔑 Access Codes

| Code      | Person     |
| --------- | ---------- |
| `ROOM001` | Roommate 1 |
| `ROOM002` | Roommate 2 |
| `ROOM003` | Roommate 3 |
| `ROOM004` | Roommate 4 |

**Share with roommates!**

---

## 📊 View Watering History

Open `data/watering.csv` (in project folder):

```csv
device_id,roommate_name,timestamp
a1:b2:c3:d4:e5:f6,"Alice",2026-05-28T14:30:00.000Z
device_abc123,"Bob",2026-05-28T15:45:00.000Z
```

**Import into Excel/Google Sheets for charts!**

---

## ⚙️ Customize (Optional)

### Change Access Codes

Edit `lib/access-codes.ts`:

```typescript
export const VALID_ACCESS_CODES = ["ALICE_CODE", "BOB_CODE", "YOUR_CODES_HERE"];
```

Restart server: `npm run dev`

### Change App Title

Edit `app/layout.tsx`:

```typescript
title: "Your App Name",
```

### Change Colors

Edit components to change green to your color:

- `from-green-50 to-emerald-50` (background)
- `bg-green-600` (button)

---

## 📁 Important Files

- `data/watering.csv` - Your watering log
- `lib/access-codes.ts` - Edit codes here
- `app/layout.tsx` - Edit app title here
- `.gitignore` - Keeps data folder out of git

---

## 🐛 Common Issues

### "Invalid access code"

- Check code is spelled correctly
- Codes are: ROOM001, ROOM002, ROOM003, ROOM004
- Edit `lib/access-codes.ts` to change

### App keeps asking for login

- Browser cookies disabled → Enable them
- Private/incognito mode → Use normal mode
- Clear browser cookies → Try again

### CSV file not found

- Click button once to create it
- Should appear in `data/watering.csv`
- Check your project root

### Button not responding

- Refresh the page
- Check if dev server still running
- Look at browser console (F12) for errors

---

## 🎓 Next Steps

1. **Deploy** (optional)
   - `npm run build`
   - `npm start`
   - Or use Vercel

2. **Customize Codes**
   - Edit `lib/access-codes.ts`
   - Share codes with roommates

3. **Share with Roommates**
   - Give them the app URL
   - Tell them their access code
   - They'll set up their name on first visit

4. **Track History**
   - Open `data/watering.csv`
   - Import into spreadsheet
   - Create charts and reports

---

## 📚 Full Documentation

- **README.md** - Full features & docs
- **SETUP.md** - Detailed setup
- **ACCESS_CODES.md** - Code management
- **ARCHITECTURE.md** - How it works
- **IMPLEMENTATION.md** - Technical details

---

## ✅ Checklist

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] Test with access code
- [ ] Enter your name
- [ ] Tap watering button
- [ ] Check `data/watering.csv`
- [ ] Share app with roommates
- [ ] Share your access code

---

## 🚀 You're All Set!

Your plant watering tracker is **ready to use**.

Enjoy tracking! 🌿
