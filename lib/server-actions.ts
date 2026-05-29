"use server";

import { promises as fs } from "fs";
import path from "path";
import { appendFile } from "fs/promises";

const WATERING_LOG_FILE = path.join(process.cwd(), "data", "watering.csv");

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize CSV file if it doesn't exist
async function ensureCSVHeader() {
  try {
    await fs.access(WATERING_LOG_FILE);
  } catch {
    await ensureDataDir();
    await appendFile(WATERING_LOG_FILE, "device_id,roommate_name,timestamp\n");
  }
}

export async function recordWatering(deviceId: string, roommateName: string) {
  try {
    await ensureCSVHeader();
    const timestamp = new Date().toISOString();
    const csvLine = `${deviceId},"${roommateName}",${timestamp}\n`;
    await appendFile(WATERING_LOG_FILE, csvLine);
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
    const content = await fs.readFile(WATERING_LOG_FILE, "utf-8");
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
