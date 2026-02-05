import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "@/components/client-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Barn Coffee POS",
    template: "%s | Barn Coffee POS",
  },
  description: "Modern point-of-sale system demo for coffee shops.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Barn Coffee POS",
    description: "A barista-first POS experience with inventory and reporting.",
    url: "/",
    siteName: "Barn Coffee POS",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Barn Coffee POS preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barn Coffee POS",
    description: "A barista-first POS experience with inventory and reporting.",
    images: ["/opengraph-image"],
  },
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('pos-settings');
    var root = document.documentElement;
    if (!stored) {
      root.classList.add('dark');
      root.classList.remove('light');
      return;
    }
    var parsed = JSON.parse(stored);
    var dark = parsed && parsed.state && parsed.state.settings && parsed.state.settings.darkMode;
    if (dark === false) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-loader" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
