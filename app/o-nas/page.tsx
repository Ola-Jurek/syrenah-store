import type { Metadata } from "next";
import { AboutPageContent } from "@/components/AboutPageContent";

export const metadata: Metadata = {
  title: "O nas",
  description:
    "Syrenah — luksusowa moda damska tworzona z pasją. Poznaj historię naszej marki.",
};

export default function ONasPage() {
  return <AboutPageContent />;
}
