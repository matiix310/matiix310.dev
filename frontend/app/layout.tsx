import "@/app/globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import SecuredApiDialog from "@/components/SecuredApiDialog";

export const metadata: Metadata = {
  title: "Avalon",
  description: "All in one authentication manager across all devices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SecuredApiDialog />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
