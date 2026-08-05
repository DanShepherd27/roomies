"use server";

import { promises as fs } from "fs";
import path from "path";
import { databaseName, getMongoClient } from "./mongodb";

export interface CodeEntry {
  code: string;
  name: string;
  createdAt: string;
  isAdmin?: boolean;
}

const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_CODES_FILE = path.join(LOCAL_DATA_DIR, "access_codes.json");

function defaultCodeEntry(): CodeEntry {
  const defaultCode = process.env.DEFAULT_ACCESS_CODE || "ROOMMATE01";
  return {
    code: defaultCode.toUpperCase(),
    name: process.env.DEFAULT_ACCESS_CODE ? "Admin" : "Roommate 1",
    createdAt: new Date().toISOString(),
    isAdmin: true,
  };
}

async function codesCollection() {
  const client = await getMongoClient();
  const collection = client.db(databaseName).collection<CodeEntry>("access_codes");
  await collection.createIndex({ code: 1 }, { unique: true });
  return collection;
}

async function ensureLocalCodesFile() {
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  try {
    await fs.access(LOCAL_CODES_FILE);
  } catch {
    await fs.writeFile(LOCAL_CODES_FILE, JSON.stringify([defaultCodeEntry()], null, 2));
  }
}

export async function ensureCodesFile(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    await ensureLocalCodesFile();
    return;
  }

  const collection = await codesCollection();
  const entry = defaultCodeEntry();
  await collection.updateOne(
    { code: entry.code },
    { $setOnInsert: entry },
    { upsert: true },
  );
}

export async function readAccessCodes(): Promise<CodeEntry[]> {
  try {
    await ensureCodesFile();
    if (!process.env.MONGODB_URI) {
      return JSON.parse(await fs.readFile(LOCAL_CODES_FILE, "utf-8"));
    }

    return (await codesCollection())
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();
  } catch (err) {
    console.error("Error reading access codes:", err);
    return [defaultCodeEntry()];
  }
}

export async function writeAccessCodes(codes: CodeEntry[]): Promise<void> {
  if (!process.env.MONGODB_URI) {
    await ensureLocalCodesFile();
    await fs.writeFile(LOCAL_CODES_FILE, JSON.stringify(codes, null, 2));
    return;
  }

  const collection = await codesCollection();
  await collection.deleteMany({});
  if (codes.length > 0) await collection.insertMany(codes);
}

export async function isValidAccessCode(code: string): Promise<boolean> {
  const codes = await readAccessCodes();
  return codes.some((entry) => entry.code === code.toUpperCase().trim());
}

export async function isMasterKey(code: string): Promise<boolean> {
  const codes = await readAccessCodes();
  return codes.find((entry) => entry.code === code.toUpperCase().trim())?.isAdmin === true;
}

export async function getDefaultNameForCode(code: string): Promise<string> {
  const codes = await readAccessCodes();
  return codes.find((entry) => entry.code === code.toUpperCase().trim())?.name || "User";
}

export async function getAdminStatus(code: string): Promise<boolean> {
  return isMasterKey(code);
}
