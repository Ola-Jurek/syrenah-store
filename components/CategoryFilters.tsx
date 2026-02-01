"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Category = {
  id: string
  namePl: string
  slug: string
}

type Props = {
  categories: Category[]
}

export function CategoryFilters({ categories }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col flex-wrap gap-6 mb-12">
      <Link
        href="/shop"
        className={cn(
          "text-xs uppercase tracking-widest transition-colors",
          pathname === "/shop"
            ? "text-[#C1A88C] font-medium underline underline-offset-4 decoration-1"
            : "text-[#C1A88C]/70 hover:text-[#C1A88C]"
        )}
      >
        WSZYSTKIE KATEGORIE
      </Link>
      {categories.map((category) => {
        const isActive = pathname === `/shop/${category.slug}`
        return (
          <Link
            key={category.id}
            href={`/shop/${category.slug}`}
            className={cn(
              "text-xs uppercase tracking-widest transition-colors",
              isActive
                ? "text-[#C1A88C] font-medium underline underline-offset-4 decoration-1"
                : "text-[#C1A88C]/70 hover:text-[#C1A88C]"
            )}
          >
            {category.namePl.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}

