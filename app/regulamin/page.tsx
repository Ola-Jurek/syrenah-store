import type { Metadata } from "next";
import { RegulaminContent } from "@/components/RegulaminContent";

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  description:
    "Regulamin sklepu internetowego Syrenah — warunki zakupów, płatności i realizacji zamówień.",
};

export default function RegulaminPage() {
  return (
    <div className="bg-white min-h-screen">
      <RegulaminContent />
    </div>
  );
}
