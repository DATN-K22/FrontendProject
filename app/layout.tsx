import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { LoadingProvider } from "@/components/loading";
import { AlertProvider } from "@/components/alert";
import "./globals.css";
import "@calendarjs/ce/dist/style.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Next + MUI",
  description: "MUI setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <Providers>
          <LoadingProvider>
            <AlertProvider>
              <main>{children}</main>
            </AlertProvider>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
