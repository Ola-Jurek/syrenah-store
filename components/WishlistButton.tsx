"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/components/WishlistContext";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  className?: string;
  size?: "sm" | "md";
};

export function WishlistButton({ productId, className, size = "sm" }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);

  const isFavorite = isInWishlist(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200",
        "hover:scale-110 active:scale-95",
        buttonSize,
        isAnimating && "scale-125",
        className
      )}
      aria-label={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-all duration-200",
          isFavorite
            ? "fill-[#C1A88C] text-[#C1A88C]"
            : "fill-transparent text-black/40 hover:text-[#C1A88C]"
        )}
      />
    </button>
  );
}
