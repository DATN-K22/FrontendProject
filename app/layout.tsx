import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { LoadingProvider } from "@/components/Loading";
import { AlertProvider } from "@/components/Alert";

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
    <html lang="en" suppressHydrationWarning>
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
