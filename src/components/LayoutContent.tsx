"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar";
import ClientAuthProvider from "@/components/ClientAuthProvider";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    // No sidebar on auth pages
    return <ClientAuthProvider>{children}</ClientAuthProvider>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
