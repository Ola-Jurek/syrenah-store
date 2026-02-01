import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CategoryFilters } from "@/components/CategoryFilters";

type Props = {
  searchParams: Promise<{ search?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { search } = await searchParams;

  // Jeśli jest parametr search, wyświetl wyniki wyszukiwania
  if (search) {
    const searchTerm = decodeURIComponent(search);
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            namePl: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            nameEn: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            descriptionPl: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            descriptionEn: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 20,
      include: {
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
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
        <h1 className="text-xs uppercase tracking-widest mb-4 text-black font-medium">
          WYNIKI WYSZUKIWANIA: "{searchTerm.toUpperCase()}"
        </h1>
        <p className="text-xs text-black/60 mb-12">
          Znaleziono {products.length} {products.length === 1 ? "produkt" : "produktów"}
        </p>

        {products.length === 0 ? (
          <p className="text-muted-foreground">
            Nie znaleziono produktów dla frazy "{searchTerm}"
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 lg:gap-8">
            {products.map((product) => {
              const primaryImage = product.images[0];
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.category.slug}/${product.slug}`}
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

  // Domyślnie wyświetl kategorie
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="px-6 pt-24 pb-16 max-w-7xl mx-auto bg-white">
      <h1 className="text-xs uppercase tracking-widest mb-6 text-black font-medium">
        SKLEP
      </h1>

      {/* Lista kategorii */}
      <CategoryFilters categories={categories} />
    </div>
  );
}
