import { NextResponse } from "next/server";

export const dynamic = "force-static";

const ADS_TXT_CONTENT =
  "google.com, pub-3239203696892345, DIRECT, f08c47fec0942fa0\n";

export function GET() {
  return new NextResponse(ADS_TXT_CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
