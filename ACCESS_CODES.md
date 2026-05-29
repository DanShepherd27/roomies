# Access Code Management

## Overview
Access codes are the primary way roommates authenticate with the app. They are stored securely in a private **Vercel Blob** (`access_codes.json`).

## Managing Codes via Admin Panel
The easiest way to manage codes is through the built-in **Admin Panel** at `/admin`. 

### Features:
- **Add New Codes**: Create unique codes for new roommates.
- **Set Admin Status**: Designate which roommates can access the Admin Panel.
- **Edit Names**: Change the display name associated with a code.
- **Delete Codes**: Remove codes for roommates who have moved out.

## Initial Setup
On the first run (local or production), the app will initialize the access codes list:
1. It checks for the `DEFAULT_ACCESS_CODE` environment variable.
2. If found, it creates a master admin account with that code.
3. If not found, it defaults to `ROOMMATE01` as the master admin.

## Vercel Blob Persistence
Unlike local development, where codes are in `data/access_codes.json`, production codes are stored in **Vercel Blob**.
- **Real-time Updates**: Changes made in the Admin Panel are saved instantly to the blob.
- **Cache-Busting**: The app uses `useCache: false` and `cache: 'no-store'` to ensure all devices see code changes immediately.
- **Security**: The blob is set to `private`, meaning codes cannot be leaked via a public URL.

## Best Practices
- ✅ **Keep the Master Code Secure**: Use a strong `DEFAULT_ACCESS_CODE`.
- ✅ **Rotate Codes**: If a roommate moves out, delete their code and update others if necessary.
- ✅ **One Admin is Enough**: Only grant admin privileges to those who need to manage the app.

## Troubleshooting
- **"Invalid access code"**: Ensure the code is entered exactly (it is case-insensitive and whitespace-trimmed).
- **Admin Panel inaccessible**: Ensure your current code has `isAdmin: true` set in the Admin Panel or was the `DEFAULT_ACCESS_CODE`.
- **Changes not saving**: Check Vercel logs for any Blob storage errors (e.g., token issues).
