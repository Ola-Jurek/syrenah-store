"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { renderRegItem, type RegItem } from "@/components/legal/RegItem";

function OrderedBlock({ items }: { items: RegItem[] }) {
  return (
    <ol className="list-decimal list-inside space-y-4 text-sm text-black/70 leading-relaxed">
      {items.map((item, i) => renderRegItem(item, i))}
    </ol>
  );
}

const FORM_FILES = {
  pl: {
    returnForm: "/Formularz zwrotu.pdf",
    complaintForm: "/Formularz reklamacji.pdf",
  },
  en: {
    returnForm: "/Return form.pdf",
    complaintForm: "/Complaint form.pdf",
  },
} as const;

export function ZwrotyContent() {
  const { locale, messages } = useLanguage();
  const z = messages.zwroty;
  const forms = FORM_FILES[locale];
  const returnsItems = z.returnsItems as RegItem[];
  const complaintsItems = z.complaintsItems as RegItem[];
  const exchangeItems = z.exchangeItems as string[];

  return (
    <>
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            {z.kicker}
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            {z.title}
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      <section className="px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 p-6 bg-[#FAF8F5] border border-[#E8E3D8]">
            <p className="text-sm text-black/70 leading-relaxed">{z.intro}</p>
          </div>

          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">I</span>
              </div>
              <h2 className="font-playfair text-xl text-black">
                {z.returnsTitle}
              </h2>
            </div>
            <OrderedBlock items={returnsItems} />
          </div>

          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">II</span>
              </div>
              <h2 className="font-playfair text-xl text-black">
                {z.complaintsTitle}
              </h2>
            </div>
            <OrderedBlock items={complaintsItems} />
          </div>

          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                <span className="text-sm font-playfair text-black">III</span>
              </div>
              <h2 className="font-playfair text-xl text-black">
                {z.exchangeTitle}
              </h2>
            </div>
            <ol className="list-decimal list-inside space-y-4 text-sm text-black/70 leading-relaxed">
              {exchangeItems.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>

          <div className="mb-8 p-8 bg-[#FAF8F5] border border-[#E8E3D8] text-center">
            <h3 className="font-playfair text-lg text-black mb-3">
              {z.formBoxTitle}
            </h3>
            <p className="text-sm text-black/60 mb-2">{z.formBoxAddress}</p>
            <p className="text-sm text-black/60 mb-6">{z.formBoxEmailNote}</p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
              <a
                href={encodeURI(forms.returnForm)}
                download
                className="inline-block text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
              >
                {z.formBoxDownloadReturn}
              </a>
              <a
                href={encodeURI(forms.complaintForm)}
                download
                className="inline-block text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
              >
                {z.formBoxDownloadComplaint}
              </a>
              <Link
                href="/kontakt"
                className="inline-block text-xs uppercase tracking-[0.2em] text-black/60 border border-black/20 px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
              >
                {z.formBoxContactForm}
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-black/40 tracking-wide pb-8">
            {z.updated}
          </p>
        </div>
      </section>
    </>
  );
}
