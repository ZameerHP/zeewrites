import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getDatabase } from "@/lib/server-store";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
  adjustFontFallback: true,
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zeewrites.com"),
  title: {
    default: "Zee Writes | Guides & Tech Fixes",
    template: "%s | Zee Writes",
  },
  description: "Guides and practical tech fixes written by Zee.",
  keywords: [
    "Zee Writes",
    "tech fixes",
    "UTF-8 mojibake fix",
    "ERR_SSL_PROTOCOL_ERROR fix",
    "Core Web Vitals CLS LCP",
    "Git CRLF LF fix",
    "JSON validation guide",
  ],
  authors: [{ name: "Zee", url: "https://zeewrites.com/about" }],
  creator: "Zee",
  publisher: "Zee Writes",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zeewrites.com",
    siteName: "Zee Writes",
    title: "Zee Writes | Guides & Tech Fixes",
    description: "Guides and practical tech fixes written by Zee.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zee Writes | Guides & Tech Fixes",
    description: "Guides and practical tech fixes written by Zee.",
  },
  alternates: {
    canonical: "https://zeewrites.com",
  },
};

const LIGHT_MODE_INIT_SCRIPT = `
(function() {
  try {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('zeewrites_theme_v3');
    localStorage.removeItem('zeewrites_theme_v1');
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { articles, settings } = await getDatabase();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LIGHT_MODE_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-page text-ink">
        <SiteProvider initialArticles={articles} initialSettings={settings}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </SiteProvider>
      </body>
    </html>
  );
}
