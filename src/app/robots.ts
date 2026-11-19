import { MetadataRoute } from "next";

const CANONICAL_BASE_URL = "https://zeewrites.blog";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ads.txt"],
        disallow: ["/zee-studio-vault", "/zee-studio-vault/", "/api/"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
    ],
    sitemap: `${CANONICAL_BASE_URL}/sitemap.xml`,
    host: CANONICAL_BASE_URL,
  };
}
