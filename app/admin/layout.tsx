import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Learnaide",
  description: "Learnaide Admin Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}