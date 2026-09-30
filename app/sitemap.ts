import type { MetadataRoute } from "next";

const base = "https://syrenahthelabel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-30");
  const paths = [
    "",
    "/shop",
    "/o-nas",
    "/kontakt",
    "/regulamin",
    "/polityka-prywatnosci",
    "/zwroty-i-reklamacje",
  ];

  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
