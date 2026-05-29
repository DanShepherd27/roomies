"use server";

import { readAccessCodes, writeAccessCodes, CodeEntry } from "./access-codes";

export async function getAllAccessCodes(): Promise<CodeEntry[]> {
  return await readAccessCodes();
}

export async function addAccessCode(
  code: string,
  name: string,
  isAdmin?: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const codes = await readAccessCodes();

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

    await writeAccessCodes(codes);
    return { success: true };
  } catch (err) {
    console.error("Failed to add code:", err);
    return { success: false, error: "Failed to add code" };
  }
}

export async function deleteAccessCode(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    let codes = await readAccessCodes();

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
    await writeAccessCodes(codes);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete code:", err);
    return { success: false, error: "Failed to delete code" };
  }
}

export async function updateAccessCodeName(
  code: string,
  newName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const codes = await readAccessCodes();

    const codeEntry = codes.find((c) => c.code === code.toUpperCase());
    if (!codeEntry) {
      return { success: false, error: "Code not found" };
    }

    codeEntry.name = newName.trim() || "Unnamed Roommate";
    await writeAccessCodes(codes);
    return { success: true };
  } catch (err) {
    console.error("Failed to update code:", err);
    return { success: false, error: "Failed to update code" };
  }
}

export async function toggleAccessCodeAdmin(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const codes = await readAccessCodes();

    const codeEntry = codes.find((c) => c.code === code.toUpperCase());
    if (!codeEntry) {
      return { success: false, error: "Code not found" };
    }

    codeEntry.isAdmin = !codeEntry.isAdmin;
    await writeAccessCodes(codes);
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle admin status:", err);
    return { success: false, error: "Failed to toggle admin status" };
  }
}
