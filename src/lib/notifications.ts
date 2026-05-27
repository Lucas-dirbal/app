import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { list, put } from "@vercel/blob";

export type NotificationRecord = {
  id: string;
  packageName: string;
  appName: string;
  title: string;
  text: string;
  bigText: string;
  postedAt: number;
  receivedAt: string;
  notificationId?: number;
  key?: string;
};

export type IncomingNotification = Omit<NotificationRecord, "id" | "receivedAt">;

const BLOB_FILE = "notifications.json";
const LOCAL_FILE = join(process.cwd(), ".data", BLOB_FILE);
const MAX_RECORDS = 500;

export async function readNotifications(): Promise<NotificationRecord[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return readLocalNotifications();
  }

  const { blobs } = await list({ prefix: BLOB_FILE, limit: 1 });
  const blob = blobs.find((item) => item.pathname === BLOB_FILE);
  if (!blob) {
    return [];
  }

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function appendNotification(input: IncomingNotification) {
  const current = await readNotifications();
  const next: NotificationRecord = {
    ...input,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  };

  const notifications = [next, ...current].slice(0, MAX_RECORDS);
  await writeNotifications(notifications);
  return next;
}

export async function clearNotifications() {
  await writeNotifications([]);
}

async function writeNotifications(notifications: NotificationRecord[]) {
  const body = JSON.stringify(notifications, null, 2);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    await mkdir(dirname(LOCAL_FILE), { recursive: true });
    await writeFile(LOCAL_FILE, body, "utf8");
    return;
  }

  await put(BLOB_FILE, body, {
    access: "public",
    allowOverwrite: true,
  });
}

async function readLocalNotifications() {
  try {
    const content = await readFile(LOCAL_FILE, "utf8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
