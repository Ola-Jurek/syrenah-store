"use client";

import { useCart, getCartItemName } from "@/components/CartContext";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Tag, X, Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { formatMoney } from "@/lib/format-price";

type ProductImage = {
  productId: string;
  imageUrl: string | null;
};

type AppliedDiscount = {
  id: string;
  code: string;
  namePl: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
  totalAfterDiscount: number;
};

export default function CartPage() {
  const { locale, messages } = useLanguage();
  const ct = messages.cart;
  const { items, removeFromCart } = useCart();
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});

  // Kod rabatowy
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Pobierz zdjęcia produktów
  useEffect(() => {
    async function fetchImages() {
      const productIds = items.map(item => item.productId);
      if (productIds.length === 0) return;

      try {
        const res = await fetch(`/api/products/images?ids=${productIds.join(',')}`);
        if (res.ok) {
          const data: ProductImage[] = await res.json();
          const imagesMap: Record<string, string | null> = {};
          data.forEach(item => {
            imagesMap[item.productId] = item.imageUrl;
          });
          setProductImages(imagesMap);
        }
      } catch (error) {
        console.error("Error fetching product images:", error);
      }
    }

    fetchImages();
  }, [items]);

  // Załaduj zapisany kod z localStorage
  useEffect(() => {
    const saved = localStorage.getItem("syrenah_discount_code");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAppliedDiscount(parsed);
      } catch {
        localStorage.removeItem("syrenah_discount_code");
      }
    }
  }, []);

  // Re-waliduj rabat gdy zmieniają się produkty w koszyku
  useEffect(() => {
    if (!appliedDiscount || items.length === 0) {
      if (items.length === 0 && appliedDiscount) {
        removeDiscount();
      }
      return;
    }

    // Re-przelicz rabat z aktualnymi produktami
    revalidateDiscount(appliedDiscount.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  async function revalidateDiscount(code: string) {
    try {
      const res = await fetch("/api/cart/apply-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newDiscount: AppliedDiscount = {
          id: data.discount.id,
          code: data.discount.code,
          namePl: data.discount.namePl,
          type: data.discount.type,
          value: data.discount.value,
          discountAmount: data.discountAmount,
          totalAfterDiscount: data.totalAfterDiscount,
        };
        setAppliedDiscount(newDiscount);
        localStorage.setItem("syrenah_discount_code", JSON.stringify(newDiscount));
      } else {
        // Rabat już nie jest ważny — usuń
        removeDiscount();
      }
    } catch {
      // Cicho — nie usuwaj rabatu przy błędzie sieci
    }
  }

  async function handleApplyDiscount() {
    if (!discountCode.trim()) return;

    setApplyingDiscount(true);
    setDiscountError(null);

    try {
      const res = await fetch("/api/cart/apply-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDiscountError(data.error || "Nieprawidłowy kod rabatowy");
        return;
      }

      const newDiscount: AppliedDiscount = {
        id: data.discount.id,
        code: data.discount.code,
        namePl: data.discount.namePl,
        type: data.discount.type,
        value: data.discount.value,
        discountAmount: data.discountAmount,
        totalAfterDiscount: data.totalAfterDiscount,
      };

      setAppliedDiscount(newDiscount);
      localStorage.setItem("syrenah_discount_code", JSON.stringify(newDiscount));
      setDiscountCode("");
    } catch {
      setDiscountError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setApplyingDiscount(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountError(null);
    localStorage.removeItem("syrenah_discount_code");
  }

  const subtotalPln = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotalEur = items.reduce(
    (sum, item) =>
      sum +
      (item.priceEur != null ? item.priceEur : 0) * item.quantity,
    0
  );
  const canUseEur =
    locale === "en" &&
    items.length > 0 &&
    items.every((i) => i.priceEur != null);

  const subtotal = canUseEur ? subtotalEur : subtotalPln;

  const hasCartDiscount = appliedDiscount && appliedDiscount.discountAmount > 0;
  const totalAfterCartDiscountPln = hasCartDiscount
    ? appliedDiscount!.totalAfterDiscount
    : subtotalPln;
  const totalPln = Math.min(subtotalPln, totalAfterCartDiscountPln);
  const effectiveDiscountPln = subtotalPln - totalPln;

  const eurScale =
    canUseEur && subtotalPln > 0 ? subtotalEur / subtotalPln : 1;
  const total = canUseEur ? totalPln * eurScale : totalPln;
  const effectiveDiscount = canUseEur    ? effectiveDiscountPln * eurScale
    : effectiveDiscountPln;

  const getProductLink = (item: typeof items[0]) => {
    if (item.slug && item.categorySlug) {
      return `/shop/${item.categorySlug}/${item.slug}`;
    }
    return "#";
  };

  return (
    <div className="px-6 pt-24 pb-16 max-w-4xl mx-auto bg-white">
      <h1 className="text-xs uppercase tracking-widest mb-12 text-black font-medium">
        {ct.title.toUpperCase()}
      </h1>

      {items.length === 0 ? (
        <p className="text-black/60 text-center py-12">{ct.empty}</p>
      ) : (
        <>
          <ul className="space-y-6 mb-12">
            {items.map((item) => {
              const productLink = getProductLink(item);
              const imageUrl = productImages[item.productId];
              const displayName = getCartItemName(item, locale);
              const unit =
                canUseEur && item.priceEur != null ? item.priceEur : item.price;
              const orig =
                canUseEur && item.originalPriceEur != null
                  ? item.originalPriceEur
                  : item.originalPrice;
              const hasDiscount =
                orig != null && orig > unit;

              return (
                <li
                  key={`${item.productId}-${item.size || ''}-${item.color || ''}`}
                  className="border-b border-black/10 pb-6 flex gap-4"
                >
                  {/* Zdjęcie produktu - klikalne */}
                  {productLink !== "#" ? (
                    <Link href={productLink} className="flex-shrink-0">
                      <div className="w-24 h-24 bg-[#C1A88C]/10 relative overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={displayName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#C1A88C]/20 rounded" />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-24 h-24 bg-[#C1A88C]/10 flex-shrink-0" />
                  )}

                  {/* Informacje o produkcie */}
                  <div className="flex-1">
                    {productLink !== "#" ? (
                      <Link href={productLink}>
                        <p className="font-serif text-sm mb-1 hover:text-[#C1A88C] transition-colors">
                          {displayName}
                        </p>
                      </Link>
                    ) : (
                      <p className="font-serif text-sm mb-1">{displayName}</p>
                    )}
                    
                    {item.size && (
                      <p className="text-xs text-black/60 mb-1">
                        {ct.size}: {item.size}
                      </p>
                    )}
                    {item.color && (
                      <p className="text-xs text-black/60 mb-1">
                        {ct.color}: {item.color}
                      </p>
                    )}
                    
                    <div className="text-xs text-black/60 mb-3 flex items-center gap-2">
                      {hasDiscount && orig != null && (
                        <span className="line-through text-black/30">
                          {formatMoney(orig, canUseEur ? "en" : "pl")}
                        </span>
                      )}
                      <span className={hasDiscount ? "text-[#C1A88C] font-semibold" : ""}>
                        {formatMoney(unit, canUseEur ? "en" : "pl")}
                      </span>
                      <span>× {item.quantity}</span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      {ct.remove}
                    </button>
                  </div>

                  {/* Cena */}
                  <div className="text-right">
                    <p className="font-serif text-sm">
                      {formatMoney(unit * item.quantity, canUseEur ? "en" : "pl")}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ───── Kod rabatowy ───── */}
          <div className="mb-8">
            {appliedDiscount ? (
              /* Zastosowany rabat */
              <div className="border border-[#C1A88C]/30 bg-[#C1A88C]/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C1A88C]/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-[#C1A88C]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-black/80 bg-[#C1A88C]/10 px-2 py-0.5 rounded">
                        {appliedDiscount.code}
                      </span>
                      {appliedDiscount.namePl && (
                        <span className="text-xs text-black/50">
                          {appliedDiscount.namePl}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#C1A88C] mt-1 font-medium">
                      {appliedDiscount.type === "PERCENTAGE"
                        ? `-${appliedDiscount.value}%`
                        : `-${appliedDiscount.value.toFixed(2)} PLN`}
                      {effectiveDiscount > 0 &&
                        ` (${ct.youSave} ${formatMoney(
                          effectiveDiscount,
                          canUseEur ? "en" : "pl"
                        )})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeDiscount}
                  className="p-1.5 text-black/40 hover:text-black transition-colors"
                  title={ct.removeDiscountTitle}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Formularz kodu */
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-3.5 w-3.5 text-[#C1A88C]" />
                  <span className="text-xs uppercase tracking-widest text-black/50">
                    {ct.discountCode}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyDiscount();
                      }
                    }}
                    placeholder={ct.placeholderCode}
                    className="flex-1 px-4 py-2.5 border border-[#E8E3D8] text-sm font-mono tracking-wider bg-white placeholder:text-black/25 focus:outline-none focus:border-[#C1A88C] transition-colors"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !discountCode.trim()}
                    className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-black/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {applyingDiscount ? ct.applying : ct.apply}
                  </button>
                </div>
                {discountError && (
                  <p className="text-xs text-[#D4A0A0] mt-2">{discountError}</p>
                )}
              </div>
            )}
          </div>

          {/* Podsumowanie - beżowe tło */}
          <div className="bg-[#C1A88C]/10 p-6 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-black/50">
                <span className="uppercase tracking-widest">{ct.productsLine}</span>
                <span>{formatMoney(subtotal, canUseEur ? "en" : "pl")}</span>
              </div>

              {effectiveDiscount > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="uppercase tracking-widest text-[#C1A88C]">
                    {ct.discountLine} ({appliedDiscount?.code})
                  </span>
                  <span className="text-[#C1A88C] font-medium">
                    -{formatMoney(effectiveDiscount, canUseEur ? "en" : "pl")}
                  </span>
                </div>
              )}

              <div className="border-t border-black/10 pt-2 mt-2 flex justify-between items-center text-sm">
                <span className="uppercase tracking-widest text-black/60">{ct.total}</span>
                <span className="font-serif text-lg text-black">
                  {formatMoney(total, canUseEur ? "en" : "pl")}
                </span>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex justify-center">
              <Link href="/checkout/gate">
                <button
                  className="
                    bg-[#C1A88C] text-white
                    px-10 py-4
                    text-xs uppercase tracking-widest
                    hover:bg-[#C1A88C]/90
                    transition-colors
                  "
                >
                  {ct.checkoutButton}
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
