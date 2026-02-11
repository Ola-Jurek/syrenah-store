import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ShopFilters } from "@/components/ShopFilters";
import { getEffectivePrice, extractDiscountInfo, extractDiscountLabel } from "@/lib/pricing";

type Props = {
  searchParams: Promise<{ search?: string; sort?: string; filter?: string }>;
};

// Wspólne include dla produktu z cenami i rabatami
const productInclude = {
  category: {
    select: {
      id: true,
      namePl: true,
      nameEn: true,
      slug: true,
    },
  },
  images: {
    where: { isPrimary: true },
    take: 1,
  },
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
} as const;

/** Mapuje produkt z bazy na props dla ProductCard */
function mapProductToCardProps(product: any) {
  const primaryImage = product.images[0];
  const discountInfo = extractDiscountInfo(product.discounts);
  const discountLabel = extractDiscountLabel(product.discounts);
  const pricing = getEffectivePrice({
    pricePln: Number(product.pricePln),
    priceEur: Number(product.priceEur),
    salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
    salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
    discount: discountInfo,
  });

  return {
    id: product.id,
    namePl: product.namePl,
    slug: product.slug,
    image: primaryImage?.url ?? null,
    imageAlt: primaryImage?.altPl ?? null,
    createdAt: product.createdAt.toISOString(),
    stock: product.stock,
    originalPrice: pricing.originalPricePln.toFixed(2),
    finalPrice: pricing.finalPricePln.toFixed(2),
    discountLabel,
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const { search, sort, filter } = await searchParams;

  // ─── Baner: widoczny tylko gdy istnieje aktywny Discount z kodem ───
  const activeDiscountWithCode = await prisma.discount.findFirst({
    where: {
      isActive: true,
      code: { not: "" },
      validFrom: { lte: new Date() },
      OR: [
        { validUntil: null },
        { validUntil: { gte: new Date() } },
      ],
    },
    select: { id: true, code: true, namePl: true, type: true, value: true },
  });

  const showBanner = !!activeDiscountWithCode;

  // ─── Sprawdź czy są produkty wyprzedażowe (dla filtra WYPRZEDAŻ) ───
  const now = new Date();
  const saleProductsCount = await prisma.product.count({
    where: {
      OR: [
        { salePricePln: { not: null } },
        {
          discounts: {
            some: {
              isActive: true,
              validFrom: { lte: now },
              OR: [
                { validUntil: null },
                { validUntil: { gte: now } },
              ],
            },
          },
        },
      ],
    },
  });
  const hasSaleProducts = saleProductsCount > 0;

  // ─── Wyniki wyszukiwania ───
  if (search) {
    const searchTerm = decodeURIComponent(search);
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { namePl: { contains: searchTerm, mode: "insensitive" } },
          { nameEn: { contains: searchTerm, mode: "insensitive" } },
          { descriptionPl: { contains: searchTerm, mode: "insensitive" } },
          { descriptionEn: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
      take: 20,
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="bg-white pt-16">
        {showBanner && <ShopBanner discount={activeDiscountWithCode} />}

        <div className="px-6 pb-16 max-w-7xl mx-auto pt-8">
          <h1 className="text-xs uppercase tracking-widest mb-4 text-black font-medium">
            WYNIKI WYSZUKIWANIA: &quot;{searchTerm.toUpperCase()}&quot;
          </h1>
          <p className="text-xs text-black/60 mb-12">
            Znaleziono {products.length}{" "}
            {products.length === 1 ? "produkt" : "produktów"}
          </p>

          {products.length === 0 ? (
            <p className="text-muted-foreground">
              Nie znaleziono produktów dla frazy &quot;{searchTerm}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={mapProductToCardProps(product)}
                  categorySlug={product.category.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Filtrowanie ───
  const currentFilter = filter || "all";

  let whereClause: any = {};

  if (currentFilter === "new") {
    // Produkty z ostatnich 14 dni
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    whereClause = { createdAt: { gte: twoWeeksAgo } };
  } else if (currentFilter === "sale") {
    // Produkty z salePrice LUB z przypisanym aktywnym Discount
    whereClause = {
      OR: [
        { salePricePln: { not: null } },
        {
          discounts: {
            some: {
              isActive: true,
              validFrom: { lte: now },
              OR: [
                { validUntil: null },
                { validUntil: { gte: now } },
              ],
            },
          },
        },
      ],
    };
  }

  // ─── Sortowanie ───
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { pricePln: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { pricePln: "desc" };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: productInclude,
    orderBy,
  });

  return (
    <div className="bg-white pt-16">
      {showBanner && <ShopBanner discount={activeDiscountWithCode} />}

      <div className="px-6 pb-16 max-w-7xl mx-auto pt-8">
        {/* Pasek filtrów */}
        <Suspense fallback={<div className="h-12 mb-8 border-b border-[#C1A88C]/10 animate-pulse" />}>
          <ShopFilters
            currentFilter={currentFilter}
            currentSort={sort || "newest"}
            hasSaleProducts={hasSaleProducts}
          />
        </Suspense>

        {/* Siatka produktów */}
        {products.length === 0 ? (
          <p className="text-muted-foreground">
            Produkty w przygotowaniu ✨
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={mapProductToCardProps(product)}
                categorySlug={product.category.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Baner promocyjny — beżowy pasek (server component) ───
function ShopBanner({
  discount,
}: {
  discount: { code: string; namePl: string | null; type: string; value: any } | null;
}) {
  if (!discount) return null;

  const label = discount.namePl?.trim() || "";
  const val = Number(discount.value);
  const discountText =
    discount.type === "PERCENTAGE" ? `-${val}%` : `-${val.toFixed(0)} PLN`;

  // Tekst główny (nazwa rabatu lub wartość)
  const mainText = label || discountText;
  const codeText = `KOD: ${discount.code.toUpperCase()}`;

  return (
    <div className="w-full bg-[#EDE3DF] py-4 md:py-5 px-6">
      {/* Desktop: jedna linia */}
      <p className="hidden md:block text-center uppercase tracking-[0.2em] text-black/80 text-base lg:text-lg font-medium">
        {mainText} · {codeText}
      </p>
      {/* Mobile: dwie linie */}
      <div className="flex flex-col items-center gap-0.5 md:hidden">
        <span className="uppercase tracking-[0.2em] text-black/80 text-sm font-medium">
          {mainText}
        </span>
        <span className="uppercase tracking-[0.15em] text-black/60 text-xs">
          {codeText}
        </span>
      </div>
    </div>
  );
}
