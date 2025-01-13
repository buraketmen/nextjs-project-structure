import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ProjectProvider } from "@/context/project-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import "../public/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Project Structure Explorer",
  description:
    "Interactive Next.js project structure explorer. Routes, pages, layouts, and more.",
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProjectProvider>
            {children}
            <Toaster />
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
