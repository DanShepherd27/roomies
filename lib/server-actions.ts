"use server";

import { promises as fs } from "fs";
import path from "path";
import { appendFile } from "fs/promises";
import { databaseName, getMongoClient } from "./mongodb";
import { readAccessCodes } from "./access-codes";

interface WateringEvent {
  deviceId: string;
  accessCode: string;
  timestamp: string;
}

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_WATERING_LOG = path.join(LOCAL_DATA_DIR, "watering.csv");
const CSV_HEADER = "device_id,access_code,timestamp\n";

async function wateringCollection() {
  const client = await getMongoClient();
  const collection = client.db(databaseName).collection<WateringEvent>("watering_events");
  await collection.createIndex({ timestamp: -1 });
  return collection;
}

async function ensureLocalWateringLog() {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  try {
    await fs.access(LOCAL_WATERING_LOG);
  } catch {
    await fs.writeFile(LOCAL_WATERING_LOG, CSV_HEADER);
  }
}

async function readLocalEvents(): Promise<WateringEvent[]> {
  await ensureLocalWateringLog();
  return (await fs.readFile(LOCAL_WATERING_LOG, "utf-8"))
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("device_id"))
    .map((line) => {
      const [deviceId, quotedCode, timestamp] = line.split(",");
      return { deviceId, accessCode: quotedCode.replace(/^"|"$/g, ""), timestamp };
    });
}

export async function recordWatering(deviceId: string, accessCode: string) {
  try {
    const event: WateringEvent = {
      deviceId,
      accessCode: accessCode.toUpperCase().trim(),
      timestamp: new Date().toISOString(),
    };

    if (process.env.MONGODB_URI) {
      await (await wateringCollection()).insertOne(event);
    } else {
      await ensureLocalWateringLog();
      await appendFile(LOCAL_WATERING_LOG, `${event.deviceId},"${event.accessCode}",${event.timestamp}\n`);
    }
    return { success: true, timestamp: event.timestamp };
  } catch (error) {
    console.error("Error recording watering:", error);
    return { success: false, error: "Failed to record watering" };
  }
}

export async function getLastWateringTime(_deviceId: string): Promise<string | null> {
  try {
    if (process.env.MONGODB_URI) {
      const event = await (await wateringCollection()).findOne(
        {},
        { projection: { timestamp: 1 }, sort: { timestamp: -1 } },
      );
      return event?.timestamp || null;
    }
    return (await readLocalEvents()).at(-1)?.timestamp || null;
  } catch (error) {
    console.error("Error reading watering log:", error);
    return null;
  }
}

export async function getWateringHistory(): Promise<{ roommate_name: string; timestamp: string }[]> {
  try {
    const events = process.env.MONGODB_URI
      ? await (await wateringCollection()).find({}, { projection: { _id: 0 } }).sort({ timestamp: 1 }).toArray()
      : await readLocalEvents();
    const codeMap = new Map((await readAccessCodes()).map((entry) => [entry.code, entry.name]));
    return events.map((event) => ({
      roommate_name: codeMap.get(event.accessCode) || "Unknown User",
      timestamp: event.timestamp,
    }));
  } catch (error) {
    console.error("Error reading watering history:", error);
    return [];
  }
}
