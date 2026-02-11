import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";

// GET /api/cart — pobierz koszyk zalogowanego użytkownika
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { slug: true } },
          discounts: {
            where: {
              isActive: true,
              validFrom: { lte: new Date() },
              OR: [
                { validUntil: null },
                { validUntil: { gte: new Date() } },
              ],
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const items = cartItems.map((item) => {
    const discountInfo = extractDiscountInfo(item.product.discounts);
    const pricing = getEffectivePrice({
      pricePln: Number(item.product.pricePln),
      priceEur: Number(item.product.priceEur),
      salePricePln: item.product.salePricePln ? Number(item.product.salePricePln) : null,
      salePriceEur: item.product.salePriceEur ? Number(item.product.salePriceEur) : null,
      discount: discountInfo,
    });

    return {
      productId: item.productId,
      name: item.product.namePl,
      price: pricing.finalPricePln,
      originalPrice: pricing.originalPricePln,
      quantity: item.quantity,
      size: item.size ?? undefined,
      color: item.color ?? undefined,
      slug: item.product.slug,
      categorySlug: item.product.category.slug,
      imageUrl: item.product.images[0]?.url ?? null,
    };
  });

  return NextResponse.json({ items });
}

// POST /api/cart — dodaj produkt do koszyka
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, quantity = 1, size, color } = body;

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  // Upsert — jeśli istnieje, zsumuj ilości
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: session.user.id,
      productId,
      size: size ?? null,
      color: color ?? null,
    },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return NextResponse.json({ item: updated });
  }

  const created = await prisma.cartItem.create({
    data: {
      userId: session.user.id,
      productId,
      quantity,
      size: size ?? null,
      color: color ?? null,
    },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}

// DELETE /api/cart — usuń produkt z koszyka (zmniejsz ilość lub usuń)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size") || null;
  const color = searchParams.get("color") || null;
  const removeAll = searchParams.get("removeAll") === "true";

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: session.user.id,
      productId,
      size,
      color,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (removeAll || existing.quantity <= 1) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ deleted: true });
  }

  const updated = await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: existing.quantity - 1 },
  });

  return NextResponse.json({ item: updated });
}
