"use client";

import { useLanguage } from "@/components/LanguageContext";
import { renderRegItem, type RegItem } from "@/components/legal/RegItem";

type PolitykaSection = {
  title: string;
  ordered?: boolean;
  intro?: string;
  items?: RegItem[];
  paragraphs?: string[];
};

export function PolitykaContent() {
  const { messages } = useLanguage();
  const p = messages.polityka;
  const sections = p.sections as PolitykaSection[];

  return (
    <>
      <section className="pt-20 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.3em] text-black/40 uppercase mb-4">
            {p.kicker}
          </p>
          <h1 className="font-playfair text-3xl md:text-4xl text-black tracking-wide">
            {p.title}
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mt-6" />
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-sm text-black/70 leading-relaxed">{p.intro}</p>
          </div>

          {sections.map((section, si) => (
            <div key={si} className="mb-12">
              <h2 className="font-playfair text-xl text-black mb-4">
                {section.title}
              </h2>
              {section.intro && (
                <p className="text-sm text-black/70 leading-relaxed mb-4">
                  {section.intro}
                </p>
              )}
              {section.paragraphs?.map((para, pi) => (
                <p
                  key={pi}
                  className="text-sm text-black/70 leading-relaxed mb-4 last:mb-0"
                >
                  {para}
                </p>
              ))}
              {section.items && section.items.length > 0 && (
                <>
                  {section.ordered ? (
                    <ol className="list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed">
                      {section.items.map((item, ii) =>
                        renderRegItem(item, `${si}-${ii}`)
                      )}
                    </ol>
                  ) : (
                    <ul className="space-y-4 text-sm text-black/70 leading-relaxed">
                      {section.items.map((item, ii) => (
                        <li
                          key={ii}
                          className="pl-4 border-l-2 border-black/10 list-none"
                        >
                          {typeof item === "string" ? (
                            item
                          ) : (
                            <>
                              {item.lead}
                              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                {item.sub.map((s, j) => (
                                  <li key={j}>{s}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          ))}

          <div className="pt-8 border-t border-black/10">
            <p className="text-xs text-black/40 tracking-wide">{p.updated}</p>
          </div>
        </div>
      </section>
    </>
  );
}
