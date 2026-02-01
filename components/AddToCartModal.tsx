"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddToCartModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Ustaw na pierwszym renderze
    if (isMobile === null) {
      checkMobile();
    }
    
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCart = () => {
    onClose();
    router.push("/cart");
  };

  // Zapobiegaj scrollowaniu body gdy modal jest otwarty
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`bg-[#FDFBF7] border-0 p-6 shadow-xl shadow-black/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 ${
          isMobile === true
            ? // Mobile: floating island at bottom
              "fixed bottom-6 left-4 right-4 top-auto translate-x-0 translate-y-0 rounded-2xl data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4"
            : // Desktop: centered modal
              "max-w-xs rounded-sm data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        }`}
        showCloseButton={false}
      >
        <DialogHeader className="text-center space-y-5">
          <DialogTitle className="text-sm font-serif text-neutral-700 tracking-wider">
            Produkt dodany do koszyka
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          <button
            onClick={handleContinueShopping}
            className="w-full border border-[#E8E3D8] bg-transparent px-8 py-2.5 text-xs uppercase tracking-widest text-neutral-600 hover:bg-[#E8E3D8] hover:text-neutral-800 transition-colors"
          >
            Kontynuuj zakupy
          </button>
          <button
            onClick={handleGoToCart}
            className="w-full bg-[#E8E3D8] text-white px-8 py-2.5 text-xs uppercase tracking-widest hover:bg-[#DDD7C8] transition-colors"
          >
            Przejdź do koszyka
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

