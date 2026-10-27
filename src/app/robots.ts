import { MetadataRoute } from "next";
import { readDatabase } from "@/lib/server-store";

export default function robots(): MetadataRoute.Robots {
  const { settings } = readDatabase();
  const baseUrl = settings.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/zee-studio-vault", "/zee-studio-vault/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
