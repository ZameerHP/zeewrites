import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const DEFAULT_ADS_TXT =
  "google.com, pub-3239203696892345, DIRECT, f08c47fec0942fa0";

export async function GET() {
  const { settings } = await getDatabase();
  const rawTxt = settings.adsTxtContent?.trim();
  const rawPub = settings.publisherId?.trim();

  const hasValidCustomTxt =
    rawTxt && !rawTxt.includes("0000000000000000");
  const hasValidCustomPub =
    rawPub && !rawPub.includes("0000000000000000");

  const body = hasValidCustomTxt
    ? rawTxt
    : hasValidCustomPub
    ? `google.com, ${rawPub.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`
    : DEFAULT_ADS_TXT;

  return new NextResponse(body + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
