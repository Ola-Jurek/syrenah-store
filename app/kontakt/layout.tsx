import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Skontaktuj się z Syrenah – pytania o zamówienia, rozmiary i współpracę. Odpowiemy tak szybko, jak to możliwe.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
