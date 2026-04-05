"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatWidget from "@/components/ChatWidget";
import { ChatWidgetProvider } from "@/context/ChatWidgetContext";
import { authUtils } from "@/utils/auth";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { token, userData } = authUtils.getAuth();

  useEffect(() => {
    if (!token || !userData) {
      router.replace("/auth/login");
      return;
    }

    if (pathname.startsWith("/instructor") && userData.role !== "instructor") {
      router.replace("/403");
    }
  }, [token, userData, pathname, router]);

  if (!token || !userData) {
    return null;
  }

  if (pathname.startsWith("/instructor") && userData.role !== "instructor") {
    return null;
  }

  return (
    <ChatWidgetProvider userId={String(userData?.id ?? userData?._id ?? "") || null}>
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </ChatWidgetProvider>
  );
}
