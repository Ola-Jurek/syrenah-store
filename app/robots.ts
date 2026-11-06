import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/checkout",
        "/cart",
        "/account",
        "/orders",
        "/wishlist",
        "/search",
        "/success",
        "/login",
        "/register",
      ],
    },
    sitemap: "https://syrenahthelabel.com/sitemap.xml",
  };
}
