import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartLine = {
  productId?: string;
  quantity?: number;
  price?: number;
};

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  let cart: CartLine[] = [];
  if (session.metadata?.cart) {
    try {
      const parsed = JSON.parse(session.metadata.cart) as CartLine[];
      if (Array.isArray(parsed)) cart = parsed;
    } catch {
      cart = [];
    }
  }

  const contents = cart
    .filter((item) => item.productId)
    .map((item) => ({
      id: String(item.productId),
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
      ...(typeof item.price === "number" ? { item_price: item.price } : {}),
    }));

  return NextResponse.json({
    eventId: session.metadata?.metaEventId || `purchase_${session.id}`,
    value: (session.amount_total ?? 0) / 100,
    currency: (session.currency || "pln").toUpperCase(),
    contentIds: contents.map((item) => item.id),
    contents,
    numItems: contents.reduce((sum, item) => sum + item.quantity, 0),
  });
}
