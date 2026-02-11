"use client";

import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, X } from "lucide-react";

type ShippingData = {
  fullName: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  shippingMethod: "courier" | "parcel_locker";
  parcelLockerCode?: string;
  parcelLockerAddress?: string;
  parcelLockerCity?: string;
  parcelLockerPostalCode?: string;

  // Faktura VAT
  wantInvoice?: boolean;
  companyName?: string;
  vatNumber?: string;
  companyStreet?: string;
  companyPostalCode?: string;
  companyCity?: string;

  // Inny adres dostawy
  differentShipping?: boolean;
  altFullName?: string;
  altStreet?: string;
  altPostalCode?: string;
  altCity?: string;
  altPhone?: string;
};

type ProductImage = {
  productId: string;
  imageUrl: string | null;
};

const SHIPPING_LABELS: Record<string, { label: string; price: number }> = {
  courier: { label: "Kurier", price: 15 },
  parcel_locker: { label: "Paczkomat", price: 10 },
};

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { data: session } = useSession();
  const [shipping, setShipping] = useState<ShippingData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productImages, setProductImages] = useState<
    Record<string, string | null>
  >({});

  // Kod rabatowy z koszyka (z localStorage)
  type AppliedDiscount = {
    id: string;
    code: string;
    namePl: string | null;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    discountAmount: number;
    totalAfterDiscount: number;
  };
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);

  // Załaduj dane dostawy z localStorage
  useEffect(() => {
    const saved = localStorage.getItem("syrenah_shipping");
    if (!saved) {
      // Brak danych — wróć do formularza
      router.replace("/checkout/shipping");
      return;
    }

    try {
      const parsed = JSON.parse(saved) as ShippingData;
      setShipping(parsed);
      setIsReady(true);
    } catch {
      router.replace("/checkout/shipping");
    }
  }, [router]);

  // Załaduj kod rabatowy z localStorage
  useEffect(() => {
    const saved = localStorage.getItem("syrenah_discount_code");
    if (saved) {
      try {
        setAppliedDiscount(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Pobierz zdjęcia produktów
  useEffect(() => {
    async function fetchImages() {
      const productIds = items.map((item) => item.productId);
      if (productIds.length === 0) return;

      try {
        const res = await fetch(
          `/api/products/images?ids=${productIds.join(",")}`
        );
        if (res.ok) {
          const data: ProductImage[] = await res.json();
          const imagesMap: Record<string, string | null> = {};
          data.forEach((item) => {
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost = shipping
    ? SHIPPING_LABELS[shipping.shippingMethod]?.price ?? 15
    : 15;

  // Uwzględnij rabat z kodu koszyka
  const hasCartDiscount =
    appliedDiscount && appliedDiscount.discountAmount > 0;
  const cartDiscountAmount = hasCartDiscount
    ? appliedDiscount.discountAmount
    : 0;
  const totalAfterCartDiscount = hasCartDiscount
    ? appliedDiscount.totalAfterDiscount
    : subtotal;
  const effectiveProductTotal = Math.min(subtotal, totalAfterCartDiscount);
  const effectiveDiscount = subtotal - effectiveProductTotal;

  const total = effectiveProductTotal + shippingCost;

  const handlePayment = async () => {
    if (!shipping) return;

    setIsProcessing(true);

    try {
      // Przygotuj shippingAddress w zależności od metody dostawy
      const shippingAddress =
        shipping.shippingMethod === "parcel_locker" &&
        shipping.parcelLockerCode
          ? {
              type: "parcel_locker",
              parcelLockerCode: shipping.parcelLockerCode,
              street: shipping.parcelLockerAddress || "",
              city: shipping.parcelLockerCity || "",
              postalCode: shipping.parcelLockerPostalCode || "",
            }
          : {
              type: "courier",
              street: shipping.street,
              city: shipping.city,
              postalCode: shipping.postalCode,
            };

      // Dane faktury
      const invoice = shipping.wantInvoice
        ? {
            companyName: shipping.companyName || "",
            vatNumber: shipping.vatNumber || "",
            street: shipping.companyStreet || "",
            postalCode: shipping.companyPostalCode || "",
            city: shipping.companyCity || "",
          }
        : null;

      // Inny adres dostawy
      const alternateShipping = shipping.differentShipping
        ? {
            fullName: shipping.altFullName || "",
            street: shipping.altStreet || "",
            postalCode: shipping.altPostalCode || "",
            city: shipping.altCity || "",
            phone: shipping.altPhone || "",
          }
        : null;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: {
            fullName: shipping.fullName,
            email: shipping.email,
            phone: shipping.phone,
            shippingMethod: shipping.shippingMethod,
            shippingCost,
            shippingAddress,
            invoice,
            alternateShipping,
          },
          discountCode: appliedDiscount?.code || null,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        alert("Wystąpił błąd — spróbuj ponownie.");
        setIsProcessing(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Wystąpił błąd — spróbuj ponownie.");
      setIsProcessing(false);
    }
  };

  // Ładowanie
  if (!isReady || !shipping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-5 h-5 border border-[#C1A88C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pusty koszyk
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
        <h1 className="font-serif text-xl text-neutral-800 mb-3">
          Twój koszyk jest pusty
        </h1>
        <p className="text-xs text-neutral-400 mb-8">
          Dodaj produkty, aby przejść do zamówienia.
        </p>
        <Link
          href="/shop"
          className="border border-neutral-900 px-8 py-3 text-xs uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          Wróć do sklepu
        </Link>
      </div>
    );
  }

  const shippingLabel =
    SHIPPING_LABELS[shipping.shippingMethod]?.label ??
    shipping.shippingMethod;

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-8 h-8 rounded-full bg-[#C1A88C]/30 text-[#C1A88C] flex items-center justify-center text-xs font-medium">
            ✓
          </span>
          <div className="w-8 h-px bg-[#C1A88C]" />
          <span className="w-8 h-8 rounded-full bg-[#C1A88C]/30 text-[#C1A88C] flex items-center justify-center text-xs font-medium">
            ✓
          </span>
          <div className="w-8 h-px bg-[#C1A88C]" />
          <span className="w-8 h-8 rounded-full bg-[#C1A88C] text-white flex items-center justify-center text-xs font-medium">
            3
          </span>
        </div>

        {/* Nagłówek */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl text-neutral-800 mb-2">
            Podsumowanie zamówienia
          </h1>
          <p className="text-xs text-neutral-400">
            Sprawdź dane i przejdź do płatności.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-10">
          {/* Lewa kolumna */}
          <div className="space-y-8">
            {/* Dane dostawy */}
            <div className="bg-white border border-[#E8E3D8] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500">
                  Dane dostawy
                </h2>
                <Link
                  href="/checkout/shipping"
                  className="text-xs text-[#C1A88C] hover:text-[#B09A7C] transition-colors underline underline-offset-2"
                >
                  Zmień
                </Link>
              </div>

              <div className="space-y-1.5 text-sm text-neutral-700">
                <p className="font-medium">{shipping.fullName}</p>
                <p>{shipping.email}</p>

                {shipping.shippingMethod === "parcel_locker" &&
                shipping.parcelLockerCode ? (
                  /* Adres paczkomatu */
                  <div className="mt-2 border border-[#C1A88C]/30 bg-[#C1A88C]/5 p-3 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#C1A88C]/20 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#C1A88C]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        Paczkomat: {shipping.parcelLockerCode}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {shipping.parcelLockerAddress}
                        {shipping.parcelLockerCity &&
                          `, ${shipping.parcelLockerPostalCode} ${shipping.parcelLockerCity}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Adres kuriera */
                  <>
                    <p>{shipping.street}</p>
                    <p>
                      {shipping.postalCode} {shipping.city}
                    </p>
                  </>
                )}

                <p className="text-neutral-500">{shipping.phone}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E8E3D8]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">
                      Metoda dostawy
                    </p>
                    <p className="text-sm text-neutral-700 font-medium">
                      {shippingLabel}
                    </p>
                  </div>
                  <span className="text-sm font-serif text-neutral-700">
                    {shippingCost.toFixed(2)} zł
                  </span>
                </div>
              </div>
            </div>

            {/* Inny adres dostawy */}
            {shipping.differentShipping && shipping.altStreet && (
              <div className="bg-white border border-[#E8E3D8] p-6">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  Adres do wysyłki (inny)
                </h2>
                <div className="space-y-1.5 text-sm text-neutral-700">
                  {shipping.altFullName && (
                    <p className="font-medium">{shipping.altFullName}</p>
                  )}
                  <p>{shipping.altStreet}</p>
                  <p>
                    {shipping.altPostalCode} {shipping.altCity}
                  </p>
                  {shipping.altPhone && (
                    <p className="text-neutral-500">{shipping.altPhone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Faktura VAT */}
            {shipping.wantInvoice && shipping.companyName && (
              <div className="bg-white border border-[#E8E3D8] p-6">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  Dane do faktury VAT
                </h2>
                <div className="space-y-1.5 text-sm text-neutral-700">
                  <p className="font-medium">{shipping.companyName}</p>
                  <p>NIP: {shipping.vatNumber}</p>
                  <p>{shipping.companyStreet}</p>
                  <p>
                    {shipping.companyPostalCode} {shipping.companyCity}
                  </p>
                </div>
              </div>
            )}

            {/* Produkty */}
            <div className="bg-white border border-[#E8E3D8] p-6">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">
                Produkty ({items.length})
              </h2>

              <ul className="divide-y divide-[#E8E3D8]">
                {items.map((item) => {
                  const imageUrl = productImages[item.productId];

                  return (
                    <li
                      key={`${item.productId}-${item.size || ""}-${
                        item.color || ""
                      }`}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {/* Zdjęcie */}
                      <div className="w-16 h-16 bg-[#C1A88C]/10 flex-shrink-0 relative overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-[#C1A88C]/20 rounded" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-700 font-medium truncate">
                          {item.name}
                        </p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {item.size && `Rozmiar: ${item.size}`}
                            {item.size && item.color && " · "}
                            {item.color && `Kolor: ${item.color}`}
                          </p>
                        )}
                        <p className="text-xs text-neutral-400 mt-0.5">
                          × {item.quantity}
                        </p>
                      </div>

                      {/* Cena */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-serif text-neutral-700">
                          {(item.price * item.quantity).toFixed(2)} zł
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Prawa kolumna — podsumowanie + przycisk */}
          <div className="md:sticky md:top-28 h-fit">
            <div className="bg-white border border-[#E8E3D8] p-6">
              <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">
                Do zapłaty
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Produkty</span>
                  <span>{subtotal.toFixed(2)} zł</span>
                </div>

                {effectiveDiscount > 0 && appliedDiscount && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#C1A88C] flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Rabat ({appliedDiscount.code})
                    </span>
                    <span className="text-[#C1A88C] font-medium">
                      -{effectiveDiscount.toFixed(2)} zł
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Dostawa ({shippingLabel})</span>
                  <span>{shippingCost.toFixed(2)} zł</span>
                </div>
                <div className="border-t border-[#E8E3D8] pt-3 mt-3 flex justify-between">
                  <span className="text-xs uppercase tracking-widest text-neutral-600">
                    Razem
                  </span>
                  <span className="font-serif text-xl text-neutral-800">
                    {total.toFixed(2)} zł
                  </span>
                </div>
              </div>
            </div>

            {/* Przycisk płatności */}
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-5 bg-[#C1A88C] text-white py-4 text-xs uppercase tracking-widest hover:bg-[#B09A7C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border border-white/50 border-t-white rounded-full animate-spin" />
                  Przetwarzanie...
                </span>
              ) : (
                "Zapłać"
              )}
            </button>

            {/* Bezpieczeństwo */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <svg
                className="w-3.5 h-3.5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-[10px] text-neutral-400">
                Bezpieczna płatność przez Stripe
              </p>
            </div>

            {/* Wróć */}
            <Link
              href="/checkout/shipping"
              className="block text-center mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
            >
              ← Wróć do danych dostawy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
