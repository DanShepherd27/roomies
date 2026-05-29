"use server";

import { put, list, get } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { appendFile } from "fs/promises";

const IS_VERCEL = !!process.env.VERCEL;
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_WATERING_LOG = path.join(LOCAL_DATA_DIR, "watering.csv");
const BLOB_FILENAME = "watering.csv";
const CSV_HEADER = "device_id,roommate_name,timestamp\n";

/**
 * Gets the URL of the watering.csv blob if it exists.
 */
async function getBlobUrl(): Promise<string | null> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME });
    const blob = blobs.find(b => b.pathname === BLOB_FILENAME);
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
    const { stream } = await get(url, { 
      access: 'private',
    });
    return new Response(stream);
  } catch (err) {
    console.error("Error fetching private blob with SDK:", err);
    throw err;
  }
}

// Ensure data directory exists (for local)
async function ensureDataDir() {
  if (IS_VERCEL) return;
  try {
    await fs.access(LOCAL_DATA_DIR);
  } catch {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  }
}

// Initialize CSV file if it doesn't exist
async function ensureCSVHeader() {
  if (IS_VERCEL) {
    const url = await getBlobUrl();
    if (!url) {
      console.log("Initializing watering.csv in Vercel Blob (private)");
      await put(BLOB_FILENAME, CSV_HEADER, {
        access: "private",
        addRandomSuffix: false,
      });
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

    if (IS_VERCEL) {
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

      await put(BLOB_FILENAME, newContent, {
        access: "private",
        addRandomSuffix: false,
      });
    } else {
      await appendFile(LOCAL_WATERING_LOG, csvLine);
    }
    
    return { success: true, timestamp };
  } catch (error) {
    console.error("Error recording watering:", error);
    return { success: false, error: "Failed to record watering" };
  }
}

export async function getLastWateringTime(
  deviceId: string,
): Promise<string | null> {
  try {
    await ensureCSVHeader();
    let content = "";

    if (IS_VERCEL) {
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

    // Find the last watering for this device
    let lastTimestamp: string | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const parts = lines[i].split(",");
      if (parts[0] === deviceId) {
        lastTimestamp = parts[2];
        break;
      }
    }

    return lastTimestamp;
  } catch (error) {
    console.error("Error reading watering log:", error);
    return null;
  }
}
