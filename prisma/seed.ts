const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // CATEGORY
  const dressesCategory = await prisma.category.upsert({
    where: { slug: "dresses" },
    update: {},
    create: {
      namePl: "Sukienki",
      nameEn: "Dresses",
      slug: "dresses",
    },
  });

  console.log("✅ Category created:", dressesCategory.namePl);

  // PRODUCT
  const product = await prisma.product.upsert({
    where: { slug: "sukienka-lilia" },
    update: {},
    create: {
      namePl: "Sukienka Lilia",
      nameEn: "Lilia Dress",
      slug: "sukienka-lilia",
      pricePln: 499,
      priceEur: 110,
      stock: 10,
      categoryId: dressesCategory.id,
      images: {
        create: [
          {
            url: "/products/lilia.jpg",
            altPl: "Sukienka Lilia",
            altEn: "Lilia Dress",
            isPrimary: true,
          },
        ],
      },
    },
  });

  console.log("✅ Product created:", product.namePl);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
