"use client";

import { useLanguage } from "@/components/LanguageContext";

type Discount = {
  code: string;
  namePl: string | null;
  type: string;
  value: unknown;
};

export function ShopBanner({ discount }: { discount: Discount | null }) {
  const { t } = useLanguage();

  if (!discount) return null;

  const label = discount.namePl?.trim() || "";
  const val = Number(discount.value);
  const discountText =
    discount.type === "PERCENTAGE" ? `-${val}%` : `-${val.toFixed(0)} PLN`;

  const mainText = label || discountText;
  const codeText = `${t("shop.codePrefix")} ${discount.code.toUpperCase()}`;

  return (
    <div className="w-full bg-[#EDE3DF] py-4 md:py-5 px-6">
      <p className="hidden md:block text-center uppercase tracking-[0.2em] text-black/80 text-base lg:text-lg font-medium">
        {mainText} · {codeText}
      </p>
      <div className="flex flex-col items-center gap-0.5 md:hidden">
        <span className="uppercase tracking-[0.2em] text-black/80 text-sm font-medium">
          {mainText}
        </span>
        <span className="uppercase tracking-[0.15em] text-black/60 text-xs">
          {codeText}
        </span>
      </div>
    </div>
  );
}
