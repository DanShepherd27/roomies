"use server";

import { put, list, get } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { appendFile } from "fs/promises";

// Use Blob if token is present, otherwise fallback to local filesystem
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_WATERING_LOG = path.join(LOCAL_DATA_DIR, "watering.csv");
const BLOB_FILENAME = "watering.csv";
const CSV_HEADER = "device_id,roommate_name,timestamp\n";

/**
 * Gets the URL of the watering.csv blob if it exists.
 */
async function getBlobUrl(): Promise<string | null> {
  try {
    const { blobs } = await list({
      prefix: BLOB_FILENAME,
    });
    // Find exact match to avoid random suffix issues
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
      useCache: false,
    });
    const response = new Response(blobResponse?.stream);
    if (!response.ok) {
      console.error(
        `Blob fetch failed with status ${response.status}: ${response.statusText}`,
      );
    }
    return response;
  } catch (err) {
    console.error("Error fetching private blob with SDK:", err);
    throw err;
  }
}

// Ensure data directory exists (for local)
async function ensureDataDir() {
  if (USE_BLOB) return;
  try {
    await fs.access(LOCAL_DATA_DIR);
  } catch {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  }
}

// Initialize CSV file if it doesn't exist
async function ensureCSVHeader() {
  if (USE_BLOB) {
    const url = await getBlobUrl();
    if (!url) {
      console.log("Initializing watering.csv in Vercel Blob (private)");
      await put(BLOB_FILENAME, CSV_HEADER, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log("Watering log initialized in Blob.");
    }
    return;
  }

  try {
    await fs.access(LOCAL_WATERING_LOG);
  } catch {
    await ensureDataDir();
    await fs.writeFile(LOCAL_WATERING_LOG, CSV_HEADER);
  }
}

export async function recordWatering(deviceId: string, roommateName: string) {
  try {
    await ensureCSVHeader();
    const timestamp = new Date().toISOString();
    const csvLine = `${deviceId},"${roommateName}",${timestamp}\n`;

    if (USE_BLOB) {
      console.log("Recording watering to Vercel Blob...");
      const url = await getBlobUrl();
      let currentContent = CSV_HEADER;
      if (url) {
        const response = await fetchBlobContent(url);
        if (response.ok) {
          currentContent = await response.text();
        }
      }

      const newContent = currentContent.endsWith("\n")
        ? currentContent + csvLine
        : currentContent + "\n" + csvLine;

      // Use allowOverwrite: true to replace the existing blob
      await put(BLOB_FILENAME, newContent, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      console.log("Watering recorded successfully to Blob.");
    } else {
      await appendFile(LOCAL_WATERING_LOG, csvLine);
    }

    return { success: true, timestamp };
  } catch (error) {
    console.error("Error recording watering:", error);
    return { success: false, error: "Failed to record watering" };
  }
}

/**
 * Returns the most recent watering timestamp from ANY device.
 * This ensures the counter is synced across all roommates.
 */
export async function getLastWateringTime(
  _deviceId: string, // Kept for signature compatibility but ignored for global sync
): Promise<string | null> {
  try {
    await ensureCSVHeader();
    let content = "";

    if (USE_BLOB) {
      const url = await getBlobUrl();
      if (url) {
        const response = await fetchBlobContent(url);
        if (response.ok) {
          content = await response.text();
        }
      }
    } else {
      content = await fs.readFile(LOCAL_WATERING_LOG, "utf-8");
    }

    if (!content) return null;

    const lines = content
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("device_id"));

    // If there are no log lines, return null
    if (lines.length === 0) return null;

    // The last line in the CSV is the most recent watering event
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.split(",");

    // According to CSV schema: device_id,roommate_name,timestamp
    // Timestamp is at index 2
    return parts[2] || null;
  } catch (error) {
    console.error("Error reading watering log:", error);
    return null;
  }
}
