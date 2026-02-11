import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getEffectivePrice, extractDiscountInfo, extractDiscountLabel } from "@/lib/pricing";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const categoryData = await prisma.category.findUnique({
    where: { slug: category },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: {
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
        },
      },
    },
  });

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
      

      {/* Breadcrumbs */}
      <nav className="mb-16">
        <div className="flex items-center gap-2 text-xs text-[#C1A88C]/60">
          <Link href="/shop" className="hover:text-[#C1A88C] transition-colors">
            SKLEP
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <span className="text-[#C1A88C]/60">
            {categoryData.namePl.toUpperCase()}
          </span>
        </div>
      </nav>

      {/* Products grid */}
      {categoryData.products.length === 0 ? (
        <p className="text-muted-foreground">
          Produkty w przygotowaniu ✨
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {categoryData.products.map((product) => {
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

            return (
              <ProductCard
                key={product.id}
                product={{
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
                }}
                categorySlug={category}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
