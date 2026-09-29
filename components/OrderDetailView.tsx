"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageContext";
import { formatCheckoutMoney } from "@/lib/checkout-currency";

export type OrderDetailSerializable = {
  id: string;
  status: string;
  createdAt: string;
  totalPln: number;
  totalEur: number;
  items: Array<{
    id: string;
    quantity: number;
    pricePln: number;
    priceEur: number;
    product: {
      namePl: string;
      nameEn: string;
      images: { url: string }[];
    };
  }>;
};

function getTimelineProgress(status: string): {
  currentStep: number;
  completedSteps: number;
} {
  const TIMELINE_STEPS = [
    { statuses: ["PENDING"] },
    { statuses: ["PAID", "PROCESSING"] },
    { statuses: ["SHIPPED"] },
    { statuses: ["DELIVERED"] },
  ];

  let currentStep = 0;
  let completedSteps = 0;

  if (status === "PAID") {
    return { currentStep: 1, completedSteps: 2 };
  }

  for (let i = 0; i < TIMELINE_STEPS.length; i++) {
    if (TIMELINE_STEPS[i].statuses.includes(status)) {
      currentStep = i;
      completedSteps = i + 1;
      break;
    }
    if (i < TIMELINE_STEPS.length - 1) {
      completedSteps = i + 1;
    }
  }

  if (["CANCELLED", "FAILED", "REFUNDED"].includes(status)) {
    return { currentStep: -1, completedSteps: 0 };
  }

  return { currentStep, completedSteps };
}

export function OrderDetailView({ order }: { order: OrderDetailSerializable }) {
  const { locale, t } = useLanguage();
  const { currentStep, completedSteps } = getTimelineProgress(order.status);
  const showTimeline = currentStep >= 0;

  const statusKey = `orderDetail.status.${order.status}`;
  const statusText = t(statusKey) || order.status;

  const timelineLabels = [
    t("orderDetail.timeline.placed"),
    t("orderDetail.timeline.paid"),
    t("orderDetail.timeline.shipped"),
    t("orderDetail.timeline.delivered"),
  ];

  const dateStr = new Date(order.createdAt).toLocaleDateString(
    locale === "en" ? "en-GB" : "pl-PL",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const grandTotal = formatCheckoutMoney(
    order.totalPln,
    locale === "en" ? order.totalEur : null,
    locale
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-12 text-center">
          <h1 className="text-sm md:text-base font-serif mb-3 tracking-widest text-neutral-600 uppercase">
            {t("orderDetail.orderLabel")}{" "}
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs md:text-sm text-neutral-500">
            {t("orderDetail.placedOn")} {dateStr}
          </p>
        </div>

        <div className="mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-playfair text-black">
            {statusText}
          </h2>
        </div>

        <div className="border-b border-neutral-300 mb-12" />

        {showTimeline && (
          <div className="mb-16">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              <div className="absolute top-2.5 left-0 right-0 h-px bg-neutral-300 z-0">
                <div
                  className="h-full bg-neutral-400 transition-all duration-500"
                  style={{
                    width: `${(completedSteps / timelineLabels.length) * 100}%`,
                  }}
                />
              </div>

              {timelineLabels.map((label, index) => {
                const isCompleted = index < completedSteps;
                const isCurrent = index === currentStep;
                const isPast = index < currentStep;
                const shouldShowCheckmark =
                  isPast || (order.status === "PAID" && index < 2);

                return (
                  <div
                    key={label}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border transition-all ${
                        isCompleted
                          ? "bg-neutral-50 border-neutral-400 text-neutral-600"
                          : isCurrent
                            ? "bg-neutral-50 border-neutral-300 text-neutral-500"
                            : "bg-neutral-50 border-neutral-200 text-neutral-300"
                      }`}
                    >
                      {shouldShowCheckmark ? (
                        <svg
                          className="w-2.5 h-2.5 md:w-3 md:h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="text-[9px] md:text-[10px] font-medium text-neutral-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1.5 md:mt-2 text-[9px] md:text-[10px] font-medium uppercase tracking-wide ${
                        isCompleted || isCurrent
                          ? "text-neutral-700"
                          : "text-neutral-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-12 max-w-2xl mx-auto">
          <h2 className="text-sm md:text-base font-serif mb-8 text-center uppercase tracking-widest text-neutral-600">
            {t("orderDetail.productsHeading")}
          </h2>
          <div className="space-y-8">
            {order.items.map((item) => {
              const productImage = item.product.images[0]?.url;
              const name =
                locale === "en" ? item.product.nameEn : item.product.namePl;
              const lineTotalPln = item.pricePln * item.quantity;
              const lineTotalEur = item.priceEur * item.quantity;
              const lineStr = formatCheckoutMoney(
                lineTotalPln,
                locale === "en" ? lineTotalEur : null,
                locale
              );

              return (
                <div
                  key={item.id}
                  className="flex gap-6 pb-8 border-b border-neutral-300 last:border-0"
                >
                  <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-neutral-100 relative">
                    {productImage ? (
                      <Image
                        src={productImage}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-base md:text-lg mb-1 text-neutral-900">
                        {name}
                      </h3>
                      <p className="text-xs md:text-sm text-neutral-500">
                        {t("orderDetail.quantity")} {item.quantity}
                      </p>
                    </div>
                    <p className="text-base md:text-lg font-medium text-neutral-900">
                      {lineStr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-neutral-300 pt-8 max-w-2xl mx-auto">
          <div className="flex justify-between items-center text-base md:text-lg font-serif">
            <span className="uppercase tracking-wide text-neutral-700">
              {t("orderDetail.grandTotal")}
            </span>
            <span className="text-xl md:text-2xl text-neutral-900">
              {grandTotal}
            </span>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-block border border-neutral-400 bg-transparent px-8 py-3 text-xs md:text-sm uppercase tracking-widest text-neutral-700 hover:bg-neutral-800 hover:text-white hover:border-neutral-800 transition"
          >
            {t("orderDetail.backToShop")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OrderNotFoundView() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl md:text-4xl font-serif mb-4">
        {t("orderDetail.notFoundTitle")}
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        {t("orderDetail.notFoundBody")}
      </p>
      <Link
        href="/shop"
        className="inline-block border border-black bg-transparent px-8 py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition"
      >
        {t("orderDetail.backToShop")}
      </Link>
    </div>
  );
}
