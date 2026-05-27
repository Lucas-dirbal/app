import { NextRequest, NextResponse } from "next/server";
import {
  appendNotification,
  clearNotifications,
  readNotifications,
  type IncomingNotification,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const notifications = await readNotifications();
  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const notification = normalizeNotification(body);
  if (!notification.packageName) {
    return NextResponse.json({ error: "packageName is required" }, { status: 400 });
  }

  const saved = await appendNotification(notification);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearNotifications();
  return NextResponse.json({ ok: true });
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.NOTIFICATION_API_TOKEN;
  if (!expected) {
    return true;
  }

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${expected}`;
}

function normalizeNotification(value: unknown): IncomingNotification {
  const input = isObject(value) ? value : {};

  return {
    packageName: toText(input.packageName),
    appName: toText(input.appName),
    title: toText(input.title),
    text: toText(input.text),
    bigText: toText(input.bigText),
    postedAt: toNumber(input.postedAt),
    notificationId: toOptionalNumber(input.notificationId),
    key: toText(input.key),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown) {
  return typeof value === "string" ? value.slice(0, 2000) : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Date.now();
}

function toOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
