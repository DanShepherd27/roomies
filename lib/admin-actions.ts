"use server";

import { promises as fs } from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "access_codes.json");

interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

// Ensure codes file exists with default data
async function ensureCodesFile() {
  try {
    await fs.access(CODES_FILE);
  } catch {
    // File doesn't exist, create it with default code
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    const defaultData: CodeEntry[] = [
      {
        code: "ROOMMATE01",
        name: "Roommate 1",
        createdAt: new Date().toISOString(),
        isAdmin: false,
      },
    ];

    await fs.writeFile(CODES_FILE, JSON.stringify(defaultData, null, 2));
  }
}

export async function getAllAccessCodes(): Promise<CodeEntry[]> {
  await ensureCodesFile();
  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [
      {
        code: "ROOMMATE01",
        name: "Roommate 1",
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

export async function addAccessCode(
  code: string,
  name: string,
  isAdmin?: boolean,
): Promise<{ success: boolean; error?: string }> {
  await ensureCodesFile();

  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    const codes: CodeEntry[] = JSON.parse(content);

    // Check if code already exists
    if (codes.some((c) => c.code === code.toUpperCase())) {
      return { success: false, error: "Code already exists" };
    }

    // Add new code
    codes.push({
      code: code.toUpperCase(),
      name: name.trim() || "Unnamed Roommate",
      createdAt: new Date().toISOString(),
      isAdmin: isAdmin || false,
    });

    await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add code" };
  }
}

export async function deleteAccessCode(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  await ensureCodesFile();

  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    let codes: CodeEntry[] = JSON.parse(content);

    const codeToDelete = codes.find((c) => c.code === code.toUpperCase());
    if (!codeToDelete) {
      return { success: false, error: "Code not found" };
    }

    // Check if this is an admin code
    if (codeToDelete.isAdmin) {
      // Count remaining admin codes if we delete this one
      const adminCount = codes.filter((c) => c.isAdmin).length;
      if (adminCount <= 1) {
        return {
          success: false,
          error:
            "Cannot delete the last admin code. At least one admin must exist.",
        };
      }
    }

    codes = codes.filter((c) => c.code !== code.toUpperCase());
    await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete code" };
  }
}

export async function updateAccessCodeName(
  code: string,
  newName: string,
): Promise<{ success: boolean; error?: string }> {
  await ensureCodesFile();

  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    const codes: CodeEntry[] = JSON.parse(content);

    const codeEntry = codes.find((c) => c.code === code.toUpperCase());
    if (!codeEntry) {
      return { success: false, error: "Code not found" };
    }

    codeEntry.name = newName.trim() || "Unnamed Roommate";
    await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update code" };
  }
}

export async function toggleAccessCodeAdmin(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  await ensureCodesFile();

  try {
    const content = await fs.readFile(CODES_FILE, "utf-8");
    const codes: CodeEntry[] = JSON.parse(content);

    const codeEntry = codes.find((c) => c.code === code.toUpperCase());
    if (!codeEntry) {
      return { success: false, error: "Code not found" };
    }

    codeEntry.isAdmin = !codeEntry.isAdmin;
    await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2));
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle admin status" };
  }
}
