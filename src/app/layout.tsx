import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TippenThemeProvider } from "@/components/tippen/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const SITE_URL = "https://tippen.dev";
const description =
  "Tippen is an AI-powered cinematic text storytelling editor. Create stunning videos with typing animations, voice sync, AI, camera movement, music, and beautiful typography.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tippen — Create cinematic stories with text",
    template: "%s · Tippen",
  },
  description,
  keywords: [
    "Tippen",
    "cinematic text",
    "typing animation",
    "video editor",
    "AI video",
    "typewriter video",
    "storytelling",
    "text animation",
    "Remotion",
    "open source",
  ],
  authors: [{ name: "Tippen Contributors" }],
  creator: "Tippen",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Tippen — Create cinematic stories with text",
    description,
    siteName: "Tippen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tippen — Create cinematic stories with text",
    description,
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23181a1f'/%3E%3Crect x='8' y='13' width='13' height='2.4' rx='1.2' fill='%23e8a04a'/%3E%3Crect x='8' y='17.5' width='8' height='2.4' rx='1.2' fill='%23e8a04a'/%3E%3Crect x='23' y='14' width='2' height='5' rx='1' fill='%23e8a04a'/%3E%3C/svg%3E",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#181a1f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground`}
      >
        <TippenThemeProvider>{children}</TippenThemeProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
