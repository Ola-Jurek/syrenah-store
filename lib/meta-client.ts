"use client";

import { hasMarketingConsent } from "@/components/CookieBanner";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type MetaTrackPayload = {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
};

const BROWSER_EVENTS = new Set<MetaEventName>([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
]);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

function ensurePixel() {
  if (!META_PIXEL_ID || typeof window === "undefined") return;
  if (window.fbq) return;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", META_PIXEL_ID);
}

function canTrack(): boolean {
  return Boolean(META_PIXEL_ID) && hasMarketingConsent();
}

export function getMetaCheckoutContext(): {
  metaConsent: boolean;
  fbp?: string;
  fbc?: string;
} {
  if (!hasMarketingConsent()) return { metaConsent: false };
  const fbp = readCookie("_fbp") || undefined;
  const fbc = readCookie("_fbc") || undefined;
  return { metaConsent: true, fbp, fbc };
}

export function trackMetaEvent(
  eventName: MetaEventName,
  customData?: MetaTrackPayload,
  eventId?: string
): boolean {
  if (!canTrack()) return false;

  ensurePixel();
  const id = eventId || crypto.randomUUID();
  const payload = customData ?? {};
  window.fbq?.("track", eventName, payload, { eventID: id });

  if (!BROWSER_EVENTS.has(eventName)) return true;

  void fetch("/api/meta/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId: id,
      customData: payload,
      eventSourceUrl: window.location.href,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
    }),
  }).catch(() => {
    /* brak tokena albo sieci nie może psuć sklepu */
  });
  return true;
}

export function trackMetaPurchase(input: {
  eventId: string;
  value: number;
  currency: string;
  contentIds: string[];
  contents: Array<{ id: string; quantity: number; item_price?: number }>;
  numItems: number;
}) {
  if (!canTrack()) return;
  ensurePixel();
  window.fbq?.("track", "Purchase", {
    currency: input.currency,
    value: input.value,
    content_ids: input.contentIds,
    content_type: "product",
    contents: input.contents,
    num_items: input.numItems,
  }, { eventID: input.eventId });
}
