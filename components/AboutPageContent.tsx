"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export function AboutPageContent() {
  const { messages } = useLanguage();
  const a = messages.about;

  return (
    <div className="bg-white min-h-screen">
      <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E8E0D4] via-[#D4C8B8] to-[#C1B5A5]" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center px-6 max-w-2xl">
            <p className="text-[11px] tracking-[0.4em] text-white/70 uppercase mb-4">
              {a.heroKicker}
            </p>
            <h1 className="font-playfair text-4xl md:text-6xl text-white tracking-wide leading-tight">
              {a.heroTitle}
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mt-6 mb-6" />
            <p className="text-sm md:text-base text-white/80 tracking-wide font-light">
              {a.heroLead}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
            {a.missionKicker}
          </p>
          <div className="w-12 h-px bg-black/20 mx-auto mb-8" />
          <p className="text-sm md:text-base text-black/60 leading-[1.9] tracking-wide">
            {a.missionBody}
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-12 text-center">
            {a.valuesKicker}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">01</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">
                {a.v1Title}
              </h3>
              <p className="text-sm text-black/55 leading-relaxed">{a.v1Body}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">02</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">
                {a.v2Title}
              </h3>
              <p className="text-sm text-black/55 leading-relaxed">{a.v2Body}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 border border-black/10 rounded-full flex items-center justify-center">
                <span className="font-playfair text-lg text-black/70">03</span>
              </div>
              <h3 className="font-playfair text-lg text-black mb-3">
                {a.v3Title}
              </h3>
              <p className="text-sm text-black/55 leading-relaxed">{a.v3Body}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-6">
            {a.manifestKicker}
          </p>
          <blockquote className="font-playfair text-xl md:text-2xl text-black/80 leading-relaxed italic mb-8">
            {a.manifestQuote}
          </blockquote>
          <div className="w-12 h-px bg-black/20 mx-auto mb-6" />
          <p className="text-xs tracking-[0.2em] text-black/40 uppercase">
            {a.manifestSignoff}
          </p>
        </div>
      </section>

      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4C8B8] via-[#C8BAA8] to-[#BCA898]" />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center px-6">
            <p className="font-playfair text-2xl md:text-4xl text-white tracking-wide">
              {a.ctaTitle}
            </p>
            <Link
              href="/shop"
              className="inline-block mt-8 text-xs uppercase tracking-[0.2em] text-white/80 border border-white/40 px-8 py-3 hover:bg-white hover:text-black transition-colors duration-300"
            >
              {a.ctaShop}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
