"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { Tag } from "lucide-react";

type ShippingFormData = {
  fullName: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
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
  altPhone: string;
};

type SelectedLocker = {
  code: string;
  address: string;
  city: string;
  postalCode: string;
};

const SHIPPING_METHODS = [
  {
    id: "courier" as const,
    label: "Kurier",
    description: "Dostawa pod drzwi w 1–2 dni robocze",
    price: 15,
  },
  {
    id: "parcel_locker" as const,
    label: "Paczkomat",
    description: "Odbiór w wybranym paczkomacie 24/7",
    price: 10,
  },
];

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

export default function ShippingPage() {
  const router = useRouter();
  const { items } = useCart();
  const { data: session } = useSession();
  const [isReady, setIsReady] = useState(false);

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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost =
    SHIPPING_METHODS.find((m) => m.id === selectedMethod)?.price ?? 15;

  // Rabat
  const hasCartDiscount =
    appliedDiscount && appliedDiscount.discountAmount > 0;
  const totalAfterCartDiscount = hasCartDiscount
    ? appliedDiscount.totalAfterDiscount
    : subtotal;
  const effectiveProductTotal = Math.min(subtotal, totalAfterCartDiscount);
  const effectiveDiscount = subtotal - effectiveProductTotal;
  const total = effectiveProductTotal + shippingCost;

  // Pusty koszyk — wróć
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
      setLockerError("Wybierz paczkomat przed kontynuacją");
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
            Dane dostawy
          </h1>
          <p className="text-xs text-neutral-400">
            Podaj adres, na który wyślemy Twoje zamówienie.
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
                  Imię i nazwisko
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Anna Kowalska"
                  className={`${inputBase} ${
                    errors.fullName ? inputErr : inputOk
                  }`}
                  {...register("fullName", {
                    required: "Imię i nazwisko jest wymagane",
                    minLength: {
                      value: 3,
                      message: "Minimum 3 znaki",
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
                  Adres email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="anna@example.com"
                  className={`${inputBase} ${
                    errors.email ? inputErr : inputOk
                  }`}
                  {...register("email", {
                    required: "Email jest wymagany",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Nieprawidłowy adres email",
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
                  Numer telefonu
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="600 123 456"
                  className={`${inputBase} ${
                    errors.phone ? inputErr : inputOk
                  }`}
                  {...register("phone", {
                    required: "Numer telefonu jest wymagany",
                    pattern: {
                      value: /^[\d\s\-+()]{7,15}$/,
                      message: "Nieprawidłowy numer telefonu",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Metoda dostawy */}
              <div className="pt-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                  Metoda dostawy
                </p>
                <div className="space-y-3">
                  {SHIPPING_METHODS.map((method) => (
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
                        {method.price.toFixed(2)} zł
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pola adresowe — tylko dla kuriera */}
              {selectedMethod === "courier" && (
                <div className="space-y-5 pt-2">
                  {/* Ulica */}
                  <div>
                    <label
                      htmlFor="street"
                      className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                    >
                      Ulica i numer
                    </label>
                    <input
                      id="street"
                      type="text"
                      autoComplete="street-address"
                      placeholder="ul. Marszałkowska 1/2"
                      className={`${inputBase} ${
                        errors.street ? inputErr : inputOk
                      }`}
                      {...register("street", {
                        required:
                          selectedMethod === "courier"
                            ? "Ulica jest wymagana"
                            : false,
                        minLength: {
                          value: 3,
                          message: "Minimum 3 znaki",
                        },
                      })}
                    />
                    {errors.street && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Kod pocztowy + Miasto */}
                  <div className="grid grid-cols-[140px_1fr] gap-4">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
                      >
                        Kod pocztowy
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="00-001"
                        className={`${inputBase} ${
                          errors.postalCode ? inputErr : inputOk
                        }`}
                        {...register("postalCode", {
                          required:
                            selectedMethod === "courier"
                              ? "Kod pocztowy jest wymagany"
                              : false,
                          pattern: {
                            value: /^\d{2}-\d{3}$/,
                            message: "Format: 00-000",
                          },
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
                        Miasto
                      </label>
                      <input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        placeholder="Warszawa"
                        className={`${inputBase} ${
                          errors.city ? inputErr : inputOk
                        }`}
                        {...register("city", {
                          required:
                            selectedMethod === "courier"
                              ? "Miasto jest wymagane"
                              : false,
                          minLength: {
                            value: 2,
                            message: "Minimum 2 znaki",
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
              )}

              {/* Wybór paczkomatu — tylko dla paczkomat */}
              {selectedMethod === "parcel_locker" && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Wybrany paczkomat
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
                        Zmień
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
                        Wybierz Paczkomat
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Kliknij, aby otworzyć mapę paczkomatów
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
                  label="Chcę otrzymać fakturę VAT"
                />

                {wantInvoice && (
                  <div className="mt-5 space-y-4 pl-8 border-l-2 border-[#C1A88C]/30">
                    {/* Nazwa firmy */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Nazwa firmy
                      </label>
                      <input
                        type="text"
                        placeholder="Moja Firma Sp. z o.o."
                        className={`${inputBase} ${
                          errors.companyName ? inputErr : inputOk
                        }`}
                        {...register("companyName", {
                          required: wantInvoice
                            ? "Nazwa firmy jest wymagana"
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
                        NIP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234567890"
                        className={`${inputBase} ${
                          errors.vatNumber ? inputErr : inputOk
                        }`}
                        {...register("vatNumber", {
                          required: wantInvoice ? "NIP jest wymagany" : false,
                          pattern: {
                            value: /^[\d\-]{10,13}$/,
                            message: "Nieprawidłowy NIP",
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
                        Adres firmy
                      </label>
                      <input
                        type="text"
                        placeholder="ul. Biznesowa 10"
                        className={`${inputBase} ${
                          errors.companyStreet ? inputErr : inputOk
                        }`}
                        {...register("companyStreet", {
                          required: wantInvoice
                            ? "Adres firmy jest wymagany"
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
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                          Kod pocztowy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="00-001"
                          className={`${inputBase} ${
                            errors.companyPostalCode ? inputErr : inputOk
                          }`}
                          {...register("companyPostalCode", {
                            required: wantInvoice
                              ? "Kod pocztowy jest wymagany"
                              : false,
                            pattern: {
                              value: /^\d{2}-\d{3}$/,
                              message: "Format: 00-000",
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
                          Miasto
                        </label>
                        <input
                          type="text"
                          placeholder="Warszawa"
                          className={`${inputBase} ${
                            errors.companyCity ? inputErr : inputOk
                          }`}
                          {...register("companyCity", {
                            required: wantInvoice
                              ? "Miasto jest wymagane"
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
                  label="Inny adres dostawy"
                />

                {differentShipping && (
                  <div className="mt-5 space-y-4 pl-8 border-l-2 border-[#C1A88C]/30">
                    {/* Imię i Nazwisko odbiorcy */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Imię i nazwisko odbiorcy
                      </label>
                      <input
                        type="text"
                        placeholder="Jan Nowak"
                        className={`${inputBase} ${
                          errors.altFullName ? inputErr : inputOk
                        }`}
                        {...register("altFullName", {
                          required: differentShipping
                            ? "Imię i nazwisko odbiorcy jest wymagane"
                            : false,
                        })}
                      />
                      {errors.altFullName && (
                        <p className="mt-1.5 text-xs text-red-400">
                          {errors.altFullName.message}
                        </p>
                      )}
                    </div>

                    {/* Ulica */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Ulica i numer
                      </label>
                      <input
                        type="text"
                        placeholder="ul. Kwiatowa 5/3"
                        className={`${inputBase} ${
                          errors.altStreet ? inputErr : inputOk
                        }`}
                        {...register("altStreet", {
                          required: differentShipping
                            ? "Ulica jest wymagana"
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
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                          Kod pocztowy
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="00-001"
                          className={`${inputBase} ${
                            errors.altPostalCode ? inputErr : inputOk
                          }`}
                          {...register("altPostalCode", {
                            required: differentShipping
                              ? "Kod pocztowy jest wymagany"
                              : false,
                            pattern: {
                              value: /^\d{2}-\d{3}$/,
                              message: "Format: 00-000",
                            },
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
                          Miasto
                        </label>
                        <input
                          type="text"
                          placeholder="Kraków"
                          className={`${inputBase} ${
                            errors.altCity ? inputErr : inputOk
                          }`}
                          {...register("altCity", {
                            required: differentShipping
                              ? "Miasto jest wymagane"
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
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">
                        Telefon odbiorcy
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="600 987 654"
                        className={`${inputBase} ${
                          errors.altPhone ? inputErr : inputOk
                        }`}
                        {...register("altPhone", {
                          pattern: {
                            value: /^[\d\s\-+()]{7,15}$/,
                            message: "Nieprawidłowy numer telefonu",
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
                  Twoje zamówienie
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
                          {item.name}
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
                        {(item.price * item.quantity).toFixed(2)} zł
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#E8E3D8] pt-4 space-y-2">
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
                    <span>Dostawa</span>
                    <span>{shippingCost.toFixed(2)} zł</span>
                  </div>
                  <div className="border-t border-[#E8E3D8] pt-3 flex justify-between">
                    <span className="text-xs uppercase tracking-widest text-neutral-600">
                      Razem
                    </span>
                    <span className="font-serif text-lg text-neutral-800">
                      {total.toFixed(2)} zł
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
                    Akceptuję{" "}
                    <Link
                      href="/regulamin"
                      className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      regulamin sklepu
                    </Link>{" "}
                    oraz{" "}
                    <Link
                      href="/polityka-prywatnosci"
                      className="text-[#C1A88C] underline underline-offset-2 hover:text-[#B09A7C]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      politykę prywatności
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
                {isSubmitting ? "Przetwarzanie..." : "Przejdź do podsumowania"}
              </button>

              {/* Komunikat o regulaminie */}
              {termsError && (
                <p className="text-center text-xs text-red-400 mt-2">
                  Zaakceptuj regulamin, żeby przejść dalej.
                </p>
              )}

              {/* Wróć */}
              <Link
                href="/cart"
                className="block text-center mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
              >
                ← Wróć do koszyka
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
                  Wybierz Paczkomat
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Znajdź najbliższy paczkomat InPost
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
              {/* @ts-ignore — InPost Geowidget Web Component */}
              <inpost-geowidget
                onpoint="__inpostPointSelected"
                token={process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN || ""}
                language="pl"
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
