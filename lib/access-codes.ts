"use server";

import { put, list, get } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_CODES_FILE = path.join(LOCAL_DATA_DIR, "access_codes.json");
const BLOB_FILENAME = "access_codes.json";

/**
 * Gets the URL of the access_codes.json blob if it exists.
 */
async function getBlobUrl(): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    const blob = blobs.find((b) => b.pathname === BLOB_FILENAME);
    return blob ? blob.url : null;
  } catch (err) {
    console.error("Error listing blobs:", err);
    return null;
  }
}

/**
 * Helper to fetch private blob content using the SDK's get() method.
 */
async function fetchBlobContent(url: string) {
  try {
    const blobResponse = await get(url, {
      access: "private",
      // The SDK reads BLOB_READ_WRITE_TOKEN from env automatically
    });
    return new Response(blobResponse?.stream);
  } catch (err) {
    console.error("Error fetching private blob with SDK:", err);
    throw err;
  }
}

export async function ensureCodesFile(): Promise<void> {
  if (IS_VERCEL) {
    const url = await getBlobUrl();
    if (!url) {
      console.log("Initializing access codes in Vercel Blob (private)");
      const defaultCode = process.env.DEFAULT_ACCESS_CODE || "ROOMMATE01";
      const defaultData: CodeEntry[] = [
        {
          code: defaultCode.toUpperCase(),
          name: process.env.DEFAULT_ACCESS_CODE ? "Admin" : "Roommate 1",
          createdAt: new Date().toISOString(),
          isAdmin: true,
        },
      ];
      await put(BLOB_FILENAME, JSON.stringify(defaultData, null, 2), {
        access: "private",
        addRandomSuffix: false,
      });
    }
    return;
  }

  // Local development
  try {
    await fs.access(LOCAL_DATA_DIR);
  } catch {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(LOCAL_CODES_FILE);
  } catch {
    const defaultCode = process.env.DEFAULT_ACCESS_CODE || "ROOMMATE01";
    const defaultData: CodeEntry[] = [
      {
        code: defaultCode.toUpperCase(),
        name: process.env.DEFAULT_ACCESS_CODE ? "Admin" : "Roommate 1",
        createdAt: new Date().toISOString(),
        isAdmin: true,
      },
    ];
    await fs.writeFile(LOCAL_CODES_FILE, JSON.stringify(defaultData, null, 2));
  }
}

export async function readAccessCodes(): Promise<CodeEntry[]> {
  try {
    if (IS_VERCEL) {
      const url = await getBlobUrl();
      if (url) {
        const response = await fetchBlobContent(url);
        if (response.ok) {
          return await response.json();
        }
      }
      // If not found in blob, try to initialize
      await ensureCodesFile();
      const newUrl = await getBlobUrl();
      if (newUrl) {
        const response = await fetchBlobContent(newUrl);
        if (response.ok) {
          return await response.json();
        }
      }
    } else {
      await ensureCodesFile();
      const content = await fs.readFile(LOCAL_CODES_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading access codes:", err);
  }

  // Final fallback
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

export async function writeAccessCodes(codes: CodeEntry[]): Promise<void> {
  try {
    if (IS_VERCEL) {
      await put(BLOB_FILENAME, JSON.stringify(codes, null, 2), {
        access: "private",
        addRandomSuffix: false,
      });
    } else {
      await ensureCodesFile();
      await fs.writeFile(LOCAL_CODES_FILE, JSON.stringify(codes, null, 2));
    }
  } catch (err) {
    console.error("Error writing access codes:", err);
    throw err;
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
