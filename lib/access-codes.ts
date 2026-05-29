"use server";

import { promises as fs } from "fs";
import path from "path";

interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

const CODES_FILE = path.join(process.cwd(), "data", "access_codes.json");

async function readAccessCodes(): Promise<CodeEntry[]> {
  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    return JSON.parse(content) as CodeEntry[];
  } catch {
    // If file doesn't exist, return default codes
    return [
      {
        code: "ROOMMATE01",
        name: "Roommate 1",
        createdAt: new Date().toISOString(),
        isAdmin: false,
      },
    ];
  }
}

export async function isValidAccessCode(code: string): Promise<boolean> {
  const codes = await readAccessCodes();
  const upperCode = code.toUpperCase().trim();
  return codes.some((c) => c.code === upperCode);
}

export async function isMasterKey(code: string): Promise<boolean> {
  const codes = await readAccessCodes();
  const upperCode = code.toUpperCase().trim();
  const codeEntry = codes.find((c) => c.code === upperCode);
  return codeEntry?.isAdmin === true;
}

export async function getDefaultNameForCode(code: string): Promise<string> {
  const codes = await readAccessCodes();
  const upperCode = code.toUpperCase().trim();
  const codeEntry = codes.find((c) => c.code === upperCode);
  return codeEntry?.name || "User";
}
