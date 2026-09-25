import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";
import { stockForSize } from "@/lib/size-stock";

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
          images: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
            take: 5,
          },
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
          sizeStocks: { select: { size: true, stock: true } },
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

    const image =
      item.product.images.find((img) => img.url?.trim()) ||
      item.product.images[0];

    return {
      productId: item.productId,
      name: item.product.namePl,
      namePl: item.product.namePl,
      nameEn: item.product.nameEn,
      price: pricing.finalPricePln,
      priceEur: pricing.finalPriceEur,
      originalPrice: pricing.originalPricePln,
      originalPriceEur: pricing.originalPriceEur,
      quantity: item.quantity,
      size: item.size ?? undefined,
      color: item.color ?? undefined,
      slug: item.product.slug,
      categorySlug: item.product.category.slug,
      imageUrl: image?.url?.trim() || null,
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

  const qty = Math.max(1, Number(quantity) || 1);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { sizeStocks: { select: { size: true, stock: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      userId: session.user.id,
      productId,
      size: size ?? null,
      color: color ?? null,
    },
  });

  const nextQty = (existing?.quantity ?? 0) + qty;
  const availability = stockForSize(
    product.stock,
    product.sizes,
    product.sizeStocks,
    size
  );
  if (availability.error || availability.available < nextQty) {
    return NextResponse.json(
      { error: availability.error || "Za mało sztuk na stanie" },
      { status: 400 }
    );
  }

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
    return NextResponse.json({ item: updated });
  }

  const created = await prisma.cartItem.create({
    data: {
      userId: session.user.id,
      productId,
      quantity: qty,
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
