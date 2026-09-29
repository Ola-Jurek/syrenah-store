"use client";

export type RegItem =
  | string
  | { lead: string; sub: string[] };

export function renderRegItem(item: RegItem, key: React.Key) {
  if (typeof item === "string") {
    return (
      <li key={key} className="text-sm text-black/70 leading-relaxed">
        {item}
      </li>
    );
  }
  return (
    <li key={key} className="text-sm text-black/70 leading-relaxed">
      {item.lead}
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        {item.sub.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </li>
  );
}
