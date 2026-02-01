import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-8">
          {categoryData.products.map((product) => {
            const primaryImage = product.images[0];
            return (
              <Link
                key={product.id}
                href={`/shop/${category}/${product.slug}`}
                className="group"
              >
                <div className="bg-[#C1A88C]/10 aspect-[3/4] relative mb-3">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altPl || product.namePl}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Syrenah"
                        width={80}
                        height={80}
                        className="opacity-20"
                      />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-sm uppercase tracking-widest font-serif text-black mb-1">
                    {product.namePl.toUpperCase()}
                  </h2>
                  <p className="text-xs text-black/60">
                    {product.pricePln.toString()} PLN
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

