"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCart, getCartItemName } from "@/components/CartContext";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
import { Tag } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import {
  cartSubtotals,
  formatCheckoutMoney,
  plnToEurUsingRatio,
} from "@/lib/checkout-currency";
import {
  SHIPPING_COUNTRIES,
  destinationCountry,
  isPolandCountry,
  shippingPricePln,
} from "@/lib/shipping-countries";

type ShippingFormData = {
  fullName: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  shippingMethod: "courier" | "parcel_locker";

  // Faktura VAT
  wantInvoice: boolean;
  companyName: string;
  vatNumber: string;
  companyStreet: string;
  companyPostalCode: string;
  companyCity: string;

  // Inny adres dostawy
  differentShipping: boolean;
  altFullName: string;
  altStreet: string;
  altPostalCode: string;
  altCity: string;
  altCountry: string;
  altPhone: string;
};

type SelectedLocker = {
  code: string;
  address: string;
  city: string;
  postalCode: string;
};

/* ────────── Checkbox komponent ────────── */
function StyledCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label 
      className="flex items-center gap-3 cursor-pointer group select-none"
      onClick={() => onChange(!checked)}
      >
      <span
        className={`relative w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${
          checked
            ? "bg-[#C1A88C] border-[#C1A88C]"
            : "border-neutral-300 bg-white group-hover:border-[#C1A88C]/60"
        }`}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}

/* ────────── Reusable input styles ────────── */
const inputBase =
  "w-full px-4 py-2.5 text-sm border bg-white text-neutral-700 placeholder:text-neutral-300 focus:outline-none transition-colors";
const inputOk = "border-[#E8E3D8] focus:border-[#C1A88C]";
const inputErr = "border-red-300 focus:border-red-400";

function polishPostalDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function formatPolishPostal(value: string) {
  const digits = polishPostalDigits(value);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function isPolishPostal(value: string) {
  return polishPostalDigits(value).length === 5;
}

export default function ShippingPage() {
  const router = useRouter();
  const { items } = useCart();
  const { data: session } = useSession();
  const { locale, t } = useLanguage();
  const [isReady, setIsReady] = useState(false);

  const SHIPPING_METHODS = useMemo(
    () => [
      {
        id: "courier" as const,
        label: t("checkoutFlow.courierLabel"),
        description: t("checkoutFlow.courierDesc"),
      },
      {
        id: "parcel_locker" as const,
        label: t("checkoutFlow.lockerLabel"),
        description: t("checkoutFlow.lockerDesc"),
      },
    ],
    [t]
  );

  // Paczkomat
  const [selectedLocker, setSelectedLocker] = useState<SelectedLocker | null>(
    null
  );
  const [showGeowidget, setShowGeowidget] = useState(false);
  const [lockerError, setLockerError] = useState<string | null>(null);
  const geowidgetRef = useRef<HTMLDivElement>(null);

  // Zgoda na regulamin
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  // Rabat z koszyka
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      street: "",
      postalCode: "",
      city: "",
      country: "PL",
      phone: "",
      shippingMethod: "courier",
      wantInvoice: false,
      companyName: "",
      vatNumber: "",
      companyStreet: "",
      companyPostalCode: "",
      companyCity: "",
      differentShipping: false,
      altFullName: "",
      altStreet: "",
      altPostalCode: "",
      altCity: "",
      altCountry: "PL",
      altPhone: "",
    },
  });

  // Globalny callback dla InPost Geowidget
  useEffect(() => {
    (window as any).__inpostPointSelected = (point: any) => {
      const addr = point.address_details || {};
      const street = addr.street
        ? `${addr.street} ${addr.building_number || ""}`.trim()
        : point.address?.line1 || "";

      setSelectedLocker({
        code: point.name,
        address: street,
        city: addr.city || "",
        postalCode: addr.post_code || "",
      });
      setLockerError(null);
      setShowGeowidget(false);
    };

    return () => {
      delete (window as any).__inpostPointSelected;
    };
  }, []);

  // Załaduj zapisane dane z localStorage + dane sesji
  useEffect(() => {
    const saved = localStorage.getItem("syrenah_shipping");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setValue("fullName", parsed.fullName);
        if (parsed.email) setValue("email", parsed.email);
        if (parsed.street) setValue("street", parsed.street);
        if (parsed.postalCode) setValue("postalCode", parsed.postalCode);
        if (parsed.city) setValue("city", parsed.city);
        if (parsed.country) setValue("country", parsed.country);
        if (parsed.phone) setValue("phone", parsed.phone);
        if (parsed.shippingMethod)
          setValue("shippingMethod", parsed.shippingMethod);

        // Invoice
        if (parsed.wantInvoice) setValue("wantInvoice", true);
        if (parsed.companyName) setValue("companyName", parsed.companyName);
        if (parsed.vatNumber) setValue("vatNumber", parsed.vatNumber);
        if (parsed.companyStreet)
          setValue("companyStreet", parsed.companyStreet);
        if (parsed.companyPostalCode)
          setValue("companyPostalCode", parsed.companyPostalCode);
        if (parsed.companyCity) setValue("companyCity", parsed.companyCity);

        // Alternate shipping
        if (parsed.differentShipping) setValue("differentShipping", true);
        if (parsed.altFullName) setValue("altFullName", parsed.altFullName);
        if (parsed.altStreet) setValue("altStreet", parsed.altStreet);
        if (parsed.altPostalCode)
          setValue("altPostalCode", parsed.altPostalCode);
        if (parsed.altCity) setValue("altCity", parsed.altCity);
        if (parsed.altCountry) setValue("altCountry", parsed.altCountry);
        if (parsed.altPhone) setValue("altPhone", parsed.altPhone);

        // Odtwórz dane paczkomatu
        if (parsed.parcelLockerCode) {
          setSelectedLocker({
            code: parsed.parcelLockerCode,
            address: parsed.parcelLockerAddress || "",
            city: parsed.parcelLockerCity || "",
            postalCode: parsed.parcelLockerPostalCode || "",
          });
        }
      } catch {
        // ignoruj
      }
    }

    // Uzupełnij dane z sesji, jeśli pola są puste
    if (session?.user) {
      const current = localStorage.getItem("syrenah_shipping");
      const parsed = current ? JSON.parse(current) : {};
      if (!parsed.fullName && session.user.name) {
        setValue("fullName", session.user.name);
      }
      if (!parsed.email && session.user.email) {
        setValue("email", session.user.email);
      }
    }

    // Załaduj kod rabatowy z localStorage
    const discountSaved = localStorage.getItem("syrenah_discount_code");
    if (discountSaved) {
      try {
        setAppliedDiscount(JSON.parse(discountSaved));
      } catch {
        // ignore
      }
    }

    setIsReady(true);
  }, [session, setValue]);

  const selectedMethod = watch("shippingMethod");
  const wantInvoice = watch("wantInvoice");
  const differentShipping = watch("differentShipping");
  const country = watch("country");
  const altCountry = watch("altCountry");
  const shipsToPoland = isPolandCountry(country);
  const altShipsToPoland = isPolandCountry(altCountry);
  const deliveryCountry = destinationCountry({
    country,
    differentShipping,
    altCountry,
  });
  const destinationIsPoland = isPolandCountry(deliveryCountry);

  useEffect(() => {
    if (!destinationIsPoland && selectedMethod === "parcel_locker") {
      setValue("shippingMethod", "courier");
    }
  }, [destinationIsPoland, selectedMethod, setValue]);

  const { subPln: subtotal, subEur: subtotalEur, canUseEur } =
    cartSubtotals(items);

  const methodPrice = (methodId: string) =>
    shippingPricePln(methodId, deliveryCountry);

  const shippingCost = methodPrice(selectedMethod);

  const shippingEur =
    canUseEur && subtotal > 0
      ? plnToEurUsingRatio(shippingCost, subtotal, subtotalEur)
      : null;

  // Rabat
  const hasCartDiscount =
    appliedDiscount && appliedDiscount.discountAmount > 0;
  const totalAfterCartDiscount = hasCartDiscount
    ? appliedDiscount.totalAfterDiscount
    : subtotal;
  const effectiveProductTotal = Math.min(subtotal, totalAfterCartDiscount);
  const effectiveDiscount = subtotal - effectiveProductTotal;
  const total = effectiveProductTotal + shippingCost;

  const effectiveDiscountEur =
    canUseEur && subtotal > 0
      ? Math.round(
          (effectiveDiscount * (subtotalEur / subtotal)) * 100
        ) / 100
      : null;

  const totalEurDisplay =
    canUseEur && subtotal > 0
      ? Math.round(
          (effectiveProductTotal * (subtotalEur / subtotal) +
            (shippingEur ?? 0)) *
            100
        ) / 100
      : null;

  // Pusty koszyk — wróć
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FDFBF7]">
        <h1 className="font-serif text-xl text-neutral-800 mb-3">
          {t("checkoutFlow.emptyCartTitle")}
        </h1>
        <p className="text-xs text-neutral-400 mb-8">
          {t("checkoutFlow.emptyCartHint")}
        </p>
        <Link
          href="/shop"
          className="border border-neutral-900 px-8 py-3 text-xs uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          {t("checkoutFlow.backToShop")}
        </Link>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-5 h-5 border border-[#C1A88C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const onSubmit = (data: ShippingFormData) => {
    // Walidacja regulaminu
    if (!acceptTerms) {
      setTermsError(true);
      return;
    }
    setTermsError(false);

    // Walidacja paczkomatu
    if (data.shippingMethod === "parcel_locker" && !selectedLocker) {
      setLockerError(t("checkoutFlow.pickLockerFirst"));
      return;
    }

    // Zapisz dane z paczkomat info
    const payload: Record<string, any> = { ...data };

    if (data.shippingMethod === "parcel_locker" && selectedLocker) {
      payload.parcelLockerCode = selectedLocker.code;
      payload.parcelLockerAddress = selectedLocker.address;
      payload.parcelLockerCity = selectedLocker.city;
      payload.parcelLockerPostalCode = selectedLocker.postalCode;
    }

    localStorage.setItem("syrenah_shipping", JSON.stringify(payload));
    router.push("/checkout/review");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-8 h-8 rounded-full bg-[#C1A88C]/30 text-[#C1A88C] flex items-center justify-center text-xs font-medium">
            ✓
          </span>
          <div className="w-8 h-px bg-[#C1A88C]" />
          <span className="w-8 h-8 rounded-full bg-[#C1A88C] text-white flex items-center justify-center text-xs font-medium">
            2
          </span>
          <div className="w-8 h-px bg-neutral-300" />
          <span className="w-8 h-8 rounded-full border border-neutral-300 text-neutral-400 flex items-center justify-center text-xs">
            3
          </span>
        </div>

        {/* Nagłówek */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl text-neutral-800 mb-2">
            {t("checkoutFlow.shippingTitle")}
          </h1>
          <p className="text-xs text-neutral-400">
            {t("checkoutFlow.shippingSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-[1fr_320px] gap-10">
            {/* Lewa kolumna — formularz */}
            <div className="space-y-5">
              {/* Imię i Nazwisko */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                >
                  {t("checkoutFlow.fullName")}
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder={t("checkoutFlow.phFullName")}
                  className={`${inputBase} ${
                    errors.fullName ? inputErr : inputOk
                  }`}
                  {...register("fullName", {
                    required: t("checkoutValidation.fullNameRequired"),
                    minLength: {
                      value: 3,
                      message: t("checkoutValidation.fullNameMin"),
                    },
                  })}
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                >
                  {t("checkoutFlow.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("checkoutFlow.phEmail")}
                  className={`${inputBase} ${
                    errors.email ? inputErr : inputOk
                  }`}
                  {...register("email", {
                    required: t("checkoutValidation.emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("checkoutValidation.emailInvalid"),
                    },
                  })}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Telefon */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                >
                  {t("checkoutFlow.phone")}
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t("checkoutFlow.phPhone")}
                  className={`${inputBase} ${
                    errors.phone ? inputErr : inputOk
                  }`}
                  {...register("phone", {
                    required: t("checkoutValidation.phoneRequired"),
                    pattern: {
                      value: /^[\d\s\-+()]{7,15}$/,
                      message: t("checkoutValidation.phoneInvalid"),
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Adres dostawy */}
              <div className="space-y-5 pt-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  {t("checkoutFlow.addressHeading")}
                </p>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                  >
                    {t("checkoutFlow.country")}
                  </label>
                  <select
                    id="country"
                    autoComplete="country"
                    className={`${inputBase} ${
                      errors.country ? inputErr : inputOk
                    }`}
                    {...register("country", {
                      required: t("checkoutValidation.countryRequired"),
                    })}
                  >
                    {SHIPPING_COUNTRIES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {locale === "en" ? item.en : item.pl}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="street"
                    className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                  >
                    {t("checkoutFlow.street")}
                  </label>
                  <input
                    id="street"
                    type="text"
                    autoComplete="street-address"
                    placeholder={t("checkoutFlow.phStreet")}
                    className={`${inputBase} ${
                      errors.street ? inputErr : inputOk
                    }`}
                    {...register("street", {
                      required: t("checkoutValidation.streetRequired"),
                      minLength: {
                        value: 3,
                        message: t("checkoutValidation.streetMin"),
                      },
                    })}
                  />
                  {errors.street && (
                    <p className="mt-1.5 text-xs text-red-400">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4">
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                    >
                      {t("checkoutFlow.postalCode")}
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder={
                        shipsToPoland ? t("checkoutFlow.phPostalCode") : ""
                      }
                      className={`${inputBase} ${
                        errors.postalCode ? inputErr : inputOk
                      }`}
                        {...register("postalCode", {
                        required: t("checkoutValidation.postalRequired"),
                        onChange: (event) => {
                          if (!shipsToPoland) return;
                          const formatted = formatPolishPostal(
                            event.target.value
                          );
                          if (formatted !== event.target.value) {
                            setValue("postalCode", formatted);
                          }
                        },
                        ...(shipsToPoland
                          ? {
                              validate: (value) =>
                                isPolishPostal(value) ||
                                t("checkoutValidation.postalFormat"),
                            }
                          : {
                              minLength: {
                                value: 2,
                                message: t("checkoutValidation.postalMin"),
                              },
                            }),
                      })}
                    />
                    {errors.postalCode && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                    >
                      {t("checkoutFlow.city")}
                    </label>
                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder={t("checkoutFlow.phCity")}
                      className={`${inputBase} ${
                        errors.city ? inputErr : inputOk
                      }`}
                      {...register("city", {
                        required: t("checkoutValidation.cityRequired"),
                        minLength: {
                          value: 2,
                          message: t("checkoutValidation.cityMin"),
                        },
                      })}
                    />
                    {errors.city && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Metoda dostawy */}
              <div className="pt-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  {t("checkoutFlow.shippingMethodHeading")}
                </p>
                <div className="space-y-3">
                  {SHIPPING_METHODS.filter(
                    (method) =>
                      method.id !== "parcel_locker" || destinationIsPoland
                  ).map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? "border-[#C1A88C] bg-[#C1A88C]/5"
                          : "border-[#E8E3D8] bg-white hover:border-neutral-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        className="sr-only"
                        {...register("shippingMethod")}
                      />
                      {/* Custom radio */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedMethod === method.id
                            ? "border-[#C1A88C]"
                            : "border-neutral-300"
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-[#C1A88C]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-800 font-medium">
                          {method.label}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {method.description}
                        </p>
                      </div>
                      <span className="text-sm font-serif text-neutral-700">
                        {formatCheckoutMoney(
                          methodPrice(method.id),
                          canUseEur && subtotal > 0
                            ? plnToEurUsingRatio(
                                methodPrice(method.id),
                                subtotal,
                                subtotalEur
                              )
                            : null,
                          locale
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Wybór paczkomatu — tylko dla paczkomat */}
              {selectedMethod === "parcel_locker" && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    {t("checkoutFlow.lockerSelectedTitle")}
                  </p>

                  {selectedLocker ? (
                    <div className="border border-[#C1A88C] bg-[#C1A88C]/5 p-4 flex items-start gap-3">
                      {/* Ikona paczkomatu */}
                      <div className="flex-shrink-0 w-10 h-10 bg-[#C1A88C]/20 rounded flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#C1A88C]"
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
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-800">
                          {selectedLocker.code}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {selectedLocker.address}
                          {selectedLocker.city &&
                            `, ${selectedLocker.postalCode} ${selectedLocker.city}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGeowidget(true)}
                        className="text-xs text-[#C1A88C] hover:text-[#B09A7C] underline underline-offset-2 transition-colors flex-shrink-0"
                      >
                        {t("checkoutFlow.change")}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLockerError(null);
                        setShowGeowidget(true);
                      }}
                      className="w-full border-2 border-dashed border-[#C1A88C]/40 bg-[#C1A88C]/5 p-5 flex flex-col items-center gap-2 hover:border-[#C1A88C] hover:bg-[#C1A88C]/10 transition-all group"
                    >
                      <svg
                        className="w-6 h-6 text-[#C1A88C] group-hover:scale-110 transition-transform"
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
                      <span className="text-sm font-medium text-[#C1A88C]">
                        {t("checkoutFlow.lockerPickTitle")}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {t("checkoutFlow.lockerMapHint")}
                      </span>
                    </button>
                  )}

                  {lockerError && (
                    <p className="text-xs text-red-400">{lockerError}</p>
                  )}
                </div>
              )}

              {/* ──────────── Faktura VAT ──────────── */}
              <div className="pt-6 border-t border-[#E8E3D8]">
                <StyledCheckbox
                  checked={wantInvoice}
                  onChange={(v) => setValue("wantInvoice", v)}
                  label={t("checkoutFlow.wantInvoice")}
                />

                {wantInvoice && (
                  <div className="mt-5 space-y-4 pl-8 border-l-2 border-[#C1A88C]/30">
                    {/* Nazwa firmy */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.companyName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("checkoutFlow.phCompanyName")}
                        className={`${inputBase} ${
                          errors.companyName ? inputErr : inputOk
                        }`}
                        {...register("companyName", {
                          required: wantInvoice
                            ? t("checkoutValidation.companyNameRequired")
                            : false,
                        })}
                      />
                      {errors.companyName && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    {/* NIP */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.vatNumberField")}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={t("checkoutFlow.phVatNumber")}
                        className={`${inputBase} ${
                          errors.vatNumber ? inputErr : inputOk
                        }`}
                        {...register("vatNumber", {
                          required: wantInvoice
                            ? t("checkoutValidation.vatRequired")
                            : false,
                          pattern: {
                            value: /^[\d\-]{10,13}$/,
                            message: t("checkoutValidation.vatInvalid"),
                          },
                        })}
                      />
                      {errors.vatNumber && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.vatNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Adres firmy — ulica */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.companyAddress")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("checkoutFlow.phCompanyStreet")}
                        className={`${inputBase} ${
                          errors.companyStreet ? inputErr : inputOk
                        }`}
                        {...register("companyStreet", {
                          required: wantInvoice
                            ? t("checkoutValidation.companyStreetRequired")
                            : false,
                        })}
                      />
                      {errors.companyStreet && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.companyStreet.message}
                        </p>
                      )}
                    </div>

                    {/* Kod + Miasto firmy */}
                    <div className="grid grid-cols-[140px_1fr] gap-4">
                      <div>
                        <label
                          htmlFor="companyPostalCode"
                          className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                        >
                          {t("checkoutFlow.postalCode")}
                        </label>
                        <input
                          id="companyPostalCode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder={t("checkoutFlow.phPostalCode")}
                          className={`${inputBase} ${
                            errors.companyPostalCode ? inputErr : inputOk
                          }`}
                          {...register("companyPostalCode", {
                            required: wantInvoice
                              ? t("checkoutValidation.companyPostalRequired")
                              : false,
                            validate: (value) =>
                              !wantInvoice ||
                              !value ||
                              isPolishPostal(value) ||
                              t("checkoutValidation.postalFormat"),
                            onChange: (event) => {
                              const formatted = formatPolishPostal(
                                event.target.value
                              );
                              if (formatted !== event.target.value) {
                                setValue("companyPostalCode", formatted);
                              }
                            },
                          })}
                        />
                        {errors.companyPostalCode && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.companyPostalCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                          {t("checkoutFlow.city")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("checkoutFlow.phCity")}
                          className={`${inputBase} ${
                            errors.companyCity ? inputErr : inputOk
                          }`}
                          {...register("companyCity", {
                            required: wantInvoice
                              ? t("checkoutValidation.companyCityRequired")
                              : false,
                          })}
                        />
                        {errors.companyCity && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.companyCity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────── Inny adres dostawy ──────────── */}
              <div className="pt-4 border-t border-[#E8E3D8]">
                <StyledCheckbox
                  checked={differentShipping}
                  onChange={(v) => setValue("differentShipping", v)}
                  label={t("checkoutFlow.differentShipping")}
                />

                {differentShipping && (
                  <div className="mt-5 space-y-4 pl-8 border-l-2 border-[#C1A88C]/30">
                    {/* Imię i Nazwisko odbiorcy */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.receiverName")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("checkoutFlow.phReceiverName")}
                        className={`${inputBase} ${
                          errors.altFullName ? inputErr : inputOk
                        }`}
                        {...register("altFullName", {
                          required: differentShipping
                            ? t("checkoutValidation.altNameRequired")
                            : false,
                        })}
                      />
                      {errors.altFullName && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.altFullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.country")}
                      </label>
                      <select
                        autoComplete="country"
                        className={`${inputBase} ${
                          errors.altCountry ? inputErr : inputOk
                        }`}
                        {...register("altCountry", {
                          required: differentShipping
                            ? t("checkoutValidation.countryRequired")
                            : false,
                        })}
                      >
                        {SHIPPING_COUNTRIES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {locale === "en" ? item.en : item.pl}
                          </option>
                        ))}
                      </select>
                      {errors.altCountry && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.altCountry.message}
                        </p>
                      )}
                    </div>

                    {/* Ulica */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        {t("checkoutFlow.street")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("checkoutFlow.phAltStreet")}
                        className={`${inputBase} ${
                          errors.altStreet ? inputErr : inputOk
                        }`}
                        {...register("altStreet", {
                          required: differentShipping
                            ? t("checkoutValidation.altStreetRequired")
                            : false,
                        })}
                      />
                      {errors.altStreet && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.altStreet.message}
                        </p>
                      )}
                    </div>

                    {/* Kod + Miasto */}
                    <div className="grid grid-cols-[140px_1fr] gap-4">
                      <div>
                        <label
                          htmlFor="altPostalCode"
                          className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                        >
                          {t("checkoutFlow.postalCode")}
                        </label>
                        <input
                          id="altPostalCode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder={
                            altShipsToPoland
                              ? t("checkoutFlow.phPostalCode")
                              : ""
                          }
                          className={`${inputBase} ${
                            errors.altPostalCode ? inputErr : inputOk
                          }`}
                          {...register("altPostalCode", {
                            required: differentShipping
                              ? t("checkoutValidation.altPostalRequired")
                              : false,
                            onChange: (event) => {
                              if (!altShipsToPoland) return;
                              const formatted = formatPolishPostal(
                                event.target.value
                              );
                              if (formatted !== event.target.value) {
                                setValue("altPostalCode", formatted);
                              }
                            },
                            ...(altShipsToPoland
                              ? {
                                  validate: (value: string) =>
                                    !differentShipping ||
                                    isPolishPostal(value) ||
                                    t("checkoutValidation.postalFormat"),
                                }
                              : {
                                  minLength: {
                                    value: 2,
                                    message: t("checkoutValidation.postalMin"),
                                  },
                                }),
                          })}
                        />
                        {errors.altPostalCode && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.altPostalCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                          {t("checkoutFlow.city")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("checkoutFlow.phAltCity")}
                          className={`${inputBase} ${
                            errors.altCity ? inputErr : inputOk
                          }`}
                          {...register("altCity", {
                            required: differentShipping
                              ? t("checkoutValidation.altCityRequired")
                              : false,
                          })}
                        />
                        {errors.altCity && (
                          <p className="mt-1.5 text-xs text-red-400">
                            {errors.altCity.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Telefon odbiorcy */}
                    <div>
                      <label
                        htmlFor="altPhone"
                        className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                      >
                        {t("checkoutFlow.receiverPhone")}
                      </label>
                      <input
                        id="altPhone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder={t("checkoutFlow.phAltPhone")}
                        className={`${inputBase} ${
                          errors.altPhone ? inputErr : inputOk
                        }`}
                        {...register("altPhone", {
                          pattern: {
                            value: /^[\d\s\-+()]{7,15}$/,
                            message: t("checkoutValidation.altPhoneInvalid"),
                          },
                        })}
                      />
                      {errors.altPhone && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.altPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prawa kolumna — podsumowanie */}
            <div className="md:sticky md:top-28 h-fit">
              <div className="bg-white border border-[#E8E3D8] p-6">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">
                  {t("checkoutFlow.orderSidebarTitle")}
                </h2>

                <ul className="space-y-3 mb-5">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size || ""}-${
                        item.color || ""
                      }`}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-700 truncate">
                          {getCartItemName(item, locale)}
                          {item.size && (
                            <span className="text-neutral-400">
                              {" "}
                              · {item.size}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400">
                          × {item.quantity}
                        </p>
                      </div>
                      <p className="font-serif text-neutral-700 ml-4 flex-shrink-0">
                        {formatCheckoutMoney(
                          item.price * item.quantity,
                          item.priceEur != null
                            ? item.priceEur * item.quantity
                            : null,
                          locale
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#E8E3D8] pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{t("checkoutFlow.summaryProducts")}</span>
                    <span>
                      {formatCheckoutMoney(
                        subtotal,
                        canUseEur ? subtotalEur : null,
                        locale
                      )}
                    </span>
                  </div>

                  {effectiveDiscount > 0 && appliedDiscount && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#C1A88C] flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {t("checkoutFlow.summaryDiscount")} (
                        {appliedDiscount.code})
                      </span>
                      <span className="text-[#C1A88C] font-medium">
                        -
                        {formatCheckoutMoney(
                          effectiveDiscount,
                          effectiveDiscountEur,
                          locale
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>{t("checkoutFlow.summaryShipping")}</span>
                    <span>
                      {formatCheckoutMoney(
                        shippingCost,
                        shippingEur,
                        locale
                      )}
                    </span>
                  </div>
                  <div className="border-t border-[#E8E3D8] pt-3 flex justify-between">
                    <span className="text-xs uppercase tracking-widest text-neutral-600">
                      {t("checkoutFlow.summaryTotal")}
                    </span>
                    <span className="font-serif text-lg text-neutral-800">
                      {formatCheckoutMoney(total, totalEurDisplay, locale)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Zgoda na regulamin */}
              <div className="mt-5">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <span
                    onClick={() => {
                      setAcceptTerms(!acceptTerms);
                      if (!acceptTerms) setTermsError(false);
                    }}
                    className={`relative w-5 h-5 mt-0.5 border-2 rounded-sm flex items-center justify-center transition-colors flex-shrink-0 ${
                      acceptTerms
                        ? "bg-[#C1A88C] border-[#C1A88C]"
                        : termsError
                        ? "border-red-300 bg-white"
                        : "border-neutral-300 bg-white group-hover:border-[#C1A88C]/60"
                    }`}
                  >
                    {acceptTerms && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className="text-sm text-neutral-700 leading-relaxed"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName === "A") return;
                      setAcceptTerms(!acceptTerms);
                      if (!acceptTerms) setTermsError(false);
                    }}
                  >
                    {t("checkoutFlow.termsAcceptBefore")}{" "}
                    <Link
                      href="/regulamin"
                      className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("checkoutFlow.termsStore")}
                    </Link>{" "}
                    {t("checkoutFlow.termsAnd")}{" "}
                    <Link
                      href="/polityka-prywatnosci"
                      className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("checkoutFlow.termsPrivacy")}
                    </Link>
                    .
                  </span>
                </label>
              </div>

              {/* Przycisk dalej — pod podsumowaniem */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-5 bg-[#C1A88C] text-white py-3.5 text-xs uppercase tracking-widest hover:bg-[#B09A7C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? t("common.processing")
                  : t("checkoutFlow.continueToReview")}
              </button>

              {/* Komunikat o regulaminie */}
              {termsError && (
                <p className="text-center text-xs text-red-400 mt-2">
                  {t("checkoutFlow.termsError")}
                </p>
              )}

              {/* Wróć */}
              <Link
                href="/cart"
                className="block text-center mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
              >
                {t("checkoutFlow.backToCart")}
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* ────────── Modal InPost Geowidget ────────── */}
      {showGeowidget && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowGeowidget(false)}
          />

          {/* Modal */}
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-[9999] bg-white rounded-sm shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3D8] flex-shrink-0">
              <div>
                <h2 className="font-serif text-lg text-neutral-800">
                  {t("checkoutFlow.lockerModalTitle")}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {t("checkoutFlow.lockerModalSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGeowidget(false)}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Geowidget container */}
            <div className="flex-1 relative" ref={geowidgetRef}>
              <Script
                src="https://geowidget.inpost.pl/inpost-geowidget.js"
                strategy="lazyOnload"
              />
              <link
                rel="stylesheet"
                href="https://geowidget.inpost.pl/inpost-geowidget.css"
              />
              {/* @ts-ignore — InPost Geowidget Web Component.
                  onpoint jest w widgecie tylko getterem. React przy drugim
                  wejściu próbuje go nadpisać i wywala całą stronę, więc
                  atrybut ustawiamy ręcznie. */}
              <inpost-geowidget
                ref={(node: HTMLElement | null) => {
                  node?.setAttribute("onpoint", "__inpostPointSelected");
                }}
                token={process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN || ""}
                language={locale === "en" ? "en" : "pl"}
                config="parcelCollect"
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
