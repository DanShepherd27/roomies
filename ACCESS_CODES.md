# Access Code Management

## Overview

Access codes are the primary way roommates authenticate with the app. In production, they are stored in the `access_codes` collection in **MongoDB Atlas**.

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

## MongoDB Atlas Configuration

Set these environment variables in your deployment environment (for example, Vercel):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string, including the database-user password. |
| `MONGODB_DB` | Optional database name; defaults to `roomies`. |
| `DEFAULT_ACCESS_CODE` | Creates the initial admin code if it does not already exist. |

When `MONGODB_URI` is present, the app creates a unique index on the `code` field and initializes the default admin code with an upsert. Changes made in the Admin Panel are written directly to Atlas and are available to subsequent requests immediately.

For local development without `MONGODB_URI`, the app falls back to `data/access_codes.json`.

Keep `MONGODB_URI` server-only: do not give it a `NEXT_PUBLIC_` prefix, and grant its Atlas database user only the permissions needed for the selected database.

## Best Practices

- ✅ **Keep the Master Code Secure**: Use a strong `DEFAULT_ACCESS_CODE`.
- ✅ **Rotate Codes**: If a roommate moves out, delete their code and update others if necessary.
- ✅ **One Admin is Enough**: Only grant admin privileges to those who need to manage the app.

## Troubleshooting

- **"Invalid access code"**: Ensure the code is entered exactly (it is case-insensitive and whitespace-trimmed).
- **Admin Panel inaccessible**: Ensure your current code has `isAdmin: true` set in the Admin Panel or was the `DEFAULT_ACCESS_CODE`.
- **Changes not saving**: Confirm `MONGODB_URI` is set, the Atlas database user can read and write the configured database, and the deployment environment can reach the Atlas cluster.
