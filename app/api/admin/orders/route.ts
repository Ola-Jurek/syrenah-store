export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/orders
 * Zwraca ostatnie 50 zamówień posortowanych po dacie utworzenia (desc)
 */
export async function GET(req: Request) {
  try {
    assertAdmin(req);

    const orders = await prisma.order.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    const formattedOrders = orders.map((order) => {
      const itemCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        totalPln: Number(order.totalPln),
        itemCount,
        stripeSessionId: order.stripeSessionId || null,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    // assertAdmin rzuca Response, więc jeśli to Response, zwróć go
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN ORDERS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

