"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { ProductBadge } from "@/components/ProductBadge";
import { ProductSizeChart } from "@/components/ProductSizeChart";
import { useLanguage } from "@/components/LanguageContext";
import { formatMoney } from "@/lib/format-price";
import { extractDiscountLabel } from "@/lib/pricing";
import type { SizeChart } from "@/lib/size-chart";
type ImageRow = {
  id: string;
  url: string;
  altPl: string | null;
  altEn: string | null;
  isPrimary: boolean;
};

type ProductPageViewProps = {
  product: {
    id: string;
    namePl: string;
    nameEn: string;
    slug: string;
    descriptionPl: string | null;
    descriptionEn: string | null;
    stock: number;
    sizes: string[];
    colors: string[];
    sizeChart: SizeChart | null;
    createdAt: string;
    category: { slug: string; namePl: string; nameEn: string };
    images: ImageRow[];
    discounts: Array<{ type: string; value: unknown; namePl?: string | null }>;
  };
  pricing: {
    originalPricePln: number;
    finalPricePln: number;
    originalPriceEur: number;
    finalPriceEur: number;
    hasDiscount: boolean;
  };
};

export function ProductPageView({ product, pricing }: ProductPageViewProps) {
  const { locale, t, messages } = useLanguage();
  const name =
    locale === "en" && product.nameEn?.trim()
      ? product.nameEn
      : product.namePl;
  const description =
    locale === "en" && product.descriptionEn?.trim()
      ? product.descriptionEn
      : product.descriptionPl;
  const catName =
    locale === "en" && product.category.nameEn?.trim()
      ? product.category.nameEn
      : product.category.namePl;

  const discountLabelPl = extractDiscountLabel(product.discounts, "PLN");
  const discountLabelEn = extractDiscountLabel(product.discounts, "EUR");
  const discountLabel =
    locale === "en" ? discountLabelEn ?? discountLabelPl : discountLabelPl;

  const orig =
    locale === "en" ? pricing.originalPriceEur : pricing.originalPricePln;
  const fin =
    locale === "en" ? pricing.finalPriceEur : pricing.finalPricePln;

  return (
    <div className="px-6 pt-24 pb-16 max-w-6xl mx-auto bg-white">
      <nav className="mb-16">
        <div className="flex items-center gap-2 text-xs text-[#C1A88C]/60">
          <Link href="/shop" className="hover:text-[#C1A88C] transition-colors">
            {t("product.shopCrumb")}
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <Link
            href={`/shop/${product.category.slug}`}
            className="hover:text-[#C1A88C] transition-colors"
          >
            {catName.toUpperCase()}
          </Link>
          <span className="text-[#C1A88C]/40">|</span>
          <span className="text-[#C1A88C]/60">{name.toUpperCase()}</span>
        </div>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="w-full relative">
          <ProductBadge
            createdAt={product.createdAt}
            stock={product.stock}
            hasPriceReduction={pricing.hasDiscount}
            discountLabel={discountLabel}
          />
          <div className="absolute top-3 right-3 z-10">
            <WishlistButton
              productId={product.id}
              size="md"
              className="bg-white/60 backdrop-blur-sm shadow-sm"
            />
          </div>
          <div className="max-h-[80vh] overflow-hidden">
            <ProductGallery
              images={product.images}
              productName={name}
              locale={locale}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-sm uppercase tracking-widest font-serif mb-3 text-center md:text-left text-black">
            {name.toUpperCase()}
          </h1>

          <div className="mb-8 text-center md:text-left">
            {pricing.hasDiscount ? (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="text-xs text-black/40 line-through uppercase tracking-widest">
                  {formatMoney(orig, locale)}
                </span>
                <span className="text-xs text-[#C1A88C] font-semibold uppercase tracking-widest">
                  {formatMoney(fin, locale)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-black/60 uppercase tracking-widest">
                {formatMoney(fin, locale)}
              </p>
            )}
          </div>

          {description && (
            <p className="text-sm text-black/60 mb-8 leading-relaxed whitespace-pre-wrap text-center md:text-left">
              {description}
            </p>
          )}

          {product.sizeChart && product.sizeChart.rows.length > 0 && (
            <div className="mb-8 flex justify-center md:justify-start">
              <ProductSizeChart
                labels={messages.sizeChart}
                columns={product.sizeChart.columns.map((column) => ({
                  id: column.id,
                  label:
                    locale === "en" && column.labelEn.trim()
                      ? column.labelEn
                      : column.labelPl,
                }))}
                rows={product.sizeChart.rows}
                allowInches={locale === "en"}
              />
            </div>
          )}

          <div className="mt-auto">
            <AddToCartButton
              productId={product.id}
              name={name}
              namePl={product.namePl}
              nameEn={product.nameEn}
              price={pricing.finalPricePln}
              priceEur={pricing.finalPriceEur}
              originalPricePln={pricing.originalPricePln}
              originalPriceEur={pricing.originalPriceEur}
              stock={product.stock}
              sizes={product.sizes}
              colors={product.colors}
              slug={product.slug}
              categorySlug={product.category.slug}
              i18n={messages.product}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
