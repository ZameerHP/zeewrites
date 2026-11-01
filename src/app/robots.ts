import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getDatabase } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getDatabase();
  let baseUrl = (settings.siteUrl || "https://zeewrites.vercel.app").replace(/\/$/, "");

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      baseUrl = `${proto}://${host}`;
    }
  } catch {
    // Fallback if headers cannot be resolved
  }

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
