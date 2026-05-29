// List of valid access codes for roommates
// You can change these codes as needed
export const VALID_ACCESS_CODES = ["ROOM001", "ROOM002", "ROOM003", "ROOM004"];

export function isValidAccessCode(code: string): boolean {
  return VALID_ACCESS_CODES.includes(code.toUpperCase().trim());
}

export function getDefaultNameForCode(code: string): string {
  const index = VALID_ACCESS_CODES.indexOf(code.toUpperCase().trim());
  return index !== -1 ? `Roommate ${index + 1}` : "User";
}
