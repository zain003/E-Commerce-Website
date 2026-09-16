import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Atelier | Luxury Essentials & Artisanal Craft",
  description: "Curated collection of modern luxury essentials, crafted with artisanal care and carbon-neutral delivery.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground"
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

