"use server";

import { promises as fs } from "fs";
import path from "path";

export interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

const CODES_FILE = path.join(process.cwd(), "data", "access_codes.json");

export async function ensureCodesFile(): Promise<void> {
  const dataDir = path.join(process.cwd(), "data");
  
  try {
    await fs.access(dataDir);
  } catch {
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create data directory:", err);
    }
  }

  try {
    await fs.access(CODES_FILE);
  } catch {
    // File doesn't exist, create it with default code from env or fallback
    const defaultCode = process.env.DEFAULT_ACCESS_CODE || "ROOMMATE01";
    const defaultData: CodeEntry[] = [
      {
        code: defaultCode.toUpperCase(),
        name: process.env.DEFAULT_ACCESS_CODE ? "Admin" : "Roommate 1",
        createdAt: new Date().toISOString(),
        isAdmin: true, // Make it admin so the admin panel is accessible on first run
      },
    ];

    try {
      await fs.writeFile(CODES_FILE, JSON.stringify(defaultData, null, 2));
    } catch (err) {
      console.error("Failed to initialize access_codes.json:", err);
    }
  }
}

export async function readAccessCodes(): Promise<CodeEntry[]> {
  await ensureCodesFile();
  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    return JSON.parse(content) as CodeEntry[];
  } catch {
    // Fallback if reading fails even after ensure
    const defaultCode = process.env.DEFAULT_ACCESS_CODE || "ROOMMATE01";
    return [
      {
        code: defaultCode.toUpperCase(),
        name: process.env.DEFAULT_ACCESS_CODE ? "Admin" : "Roommate 1",
        createdAt: new Date().toISOString(),
        isAdmin: true,
      },
    ];
  }
}

export async function writeAccessCodes(codes: CodeEntry[]): Promise<void> {
  await ensureCodesFile();
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2));
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
