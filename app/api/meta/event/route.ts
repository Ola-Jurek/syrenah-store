import { NextResponse } from "next/server";
import {
  sendMetaServerEvent,
  type MetaCustomData,
  type MetaContent,
} from "@/lib/meta-capi";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
]);

function isAllowedRequest(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  let appOrigin = "";
  if (appUrl) {
    try {
      appOrigin = new URL(appUrl).origin;
    } catch {
      appOrigin = "";
    }
  }

  return [origin, referer].some((value) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return true;
      }
      return Boolean(appOrigin) && url.origin === appOrigin;
    } catch {
      return false;
    }
  });
}

function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function sanitizeCustomData(input: unknown): MetaCustomData | undefined {
  if (!input || typeof input !== "object") return undefined;
  const src = input as Record<string, unknown>;
  const out: MetaCustomData = {};

  const currency = clip(src.currency, 3);
  if (currency) out.currency = currency.toUpperCase();

  if (typeof src.value === "number" && Number.isFinite(src.value) && src.value >= 0 && src.value < 1_000_000) {
    out.value = Math.round(src.value * 100) / 100;
  }

  const contentName = clip(src.content_name, 200);
  if (contentName) out.content_name = contentName;
  const contentCategory = clip(src.content_category, 100);
  if (contentCategory) out.content_category = contentCategory;
  const contentType = clip(src.content_type, 40);
  if (contentType) out.content_type = contentType;

  if (typeof src.num_items === "number" && Number.isFinite(src.num_items)) {
    out.num_items = Math.max(0, Math.min(999, Math.round(src.num_items)));
  }

  if (Array.isArray(src.content_ids)) {
    const ids = src.content_ids
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .slice(0, 40)
      .map((id) => id.slice(0, 80));
    if (ids.length > 0) out.content_ids = ids;
  }

  if (Array.isArray(src.contents)) {
    const contents: MetaContent[] = [];
    for (const item of src.contents.slice(0, 40)) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = clip(row.id, 80);
      if (!id) continue;
      const quantity =
        typeof row.quantity === "number" && Number.isFinite(row.quantity)
          ? Math.max(1, Math.min(99, Math.round(row.quantity)))
          : 1;
      const content: MetaContent = { id, quantity };
      if (
        typeof row.item_price === "number" &&
        Number.isFinite(row.item_price) &&
        row.item_price >= 0
      ) {
        content.item_price = Math.round(row.item_price * 100) / 100;
      }
      contents.push(content);
    }
    if (contents.length > 0) out.contents = contents;
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function sourceUrl(raw: unknown): string {
  const fallback = process.env.NEXT_PUBLIC_APP_URL || "https://syrenahthelabel.com";
  if (typeof raw !== "string") return fallback;
  try {
    const url = new URL(raw);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const appOrigin = appUrl ? new URL(appUrl).origin : "";
    const local =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (local || (appOrigin && url.origin === appOrigin)) {
      return url.toString().slice(0, 500);
    }
  } catch {
    /* zostaw adres sklepu */
  }
  return fallback;
}

export async function POST(req: Request) {
  if (!isAllowedRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    eventName?: string;
    eventId?: string;
    customData?: unknown;
    eventSourceUrl?: string;
    fbp?: string;
    fbc?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.eventName || !ALLOWED_EVENTS.has(body.eventName)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }
  if (!body.eventId || !/^[A-Za-z0-9_-]{8,80}$/.test(body.eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const result = await sendMetaServerEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: sourceUrl(body.eventSourceUrl),
    customData: sanitizeCustomData(body.customData),
    userData: {
      fbp: clip(body.fbp, 200) ?? null,
      fbc: clip(body.fbc, 480) ?? null,
      clientIp:
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip"),
      clientUserAgent: req.headers.get("user-agent"),
    },
  });

  return NextResponse.json({ ok: result.ok, skipped: result.skipped === true });
}
