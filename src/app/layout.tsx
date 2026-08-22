import type { Metadata, Viewport } from "next";
import { Roboto_Flex, Roboto_Mono } from "next/font/google";
import { PWARegister } from "@/components/common/PWARegister";
import "./globals.css";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "RIVR — Premium Streaming",
  description: "Your personal premium streaming platform. Discover movies, TV shows, and anime across all providers.",
  keywords: ["streaming", "movies", "tv shows", "anime", "media player", "RIVR"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RIVR",
  },
  icons: {
    icon: [
      { url: "/brand/logo-r.png", sizes: "any", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${robotoFlex.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
