import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/HeroSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { InstagramFeed } from "@/components/InstagramFeed";

export default async function Home() {
  const heroSettings = await prisma.heroSettings.findFirst({
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection heroSettings={heroSettings} />

      {/* Category Grid - zakomentowane, będzie odkomentowane gdy będzie więcej niż jedna kategoria */}
      {/* <CategoryGrid categories={categories} /> */}

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
}
