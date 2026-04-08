import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { getEffectivePrice, extractDiscountInfo, extractDiscountLabel } from "@/lib/pricing";
import { ProductBadge } from "@/components/ProductBadge";
import { ProductSizeChart } from "@/components/ProductSizeChart";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    category: string;
    productSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: "Produkt nie znaleziony",
    };
  }

  const description = product.descriptionPl
    ? product.descriptionPl.length > 160
      ? product.descriptionPl.slice(0, 157) + "..."
      : product.descriptionPl
    : `Kup ${product.namePl} w Syrenah Store - ekskluzywna moda damska.`;

  const primaryImage = product.images[0]?.url;

  return {
    title: product.namePl,
    description,
    openGraph: {
      title: product.namePl,
      description: description,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              alt: product.images[0]?.altPl || product.namePl,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.namePl,
      description: description,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug, category } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
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
    },
  });

  if (!product) {
    notFound();
  }

  // Parsuj sizes i colors z JSON
  const sizes = product.sizes ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes) as string[] : [];
  const colors = product.colors ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors) as string[] : [];

  // Oblicz efektywną cenę
  const discountInfo = extractDiscountInfo(product.discounts);
  const discountLabel = extractDiscountLabel(product.discounts);
  const pricing = getEffectivePrice({
    pricePln: Number(product.pricePln),
    priceEur: Number(product.priceEur),
    salePricePln: product.salePricePln ? Number(product.salePricePln) : null,
    salePriceEur: product.salePriceEur ? Number(product.salePriceEur) : null,
    discount: discountInfo,
  });

  return (
    <div className="px-6 pt-24 pb-16 max-w-6xl mx-auto bg-white">
      {/* Breadcrumbs */}
      <nav className="mb-16">
        <div className="flex items-center gap-2 text-xs text-[#C1A88C]/60">
          <Link href="/shop" className="hover:text-[#C1A88C] transition-colors">
            SKLEP
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <Link 
            href={`/shop/${product.category.slug}`} 
            className="hover:text-[#C1A88C] transition-colors"
          >
            {product.category.namePl.toUpperCase()}
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <span className="text-[#C1A88C]/60">
            {product.namePl.toUpperCase()}
          </span>
        </div>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        {/* LEFT: Images */}
        <div className="w-full relative">
          {/* Product Badge (SALE / NEW / SOLD OUT) */}
          <ProductBadge
            createdAt={product.createdAt.toISOString()}
            stock={product.stock}
            hasPriceReduction={pricing.hasDiscount}
            discountLabel={discountLabel}
          />
          {/* Wishlist Heart – prawy górny róg zdjęcia */}
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton
              productId={product.id}
              size="md"
              className="bg-white/60 backdrop-blur-sm shadow-sm"
            />
          </div>
          <div className="max-h-[80vh] overflow-hidden">
            <ProductGallery images={product.images} productName={product.namePl} />
          </div>
        </div>

        {/* RIGHT: Product info */}
        <div className="flex flex-col">
          <h1 className="text-sm uppercase tracking-widest font-serif mb-3 text-center md:text-left text-black">
            {product.namePl.toUpperCase()}
          </h1>

          {/* Cena */}
          <div className="mb-8 text-center md:text-left">
            {pricing.hasDiscount ? (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-xs text-black/40 line-through uppercase tracking-widest">
                  {pricing.originalPricePln.toFixed(2)} PLN
                </span>
                <span className="text-xs text-[#C1A88C] font-semibold uppercase tracking-widest">
                  {pricing.finalPricePln.toFixed(2)} PLN
                </span>
              </div>
            ) : (
              <p className="text-xs text-black/60 uppercase tracking-widest">
                {pricing.finalPricePln.toFixed(2)} PLN
              </p>
            )}
          </div>

          {product.descriptionPl && (
            <p className="text-sm text-black/60 mb-8 leading-relaxed whitespace-pre-wrap text-center md:text-left">
              {product.descriptionPl}
            </p>
          )}

          <div className="mb-8 flex justify-center md:justify-start">
            <ProductSizeChart />
          </div>

          {/* CTA */}
          <div className="mt-auto">
            <AddToCartButton
              productId={product.id}
              name={product.namePl}
              price={pricing.finalPricePln}
              stock={product.stock}
              sizes={sizes}
              colors={colors}
              slug={product.slug}
              categorySlug={product.category.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
