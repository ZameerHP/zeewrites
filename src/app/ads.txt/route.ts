import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/server-store";

export async function GET() {
  const { settings } = readDatabase();
  const body =
    settings.adsTxtContent?.trim() ||
    (settings.publisherId
      ? `google.com, ${settings.publisherId.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0`
      : "");

  return new NextResponse(body ? body + "\n" : "", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
