import type { Metadata } from "next";
import { Roboto_Flex, Roboto_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "RIVR — Premium Streaming",
  description: "Your personal premium streaming platform. Discover movies, TV shows, and anime across all providers.",
  keywords: ["streaming", "movies", "tv shows", "anime", "media player", "RIVR"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${robotoFlex.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
