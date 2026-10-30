import React from "react";
import { getDatabase } from "@/lib/server-store";
import { generateHomepageJsonLd } from "@/lib/schema";
import { HomeContentView } from "@/components/home/HomeContentView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const { articles, settings } = await getDatabase();
  const jsonLd = generateHomepageJsonLd(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContentView initialArticles={articles} />
    </>
  );
}
