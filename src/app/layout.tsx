import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AppDataProvider } from "@/context/app-data-context";
import ClientAuthProvider from "@/components/ClientAuthProvider";
import LayoutWithSidebar from "@/components/LayoutContent"; // 👈 new client component

export const metadata: Metadata = {
  title: "FleetNow",
  description: "School Bus Fleet Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppDataProvider>
            <ClientAuthProvider>
              <LayoutWithSidebar>{children}</LayoutWithSidebar>
            </ClientAuthProvider>
          </AppDataProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
