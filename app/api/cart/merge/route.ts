import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePrice, extractDiscountInfo } from "@/lib/pricing";

type GuestCartItem = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
};

// POST /api/cart/merge — scal koszyk gościa (localStorage) z koszykiem w DB
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const guestItems: GuestCartItem[] = body.items;

  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return NextResponse.json({ merged: 0 });
  }

  let mergedCount = 0;

  for (const guestItem of guestItems) {
    const { productId, quantity, size, color } = guestItem;

    if (!productId || !quantity || quantity <= 0) continue;

    // Sprawdź czy produkt istnieje
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) continue;

    // Sprawdź czy ten wariant jest już w koszyku użytkownika
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        size: size ?? null,
        color: color ?? null,
      },
    });

    if (existing) {
      // Zsumuj ilości
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      // Dodaj nowy element
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
          size: size ?? null,
          color: color ?? null,
        },
      });
    }

    mergedCount++;
  }

  // Zwróć aktualny koszyk po merge (z finalPrice)
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

  return NextResponse.json({ merged: mergedCount, items });
}
