"use client";

import { useCart, getCartItemName } from "@/components/CartContext";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  cartSubtotals,
  formatCheckoutMoney,
} from "@/lib/checkout-currency";

export default function CheckoutPage() {
  const { items } = useCart();
  const { locale, t } = useLanguage();
  const { subPln, subEur, canUseEur } = cartSubtotals(items);

  const total = subPln;
  const totalEur = canUseEur ? subEur : null;

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, checkoutLocale: locale }),
    });

    const data = await res.json();

    if (!data.url) {
      alert(t("alerts.checkoutMissingBackendUrl"));
      return;
    }

    window.location.href = data.url;
  };

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-serif mb-4">
          {t("checkoutFlow.legacyPageTitle")}
        </h1>
        <p className="text-muted-foreground mb-6">
          {t("cart.empty")}
        </p>
        <Link href="/shop" className="underline">
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-16 max-w-6xl mx-auto grid gap-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-serif mb-8">
          {t("checkoutFlow.legacyPageTitle")}
        </h1>

        <form className="space-y-6">
          <div>
            <label className="block text-sm mb-1">
              {t("checkoutFlow.legacyEmail")}
            </label>
            <input
              type="email"
              placeholder={t("checkoutFlow.legacyEmailPh")}
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("checkoutFlow.legacyFullName")}
            </label>
            <input
              type="text"
              placeholder={t("checkoutFlow.legacyNamePh")}
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              {t("checkoutFlow.legacyAddress")}
            </label>
            <input
              type="text"
              placeholder={t("checkoutFlow.legacyAddressPh")}
              className="w-full border px-4 py-3 rounded-md"
            />
          </div>
        </form>
      </div>

      <div className="border rounded-xl p-6 h-fit">
        <h2 className="text-lg font-medium mb-6">
          {t("checkoutFlow.legacyOrderSummary")}
        </h2>

        <ul className="space-y-4 mb-6">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex justify-between text-sm"
            >
              <span>
                {getCartItemName(item, locale)} × {item.quantity}
              </span>
              <span>
                {formatCheckoutMoney(
                  item.price * item.quantity,
                  item.priceEur != null
                    ? item.priceEur * item.quantity
                    : null,
                  locale
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t pt-4 text-lg font-medium">
          <span>{t("checkoutFlow.legacySum")}</span>
          <span>{formatCheckoutMoney(total, totalEur, locale)}</span>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          className="mt-6 w-full border border-black py-4 text-sm tracking-wide uppercase hover:bg-black hover:text-white transition"
        >
          {t("checkoutFlow.legacyPay")}
        </button>
      </div>
    </div>
  );
}
