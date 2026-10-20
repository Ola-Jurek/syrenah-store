import { createHash } from "crypto";
import type Stripe from "stripe";

const GRAPH_VERSION = "v23.0";

export type MetaContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type MetaCustomData = {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_type?: string;
  content_ids?: string[];
  contents?: MetaContent[];
  num_items?: number;
};

type MetaUserData = {
  email?: string | null;
  phone?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
};

export type MetaServerEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  customData?: MetaCustomData;
  userData?: MetaUserData;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return null;
  return sha256(normalized);
}

function hashPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return sha256(digits);
}

function pixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
}

function accessToken(): string {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || "";
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(pixelId() && accessToken());
}

export async function sendMetaServerEvent(
  event: MetaServerEvent
): Promise<{ ok: boolean; skipped?: boolean }> {
  const id = pixelId();
  const token = accessToken();
  if (!id || !token) return { ok: false, skipped: true };

  const userData: Record<string, string | string[]> = {};
  const emailHash = event.userData?.email
    ? hashEmail(event.userData.email)
    : null;
  const phoneHash = event.userData?.phone
    ? hashPhone(event.userData.phone)
    : null;
  if (emailHash) userData.em = [emailHash];
  if (phoneHash) userData.ph = [phoneHash];
  if (event.userData?.fbp) userData.fbp = event.userData.fbp;
  if (event.userData?.fbc) userData.fbc = event.userData.fbc;
  if (event.userData?.clientIp) userData.client_ip_address = event.userData.clientIp;
  if (event.userData?.clientUserAgent) {
    userData.client_user_agent = event.userData.clientUserAgent;
  }

  const payload: {
    data: Array<Record<string, unknown>>;
    test_event_code?: string;
  } = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
  };

  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testCode) payload.test_event_code = testCode;

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${id}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    console.error("Meta CAPI error:", response.status);
    return { ok: false };
  }

  return { ok: true };
}

type CartLine = {
  productId?: string;
  quantity?: number;
  price?: number;
};

function purchaseFromSession(session: Stripe.Checkout.Session): MetaServerEvent | null {
  if (session.payment_status !== "paid") return null;
  if (session.metadata?.metaConsent !== "1") return null;

  let cart: CartLine[] = [];
  if (session.metadata?.cart) {
    try {
      const parsed = JSON.parse(session.metadata.cart) as CartLine[];
      if (Array.isArray(parsed)) cart = parsed;
    } catch {
      cart = [];
    }
  }

  const contents: MetaContent[] = cart
    .filter((item) => item.productId)
    .map((item) => ({
      id: String(item.productId),
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      ...(typeof item.price === "number" ? { item_price: item.price } : {}),
    }));

  let email: string | null = session.customer_details?.email ?? null;
  let phone: string | null = session.customer_details?.phone ?? null;
  if (session.metadata?.shipping) {
    try {
      const shipping = JSON.parse(session.metadata.shipping) as {
        email?: string;
        phone?: string;
      };
      email = email || shipping.email || null;
      phone = phone || shipping.phone || null;
    } catch {
      /* brak adresu w metadanych nie blokuje zakupu */
    }
  }

  const value = (session.amount_total ?? 0) / 100;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://syrenahthelabel.com";

  return {
    eventName: "Purchase",
    eventId: session.metadata?.metaEventId || `purchase_${session.id}`,
    eventSourceUrl: `${appUrl}/success?session_id=${session.id}`,
    customData: {
      currency: (session.currency || "pln").toUpperCase(),
      value,
      content_type: "product",
      content_ids: contents.map((item) => item.id),
      contents,
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    },
    userData: {
      email,
      phone,
      fbp: session.metadata?.metaFbp || null,
      fbc: session.metadata?.metaFbc || null,
    },
  };
}

export async function sendMetaPurchaseForSession(
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; skipped?: boolean }> {
  const event = purchaseFromSession(session);
  if (!event) return { ok: false, skipped: true };
  return sendMetaServerEvent(event);
}
