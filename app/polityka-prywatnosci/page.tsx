import type { Metadata } from "next";
import { PolitykaContent } from "@/components/PolitykaContent";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności sklepu Syrenah — informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
};

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="bg-white min-h-screen">
      <PolitykaContent />
    </div>
  );
}
