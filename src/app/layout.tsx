import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
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
      className={`${roboto.variable} h-full antialiased`}
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

