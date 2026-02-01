import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

type Category = {
  id: string;
  namePl: string;
  slug: string;
};

type Props = {
  categories: Category[];
};

export async function CategoryGrid({ categories }: Props) {
  // Pobierz pierwsze zdjęcie produktu z każdej kategorii jako thumbnail
  const categoriesWithImages = await Promise.all(
    categories.map(async (category) => {
      const product = await prisma.product.findFirst({
        where: { categoryId: category.id },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      });

      return {
        ...category,
        imageUrl: product?.images[0]?.url || null,
      };
    })
  );

  if (categoriesWithImages.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categoriesWithImages.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className="group"
          >
            <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden mb-3">
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.namePl}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-center text-neutral-700 font-serif">
              {category.namePl.split("").join(" ")}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

