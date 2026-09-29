"use client";

import type { Messages } from "@/lib/dict";
import { renderRegItem, type RegItem } from "@/components/legal/RegItem";

type RegSection = {
  title: string;
  ordered: boolean;
  items: RegItem[];
};

export function RegulaminBody({
  regulamin,
}: {
  regulamin: Messages["regulamin"];
}) {
  const sections = regulamin.sections as RegSection[];

  return (
    <>
      {sections.map((section, si) => {
        const List = section.ordered ? "ol" : "ul";
        const listClass = section.ordered
          ? "list-decimal list-inside space-y-3 text-sm text-black/70 leading-relaxed"
          : "list-disc list-inside space-y-3 text-sm text-black/70 leading-relaxed";

        return (
          <div key={si} className="mb-12">
            <h2 className="font-playfair text-xl text-black mb-4">
              {section.title}
            </h2>
            <List className={listClass}>
              {section.items.map((item, ii) =>
                renderRegItem(item, `${si}-${ii}`)
              )}
            </List>
          </div>
        );
      })}

      <div className="pt-8 border-t border-black/10">
        <p className="text-xs text-black/40 tracking-wide">
          {regulamin.updated}
        </p>
      </div>
    </>
  );
}
