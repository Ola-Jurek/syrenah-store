const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Find category with slug "dresses"
  const category = await prisma.category.findUnique({
    where: {
      slug: "dresses",
    },
  });

  if (!category) {
    throw new Error("Category with slug 'dresses' not found");
  }

  // Create product assigned to this category
  await prisma.product.create({
    data: {
      namePl: "Sukienka Lilia",
      nameEn: "Lilia Dress",
      descriptionPl: "Krótki opis placeholder",
      descriptionEn: "Short placeholder description",
      pricePln: 499,
      priceEur: 109,
      stock: 5,
      slug: "sukienka-lilia",
      categoryId: category.id,
    },
  });
}

main()
  .then(() => {
    console.log("Product seeded");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

