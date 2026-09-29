"use client";

import { useLanguage } from "@/components/LanguageContext";
import { RegulaminBody } from "@/components/RegulaminBody";

export function RegulaminContent() {
  const { messages } = useLanguage();
  const r = messages.regulamin;

  return (
    <>
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            {r.kicker}
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            {r.title}
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto prose-container">
          <RegulaminBody regulamin={r} />
        </div>
      </section>
    </>
  );
}
