import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ShopFilters } from "@/components/ShopFilters";
import {
  getEffectivePrice,
  extractDiscountInfo,
  extractDiscountLabel,
} from "@/lib/pricing";
import { ShopBanner } from "@/components/ShopBanner";
import { ShopSearchHeader } from "@/components/ShopSearchHeader";
import { ShopEmpty } from "@/components/ShopEmpty";
import { ShopNoSearchResults } from "@/components/ShopNoSearchResults";
import { sellableStock } from "@/lib/size-stock";

type Props = {
  searchParams: Promise<{ search?: string; sort?: string; filter?: string }>;
};

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
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "asc" as const }],
    take: 5,
  },
  discounts: {
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    take: 1,
  },
  sizeStocks: { select: { size: true, stock: true } },
};

function mapProductToCardProps(product: {
  id: string;
  namePl: string;
  nameEn: string;
  slug: string;
  stock: number;
  sizes: unknown;
  sizeStocks: Array<{ size: string; stock: number }>;
  createdAt: Date;
  salePricePln: unknown;
  salePriceEur: unknown;
  pricePln: unknown;
  priceEur: unknown;
  images: Array<{ url: string; altPl: string | null; altEn: string | null }>;
  discounts: Array<{ type: string; value: unknown; namePl?: string | null }>;
}) {
  const primaryImage =
    product.images.find((img) => img.url?.trim()) || product.images[0];
  const discountInfo = extractDiscountInfo(product.discounts);
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
    nameEn: product.nameEn,
    slug: product.slug,
    image: primaryImage?.url ?? null,
    imageAlt: primaryImage?.altPl ?? null,
    imageAltEn: primaryImage?.altEn ?? null,
    createdAt: product.createdAt.toISOString(),
    stock: sellableStock(product.stock, product.sizes, product.sizeStocks),
    originalPrice: pricing.originalPricePln.toFixed(2),
    finalPrice: pricing.finalPricePln.toFixed(2),
    originalPriceEur: pricing.originalPriceEur.toFixed(2),
    finalPriceEur: pricing.finalPriceEur.toFixed(2),
    discountLabelPl: extractDiscountLabel(product.discounts, "PLN"),
    discountLabelEn: extractDiscountLabel(product.discounts, "EUR"),
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const { search, sort, filter } = await searchParams;

  const activeDiscountWithCode = await prisma.discount.findFirst({
    where: {
      isActive: true,
      code: { not: "" },
      validFrom: { lte: new Date() },
      OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
    },
    select: { id: true, code: true, namePl: true, type: true, value: true },
  });

  const showBanner = !!activeDiscountWithCode;

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
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
          },
        },
      ],
    },
  });
  const hasSaleProducts = saleProductsCount > 0;

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
          <ShopSearchHeader term={searchTerm} count={products.length} />

          {products.length === 0 ? (
            <ShopNoSearchResults term={searchTerm} />
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

  const currentFilter = filter || "all";

  let whereClause: Record<string, unknown> = {};

  if (currentFilter === "new") {
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    whereClause = { createdAt: { gte: twoWeeksAgo } };
  } else if (currentFilter === "sale") {
    whereClause = {
      OR: [
        { salePricePln: { not: null } },
        {
          discounts: {
            some: {
              isActive: true,
              validFrom: { lte: now },
              OR: [{ validUntil: null }, { validUntil: { gte: now } }],
            },
          },
        },
      ],
    };
  }

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
        <Suspense
          fallback={
            <div className="h-12 mb-8 border-b border-[#C1A88C]/10 animate-pulse" />
          }
        >
          <ShopFilters
            currentFilter={currentFilter}
            currentSort={sort || "newest"}
            hasSaleProducts={hasSaleProducts}
          />
        </Suspense>

        {products.length === 0 ? (
          <ShopEmpty />
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
