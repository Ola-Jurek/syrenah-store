"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export function AboutPageContent() {
  const { messages } = useLanguage();
  const a = messages.about;

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-white px-0 pt-16 md:px-10 md:pt-24 md:pb-4 lg:px-16">
        <div className="relative mx-auto w-full aspect-[2/3] overflow-hidden md:aspect-[3/2] md:max-w-[1100px]">
          <Image
            src="/about/hero-mobile.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top md:hidden"
          />
          <Image
            src="/about/hero-desktop.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 1100px, 100vw"
            className="hidden object-cover object-center md:block"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 md:items-end md:bg-transparent md:bg-gradient-to-t md:from-black/55 md:via-black/10 md:to-transparent md:pb-12">
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

      <section className="md:px-10 md:py-16 lg:px-16">
        <div className="relative mx-auto w-full h-[50vh] overflow-hidden md:h-auto md:aspect-[3/2] md:max-w-[1100px]">
          <Image
            src="/about/cta-mobile.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center md:hidden"
          />
          <Image
            src="/about/cta-desktop.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 1100px, 100vw"
            className="hidden object-cover object-center md:block"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 md:items-end md:bg-transparent md:bg-gradient-to-t md:from-black/55 md:via-black/10 md:to-transparent md:pb-12">
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
        </div>
      </section>
    </div>
  );
}
