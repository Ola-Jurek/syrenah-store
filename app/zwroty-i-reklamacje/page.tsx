import type { Metadata } from "next";
import { ZwrotyContent } from "@/components/ZwrotyContent";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje",
  description:
    "Zasady zwrotów i reklamacji w sklepie Syrenah — 14 dni na zwrot bez podania przyczyny.",
};

export default function ZwrotyIReklamacjePage() {
  return (
    <div className="bg-white min-h-screen">
      <ZwrotyContent />
    </div>
  );
}
