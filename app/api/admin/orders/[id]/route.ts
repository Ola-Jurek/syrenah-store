export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/adminAuth";
import { OrderStatus } from "@prisma/client";
import { sendStatusUpdateEmail } from "@/lib/emails/sendStatusUpdateEmail";

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
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
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
      shippingEmail: order.shippingEmail,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingMethod: order.shippingMethod,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
      shippingAddress: order.shippingAddress,

      // Faktura
      isInvoiceRequested: order.isInvoiceRequested,
      companyName: order.companyName,
      vatNumber: order.vatNumber,
      billingAddress: order.billingAddress,

      // Inny adres dostawy
      isDifferentShippingAddress: order.isDifferentShippingAddress,
      alternateShippingAddress: order.alternateShippingAddress,

      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        pricePln: Number(item.pricePln),
        product: {
          id: item.product.id,
          namePl: item.product.namePl,
          nameEn: item.product.nameEn,
          slug: item.product.slug,
          imageUrl: item.product.images?.[0]?.url || null,
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
 * Aktualizuje status zamówienia i wysyła powiadomienie email
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertAdmin(req);

    const { id } = await params;
    const body = await req.json();
    const { status, trackingNumber } = body;

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

    // Zaktualizuj zamówienie w bazie
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Wyślij email o zmianie statusu (dla PROCESSING, SHIPPED, DELIVERED)
    const emailResult = await sendStatusUpdateEmail({
      order: {
        id: order.id,
        shippingEmail: order.shippingEmail,
        shippingName: order.shippingName,
        shippingMethod: order.shippingMethod,
        user: order.user,
      },
      newStatus: status,
      trackingNumber,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      emailError: emailResult.error,
    });
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
