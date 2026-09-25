"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Messages } from "@/lib/dict";

type ProductI18n = Messages["product"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  i18n: ProductI18n;
};

export function AddToCartModal({ isOpen, onClose, i18n }: Props) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

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
            ? "fixed bottom-6 left-4 right-4 top-auto translate-x-0 translate-y-0 rounded-2xl data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4"
            : "max-w-xs rounded-sm data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        }`}
        showCloseButton={false}
      >
        <DialogHeader className="text-center space-y-5">
          <DialogTitle className="text-sm font-serif text-neutral-700 tracking-wider">
            {i18n.addedModalTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleContinueShopping}
            className="w-full border border-[#E8E3D8] bg-transparent px-8 py-2.5 text-xs uppercase tracking-widest text-neutral-600 hover:bg-[#E8E3D8] hover:text-neutral-800 transition-colors"
          >
            {i18n.continueShopping}
          </button>
          <button
            type="button"
            onClick={handleGoToCart}
            className="w-full bg-[#E8E3D8] text-white px-8 py-2.5 text-xs uppercase tracking-widest hover:bg-[#DDD7C8] transition-colors"
          >
            {i18n.goToCart}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
