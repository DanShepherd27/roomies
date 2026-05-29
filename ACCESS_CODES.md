# Access Code Management

## Current Access Codes

The following access codes are currently configured in `lib/access-codes.ts`:

| Code    | Roommate | Default Name |
| ------- | -------- | ------------ |
| ROOM001 | 1        | Roommate 1   |
| ROOM002 | 2        | Roommate 2   |
| ROOM003 | 3        | Roommate 3   |
| ROOM004 | 4        | Roommate 4   |

## How to Add/Change Access Codes

### 1. Edit the Configuration File

Open `lib/access-codes.ts` and modify the `VALID_ACCESS_CODES` array:

```typescript
export const VALID_ACCESS_CODES = [
  "ROOM001", // Alice's code
  "ROOM002", // Bob's code
  "ROOM003", // Charlie's code
  "MYROOMCODE", // Add new codes
];
```

### 2. Update the Helper Function (Optional)

The `getDefaultNameForCode()` function returns default names based on position. If you want custom default names, you can modify this:

```typescript
export function getDefaultNameForCode(code: string): string {
  const codeMap: Record<string, string> = {
    ROOM001: "Alice",
    ROOM002: "Bob",
    ROOM003: "Charlie",
    MYROOMCODE: "Diana",
  };
  return codeMap[code.toUpperCase().trim()] || "User";
}
```

### 3. Restart the Server

After making changes, restart the development server:

```bash
npm run dev
```

## Best Practices for Access Codes

✅ **DO:**

- Use codes that are easy to remember but hard to guess
- Mix letters and numbers for better security
- Keep codes between 6-12 characters
- Store codes securely when sharing with roommates
- Update codes if a roommate moves out

❌ **DON'T:**

- Use obvious codes like '123456' or 'PASSWORD'
- Share codes publicly or in unsecured messages
- Reuse codes across different apps
- Forget to update when roommates change

## Sharing Access Codes with Roommates

1. **In Person**: Tell each roommate their code verbally
2. **Secure Message**: Use encrypted messaging apps
3. **Post-it Note**: Write codes and stick to a shared fridge/bulletin board
4. **Email**: Send codes in a separate email from the app setup instructions

## Example Setup for 4 Roommates

```typescript
export const VALID_ACCESS_CODES = [
  "ALICE2026", // Alice
  "BOB2026", // Bob
  "CHARLIE2026", // Charlie
  "DIANA2026", // Diana
];

export function getDefaultNameForCode(code: string): string {
  const codeMap: Record<string, string> = {
    ALICE2026: "Alice",
    BOB2026: "Bob",
    CHARLIE2026: "Charlie",
    DIANA2026: "Diana",
  };
  return codeMap[code.toUpperCase().trim()] || "Roommate";
}
```

## Troubleshooting Access Codes

### "Invalid access code" Error

- Check that the code matches exactly (case-insensitive, but must match the configured values)
- Verify the code is in the `VALID_ACCESS_CODES` array
- Ensure no typos or extra spaces

### Forgot Your Code

- Check the `lib/access-codes.ts` file for the list
- Ask another roommate (they have access to the code list)
- Change the code in the config file and restart the server

### Want to Change Your Code

- Edit the code in `lib/access-codes.ts`
- Restart the server
- Clear your browser cookies or click logout to re-authenticate
- Log back in with your new code

## Rotating Codes

To regularly update codes (recommended every 6 months):

1. Plan new codes
2. Update `lib/access-codes.ts`
3. Restart the server
4. Notify all roommates of the change
5. Old cookies will persist until logout, so changing codes won't immediately log out users

## Security Considerations

- Access codes provide device identification, not encryption
- All watering data is stored in plaintext CSV
- Codes prevent casual access but aren't cryptographically secure
- For production use, consider adding:
  - Password hashing
  - Rate limiting on failed attempts
  - Audit logs of authentication events
  - Two-factor authentication

## Code Validation Rules

Current validation rules:

- Codes are case-insensitive (ROOM001 = room001)
- Whitespace is trimmed automatically
- Must be exactly in the `VALID_ACCESS_CODES` array
- No special characters required (but allowed)

Example valid codes:

- `ROOM001` ✅
- `room001` ✅ (converted to uppercase)
- `ROOM001` ✅ (whitespace trimmed)
- `room 001` ❌ (extra spaces not trimmed from middle)
- `INVALID` ❌ (not in the array)
