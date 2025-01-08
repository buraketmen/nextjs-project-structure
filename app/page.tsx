"use client";

import ProjectStructure from "@/components/project";
import { BrowserView } from "@/components/browser";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen">
      {/* Left side: Project Structure */}
      <div className="w-1/3 border-r p-4 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Next.js Structure</h1>
          <ThemeToggle />
        </div>
        <ProjectStructure />
      </div>

      {/* Right side: Browser View */}
      <div className="flex-1 p-4">
        <BrowserView />
      </div>
    </main>
  );
}
