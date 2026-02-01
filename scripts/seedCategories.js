const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.category.create({
    data: {
      namePl: "Sukienki",
      nameEn: "Dresses",
      slug: "dresses",
    },
  });
}

main()
  .then(() => {
    console.log("Category seeded");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
