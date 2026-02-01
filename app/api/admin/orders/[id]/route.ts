export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@prisma/client";

/**
 * GET /api/admin/orders/[id]
 * Zwraca pełne zamówienie z pozycjami i produktami
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      totalPln: Number(order.totalPln),
      totalEur: Number(order.totalEur),
      stripeSessionId: order.stripeSessionId || null,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        pricePln: Number(item.pricePln),
        product: {
          id: item.product.id,
          namePl: item.product.namePl,
          nameEn: item.product.nameEn,
          slug: item.product.slug,
        },
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    // assertAdmin rzuca Response, więc jeśli to Response, zwróć go
    if (error instanceof Response) {
      return error;
    }

    console.error("ADMIN ORDER DETAIL ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Aktualizuje status zamówienia
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // Walidacja statusu
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!status || !validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // assertAdmin rzuca Response, więc jeśli to Response, zwróć go
    if (error instanceof Response) {
      return error;
    }

    // Jeśli zamówienie nie istnieje, Prisma rzuci P2025
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.error("ADMIN ORDER UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

