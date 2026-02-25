import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/userContext";

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
        <UserProvider>
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
